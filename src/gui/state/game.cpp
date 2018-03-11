/*  LOOT

    A load order optimisation tool for Oblivion, Skyrim, Fallout 3 and
    Fallout: New Vegas.

    Copyright (C) 2012-2018    WrinklyNinja

    This file is part of LOOT.

    LOOT is free software: you can redistribute
    it and/or modify it under the terms of the GNU General Public License
    as published by the Free Software Foundation, either version 3 of
    the License, or (at your option) any later version.

    LOOT is distributed in the hope that it will
    be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with LOOT.  If not, see
    <https://www.gnu.org/licenses/>.
    */

#include "gui/state/game.h"

#include <algorithm>
#include <cmath>
#include <thread>

#include <boost/algorithm/string.hpp>
#include <boost/format.hpp>
#include <boost/locale.hpp>

#include "gui/helpers.h"
#include "gui/state/game_detection_error.h"
#include "gui/state/logging.h"
#include "loot/exception/file_access_error.h"

#ifdef _WIN32
#ifndef UNICODE
#define UNICODE
#endif
#ifndef _UNICODE
#define _UNICODE
#endif
#define NOMINMAX
#include "shlobj.h"
#include "shlwapi.h"
#include "windows.h"
#endif

using std::list;
using std::lock_guard;
using std::mutex;
using std::string;
using std::thread;
using std::vector;

namespace fs = boost::filesystem;

namespace loot {
namespace gui {
bool hasPluginFileExtension(const std::string& filename) {
  return boost::iends_with(filename, ".esp") ||
         boost::iends_with(filename, ".esm") ||
         boost::iends_with(filename, ".esl");
}

Game::Game(const GameSettings& gameSettings,
           const boost::filesystem::path& lootDataPath) :
    GameSettings(gameSettings),
    lootDataPath_(lootDataPath),
    pluginsFullyLoaded_(false),
    loadOrderSortCount_(0),
    logger_(getLogger()) {
  SetGamePath(DetectGamePath(*this));

  if (GamePath().empty()) {
    throw GameDetectionError("Game path could not be detected.");
  }

  gameHandle_ =
      CreateGameHandle(Type(), GamePath().string(), GameLocalPath().string());
  gameHandle_->IdentifyMainMasterFile(Master());
}

Game::Game(const Game& game) :
    GameSettings(game),
    lootDataPath_(game.lootDataPath_),
    gameHandle_(game.gameHandle_),
    pluginsFullyLoaded_(game.pluginsFullyLoaded_),
    messages_(game.messages_),
    loadOrderSortCount_(0),
    logger_(getLogger()) {}

Game& Game::operator=(const Game& game) {
  if (&game != this) {
    GameSettings::operator=(game);

    lootDataPath_ = game.lootDataPath_;
    gameHandle_ = game.gameHandle_;
    pluginsFullyLoaded_ = game.pluginsFullyLoaded_;
    messages_ = game.messages_;
    loadOrderSortCount_ = game.loadOrderSortCount_;
    logger_ = game.logger_;
  }

  return *this;
}

bool Game::IsInstalled(const GameSettings& gameSettings) {
  auto gamePath = DetectGamePath(gameSettings);

  return !gamePath.empty();
}

void Game::Init() {
  if (logger_) {
    logger_->info("Initialising filesystem-related data for game: {}", Name());
  }

  if (!lootDataPath_.empty()) {
    // Make sure that the LOOT game path exists.
    try {
      if (!fs::exists(lootDataPath_ / FolderName()))
        fs::create_directories(lootDataPath_ / FolderName());
    } catch (fs::filesystem_error& e) {
      throw FileAccessError(
          (boost::format(
               "Could not create LOOT folder for game. Details: %1%") %
           e.what())
              .str());
    }
  }
}

std::shared_ptr<const PluginInterface> Game::GetPlugin(
    const std::string& name) const {
  return gameHandle_->GetPlugin(name);
}

std::set<std::shared_ptr<const PluginInterface>> Game::GetPlugins() const {
  return gameHandle_->GetLoadedPlugins();
}

std::vector<Message> Game::CheckInstallValidity(
    const std::shared_ptr<const PluginInterface>& plugin,
    const PluginMetadata& metadata) {
  if (logger_) {
    logger_->trace("Checking that the current install is valid according to {}"
                   "'s data.", plugin->GetName());
  }
  std::vector<Message> messages;
  if (IsPluginActive(plugin->GetName())) {
    auto pluginExists = [&](const std::string& file) {
      return boost::filesystem::exists(DataPath() / file) ||
             (hasPluginFileExtension(file) &&
              boost::filesystem::exists(DataPath() / (file + ".ghost")));
    };
    auto tags = metadata.GetTags();
    if (tags.find(Tag("Filter")) == std::end(tags)) {
      for (const auto& master : plugin->GetMasters()) {
        if (!pluginExists(master)) {
          if (logger_) {
            logger_->error("\"{}\" requires \"{}\", but it is missing.",
              plugin->GetName(),
              master);
          }
          messages.push_back(Message(MessageType::error,
                                     (boost::format(boost::locale::translate(
                                          "This plugin requires \"%1%\" to be "
                                          "installed, but it is missing.")) %
                                      master)
                                         .str()));
        } else if (!IsPluginActive(master)) {
          if (logger_) {
            logger_->error("\"{}\" requires \"{}\", but it is inactive.",
              plugin->GetName(),
              master);
          }
          messages.push_back(Message(MessageType::error,
                                     (boost::format(boost::locale::translate(
                                          "This plugin requires \"%1%\" to be "
                                          "active, but it is inactive.")) %
                                      master)
                                         .str()));
        }
      }
    }

    for (const auto& req : metadata.GetRequirements()) {
      if (!pluginExists(req.GetName())) {
        if (logger_) {
          logger_->error("\"{}\" requires \"{}\", but it is missing.",
            plugin->GetName(),
            req.GetName());
        }
        messages.push_back(Message(MessageType::error,
                                   (boost::format(boost::locale::translate(
                                        "This plugin requires \"%1%\" to be "
                                        "installed, but it is missing.")) %
                                    req.GetName())
                                       .str()));
      }
    }
    for (const auto& inc : metadata.GetIncompatibilities()) {
      if (pluginExists(inc.GetName()) && IsPluginActive(inc.GetName())) {
        if (logger_) {
          logger_->error("\"{}\" is incompatible with \"{}\", but both are "
                         "present.", plugin->GetName(), inc.GetName());
        }
        messages.push_back(Message(MessageType::error,
                                   (boost::format(boost::locale::translate(
                                        "This plugin is incompatible with "
                                        "\"%1%\", but both are present.")) %
                                    inc.GetName())
                                       .str()));
      }
    }
  }

  if (plugin->IsLightMaster() && !boost::iends_with(plugin->GetName(), ".esp")) {
    for (const auto& masterName : plugin->GetMasters()) {
      try {
        auto master = GetPlugin(masterName);
        if (!master->IsLightMaster() && !master->IsMaster()) {
          if (logger_) {
            logger_->error("This plugin is a light master and requires the "
                           "non-master plugin \"{}\". This can cause issues "
                           "in-game, and sorting will fail while this plugin "
                           "is installed.", masterName);
          }
          messages.push_back(Message(
              MessageType::error,
              (boost::format(boost::locale::translate(
                   "This plugin is a light master and requires the non-master "
                   "plugin \"%1%\". This can cause issues in-game, and sorting "
                   "will fail while this plugin is installed.")) %
               masterName)
                  .str()));
        }
      } catch (...) {
          if (logger_) {
            logger_->info("Tried to get plugin object for master \"{}\" of "
                          "\"{}\" but it was not loaded.",
                          masterName,
                          plugin->GetName());
          }
      }
    }
  }

  // Also generate dirty messages.
  for (const auto& element : metadata.GetDirtyInfo()) {
    messages.push_back(Game::ToMessage(element));
  }

  return messages;
}

void Game::RedatePlugins() {
  if (Type() != GameType::tes5 && Type() != GameType::tes5se) {
    if (logger_) {
      logger_->warn("Cannot redate plugins for game {}.", Name());
    }
    return;
  }

  vector<string> loadorder = gameHandle_->GetLoadOrder();
  if (!loadorder.empty()) {
    time_t lastTime = 0;
    for (const auto& pluginName : loadorder) {
      fs::path filepath = DataPath() / pluginName;
      if (!fs::exists(filepath)) {
        if (fs::exists(filepath.string() + ".ghost"))
          filepath += ".ghost";
        else
          continue;
      }

      time_t thisTime = fs::last_write_time(filepath);
      if (logger_) {
        logger_->info("Current timestamp for \"{}\": {}",
          filepath.filename().string(),
          thisTime);
      }
      if (thisTime >= lastTime) {
        lastTime = thisTime;

        if (logger_) {
          logger_->trace("No need to redate \"{}\".",
            filepath.filename().string());
        }
      } else {
        lastTime += 60;
        fs::last_write_time(filepath,
                            lastTime);  // Space timestamps by a minute.

        if (logger_) {
          logger_->info("Redated \"{}\" to: {}",
            filepath.filename().string(),
            lastTime);
        }
      }
    }
  }
}

void Game::LoadAllInstalledPlugins(bool headersOnly) {
  gameHandle_->LoadPlugins(GetInstalledPluginNames(), headersOnly);

  pluginsFullyLoaded_ = !headersOnly;
}

bool Game::ArePluginsFullyLoaded() const { return pluginsFullyLoaded_; }

boost::filesystem::path Game::DataPath() const {
  if (GamePath().empty())
    throw std::logic_error("Cannot get data path from empty game path");
  return GamePath() / "Data";
}

fs::path Game::MasterlistPath() const {
  return lootDataPath_ / FolderName() / "masterlist.yaml";
}

fs::path Game::UserlistPath() const {
  return lootDataPath_ / FolderName() / "userlist.yaml";
}

std::vector<std::string> Game::GetLoadOrder() const {
  return gameHandle_->GetLoadOrder();
}

void Game::SetLoadOrder(const std::vector<std::string>& loadOrder) {
  BackupLoadOrder(GetLoadOrder(), lootDataPath_ / FolderName());
  gameHandle_->SetLoadOrder(loadOrder);
}

bool Game::IsPluginActive(const std::string& pluginName) const {
  return gameHandle_->IsPluginActive(pluginName);
}

short Game::GetActiveLoadOrderIndex(
    const std::shared_ptr<const PluginInterface>& plugin,
    const std::vector<std::string>& loadOrder) const {
  // Get the full load order, then count the number of active plugins until the
  // given plugin is encountered. If the plugin isn't active or in the load
  // order, return -1.

  if (!IsPluginActive(plugin->GetName()))
    return -1;

  short numberOfActivePlugins = 0;
  for (const std::string& otherPluginName : loadOrder) {
    if (boost::iequals(otherPluginName, plugin->GetName()))
      return numberOfActivePlugins;

    auto otherPlugin = GetPlugin(otherPluginName);
    if (plugin->IsLightMaster() == otherPlugin->IsLightMaster() &&
        IsPluginActive(otherPluginName)) {
      ++numberOfActivePlugins;
    }
  }

  return -1;
}

std::vector<std::string> Game::SortPlugins() {
  std::vector<std::string> plugins = GetInstalledPluginNames();
  try {
    // Clear any existing game-specific messages, as these only relate to
    // state that has been changed by sorting.
    ClearMessages();

    plugins = gameHandle_->SortPlugins(plugins);

    IncrementLoadOrderSortCount();
  } catch (CyclicInteractionError& e) {
    if (logger_) {
      logger_->error("Failed to sort plugins. Details: {}", e.what());
    }
    AppendMessage(Message(
        MessageType::error,
        (boost::format(boost::locale::translate("Cyclic interaction detected "
                                                "between plugins \"%1%\" and "
                                                "\"%2%\". Back cycle: %3%")) %
         e.getFirstPlugin() % e.getLastPlugin() % e.getBackCycle())
            .str()));
    plugins.clear();
  } catch (std::exception& e) {
    if (logger_) {
      logger_->error("Failed to sort plugins. Details: {}", e.what());
    }
    plugins.clear();
  }

  return plugins;
}

void Game::IncrementLoadOrderSortCount() {
  lock_guard<mutex> guard(mutex_);

  ++loadOrderSortCount_;
}

void Game::DecrementLoadOrderSortCount() {
  lock_guard<mutex> guard(mutex_);

  if (loadOrderSortCount_ > 0)
    --loadOrderSortCount_;
}

std::vector<Message> Game::GetMessages() const {
  std::vector<Message> output(
      gameHandle_->GetDatabase()->GetGeneralMessages(true));
  output.insert(end(output), begin(messages_), end(messages_));

  if (loadOrderSortCount_ == 0)
    output.push_back(
        Message(MessageType::warn,
                boost::locale::translate(
                    "You have not sorted your load order this session.")));

  size_t activeNormalPluginsCount = 0;
  bool hasActiveEsl = false;
  for (const auto& plugin : GetPlugins()) {
    if (IsPluginActive(plugin->GetName())) {
      if (plugin->IsLightMaster()) {
        hasActiveEsl = true;
      } else {
        ++activeNormalPluginsCount;
      }
    }
  }

  if (activeNormalPluginsCount > 254 && hasActiveEsl) {
    if (logger_) {
      logger_->warn("255 normal plugins and at least one light master are "
                    "active at the same time.");
    }
    output.push_back(Message(
        MessageType::warn,
        boost::locale::translate(
            "You have a normal plugin and at least one light master sharing "
            "the FE load order index. Deactivate a normal plugin or all your "
            "light masters to avoid potential issues.")));
  }

  return output;
}

void Game::AppendMessage(const Message& message) {
  lock_guard<mutex> guard(mutex_);

  messages_.push_back(message);
}

void Game::ClearMessages() {
  lock_guard<mutex> guard(mutex_);

  messages_.clear();
}

bool Game::UpdateMasterlist() {
  bool wasUpdated = gameHandle_->GetDatabase()->UpdateMasterlist(
      MasterlistPath().string(), RepoURL(), RepoBranch());
  if (wasUpdated && !gameHandle_->GetDatabase()->IsLatestMasterlist(
                        MasterlistPath().string(), RepoBranch())) {
    AppendMessage(Message(
        MessageType::error,
        boost::locale::translate("The latest masterlist revision contains a "
                                 "syntax error, LOOT is using the most recent "
                                 "valid revision instead. Syntax errors are "
                                 "usually minor and fixed within hours.")));
  }

  return wasUpdated;
}

MasterlistInfo Game::GetMasterlistInfo() const {
  return gameHandle_->GetDatabase()->GetMasterlistRevision(
      MasterlistPath().string(), true);
}

void Game::LoadMetadata() {
  std::string masterlistPath;
  std::string userlistPath;
  if (boost::filesystem::exists(MasterlistPath())) {
    if (logger_) {
      logger_->debug("Preparing to parse masterlist.");
    }
    masterlistPath = MasterlistPath().string();
  }

  if (boost::filesystem::exists(UserlistPath())) {
    if (logger_) {
      logger_->debug("Preparing to parse userlist.");
    }
    userlistPath = UserlistPath().string();
  }

  if (logger_) {
    logger_->debug("Parsing metadata list(s).");
  }
  try {
    gameHandle_->GetDatabase()->LoadLists(masterlistPath, userlistPath);
  } catch (std::exception& e) {
    if (logger_) {
      logger_->error("An error occurred while parsing the metadata list(s): {}",
        e.what());
    }
    AppendMessage(Message(
        MessageType::error,
        (boost::format(boost::locale::translate(
             "An error occurred while parsing the metadata list(s): %1%.\n\n"
             "Try updating your masterlist to resolve the error. If the "
             "error is with your user metadata, this probably happened because "
             "an update to LOOT changed its metadata syntax support. Your "
             "user metadata will have to be updated manually.\n\n"
             "To do so, use the 'Open Debug Log Location' in LOOT's main "
             "menu to open its data folder, then open your 'userlist.yaml' "
             "file in the relevant game folder. You can then edit the "
             "metadata it contains with reference to the "
             "documentation, which is accessible through LOOT's main menu.\n\n"
             "You can also seek support on LOOT's forum thread, which is "
             "linked to on [LOOT's website](https://loot.github.io/).")) %
         e.what())
            .str()));
  }
}

std::set<std::string> Game::GetKnownBashTags() const {
  return gameHandle_->GetDatabase()->GetKnownBashTags();
}

std::unordered_set<Group> Game::GetGroups() const {
  return gameHandle_->GetDatabase()->GetGroups();
}

PluginMetadata Game::GetMasterlistMetadata(const std::string& pluginName,
                                           bool evaluateConditions) const {
  return gameHandle_->GetDatabase()->GetPluginMetadata(
      pluginName, false, evaluateConditions);
}

PluginMetadata Game::GetUserMetadata(const std::string& pluginName,
                                     bool evaluateConditions) const {
  return gameHandle_->GetDatabase()->GetPluginUserMetadata(pluginName,
                                                           evaluateConditions);
}

void Game::AddUserMetadata(const PluginMetadata& metadata) {
  gameHandle_->GetDatabase()->SetPluginUserMetadata(metadata);
}

void Game::ClearUserMetadata(const std::string& pluginName) {
  gameHandle_->GetDatabase()->DiscardPluginUserMetadata(pluginName);
}

void Game::ClearAllUserMetadata() {
  gameHandle_->GetDatabase()->DiscardAllUserMetadata();
}

void Game::SaveUserMetadata() {
  gameHandle_->GetDatabase()->WriteUserMetadata(UserlistPath().string(), true);
}

bool Game::ExecutableExists(const GameType& gameType,
                            const boost::filesystem::path& gamePath) {
  if (gameType == GameType::tes5) {
    return fs::exists(gamePath / "TESV.exe");
  } else if (gameType == GameType::tes5se) {
    return fs::exists(gamePath / "SkyrimSE.exe");
  } else {
    return true;  // Don't bother checking for the other games.
  }
}

boost::filesystem::path Game::DetectGamePath(const GameSettings& gameSettings) {
  auto logger = getLogger();
  try {
    if (logger) {
      logger->trace("Checking if game \"{}\" is installed.",
        gameSettings.Name());
    }
    if (!gameSettings.GamePath().empty() &&
        fs::exists(gameSettings.GamePath() / "Data" / gameSettings.Master()))
      return gameSettings.GamePath();

    boost::filesystem::path gamePath = "..";
    if (fs::exists(gamePath / "Data" / gameSettings.Master()) &&
        ExecutableExists(gameSettings.Type(), gamePath)) {
      return gamePath;
    }

#ifdef _WIN32
    std::string key_parent =
        fs::path(gameSettings.RegistryKey()).parent_path().string();
    std::string key_name =
        fs::path(gameSettings.RegistryKey()).filename().string();
    gamePath = RegKeyStringValue("HKEY_LOCAL_MACHINE", key_parent, key_name);
    if (!gamePath.empty() &&
        fs::exists(gamePath / "Data" / gameSettings.Master()) &&
        ExecutableExists(gameSettings.Type(), gamePath)) {
      return gamePath;
    }
#endif
  } catch (std::exception& e) {
    if (logger) {
      logger->error("Error while checking if game \"{}\" is installed: {}",
        gameSettings.Name(),
        e.what());
    }
  }

  return boost::filesystem::path();
}

void Game::BackupLoadOrder(const std::vector<std::string>& loadOrder,
                           const boost::filesystem::path& backupDirectory) {
  const int maxBackupIndex = 2;
  boost::format filenameFormat = boost::format("loadorder.bak.%1%");

  boost::filesystem::path backupFilePath =
      backupDirectory / (filenameFormat % 2).str();
  if (boost::filesystem::exists(backupFilePath))
    boost::filesystem::remove(backupFilePath);

  for (int i = maxBackupIndex - 1; i > -1; --i) {
    const boost::filesystem::path backupFilePath =
        backupDirectory / (filenameFormat % i).str();
    if (boost::filesystem::exists(backupFilePath))
      boost::filesystem::rename(
          backupFilePath, backupDirectory / (filenameFormat % (i + 1)).str());
  }

  boost::filesystem::ofstream out(backupDirectory / (filenameFormat % 0).str());
  for (const auto& plugin : loadOrder) out << plugin << std::endl;
}

Message Game::ToMessage(const PluginCleaningData& cleaningData) {
  using boost::format;
  using boost::locale::translate;

  const std::string itmRecords =
      (format(translate(
           "%1% ITM record", "%1% ITM records", cleaningData.GetITMCount())) %
       cleaningData.GetITMCount())
          .str();
  const std::string deletedReferences =
      (format(translate("%1% deleted reference",
                        "%1% deleted references",
                        cleaningData.GetDeletedReferenceCount())) %
       cleaningData.GetDeletedReferenceCount())
          .str();
  const std::string deletedNavmeshes =
      (format(translate("%1% deleted navmesh",
                        "%1% deleted navmeshes",
                        cleaningData.GetDeletedNavmeshCount())) %
       cleaningData.GetDeletedNavmeshCount())
          .str();

  format f;
  if (cleaningData.GetITMCount() > 0 &&
      cleaningData.GetDeletedReferenceCount() > 0 &&
      cleaningData.GetDeletedNavmeshCount() > 0)
    f = format(translate("%1% found %2%, %3% and %4%.")) %
        cleaningData.GetCleaningUtility() % itmRecords % deletedReferences %
        deletedNavmeshes;
  else if (cleaningData.GetITMCount() == 0 &&
           cleaningData.GetDeletedReferenceCount() == 0 &&
           cleaningData.GetDeletedNavmeshCount() == 0)
    f = format(translate("%1% found dirty edits.")) %
        cleaningData.GetCleaningUtility();

  else if (cleaningData.GetITMCount() == 0 &&
           cleaningData.GetDeletedReferenceCount() > 0 &&
           cleaningData.GetDeletedNavmeshCount() > 0)
    f = format(translate("%1% found %2% and %3%.")) %
        cleaningData.GetCleaningUtility() % deletedReferences %
        deletedNavmeshes;
  else if (cleaningData.GetITMCount() > 0 &&
           cleaningData.GetDeletedReferenceCount() == 0 &&
           cleaningData.GetDeletedNavmeshCount() > 0)
    f = format(translate("%1% found %2% and %3%.")) %
        cleaningData.GetCleaningUtility() % itmRecords % deletedNavmeshes;
  else if (cleaningData.GetITMCount() > 0 &&
           cleaningData.GetDeletedReferenceCount() > 0 &&
           cleaningData.GetDeletedNavmeshCount() == 0)
    f = format(translate("%1% found %2% and %3%.")) %
        cleaningData.GetCleaningUtility() % itmRecords % deletedReferences;

  else if (cleaningData.GetITMCount() > 0)
    f = format(translate("%1% found %2%.")) %
        cleaningData.GetCleaningUtility() % itmRecords;
  else if (cleaningData.GetDeletedReferenceCount() > 0)
    f = format(translate("%1% found %2%.")) %
        cleaningData.GetCleaningUtility() % deletedReferences;
  else if (cleaningData.GetDeletedNavmeshCount() > 0)
    f = format(translate("%1% found %2%.")) %
        cleaningData.GetCleaningUtility() % deletedNavmeshes;

  std::string message = f.str();
  if (cleaningData.GetInfo().empty()) {
    return Message(MessageType::warn, message);
  }

  auto info = cleaningData.GetInfo();
  for (auto& content : info) {
    content = MessageContent(message + " " + content.GetText(),
                             content.GetLanguage());
  }

  return Message(MessageType::warn, info);
}

std::vector<std::string> Game::GetInstalledPluginNames() {
  std::vector<std::string> plugins;

  if (logger_) {
    logger_->trace("Scanning for plugins in {}",
      this->DataPath().string());
  }

  for (fs::directory_iterator it(this->DataPath());
       it != fs::directory_iterator();
       ++it) {
    if (fs::is_regular_file(it->status()) &&
        gameHandle_->IsValidPlugin(it->path().filename().string())) {
      string name = it->path().filename().string();

      if (logger_) {
        logger_->info("Found plugin: ", name);
      }

      plugins.push_back(name);
    }
  }

  return plugins;
}

#ifdef _WIN32
std::string Game::RegKeyStringValue(const std::string& keyStr,
                                    const std::string& subkey,
                                    const std::string& value) {
  HKEY hKey = NULL;
  DWORD len = MAX_PATH;
  std::wstring wstr(MAX_PATH, 0);

  if (keyStr == "HKEY_CLASSES_ROOT")
    hKey = HKEY_CLASSES_ROOT;
  else if (keyStr == "HKEY_CURRENT_CONFIG")
    hKey = HKEY_CURRENT_CONFIG;
  else if (keyStr == "HKEY_CURRENT_USER")
    hKey = HKEY_CURRENT_USER;
  else if (keyStr == "HKEY_LOCAL_MACHINE")
    hKey = HKEY_LOCAL_MACHINE;
  else if (keyStr == "HKEY_USERS")
    hKey = HKEY_USERS;
  else
    throw std::invalid_argument("Invalid registry key given.");

  auto logger = getLogger();
  if (logger) {
    logger->trace("Getting string for registry key, subkey and value: {}, {}, "
                   "{}", keyStr, subkey, value);
  }

  LONG ret = RegGetValue(hKey,
                         ToWinWide(subkey).c_str(),
                         ToWinWide(value).c_str(),
                         RRF_RT_REG_SZ | KEY_WOW64_32KEY,
                         NULL,
                         &wstr[0],
                         &len);

  if (ret == ERROR_SUCCESS) {
    // Passing c_str() cuts off any unused buffer.
    std::string value = FromWinWide(wstr.c_str());
    if (logger) {
      logger->info("Found string: {}", value);
    }
    return value;
  } else {
    if (logger) {
      logger->info("Failed to get string value.");
    }
    return "";
  }
}
#endif
}
}
