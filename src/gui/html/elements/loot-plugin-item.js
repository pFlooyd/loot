// <link rel="import" href="../../../../bower_components/polymer/polymer-element.html">
//
// link rel="import" href="../../../../bower_components/iron-icon/iron-icon.html">
// <link rel="import" href="../../../../bower_components/iron-icons/iron-icons.html">
//
// <link rel="import" href="../../../../bower_components/paper-item/paper-item.html">
// <link rel="import" href="../../../../bower_components/paper-item/paper-item-body.html">
// <link rel="import" href="../../../../bower_components/paper-ripple/paper-ripple.html">
// <link rel="import" href="../../../../bower_components/paper-tooltip/paper-tooltip.html">
// Also depends on the loot.l10n global.

export default class LootPluginItem extends Polymer.Element {
  static get is() {
    return 'loot-plugin-item';
  }

  static get properties() {
    return {
      loadOrderIndex: {
        type: Number,
        value: undefined
      },
      priority: {
        type: String,
        value: ''
      },
      globalPriority: {
        type: String,
        value: ''
      },
      isEditorOpen: {
        type: Boolean,
        value: false
      },
      hasUserEdits: {
        type: Boolean,
        value: false
      },
      isLightMaster: {
        type: Boolean,
        value: false
      }
    };
  }

  static get template() {
    return Polymer.html`
      <style>
        /* Flip effect for user metadata / editor open icons. */
        #flipper {
          transform-style: preserve-3d;
          transition: var(--state-transition-time);
          overflow: visible;
        }
        #flipper.flipped {
          transform: rotateY(180deg);
        }
        #hasUserEdits,
        #editorIsOpen {
          display: block;
          margin-right: 0;
          backface-visibility: hidden;
        }
        #hasUserEdits {
          transform: translateZ(1px);
          position: absolute;
          top: 0;
          left: 0;
        }
        #editorIsOpen {
          transform: rotateY(180deg) translateZ(-1px);
        }

        /* paper-item (two-line) */
        paper-icon-item {
          position: relative;
          min-height: 32px;
          line-height: 32px;
          font-size: 1rem;

          --paper-item-focused-before: {
            opacity: 0;
          };

          --paper-item-icon-width: 32px;
        }
        paper-item-body[two-line] {
          min-height: 32px;
          height: 32px;
        }
        :host-context(body[data-state=editing]) paper-item-body[two-line] {
          min-height: 40px;
        }
        #icon {
          border: 1px solid var(--loot-plugin-item-index-border-color, var(--paper-grey-400));
          border-radius: 50%;
          color: var(--secondary-text-color);
          height: 24px;
          width: 24px;
          line-height: 24px;
          text-align: center;
          font-family: monospace;
          text-transform: uppercase;
        }
        #primary,
        #secondary,
        #secondary iron-icon {
          transition: height var(--state-transition-time);
        }
        :host-context(body[data-state=editing]) #primary {
            line-height: normal;
        }
        #secondary > span {
            font-size: 0.857rem;
            color: var(--secondary-text-color);
            height: 13px;
            overflow: visible;
        }
        #secondary iron-icon {
          height: 13px;
          vertical-align: text-bottom;
        }
        iron-icon {
            color: var(--secondary-text-color);
        }
        /* When not in edit mode, hide secondary text. */
        :host-context(body:not([data-state=editing])) #secondary {
            height: 0;
            overflow: hidden;
        }
        [hidden],
        #hasUserEdits[hidden] {
          display: none;
        }
        :host {
          cursor: pointer;
        }
        paper-ripple {
          color: var(--accent-color);
        }
        #icon.lightMaster {
          white-space: pre;
          line-height: 12px;
          width: 32px;
          position: relative;
          left: -3px;
          border: none;
        }
      </style>
      <paper-icon-item>
        <paper-ripple></paper-ripple>
        <div id="icon" slot="item-icon" class$="[[computeLoadOrderIndexClass(isLightMaster)]]" hidden$="[[!computeLoadOrderIndexText(loadOrderIndex, isLightMaster)]]">[[computeLoadOrderIndexText(loadOrderIndex, isLightMaster)]]</div>
        <paper-item-body two-line>
          <div id="primary"><slot></slot></div>
          <div id="secondary" secondary>
            <span hidden$="[[!globalPriority]]">
              <iron-icon icon="star"></iron-icon>
              <span>[[globalPriority]]</span>
              <paper-tooltip id="globalPriorityTooltip" position="right">[[_localise('Global Priority')]]</paper-tooltip>
            </span>
            <span hidden$="[[!priority]]">
              <iron-icon icon="star-border"></iron-icon>
              <span>[[priority]]</span>
              <paper-tooltip id="localPriorityTooltip" position="right">[[_localise('Priority')]]</paper-tooltip>
            </span>
          </div>
        </paper-item-body>
        <paper-tooltip for="editorIsOpen" position="left">[[_localise('Editor Is Open')]]</paper-tooltip>
        <paper-tooltip for="hasUserEdits" position="left">[[_localise('Has User Metadata')]]</paper-tooltip>
        <div id="flipper" class$="[[computeFlipperClass(isEditorOpen)]]">
          <iron-icon id="editorIsOpen" icon="create"></iron-icon>
          <iron-icon id="hasUserEdits" icon="account-circle" hidden$="[[!hasUserEdits]]"></iron-icon>
        </div>
      </paper-icon-item>`;
  }

  static _asHexString(number, numberOfDigits) {
    const text = number.toString(16);
    return '0'.repeat(numberOfDigits - text.length) + text;
  }

  /* eslint-disable class-methods-use-this */
  _localise(text) {
    return loot.l10n.translate(text);
  }

  computeFlipperClass(isEditorOpen) {
    if (isEditorOpen) {
      return 'flipped';
    }
    return '';
  }

  computeLoadOrderIndexClass(isLightMaster) {
    if (isLightMaster) {
      return 'lightMaster';
    }
    return '';
  }

  computeLoadOrderIndexText(loadOrderIndex, isLightMaster) {
    if (loadOrderIndex > -1) {
      if (isLightMaster) {
        return `FE\n${LootPluginItem._asHexString(loadOrderIndex, 3)}`;
      }

      return LootPluginItem._asHexString(loadOrderIndex, 2);
    }

    return '';
  }

  onDragStart(evt) {
    evt.dataTransfer.effectAllowed = 'copy';
    evt.dataTransfer.setData('text/plain', evt.currentTarget.getName());
    evt.dataTransfer.setDragImage(evt.currentTarget, 325, 175);
  }
  /* eslint-enable class-methods-use-this */

  getName() {
    return this.textContent.trim();
  }

  updateContent(pluginData) {
    this.loadOrderIndex = pluginData.loadOrderIndex;
    this.priority = pluginData.priority;
    this.globalPriority = pluginData.globalPriority;
    this.isEditorOpen = pluginData.isEditorOpen;
    this.hasUserEdits = pluginData.hasUserEdits;
    this.isLightMaster = pluginData.isLightMaster;

    const indexText = this.computeLoadOrderIndexText(
      this.loadOrderIndex,
      this.isLightMaster
    );
    this.$.icon.className = this.computeLoadOrderIndexClass(this.isLightMaster);
    this.$.icon.hidden = !indexText;
    this.$.icon.textContent = indexText;
  }
}

customElements.define(LootPluginItem.is, LootPluginItem);
