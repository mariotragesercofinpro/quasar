import Vue from 'vue'

import QDialog from './QDialog.js'
import QBtn from '../btn/QBtn.js'

import QCard from '../card/QCard.js'
import QCardSection from '../card/QCardSection.js'
import QCardActions from '../card/QCardActions.js'

import QInput from '../input/QInput.js'
import QOptionGroup from '../option-group/QOptionGroup.js'

export default Vue.extend({
  name: 'DialogPlugin',

  props: {
    title: String,
    message: String,
    prompt: Object,
    options: Object,

    ok: {
      type: [String, Object, Boolean],
      default: true
    },
    cancel: [String, Object, Boolean],

    width: {
      type: String,
      default: '400px'
    },

    stackButtons: Boolean,
    color: {
      type: String,
      default: 'primary'
    },

    // QDialog props
    maximized: Boolean,
    persistent: Boolean,
    seamless: Boolean,
    noEscKey: Boolean,
    position: { required: false },
    fullWidth: Boolean,
    fullHeight: Boolean,
    transitionShow: { required: false },
    transitionHide: { required: false }
  },

  computed: {
    hasForm () {
      return this.prompt || this.options
    },

    okLabel () {
      return this.ok === true
        ? this.$q.i18n.label.ok
        : this.ok
    },

    cancelLabel () {
      return this.cancel === true
        ? this.$q.i18n.label.cancel
        : this.cancel
    },

    okProps () {
      return Object(this.ok) === this.ok
        ? Object.assign({
          color: this.color,
          label: this.$q.i18n.label.ok,
          ripple: false
        }, this.ok)
        : {
          color: this.color,
          flat: true,
          label: this.okLabel,
          ripple: false
        }
    },

    cancelProps () {
      return Object(this.cancel) === this.cancel
        ? Object.assign({
          color: this.color,
          label: this.$q.i18n.label.cancel,
          ripple: false
        }, this.cancel)
        : {
          color: this.color,
          flat: true,
          label: this.cancelLabel,
          ripple: false
        }
    }
  },

  methods: {
    show () {
      this.cancelled = true
      this.$refs.dialog.show()
    },

    hide () {
      this.$refs.dialog.hide()
    },

    getPrompt (h) {
      return [
        h(QInput, {
          props: {
            value: this.prompt.model,
            type: this.prompt.type || 'text',
            color: this.color,
            autofocus: true
          },
          on: {
            input: v => { this.prompt.model = v },
            keyup: evt => {
              // if ENTER key
              if (evt.keyCode === 13) {
                this.onOk()
              }
            }
          }
        })
      ]
    },

    getOptions (h) {
      return [
        h(QOptionGroup, {
          props: {
            value: this.options.model,
            type: this.options.type,
            color: this.color,
            inline: this.options.inline,
            options: this.options.items
          },
          on: {
            change: v => { this.options.model = v }
          }
        })
      ]
    },

    getButtons (h) {
      const child = []

      if (this.cancel) {
        child.push(h(QBtn, {
          props: this.cancelProps,
          on: { click: this.onCancel }
        }))
      }
      if (this.ok) {
        child.push(h(QBtn, {
          props: this.okProps,
          on: { click: this.onOk }
        }))
      }

      return h(QCardActions, {
        props: {
          vertical: this.stackButtons,
          align: 'right'
        }
      }, child)
    },

    onOk () {
      this.cancelled = false
      this.$emit('ok', this.getData())
      this.hide()
    },

    onCancel () {
      this.hide()
    },

    getData () {
      if (this.prompt) {
        return this.prompt.model
      }
      if (this.options) {
        return this.options.model
      }
    }
  },

  render (h) {
    const child = []

    if (this.title) {
      child.push(
        h(QCardSection, {
          staticClass: 'text-h6'
        }, [ this.title ])
      )
    }

    if (this.message) {
      child.push(
        h(QCardSection, {
          staticClass: 'text-grey-7  scroll'
        }, [ this.message ])
      )
    }

    if (this.hasForm) {
      child.push(
        h(
          QCardSection,
          { staticClass: 'scroll' },
          this.prompt ? this.getPrompt(h) : this.getOptions(h)
        )
      )
    }

    if (this.ok || this.cancel) {
      child.push(this.getButtons(h))
    }

    return h(QDialog, {
      ref: 'dialog',

      props: {
        value: this.value,
        maximized: this.maximized,
        persistent: this.persistent,
        noEscKey: this.noEscKey,
        position: this.position
      },

      on: {
        hide: () => {
          this.cancelled === true && this.$emit('cancel')
          this.$emit('hide')
        }
      }
    }, [
      h(QCard, {
        style: 'width: ' + this.width
      }, child)
    ])
  }
})
