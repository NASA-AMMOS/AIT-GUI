/*
 * Advanced Multi-Mission Operations System (AMMOS) Instrument Toolkit (AIT)
 * Bespoke Link to Instruments and Small Satellites (BLISS)
 *
 * Copyright 2017, by the California Institute of Technology. ALL RIGHTS
 * RESERVED. United States Government Sponsorship acknowledged. Any
 * commercial use must be negotiated with the Office of Technology Transfer
 * at the California Institute of Technology.
 *
 * This software may be subject to U.S. export control laws. By accepting
 * this software, the user agrees to comply with all applicable U.S. export
 * laws and regulations. User has the responsibility to obtain export licenses,
 * or other export authority as may be required before exporting such
 * information to foreign countries or providing access to foreign persons.
 */

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
    _filter_val: '',

    oninit(vnode) {
        m.request('/scripts').then((data) => {
            data = data.sort((a, b) => {
                if (a.indexOf('/') !== -1 && b.indexOf('/') !== -1) {
                    return a < b ? -1 : 1
                } else if (a.indexOf('/') !== -1) {
                    return -1
                } else if (b.indexOf('/') !== -1) {
                    return 1
                }
            })

            this.scripts = map(data, (value, index) => {
                return m('option', {value: value, key: index}, value)
            })
        })
    },

    oncreate(vnode) {
        ait.events.on('script:loaded', () => {
            this._filter_val = ''
            vnode.dom.elements['script-filter'].value = ''
            vnode.dom.elements['script-select'].value = ''
        })
    },

    view(vnode) {
        let scriptDisplayList = this.scripts
        if (this._filter_val !== '') {
            scriptDisplayList = this.scripts.filter((e) => {
                return e.attrs.value.indexOf(this._filter_val) !== -1
            })
        }

        let filterInputGroup = m('div', {class: 'form-group'}, [
            m('label', 'Filter Scripts'),
            m('div', {
                class: 'input-group'
            },
            [
                m('input', {
                    class: 'form-control',
                    placeholder: 'Filter list ...',
                    name: 'script-filter',
                    oninput: (e) => {
                        this._filter_val = e.currentTarget.value
                    }
                }, this._filter_val),
                m('div', {class: 'input-group-btn'},
                m('button', {
                    class: 'btn btn-default',
                    type: 'button',
                    onmousedown: (e) => {
                        let cur = e.currentTarget
                        while (cur.parentElement && ! cur.elements) {
                            cur = cur.parentElement
                        }
                        cur.elements['script-filter'].value = ''
                        this._filter_val = ''
                    }
                  },
                  m('span', {class: 'glyphicon glyphicon-remove-circle'})))
            ])
        ])

        let select = m('select', {
                   class: 'form-control',
                   name: 'script-select',
                   multiple: 'true',
                   onchange: (e) => {
                       vnode.attrs.ScriptSelectionData.selected = e.currentTarget.value
                       document.activeElement.blur()
                   }
                 },
                 scriptDisplayList)

             return m('form', {
                        onsubmit: (e) => {
                            e.preventDefault()
                            return false
                        }
                    },
                    [filterInputGroup, select])
    },
}

/**
 * Button component that handles user selected script loading.
 *
 * When the user clicks this button the script specified in the attribute
 * `ScriptSelectionData.selected` is passed to the AIT REST API for loading.
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
              m.request('/scripts/load/' + encodeURIComponent(scriptName)).then((data) => {
                  vnode.attrs.ScriptSelectionData.scriptText = data.script_text
                  ait.events.emit('script:loaded', null)
              })
          }
        }

        merge(btnAttrs, vnode.attrs)

        if (vnode.attrs.ScriptSelectionData.selected === null) {
            btnAttrs.disabled = 'disabled'
        }

        return m('ait-scriptloadbutton', m('button', btnAttrs, 'Load'))
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

        return m('ait-scriptloadmodal', scriptModal)
    }
}

/**
 * Script execution control dashboard.
 *
 * This component allows the user to run a script that they've selected
 * and loaded via the AIT REST API. The script that the user has selected
 * to run is passed into the component via the `ScriptSelectionData.selected`
 * attribute. The function that the load button should perform when clicked is
 * expected to be provided as the attribute `loadButtonAction`.
 *
 */
const ScriptExecCtrl = {
    oninit(vnode) {
        this._script_state = vnode.attrs.scriptState
        this._script_exec_triggered = false
    },

    view(vnode) {
        this._script_state = vnode.attrs.scriptState

        // We need to track whether we have internally triggered a script
        // execution and compare it against the "global" execution state
        // to ensure that we're preventing functionality from being
        // triggered multiple times. Most importantly, we need this to
        // ensure that a script cannot be triggered twice via double
        // clicking the execution button
        //
        // If the global state indicates that a script is running we know
        // that we can safely say that the execution has propagated and
        // we can stop preventing functionality.
        if (this._script_state === 'running') this._script_exec_triggered = false

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
                    if (this._script_exec_triggered) return

                    if (vnode.attrs.ScriptSelectionData.selected !== null) {
                        this._script_exec_triggered = true
                        let data = new FormData()
                        data.append('scriptPath', vnode.attrs.ScriptSelectionData.selected)
                        m.request({
                            method: 'POST',
                            url: '/script/run',
                            data: data
                        }).catch(() => {
                            // If something failed when we were trying to run the script we
                            // need to update internal logic so we're not out of sync. E.g.,
                            // the script might have not been loaded so nothing executed.
                            this._script_exec_triggered = false
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
            runBtnAttrs.class += ' .' + btnDisplayState
        }

        let runButton = m('button', runBtnAttrs)

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

        let stepForwardButton = m('button', stepForwardAttrs)

        let loadButton = m('button', {
            class: 'btn glyphicon glyphicon-download-alt',
            onclick: vnode.attrs.loadButtonAction
        })

        let abortAttrs = {
            class: 'btn glyphicon glyphicon-ban-circle',
            onclick: (e) => {
                e.target.setAttribute('disabled', 'disabled')
                m.request({
                        method: 'DELETE',
                        url: '/script/abort'
                }).then(() => {
                    e.target.removeAttribute('disabled')
                })
            }
        }

        if (vnode.attrs.scriptState === 'init' ||
            vnode.attrs.scriptState === 'stopped') {
            abortAttrs['disabled'] = 'disabled'
        }

        let abortButton = m('button', abortAttrs)

        let buttonDashboard = m('div', [
                                 runButton,
                                 stepForwardButton,
                                 abortButton,
                                 loadButton
                              ])

        return m('ait-scriptexecctrl', buttonDashboard)
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
            vnode.dom.children[0].elements['scriptview'],
            {
                lineNumbers: true,
                lineWrapping: true,
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
                    this._marker.className = "glyphicon glyphicon-pause " +
                                             vnode.attrs.scriptState
                } else {
                    this._marker.className = "glyphicon glyphicon-play " +
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
        return m('ait-scripteditor',
                m('form',
                  m('textarea', {name: 'scriptview'}, initHelpText)))
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


const ScriptNotification = {
    oninit(vnode) {
        this._state = 'none',
        this._script = '',

        ait.events.on('script:loaded', () => {
            this._state = 'loaded'
            this._script = vnode.attrs.ScriptSelectionData.selected
            m.redraw()
        })

        ait.events.on('script:start', () => {
            this._state = 'loaded'
            m.redraw()
        })

        ait.events.on('script:done', () => {
            this._state = 'done'
            m.redraw()
        })

        ait.events.on('script:error', () => {
            this._state = 'error'
            m.redraw()
        })

        ait.events.on('script:aborted', () => {
            this._state = 'aborted'
            m.redraw()
        })
    },

    view(vnode) {
        let msg = ''
        let attrs = {role: 'alert'}

        if (this._state === 'loaded') {
            msg = ' loaded'
        } else if (this._state === 'done') {
            attrs['class'] = 'alert alert-success'
            msg = ' finished execution'
        } else if (this._state === 'error') {
            attrs['class'] = 'alert alert-danger'
            msg = ' encountered an error'
        } else if (this._state === 'aborted') {
            attrs['class'] = 'alert alert-warning'
            msg = ' execution aborted'
        }

        if (msg !== '' && this._script) {
            return m('ait-scriptnotification', [
                m('div', attrs, [
                  m('strong', 'Status: '),
                  this._script + msg,
                ]),
            ])
        }
    }
}


/**
 * Script display, state management, and execution control.
 *
 * @example
 * <ait-scripts></ait-scripts>
 */
const Scripts = {
    oninit(vnode) {
        this._marker = document.createElement('span')
        this._script_load_toggle = true

        ait.events.on('script:start', () => {
            ScriptsState.execState = 'running'
        })

        ait.events.on('script:error', (e) => {
            ScriptsState.execState = 'error'
        })

        ait.events.on('script:pause', (e) => {
            ScriptsState.execState = 'paused'
        })

        ait.events.on('script:resume', (e) => {
            ScriptsState.execState = 'running'
        })

        ait.events.on('script:loaded', (e) => {
            ScriptsState.execState = 'stopped'
            this._script_load_toggle = !this._script_load_toggle
            ScriptsState.currentLine = 0
        })

        ait.events.on('script:step', (lineNum) => {
            ScriptsState.currentLine = lineNum - 1
        })

        ait.events.on('script:done', () => {
            ScriptsState.execState = 'stopped'
            ScriptsState.currentLine = 0
        })

        ait.events.on('script:aborted', () => {
            ScriptsState.execState = 'stopped'
            ScriptsState.currentLine = 0
        })
    },

    view(vnode) {
        let scriptLoad = m(ScriptSelect, {ScriptSelectionData: ScriptsState.scriptSelectData})

        let scriptCtrl = m('div', {class: 'col-lg-12'},
          m(ScriptExecCtrl, {
            ScriptSelectionData: ScriptsState.scriptSelectData,
            scriptState: ScriptsState.execState,
            loadButtonAction: () => {
                this._script_load_toggle = !this._script_load_toggle
            }
        }))
        let notifications = m('div', {class: 'col-lg-12'},
          m(ScriptNotification, {
            ScriptSelectionData: ScriptsState.scriptSelectData,
        }))

        let scriptEditor = m('div', {class: 'col-lg-12'},
                             m(ScriptEditor, {
                                 ScriptSelectionData: ScriptsState.scriptSelectData,
                                 scriptState: ScriptsState.execState,
                                 currentLine: ScriptsState.currentLine
                             }))

        let loadBlockAttrs = {}
        if (this._script_load_toggle) {
            loadBlockAttrs['class'] = 'load_dialog--hidden'
        }

        return m('ait-script', m('div', [
                  m('div', {class: 'row'}, scriptCtrl),
                  m('div', {class: 'row'}, notifications),
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
                ]))
    }
}

export default {Scripts, ScriptEditor, ScriptExecCtrl, ScriptLoadModal, ScriptLoadButton, ScriptSelect, ScriptNotification}
export {Scripts, ScriptEditor, ScriptExecCtrl, ScriptLoadModal, ScriptLoadButton, ScriptSelect, ScriptNotification}
