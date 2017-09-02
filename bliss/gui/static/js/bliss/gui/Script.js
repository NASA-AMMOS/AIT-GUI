import * as CodeMirror from 'codemirror'

import map from 'lodash/map'
import merge from 'lodash/merge'

/**
 * Multi-select input box that displays scripts provided by the backend REST
 * API. When the user selects a value in the select box the component updates
 * the ScriptSelectionData.selected attribute with the selected value.
 */
const ScriptSelect = {
    scripts: [],

    oninit(vnode) {
        m.request('/scripts').then((data) => {
            this.scripts = map(data, (value) => {return m('option', {value: value}, value)})
        })
    },

    view(vnode) {
        return m('select', {
                   class: 'form-control',
                   multiple: 'true',
                   onchange: (e) => {
                       vnode.attrs.ScriptSelectionData.selected = e.currentTarget.value
                       document.activeElement.blur()
                   }
                 },
                 this.scripts)
    },
}

/**
 * Button component that handles user selected script loading.
 *
 * When the user clicks this button the script specified in the attribute
 * `ScriptSelectionData.selected` is passed to the BLISS REST API for loading.
 * The text returned from the loaded script is saved into the attribute
 * `ScriptSelectionData.script_text`.
 *
 * The button is marked as disabled when `ScriptSelectionData.selected` is
 * null.
 */
const ScriptLoadButton = {
    view(vnode) {
        let btnAttrs = {
          class: 'btn btn-success',
          onclick: (e) => {
              let scriptName = encodeURIComponent(vnode.attrs.ScriptSelectionData.selected)
              m.request('/scripts/load/' + scriptName).then((data) => {
                  vnode.attrs.ScriptSelectionData.scriptText = data.script_text
                  bliss.events.emit('script:loaded', null)
              })
          }
        }

        merge(btnAttrs, vnode.attrs)

        if (vnode.attrs.ScriptSelectionData.selected === null) {
            btnAttrs.disabled = 'disabled'
        }

        return m('button', btnAttrs, 'Load')
    }
}

/**
 * A modal that allows the user to view scripts and select one to load.
 *
 * This modal uses the ScriptSelect and ScriptLoadButton components.
 *
 * Script selection and text data is passed through this component via the
 * `ScriptSelectionData` dictionary attribute. The `selected` and `script_text`
 * elements store the relevant information for passing between the ScriptSelect
 * and ScriptLoadButton components.
 */
const ScriptLoadModal = {
    view(vnode) {
        let modalHeader = m('div', {class: 'modal-header'}, [
                              m('button', {
                                  class: 'close',
                                  'data-dismiss': 'modal'
                                },
                                m('span', '\u00D7')),
                              m('h4', {class: 'modal-title'}, 'Load Sequence / Script')
                            ])

        let modalBody = m('div', {class: 'modal-body'},
                          m(ScriptSelect, {ScriptSelectionData: vnode.attrs.ScriptSelectionData}))

        let modalFooter = m('div', {class: 'modal-footer'},
                            m(ScriptLoadButton, {
                                ScriptSelectionData: vnode.attrs.ScriptSelectionData,
                                'data-dismiss': 'modal'
                            }))

        let scriptModal = m('div', {
                                class: 'modal fade',
                                tabindex: '-1',
                                role: 'dialog'
                            },
                            m('div', {
                                class: 'modal-dialog modal-lg',
                                role: 'document'
                              },
                              m('div', {class: 'modal-content'}, [
                                  modalHeader,
                                  modalBody,
                                  modalFooter
                                ])))

        return scriptModal
    }
}

/**
 * Script execution control dashboard.
 *
 * This component allows the user to run a script that they've selected
 * and loaded via the BLISS REST API. The script that the user has selected
 * to run is passed into the component via the `ScriptSelectionData.selected`
 * attribute. The function that the load button should perform when clicked is
 * expected to be provided as the attribute `loadButtonAction`.
 *
 * Functionality for the following buttons is not currently implemented:
 *      Step back
 *      Reset script
 */
const ScriptExecCtrl = {
    oninit(vnode) {
        this._script_state = vnode.attrs.scriptState
    },

    view(vnode) {
        this._script_state = vnode.attrs.scriptState

        // Invert the script execution state to give us the button display
        // classes / states
        const btnDisplayState = vnode.attrs.scriptState === 'running' ? 'pause' : 'play'

        let runBtnAttrs = {
            class: 'btn glyphicon glyphicon-' + btnDisplayState,
            onclick: (e) => {
                if (this._script_state === 'running') {
                    m.request({
                        method: 'PUT',
                        url: '/script/pause'
                    })
                } else if (this._script_state === 'paused') {
                    m.request({
                        method: 'PUT',
                        url: '/script/run'
                    })
                } else {
                    if (vnode.attrs.ScriptSelectionData.selected !== null) {
                        let data = new FormData()
                        data.append('scriptPath', vnode.attrs.ScriptSelectionData.selected)
                        m.request({
                            method: 'POST',
                            url: '/script/run',
                            data: data
                        })
                    }
                }
            }
        }

        // The Run button should be disabled in situations where running doesn't
        // make sense (init) or where it wouldn't be possible (error). When
        // a script is running / paused we update the display to color it
        // appropriately (default is black).
        if (vnode.attrs.scriptState === 'init' ||
            vnode.attrs.scriptState === 'error') {
            runBtnAttrs.disabled = 'disabled'
        } else {
            runBtnAttrs.class += ' bliss-script-' + btnDisplayState
        }

        let runButton = m('div', runBtnAttrs)

        // NOTE: The Reset, and Step Back buttons are not
        // currently implemented. They are marked as disabled for the interim.
        let resetButton = m('div', {
            class: 'btn glyphicon glyphicon-refresh',
            disabled: 'disabled',
        })

        let stepForwardAttrs = {
            class: 'btn glyphicon glyphicon-step-forward',
            onclick: (e) => {
                e.target.setAttribute('disabled', 'disabled')
                m.request({
                        method: 'PUT',
                        url: '/script/step'
                }).then(() => {
                    e.target.removeAttribute('disabled')
                })
            }
        }

        if (this._script_state !== 'paused') {
            stepForwardAttrs['disabled'] = 'disabled'
        }

        let stepForwardButton = m('div', stepForwardAttrs)

        let loadButton = m('div', {
            class: 'btn glyphicon glyphicon-download-alt',
            onclick: vnode.attrs.loadButtonAction
        })

        let buttonDashboard = m('div', [
                                 runButton,
                                 resetButton,
                                 stepForwardButton,
                                 loadButton
                              ])

        return buttonDashboard
    }
}

/**
 * Handle loaded script display and realtime execution status
 *
 * Displays a loaded script via the CodeMirror library and displays
 * current script line execution data along with execution state
 * information. The current line marker provides information on
 * the script execution state via color changes while pointing at the
 * current line of the script that is executing.
 *
 * black arrow: Indicates the script is loaded and prepared to
 *                execute at the marked line.
 * green arrow: Indicates the script is running at the marked line
 * red arrow:   Indicates an error occurred at the marked line. See
 *              the log messages for information on the encountered
 *              error.
 */
const ScriptEditor = {
    _scrollState: null,

    oninit(vnode) {
        this._marker = document.createElement('span')
    },

    oncreate(vnode) {
        this._cm = CodeMirror.fromTextArea(
            vnode.dom.elements['scriptview'],
            {
                lineNumbers: true,
                readOnly: true,
                gutters: ['codeMirrorExecGutter', 'CodeMirror-linenumbers']
            }
        )
    },

    onbeforeupdate(vnode) {
        if (this._cm !== undefined) {
            this._scrollState = this._cm.getScrollInfo()
        }
    },

    view(vnode) {
        if (this._cm !== undefined) {
            // Display the loaded script text in the editor
            if (vnode.attrs.ScriptSelectionData.scriptText !== null) {
                this._cm.setValue(vnode.attrs.ScriptSelectionData.scriptText)
            }

            // Handle the gutter marker display parameters once we have a script
            // loaded (AKA, when we're out of the init state).
            if (vnode.attrs.scriptState !== 'init') {
                if (vnode.attrs.scriptState === 'paused') {
                    this._marker.className = "glyphicon glyphicon-pause bliss-script-" +
                                             vnode.attrs.scriptState
                } else {
                    this._marker.className = "glyphicon glyphicon-play bliss-script-" +
                                             vnode.attrs.scriptState
                }
                this._cm.setGutterMarker(vnode.attrs.currentLine, 'codeMirrorExecGutter', this._marker)
            }

            if (vnode.attrs.scriptState === 'running') {
                this._cm.scrollIntoView(vnode.attrs.currentLine)
            } else {
                this._cm.scrollTo(this._scrollState.left, this._scrollState.top)
            }

            this._cm.refresh()
        }

        const initHelpText = 'To load a script, click the Load Script button above.'
        return m('form',
                 m('textarea', {name: 'scriptview'}, initHelpText))
    }
}


let ScriptsState = {
    execState: 'init',
    scriptSelectData: {
        selected: null,
        scriptText: null
    },
    currentLine: 0
}

/**
 * Manages global script states and component layout
 */
const Scripts = {
    oninit(vnode) {
        this._marker = document.createElement('span')
        this._script_load_toggle = true

        bliss.events.on('script:start', () => {
            ScriptsState.execState = 'running'
        })

        bliss.events.on('script:done', () => {
            ScriptsState.execState = 'stopped'
        })

        bliss.events.on('script:error', (e) => {
            ScriptsState.execState = 'error'
        })

        bliss.events.on('script:pause', (e) => {
            ScriptsState.execState = 'paused'
        })

        bliss.events.on('script:resume', (e) => {
            ScriptsState.execState = 'running'
        })
        
        bliss.events.on('script:loaded', (e) => {
            ScriptsState.execState = 'stopped'
            this._script_load_toggle = !this._script_load_toggle
        })

        bliss.events.on('script:step', (lineNum) => {
            ScriptsState.currentLine = lineNum - 1
        })

        bliss.events.on('script:done', () => {
            ScriptsState.currentLine = 0
        })
    },

    view(vnode) {
        let scriptLoad = m(ScriptSelect, {ScriptSelectionData: ScriptsState.scriptSelectData})
        let scriptCtrl = m('div', {class: 'col-lg-12'}, m(ScriptExecCtrl, {
            ScriptSelectionData: ScriptsState.scriptSelectData,
            scriptState: ScriptsState.execState,
            loadButtonAction: () => {
                this._script_load_toggle = !this._script_load_toggle
            }
        }))

        let scriptEditor = m('div', {class: 'col-lg-12'},
                             m(ScriptEditor, {
                                 ScriptSelectionData: ScriptsState.scriptSelectData,
                                 scriptState: ScriptsState.execState,
                                 currentLine: ScriptsState.currentLine
                             }))

        let loadBlockAttrs = {}
        if (this._script_load_toggle) {
            loadBlockAttrs['style'] = 'display:none;'
        }

        return m('div', [
                  m('div', {class: 'row'}, scriptCtrl),
                  m('div', loadBlockAttrs, [
                    m('div', {class: 'row'}, m('br')),
                    m('div', {class: 'row'},
                      m('div', {class: 'col-lg-12'}, scriptLoad)
                    ),
                    m('div', {class: 'row'}, m('div', {class: 'col-lg-1 col-lg-offset-11'}, [
                      m('br'),
                      m(ScriptLoadButton, {
                          ScriptSelectionData: ScriptsState.scriptSelectData,
                      })
                    ])),
                    m('div', {class: 'row'}, m('br')),
                  ]),
                  m('div', {class: 'row'}, scriptEditor),
                ])
    }
}

export default {Scripts, ScriptEditor, ScriptExecCtrl, ScriptLoadModal, ScriptLoadButton, ScriptSelect}
export {Scripts, ScriptEditor, ScriptExecCtrl, ScriptLoadModal, ScriptLoadButton, ScriptSelect}
