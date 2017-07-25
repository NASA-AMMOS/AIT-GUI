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

    oncreate(vnode) {
        let selectBox = document.getElementById('scriptSelectBox')
        selectBox.onchange = () => {
            vnode.attrs.ScriptSelectionData.selected = selectBox.value
            document.activeElement.blur()
            m.redraw()
        }
    },

    view(vnode) {
        return m('select', {
                   id: 'scriptSelectBox',
                   class: 'form-control',
                   multiple: 'true'
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
 * Additional attributes can be passed into the component via the
 * `additionalAttrs` attribute.
 *
 * The button is marked as disabled when `ScriptSelectionData.selected` is
 * null.
 */
const ScriptLoadButton = {
    oncreate(vnode) {
        document.getElementById('loadScriptButton').onclick = () => {
            let scriptName = encodeURIComponent(vnode.attrs.ScriptSelectionData.selected)
            m.request('/scripts/load/' + scriptName).then((data) => {
                vnode.attrs.ScriptSelectionData.scriptText = data.script_text
                bliss.events.emit('script:loaded', null)
            })
        }
    },

    view(vnode) {
        let btnAttrs = {
          id: 'loadScriptButton',
          class: 'btn btn-success',
        }

        merge(btnAttrs, vnode.attrs.additionalAttrs)

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
                                additionalAttrs: {'data-dismiss': 'modal'}
                            }))

        let scriptModal = m('div', {
                                class: 'modal fade',
                                id: 'scriptModal',
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
 * attribute.
 *
 * Functionality for the following buttons is not currently implemented:
 *      Step back
 *      Reset script
 *      Step forward
 */
const ScriptExecCtrl = {
    oninit(vnode) {
        this._script_state = vnode.attrs.scriptState
    },

    oncreate(vnode) {
        document.getElementById('scriptButtonRun').onclick = () => {
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

        let scriptFwdBtn = vnode.dom.getElementsByClassName('glyphicon-step-forward')[0]
        scriptFwdBtn.onclick = () => {
            scriptFwdBtn.setAttribute('disabled', 'disabled')
            m.request({
                    method: 'PUT',
                    url: '/script/step'
            }).then(() => {
                scriptFwdBtn.removeAttribute('disabled')
            })
        }
    },

    view(vnode) {
        this._script_state = vnode.attrs.scriptState

        // Invert the script execution state to give us the button display
        // classes / states
        const btnDisplayState = vnode.attrs.scriptState === 'running' ? 'pause' : 'play'

        let runBtnAttrs = {
            class: 'btn glyphicon glyphicon-' + btnDisplayState,
            id: 'scriptButtonRun'
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
            id: 'scriptButtonReset'
        })

        let stepBackButton = m('div', {
            class: 'btn glyphicon glyphicon-step-backward',
            disabled: 'disabled',
            id: 'scriptButtonBack'
        })

        let stepForwardAttrs = {
            class: 'btn glyphicon glyphicon-step-forward',
            id: 'scriptButtonForward'
        }

        if (this._script_state !== 'paused') {
            stepForwardAttrs['disabled'] = 'disabled'
        }

        let stepForwardButton = m('div', stepForwardAttrs)

        let loadButton = m('div', {
            class: 'btn glyphicon glyphicon-download-alt',
            'data-toggle': 'modal',
            'data-target': '#scriptModal'
        })

        let buttonDashboard = m('div', [
                                 stepBackButton,
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
            document.getElementById('scriptviewer'),
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
        }

        const initHelpText = 'To load a script, click the Load Script button above.'
        return m('form',
                 m('textarea', {id: 'scriptviewer'}, initHelpText))
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
        })

        bliss.events.on('script:step', (lineNum) => {
            ScriptsState.currentLine = lineNum - 1
        })

        bliss.events.on('script:done', () => {
            ScriptsState.currentLine = 0
        })
    },

    view(vnode) {
        let header = m('div', {class: 'col-lg-8 col-lg-offset-2'},
                       m('h3', 'Script Control Dashboard'))
        let scriptLoad = m(ScriptLoadModal, {ScriptSelectionData: ScriptsState.scriptSelectData})
        let scriptCtrl = m('div', {class: 'col-lg-8 col-lg-offset-2'}, m(ScriptExecCtrl, {
            ScriptSelectionData: ScriptsState.scriptSelectData,
            scriptState: ScriptsState.execState
        }))

        let scriptEditor = m('div', {class: 'col-lg-8 col-lg-offset-2'},
                             m(ScriptEditor, {
                                 ScriptSelectionData: ScriptsState.scriptSelectData,
                                 scriptState: ScriptsState.execState,
                                 currentLine: ScriptsState.currentLine
                             }))

        return m('div', [
                  m('div', {class: 'row'}, header),
                  m('div', {class: 'row'}, scriptCtrl),
                  m('div', {class: 'row'}, scriptEditor),
                  scriptLoad
                ])
    }
}

export default {Scripts, ScriptEditor, ScriptExecCtrl, ScriptLoadModal, ScriptLoadButton, ScriptSelect}
export {Scripts, ScriptEditor, ScriptExecCtrl, ScriptLoadModal, ScriptLoadButton, ScriptSelect}
