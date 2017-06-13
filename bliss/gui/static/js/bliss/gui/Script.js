import * as CodeMirror from 'codemirror'

import map from 'lodash/map'

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
        }
        document.activeElement.blur()
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

const ScriptLoadModal = {
    oncreate(vnode) {
        document.getElementById('loadScriptButton').onclick = () => {
            let scriptName = encodeURIComponent(vnode.attrs.ScriptSelectionData.selected)
            m.request('/scripts/load/' + scriptName).then((data) => {
                vnode.attrs.ScriptSelectionData.scriptText = data.script_text
            })
        }
    },

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
                            m('button', {
                                id: 'loadScriptButton',
                                class: 'btn btn-default',
                                'data-dismiss': 'modal'
                              }, "Load"))

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

        return m('div', scriptModal)
    }
}

const ScriptExecCtrl = {
    oncreate(vnode) {
        document.getElementById('scriptButtonRun').onclick = () => {
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
    },

    view(vnode) {
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

        // NOTE: The Reset, Step Back, and Step Forward buttons are not
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

        let stepForwardButton = m('div', {
            class: 'btn glyphicon glyphicon-step-forward',
            disabled: 'disabled',
            id: 'scriptButtonForward'
        })

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

const ScriptView = {
    _curr_line: 0,
    _exec_state: 'init',
    _script_select_data: {
        selected: null,
        scriptText: null
    },

    oninit(vnode) {
        this._marker = document.createElement('span')

        bliss.events.on('script:step', (lineNum) => {
            this._curr_line = lineNum - 1
        })

        bliss.events.on('script:start', () => {
            this._exec_state = 'running'
        })

        bliss.events.on('script:done', () => {
            this._curr_line = 0
            this._exec_state = 'stopped'
        })

        bliss.events.on('script:error', (e) => {
            this._exec_state = 'error'
        })
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

    view(vnode) {
        if (this._script_select_data.scriptText !== null) {
            this._cm.setValue(this._script_select_data.scriptText)

            if (this._exec_state === 'init') {
                this._exec_state = 'stopped'
            }
        }

        if (this._cm !== undefined && this._exec_state !== 'init') {
            this._marker.className = "glyphicon glyphicon-play bliss-script-" + this._exec_state
            this._cm.setGutterMarker(this._curr_line, 'codeMirrorExecGutter', this._marker)
        }

        let header = m('div', {class: 'col-lg-8 col-lg-offset-2'},
                       m('h3', 'Script Control Dashboard'))
        let scriptLoad = m(ScriptLoadModal, {ScriptSelectionData: this._script_select_data})
        let scriptCtrl = m('div', {class: 'col-lg-8 col-lg-offset-2'}, m(ScriptExecCtrl, {
            ScriptSelectionData: this._script_select_data,
            scriptState: this._exec_state
        }))

        const initHelpText = 'To load a script, click the Load Script button above.'
        let editor = m('div', {class: 'col-lg-8 col-lg-offset-2'},
                       m('form',
                         //m('textarea', {id: 'scriptviewer'}, 'look at me i"m \ntext\nfoo\nbar\nbaz')))
                         m('textarea', {id: 'scriptviewer'}, initHelpText)))

        return m('div', [
                  m('div', {class: 'row'}, header),
                  m('div', {class: 'row'}, scriptCtrl),
                  m('div', {class: 'row'}, editor),
                  scriptLoad
                ])
    }
}

export default {ScriptView}
export {ScriptView}
