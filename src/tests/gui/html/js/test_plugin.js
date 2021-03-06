import Plugin from '../../../../gui/html/js/plugin.js';
import Filters from '../../../../gui/html/js/filters.js';

jest.mock('../../../../gui/html/js/filters.js', () =>
  jest.fn().mockImplementation(() => ({
    messageFilter(message) {
      if (this.hideAllPluginMessages) {
        return false;
      }

      if (this.hideNotes && message.type === 'say') {
        return false;
      }

      if (
        this.hideDoNotCleanMessages &&
        message.text.toLowerCase().indexOf('do not clean') !== -1
      ) {
        return false;
      }

      return true;
    }
  }))
);

/* eslint-disable no-unused-expressions */
describe('Plugin', () => {
  describe('#Plugin()', () => {
    test('should throw if nothing is passed', () => {
      expect(() => {
        new Plugin(); // eslint-disable-line no-new
      }).toThrow();
    });

    test('should throw if an object with no name key is passed', () => {
      expect(() => {
        new Plugin({}); // eslint-disable-line no-new
      }).toThrow();
    });

    test('should not throw if some members are undefined', () => {
      expect(() => {
        new Plugin({ name: 'test' }); // eslint-disable-line no-new
      }).not.toThrow();
    });

    test("should set name to passed key's value", () => {
      const plugin = new Plugin({ name: 'test' });

      expect(plugin.name).toBe('test');
    });

    test('should set crc to zero if no key was passed', () => {
      const plugin = new Plugin({ name: 'test' });

      expect(plugin.crc).toBe(0);
    });

    test("should set crc to passed key's value", () => {
      const plugin = new Plugin({
        name: 'test',
        crc: 0xdeadbeef
      });

      expect(plugin.crc).toBe(0xdeadbeef);
    });

    test('should set version to an empty string if no key was passed', () => {
      const plugin = new Plugin({ name: 'test' });

      expect(plugin.version).toBe('');
    });

    test("should set version to passed key's value", () => {
      const plugin = new Plugin({
        name: 'test',
        version: 'foo'
      });

      expect(plugin.version).toBe('foo');
    });

    test('should set isActive value to false if no key was passed', () => {
      const plugin = new Plugin({ name: 'test' });

      expect(plugin.isActive).toBe(false);
    });

    test("should set isActive to passed key's value", () => {
      const plugin = new Plugin({
        name: 'test',
        isActive: true
      });

      expect(plugin.isActive).toBe(true);
    });

    test('should set isEmpty value to false if no key was passed', () => {
      const plugin = new Plugin({ name: 'test' });

      expect(plugin.isEmpty).toBe(false);
    });

    test("should set isEmpty to passed key's value", () => {
      const plugin = new Plugin({
        name: 'test',
        isEmpty: true
      });

      expect(plugin.isEmpty).toBe(true);
    });

    test('should set isMaster value to false if no key was passed', () => {
      const plugin = new Plugin({ name: 'test' });

      expect(plugin.isMaster).toBe(false);
    });

    test("should set isMaster to passed key's value", () => {
      const plugin = new Plugin({
        name: 'test',
        isMaster: true
      });

      expect(plugin.isMaster).toBe(true);
    });

    test('should set loadsArchive value to false if no key was passed', () => {
      const plugin = new Plugin({ name: 'test' });

      expect(plugin.loadsArchive).toBe(false);
    });

    test("should set loadsArchive to passed key's value", () => {
      const plugin = new Plugin({
        name: 'test',
        loadsArchive: true
      });

      expect(plugin.loadsArchive).toBe(true);
    });

    test('should set masterlist value to undefined if no key was passed', () => {
      const plugin = new Plugin({ name: 'test' });

      expect(plugin.masterlist).toBe(undefined);
    });

    test("should set masterlist to passed key's value", () => {
      const plugin = new Plugin({
        name: 'test',
        masterlist: {}
      });

      expect(plugin.masterlist).toEqual({});
    });

    test('should set userlist value to undefined if no key was passed', () => {
      const plugin = new Plugin({ name: 'test' });

      expect(plugin.userlist).toBe(undefined);
    });

    test("should set userlist to passed key's value", () => {
      const plugin = new Plugin({
        name: 'test',
        userlist: {}
      });

      expect(plugin.userlist).toEqual({});
    });

    test('should set priority to 0 if no key was passed', () => {
      const plugin = new Plugin({ name: 'test' });

      expect(plugin.priority).toBe(0);
    });

    test("should set priority to passed key's value", () => {
      const plugin = new Plugin({
        name: 'test',
        priority: 5
      });

      expect(plugin.priority).toBe(5);
    });

    test('should set global priority to 0 if no key was passed', () => {
      const plugin = new Plugin({ name: 'test' });

      expect(plugin.globalPriority).toBe(0);
    });

    test("should set global priority to passed key's value", () => {
      const plugin = new Plugin({
        name: 'test',
        globalPriority: 5
      });

      expect(plugin.globalPriority).toBe(5);
    });

    test('should set messages value to an empty array if no key was passed', () => {
      const plugin = new Plugin({ name: 'test' });

      expect(plugin.messages.length).toBe(0);
    });

    test("should set messages to passed key's value", () => {
      const messages = [
        {
          type: 'say',
          text: 'test message'
        }
      ];
      const plugin = new Plugin({
        name: 'test',
        messages
      });

      expect(plugin.messages).toEqual(messages);
    });

    test('should set tags value to an empty array if no key was passed', () => {
      const plugin = new Plugin({ name: 'test' });

      expect(plugin.tags.length).toBe(0);
    });

    test("should set tags to passed key's value", () => {
      const tags = [
        {
          name: 'Delev'
        }
      ];
      const plugin = new Plugin({
        name: 'test',
        tags
      });

      expect(plugin.tags).toEqual(tags);
    });

    test('should set isDirty value to false if no key was passed', () => {
      const plugin = new Plugin({ name: 'test' });

      expect(plugin.isDirty).toBe(false);
    });

    test("should set isDirty to passed key's value", () => {
      const plugin = new Plugin({
        name: 'test',
        isDirty: true
      });

      expect(plugin.isDirty).toBe(true);
    });

    test('should set cleanedWith value to an empty string if no key was passed', () => {
      const plugin = new Plugin({ name: 'test' });

      expect(plugin.cleanedWith).toBe('');
    });

    test("should set cleanedWith to passed key's value", () => {
      const plugin = new Plugin({
        name: 'test',
        cleanedWith: 'TES5Edit 3.11'
      });

      expect(plugin.cleanedWith).toBe('TES5Edit 3.11');
    });

    test('should set id to the plugins name without spaces', () => {
      const plugin = new Plugin({ name: 'test plugin name' });

      expect(plugin.id).toBe('testpluginname');
    });

    test('should set isEditorOpen to false', () => {
      const plugin = new Plugin({ name: 'test' });

      expect(plugin.isEditorOpen).toBe(false);
    });

    test('should set isSearchResult to false', () => {
      const plugin = new Plugin({ name: 'test' });

      expect(plugin.isSearchResult).toBe(false);
    });
  });

  describe('#update()', () => {
    let plugin;
    const updatedPlugin = {
      name: 'test',
      foo: 'bar',
      crc: 0xdeadbeef
    };

    beforeEach(() => {
      plugin = new Plugin({ name: 'test' });
    });

    test('should do nothing if its argument is undefined', () => {
      plugin.update();

      expect(plugin).toEqual(new Plugin({ name: 'test' }));
    });

    test('should throw if the argument has no name property', () => {
      expect(() => {
        plugin.update({});
      }).toThrow(Error);
    });

    test("should throw if the argument's name property doesn't match the plugin's name", () => {
      expect(() => {
        plugin.update({ name: 'other test' });
      }).toThrow(Error);
    });

    test("should set property values for all the given argument's properties", () => {
      plugin.update(updatedPlugin);

      expect(plugin.foo).toBe(updatedPlugin.foo);
      expect(plugin.crc).toBe(updatedPlugin.crc);
    });

    test('should not change property values for properties not present in the argument', () => {
      plugin.isActive = true;

      plugin.update(updatedPlugin);

      expect(plugin.foo).toBe(updatedPlugin.foo);
      expect(plugin.crc).toBe(updatedPlugin.crc);
      expect(plugin.isActive).toBe(true);
    });

    test('should set explicitly undefined values', () => {
      plugin.isActive = true;

      plugin.update({
        name: plugin.name,
        isActive: undefined
      });

      expect(plugin.isActive).toBe(undefined);
    });
  });

  describe('#fromJson()', () => {
    test('should return the value object if the JSON object does not have name and isEmpty fields', () => {
      const testInputObj = {
        name: 'test',
        crc: 0xdeadbeef
      };
      const testInputJson = JSON.stringify(testInputObj);

      expect(JSON.parse(testInputJson, Plugin.fromJson)).toEqual(testInputObj);
    });

    test('should return a Plugin object if the JSON object has name and isEmpty fields', () => {
      const testInputObj = {
        name: 'test',
        crc: 0xdeadbeef,
        isEmpty: false
      };
      const testInputJson = JSON.stringify(testInputObj);

      expect(JSON.parse(testInputJson, Plugin.fromJson)).toBeInstanceOf(Plugin);
    });
  });

  describe('#tagFromRowData()', () => {
    test('should throw if passed nothing', () => {
      expect(() => {
        Plugin.tagFromRowData();
      }).toThrow();
    });

    test('should return an empty object if passed nothing', () => {
      expect(() => {
        Plugin.tagFromRowData({});
      }).toThrow();
    });

    test('should return a raw metadata object if passed a row data object that removes a tag', () => {
      expect(
        Plugin.tagFromRowData({
          condition: 'foo',
          type: 'remove',
          name: 'bar'
        })
      ).toEqual({
        condition: 'foo',
        name: '-bar'
      });
    });

    test('should return a raw metadata object if passed a row data object that adds a tag', () => {
      expect(
        Plugin.tagFromRowData({
          condition: 'foo',
          type: 'add',
          name: 'bar'
        })
      ).toEqual({
        condition: 'foo',
        name: 'bar'
      });
    });
  });

  describe('#tagToRowData()', () => {
    test('should throw if passed nothing', () => {
      expect(() => {
        Plugin.tagToRowData();
      }).toThrow();
    });

    test('should return an empty object if passed nothing', () => {
      expect(() => {
        Plugin.tagToRowData({});
      }).toThrow();
    });

    test('should return a row data object if passed a raw metadata object that removes a tag', () => {
      expect(
        Plugin.tagToRowData({
          condition: 'foo',
          name: '-bar'
        })
      ).toEqual({
        condition: 'foo',
        type: 'remove',
        name: 'bar'
      });
    });

    test('should return a row data object if passed a raw metadata object that adds a tag', () => {
      expect(
        Plugin.tagToRowData({
          condition: 'foo',
          name: 'bar'
        })
      ).toEqual({
        condition: 'foo',
        type: 'add',
        name: 'bar'
      });
    });
  });

  describe('#messages', () => {
    let handleEvent;

    afterEach(() => {
      document.removeEventListener('loot-plugin-message-change', handleEvent);
    });

    test('getting messages if the array is empty should return an empty array', () => {
      const plugin = new Plugin({
        name: 'test',
        messages: []
      });

      expect(plugin.messages).toBeInstanceOf(Array);
      expect(plugin.messages.length).toBe(0);
    });

    test('getting messages should return any that are set', () => {
      const messages = [
        {
          type: 'say',
          text: 'test message'
        }
      ];
      const plugin = new Plugin({
        name: 'test',
        messages
      });

      expect(plugin.messages).toEqual(messages);
    });

    test('setting messages should store any set', () => {
      const plugin = new Plugin({
        name: 'test',
        messages: []
      });
      const messages = [
        {
          type: 'say',
          text: 'test message'
        }
      ];

      plugin.messages = messages;

      expect(plugin.messages).toEqual(messages);
    });

    test('setting messages should not fire an event if no messages were changed', done => {
      const plugin = new Plugin({
        name: 'test',
        messages: [
          {
            type: 'say',
            text: 'test message'
          }
        ]
      });

      handleEvent = () => {
        done(new Error('Should not have fired an event'));
      };

      document.addEventListener('loot-plugin-message-change', handleEvent);

      plugin.messages = plugin.messages;

      setTimeout(done, 100);
    });

    test('setting messages should fire an event if the messages were changed', done => {
      const plugin = new Plugin({
        name: 'test',
        messages: []
      });
      const messages = [
        {
          type: 'error',
          text: 'test message'
        }
      ];

      handleEvent = evt => {
        expect(evt.detail.pluginId).toBe(plugin.id);
        expect(evt.detail.totalDiff).toBe(1);
        expect(evt.detail.warningDiff).toBe(0);
        expect(evt.detail.errorDiff).toBe(1);
        done();
      };

      document.addEventListener('loot-plugin-message-change', handleEvent);

      plugin.messages = messages;
    });
  });

  describe('#isDirty', () => {
    let handleEvent;

    afterEach(() => {
      document.removeEventListener(
        'loot-plugin-cleaning-data-change',
        handleEvent
      );
    });

    test('getting value should return false if isDirty has not been set in the constructor', () => {
      const plugin = new Plugin({ name: 'test' });

      expect(plugin.isDirty).toBe(false);
    });

    test('getting value should return true if isDirty is set to true in the constructor', () => {
      const plugin = new Plugin({
        name: 'test',
        isDirty: true
      });

      expect(plugin.isDirty).toBe(true);
    });

    test('setting value should store set value', () => {
      const plugin = new Plugin({ name: 'test' });

      plugin.isDirty = true;

      expect(plugin.isDirty).toBe(true);
    });

    test('setting value to the current value should not fire an event', done => {
      const plugin = new Plugin({ name: 'test' });

      handleEvent = () => {
        done(new Error('Should not have fired an event'));
      };

      document.addEventListener(
        'loot-plugin-cleaning-data-change',
        handleEvent
      );

      plugin.isDirty = plugin.isDirty;

      setTimeout(done, 100);
    });

    test('setting value not equal to the current value should fire an event', done => {
      const plugin = new Plugin({ name: 'test' });

      handleEvent = evt => {
        expect(evt.detail.isDirty).toBe(true);
        done();
      };

      document.addEventListener(
        'loot-plugin-cleaning-data-change',
        handleEvent
      );

      plugin.isDirty = !plugin.isDirty;
    });
  });

  describe('#cleanedWith', () => {
    let handleEvent;

    afterEach(() => {
      document.removeEventListener(
        'loot-plugin-cleaning-data-change',
        handleEvent
      );
    });

    test('getting value should return an empty string if cleanedWith has not been set in the constructor', () => {
      const plugin = new Plugin({ name: 'test' });

      expect(plugin.cleanedWith).toBe('');
    });

    test('getting value should return a string if cleanedWith is set in the constructor', () => {
      const plugin = new Plugin({
        name: 'test',
        cleanedWith: 'utility'
      });

      expect(plugin.cleanedWith).toBe('utility');
    });

    test('setting value should store set value', () => {
      const plugin = new Plugin({ name: 'test' });

      plugin.cleanedWith = 'utility';

      expect(plugin.cleanedWith).toBe('utility');
    });

    test('setting value to the current value should not fire an event', done => {
      const plugin = new Plugin({ name: 'test' });

      handleEvent = () => {
        done(new Error('Should not have fired an event'));
      };

      document.addEventListener(
        'loot-plugin-cleaning-data-change',
        handleEvent
      );

      plugin.cleanedWith = plugin.cleanedWith;

      setTimeout(done, 100);
    });

    test('setting value not equal to the current value should fire an event', done => {
      const plugin = new Plugin({ name: 'test' });

      handleEvent = evt => {
        expect(evt.detail.cleanedWith).toBe('utility');
        done();
      };

      document.addEventListener(
        'loot-plugin-cleaning-data-change',
        handleEvent
      );

      plugin.cleanedWith = 'utility';
    });
  });

  describe('#crc', () => {
    let handleEvent;

    afterEach(() => {
      document.removeEventListener(
        'loot-plugin-card-content-change',
        handleEvent
      );
    });

    test('getting value should return 0 if crc has not been set in the constructor', () => {
      const plugin = new Plugin({ name: 'test' });

      expect(plugin.crc).toBe(0);
    });

    test('getting value should return 0xDEADBEEF if it was set in the constructor', () => {
      const plugin = new Plugin({
        name: 'test',
        crc: 0xdeadbeef
      });

      expect(plugin.crc).toBe(0xdeadbeef);
    });

    test('setting value should store set value', () => {
      const plugin = new Plugin({ name: 'test' });

      plugin.crc = 0xdeadbeef;

      expect(plugin.crc).toBe(0xdeadbeef);
    });

    test('setting value to the current value should not fire an event', done => {
      const plugin = new Plugin({ name: 'test' });

      handleEvent = () => {
        done(new Error('Should not have fired an event'));
      };

      document.addEventListener('loot-plugin-card-content-change', handleEvent);

      plugin.crc = plugin.crc;

      setTimeout(done, 100);
    });

    test('setting value not equal to the current value should fire an event', done => {
      const plugin = new Plugin({ name: 'test' });

      handleEvent = evt => {
        expect(evt.detail.pluginId).toBe(plugin.id);
        done();
      };

      document.addEventListener('loot-plugin-card-content-change', handleEvent);

      plugin.crc = 0xdeadbeef;
    });
  });

  describe('#tags', () => {
    let handleEvent;

    afterEach(() => {
      document.removeEventListener(
        'loot-plugin-card-content-change',
        handleEvent
      );
    });

    test('getting value should return an empty array if tags have not been set in the constructor', () => {
      const plugin = new Plugin({ name: 'test' });

      expect(plugin.tags.length).toBe(0);
    });

    test('getting value should return any tags that are set', () => {
      const tags = [
        {
          name: 'Delev'
        }
      ];
      const plugin = new Plugin({
        name: 'test',
        tags
      });

      expect(plugin.tags).toEqual(tags);
    });

    test('setting value should store set value', () => {
      const plugin = new Plugin({ name: 'test' });
      const tags = [
        {
          name: 'Delev'
        }
      ];

      plugin.tags = tags;

      expect(plugin.tags).toEqual(tags);
    });

    test('setting value to the current value should not fire an event', done => {
      const plugin = new Plugin({ name: 'test' });

      handleEvent = () => {
        done(new Error('Should not have fired an event'));
      };

      document.addEventListener('loot-plugin-card-content-change', handleEvent);

      plugin.tags = plugin.tags;

      setTimeout(done, 100);
    });

    test('setting value not equal to the current value should fire an event', done => {
      const plugin = new Plugin({ name: 'test' });
      const tags = [
        {
          name: 'Delev'
        }
      ];

      handleEvent = evt => {
        expect(evt.detail.pluginId).toBe(plugin.id);
        done();
      };

      document.addEventListener('loot-plugin-card-content-change', handleEvent);

      plugin.tags = tags;
    });
  });

  describe('#userlist', () => {
    let handleEvent;

    afterEach(() => {
      document.removeEventListener(
        'loot-plugin-item-content-change',
        handleEvent
      );
    });

    test('getting value should return undefined if it has not been set in the constructor', () => {
      const plugin = new Plugin({ name: 'test' });

      expect(plugin.userlist).toBe(undefined);
    });

    test('getting value should return the value that was set', () => {
      const plugin = new Plugin({
        name: 'test',
        userlist: {}
      });

      expect(plugin.userlist).toEqual({});
    });

    test('setting value should store set value', () => {
      const plugin = new Plugin({ name: 'test' });

      plugin.userlist = {};

      expect(plugin.userlist).toEqual({});
    });

    test('setting value to the current value should not fire an event', done => {
      const plugin = new Plugin({ name: 'test' });

      handleEvent = () => {
        done(new Error('Should not have fired an event'));
      };

      document.addEventListener('loot-plugin-item-content-change', handleEvent);

      plugin.userlist = plugin.userlist;

      setTimeout(done, 100);
    });

    test('setting value not equal to the current value should fire an event', done => {
      const plugin = new Plugin({ name: 'test' });

      handleEvent = evt => {
        expect(evt.detail.pluginId).toBe(plugin.id);
        expect(evt.detail.priority).toBe(plugin.priority);
        expect(evt.detail.globalPriority).toBe(plugin.globalPriority);
        expect(evt.detail.isEditorOpen).toBe(plugin.isEditorOpen);
        expect(evt.detail.hasUserEdits).toBe(plugin.hasUserEdits);
        done();
      };

      document.addEventListener('loot-plugin-item-content-change', handleEvent);

      plugin.userlist = { priority: 1 };
    });
  });

  describe('#priority', () => {
    let handleEvent;

    afterEach(() => {
      document.removeEventListener(
        'loot-plugin-item-content-change',
        handleEvent
      );
    });

    test('getting value should return 0 if it has not been set in the constructor', () => {
      const plugin = new Plugin({ name: 'test' });

      expect(plugin.priority).toBe(0);
    });

    test('getting value should return the value that was set', () => {
      const plugin = new Plugin({
        name: 'test',
        priority: 5
      });

      expect(plugin.priority).toBe(5);
    });

    test('setting value should store set value', () => {
      const plugin = new Plugin({ name: 'test' });

      plugin.priority = 5;

      expect(plugin.priority).toBe(5);
    });

    test('setting value to the current value should not fire an event', done => {
      const plugin = new Plugin({ name: 'test' });

      handleEvent = () => {
        done(new Error('Should not have fired an event'));
      };

      document.addEventListener('loot-plugin-item-content-change', handleEvent);

      plugin.priority = plugin.priority;

      setTimeout(done, 100);
    });

    test('setting value not equal to the current value should fire an event', done => {
      const plugin = new Plugin({ name: 'test' });

      handleEvent = evt => {
        expect(evt.detail.pluginId).toBe(plugin.id);
        expect(evt.detail.priority).toBe(plugin.priority);
        expect(evt.detail.globalPriority).toBe(plugin.globalPriority);
        expect(evt.detail.isEditorOpen).toBe(plugin.isEditorOpen);
        expect(evt.detail.hasUserEdits).toBe(plugin.hasUserEdits);
        done();
      };

      document.addEventListener('loot-plugin-item-content-change', handleEvent);

      plugin.priority = 5;
    });
  });

  describe('#globalPriority', () => {
    let handleEvent;

    afterEach(() => {
      document.removeEventListener(
        'loot-plugin-item-content-change',
        handleEvent
      );
    });

    test('getting value should return 0 if it has not been set in the constructor', () => {
      const plugin = new Plugin({ name: 'test' });

      expect(plugin.globalPriority).toBe(0);
    });

    test('getting value should return the value that was set', () => {
      const plugin = new Plugin({
        name: 'test',
        globalPriority: 5
      });

      expect(plugin.globalPriority).toBe(5);
    });

    test('setting value should store set value', () => {
      const plugin = new Plugin({ name: 'test' });

      plugin.globalPriority = 5;

      expect(plugin.globalPriority).toBe(5);
    });

    test('setting value to the current value should not fire an event', done => {
      const plugin = new Plugin({ name: 'test' });

      handleEvent = () => {
        done(new Error('Should not have fired an event'));
      };

      document.addEventListener('loot-plugin-item-content-change', handleEvent);

      plugin.globalPriority = plugin.globalPriority;

      setTimeout(done, 100);
    });

    test('setting value not equal to the current value should fire an event', done => {
      const plugin = new Plugin({ name: 'test' });

      handleEvent = evt => {
        expect(evt.detail.pluginId).toBe(plugin.id);
        expect(evt.detail.priority).toBe(plugin.priority);
        expect(evt.detail.globalPriority).toBe(plugin.globalPriority);
        expect(evt.detail.isEditorOpen).toBe(plugin.isEditorOpen);
        expect(evt.detail.hasUserEdits).toBe(plugin.hasUserEdits);
        done();
      };

      document.addEventListener('loot-plugin-item-content-change', handleEvent);

      plugin.globalPriority = 5;
    });
  });

  describe('#isEditorOpen', () => {
    let handleEvent;

    afterEach(() => {
      document.removeEventListener(
        'loot-plugin-item-content-change',
        handleEvent
      );
    });

    test('getting value should return false if it has not been set in the constructor', () => {
      const plugin = new Plugin({ name: 'test' });

      expect(plugin.isEditorOpen).toBe(false);
    });

    test('setting value should store set value', () => {
      const plugin = new Plugin({ name: 'test' });

      plugin.isEditorOpen = true;

      expect(plugin.isEditorOpen).toBe(true);
    });

    test('setting value to the current value should not fire an event', done => {
      const plugin = new Plugin({ name: 'test' });

      handleEvent = () => {
        done(new Error('Should not have fired an event'));
      };

      document.addEventListener('loot-plugin-item-content-change', handleEvent);

      plugin.isEditorOpen = plugin.isEditorOpen;

      setTimeout(done, 100);
    });

    test('setting value not equal to the current value should fire an event', done => {
      const plugin = new Plugin({ name: 'test' });

      handleEvent = evt => {
        expect(evt.detail.pluginId).toBe(plugin.id);
        expect(evt.detail.priority).toBe(plugin.priority);
        expect(evt.detail.globalPriority).toBe(plugin.globalPriority);
        expect(evt.detail.isEditorOpen).toBe(plugin.isEditorOpen);
        expect(evt.detail.hasUserEdits).toBe(plugin.hasUserEdits);
        done();
      };

      document.addEventListener('loot-plugin-item-content-change', handleEvent);

      plugin.isEditorOpen = true;
    });
  });

  describe('#isSearchResult', () => {
    let handleEvent;

    afterEach(() => {
      document.removeEventListener(
        'loot-plugin-card-styling-change',
        handleEvent
      );
    });

    test('getting value should return false if it has not been set in the constructor', () => {
      const plugin = new Plugin({ name: 'test' });

      expect(plugin.isSearchResult).toBe(false);
    });

    test('setting value should store set value', () => {
      const plugin = new Plugin({ name: 'test' });

      plugin.isSearchResult = true;

      expect(plugin.isSearchResult).toBe(true);
    });

    test('setting value to the current value should not fire an event', done => {
      const plugin = new Plugin({ name: 'test' });

      handleEvent = () => {
        done(new Error('Should not have fired an event'));
      };

      document.addEventListener('loot-plugin-card-styling-change', handleEvent);

      plugin.isSearchResult = plugin.isSearchResult;

      setTimeout(done, 100);
    });

    test('setting value not equal to the current value should fire an event', done => {
      const plugin = new Plugin({ name: 'test' });

      handleEvent = evt => {
        expect(evt.detail.pluginId).toBe(plugin.id);
        done();
      };

      document.addEventListener('loot-plugin-card-styling-change', handleEvent);

      plugin.isSearchResult = true;
    });
  });

  describe('#getCardContent()', () => {
    let plugin;
    beforeEach(() => {
      plugin = new Plugin({ name: 'test' });
    });

    test('should throw if no argument was passed', () => {
      expect(() => {
        plugin.getCardContent();
      }).toThrow();
    });

    test('should throw with an empty object', () => {
      plugin.messages = [
        {
          type: 'say',
          text: 'test message'
        }
      ];

      expect(() => {
        plugin.getCardContent({});
      }).toThrow();
    });

    test('should succeed if passed a filters object', () => {
      expect(() => {
        plugin.getCardContent(new Filters());
      }).not.toThrow();
    });
  });
});

describe('PluginCardContent', () => {
  let plugin;
  let filters;

  beforeEach(() => {
    plugin = new Plugin({
      name: 'test',
      version: 'foo',
      messages: [
        {
          type: 'say',
          text: 'test message',
          language: 'en'
        },
        {
          type: 'warn',
          text: 'do not clean',
          language: 'en'
        }
      ]
    });

    filters = new Filters();
  });

  describe('#name', () => {
    test("getting value should return plugin's value", () => {
      expect(plugin.getCardContent(filters).name).toBe(plugin.name);
    });

    test('setting value should throw', () => {
      expect(() => {
        plugin.getCardContent(filters).name = '';
      }).toThrow();
    });
  });

  describe('#isActive', () => {
    test("getting value should return plugin's value", () => {
      expect(plugin.getCardContent(filters).isActive).toBe(plugin.isActive);
    });

    test('setting value should throw', () => {
      expect(() => {
        plugin.getCardContent(filters).isActive = true;
      }).toThrow();
    });
  });

  describe('#isEmpty', () => {
    test("getting value should return plugin's value", () => {
      expect(plugin.getCardContent(filters).isEmpty).toBe(plugin.isEmpty);
    });

    test('setting value should throw', () => {
      expect(() => {
        plugin.getCardContent(filters).isEmpty = true;
      }).toThrow();
    });
  });

  describe('#isMaster', () => {
    test("getting value should return plugin's value", () => {
      expect(plugin.getCardContent(filters).isMaster).toBe(plugin.isMaster);
    });

    test('setting value should throw', () => {
      expect(() => {
        plugin.getCardContent(filters).isMaster = true;
      }).toThrow();
    });
  });

  describe('#loadsArchive', () => {
    test("getting value should return plugin's value", () => {
      expect(plugin.getCardContent(filters).loadsArchive).toBe(
        plugin.loadsArchive
      );
    });

    test('setting value should throw', () => {
      expect(() => {
        plugin.getCardContent(filters).loadsArchive = true;
      }).toThrow();
    });
  });

  describe('#version', () => {
    test("getting value should return plugin's value if the version filter is not enabled", () => {
      expect(plugin.getCardContent(filters).version).toBe(plugin.version);
    });

    test('getting value should return empty string if the version filter is enabled', () => {
      filters.hideVersionNumbers = true;
      expect(plugin.getCardContent(filters).version).toBe('');
    });

    test('setting value should throw', () => {
      expect(() => {
        plugin.getCardContent(filters).version = '';
      }).toThrow();
    });
  });

  describe('#tags', () => {
    test('should return an object containing empty strings if no tags are set', () => {
      expect(plugin.getCardContent(filters).tags).toEqual({
        added: '',
        removed: ''
      });
    });

    test('should return an object containing strings of comma-separated tag names if tags are set', () => {
      plugin.tags = [
        { name: 'Relev' },
        { name: 'Delev' },
        { name: 'Names' },
        { name: '-C.Climate' },
        { name: '-Actor.ABCS' }
      ];

      expect(plugin.getCardContent(filters).tags).toEqual({
        added: 'Relev, Delev, Names',
        removed: 'C.Climate, Actor.ABCS'
      });
    });

    test('should return an object containing empty strings if tags are set and the tags filter is enabled', () => {
      plugin.tags = [
        { name: 'Relev' },
        { name: 'Delev' },
        { name: 'Names' },
        { name: '-C.Climate' },
        { name: '-Actor.ABCS' }
      ];
      filters.hideBashTags = true;

      expect(plugin.getCardContent(filters).tags).toEqual({
        added: '',
        removed: ''
      });
    });

    test('should output a tag in the removed string if it appears as both added and removed', () => {
      plugin.tags = [{ name: 'Relev' }, { name: '-Relev' }];

      expect(plugin.getCardContent(filters).tags).toEqual({
        added: '',
        removed: 'Relev'
      });
    });

    test('setting value should throw', () => {
      expect(() => {
        plugin.getCardContent(filters).tags = {
          added: 'Relev',
          removed: 'Delev'
        };
      }).toThrow();
    });
  });

  describe('#crc', () => {
    test('should return an empty string if crc is undefined', () => {
      expect(plugin.getCardContent(filters).crc).toBe('');
    });

    test('should return an empty string if crc is zero', () => {
      plugin.crc = 0;

      expect(plugin.getCardContent(filters).crc).toBe('');
    });

    test('should return crc value as string if non zero', () => {
      plugin.crc = 0xdeadbeef;

      expect(plugin.getCardContent(filters).crc).toBe('DEADBEEF');
    });

    test('should return an empty string if crc is non-zero and the CRC filter is enabled', () => {
      plugin.crc = 0xdeadbeef;
      filters.hideCRCs = true;

      expect(plugin.getCardContent(filters).crc).toBe('');
    });

    test('should pad crc value to eight digits', () => {
      plugin.crc = 0xbeef;

      expect(plugin.getCardContent(filters).crc).toBe('0000BEEF');
    });

    test('setting value should throw', () => {
      expect(() => {
        plugin.getCardContent(filters).crc = 0xbecadeca;
      }).toThrow();
    });
  });

  describe('#messages', () => {
    test("should return message objects mapped from the plugin's message objects", () => {
      expect(plugin.getCardContent(filters).messages).toEqual(plugin.messages);
    });

    test('should return an array missing the note message when the notes filter is enabled', () => {
      filters.hideNotes = true;
      expect(plugin.getCardContent(filters).messages).toEqual([
        plugin.messages[1]
      ]);
    });

    test('should return an array missing the "do not clean" message when the "do not clean" messages filter is enabled', () => {
      filters.hideDoNotCleanMessages = true;
      expect(plugin.getCardContent(filters).messages).toEqual([
        plugin.messages[0]
      ]);
    });

    test('should return an empty array when the all messages filter is enabled', () => {
      filters.hideAllPluginMessages = true;
      expect(plugin.getCardContent(filters).messages).toEqual([]);
    });

    test('setting value should throw', () => {
      expect(() => {
        plugin.getCardContent(filters).messages = [];
      }).toThrow();
    });
  });

  describe('#containsText()', () => {
    test('should return true if argument is undefined', () => {
      expect(plugin.getCardContent(filters).containsText()).toBe(true);
    });

    test('should return true if argument is an empty string', () => {
      expect(plugin.getCardContent(filters).containsText('')).toBe(true);
    });

    test('should search name case-insensitively', () => {
      expect(plugin.getCardContent(filters).containsText('Tes')).toBe(true);
    });

    test('should search CRC case-insensitively', () => {
      plugin.crc = 0xdeadbeef;
      expect(plugin.getCardContent(filters).containsText('dead')).toBe(true);
    });

    test('should search added tags case-insensitively', () => {
      plugin.tags = [
        { name: 'Relev' },
        { name: 'Delev' },
        { name: 'Names' },
        { name: '-C.Climate' },
        { name: '-Actor.ABCS' }
      ];
      expect(plugin.getCardContent(filters).containsText('climate')).toBe(true);
    });

    test('should search removed tags case-insensitively', () => {
      plugin.tags = [
        { name: 'Relev' },
        { name: 'Delev' },
        { name: 'Names' },
        { name: '-C.Climate' },
        { name: '-Actor.ABCS' }
      ];
      expect(plugin.getCardContent(filters).containsText('.abc')).toBe(true);
    });

    test('should search message content case-insensitively', () => {
      expect(plugin.getCardContent(filters).containsText('Clean')).toBe(true);
    });

    test('should not find text that is not present', () => {
      expect(plugin.getCardContent(filters).containsText('say')).toBe(false);
    });
  });
});
