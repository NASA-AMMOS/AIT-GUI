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

import each from 'lodash/each'
import filter from 'lodash/filter'
import flatten from 'lodash/flatten'
import flatMap from 'lodash/flatMap'
import groupBy from 'lodash/groupBy'
import map from 'lodash/map'
import values from 'lodash/values'

var typeahead = require('typeahead.js/dist/typeahead.jquery');
var Bloodhound = require('typeahead.js/dist/bloodhound');

const CommandHistory = {
    _cmdHistory: null,

    refreshCommandHistory() {
        m.request({url: '/cmd/hist.json?detailed=true'}).then((dict) => {
            this._cmdHistory = dict
        })
    },

    oninit(vnode) {
        this.refreshCommandHistory()

        bliss.events.on('cmd:hist', () => {
            this.refreshCommandHistory()
        })
    },

    view(vnode) {
        return m('table', {class: 'table table-striped'}, [
            m('thead',
                m('tr', [
                    m('th', 'Timestamp'),
                    m('th', 'Command Sent')
                ])
            ),
            m('tbody',
                map(this._cmdHistory, (c) => {
                    return m('tr', [
                        m('td', c['timestamp']),
                        m('td', c['command'])
                    ])
                })
            )
        ])
    }
}

const CommandInput = {
    _cntrl_toggled: false,
    _cmding_disabled: false,

    oninit(vnode) {
        bliss.cmd.typeahead = {dict: {}, hist:{}}

        bliss.events.on('cmd:hist', (cmdname) => {
            bliss.cmd.typeahead.hist.add([cmdname])
        })

        bliss.events.on('seq:exec', () => {
            this._cmding_disabled = true
        })

        bliss.events.on('seq:done', () => {
            this._cmding_disabled = false
        })

        bliss.events.on('seq:err', () => {
            this._cmding_disabled = false
        })
    },

    oncreate(vnode) {
        bliss.cmd.promise.then((dict) => {
            let tokenize = function (str) {
                return str ? str.split('_') : [];
            }

            bliss.cmd.typeahead.dict = new Bloodhound({
                datumTokenizer: tokenize,
                queryTokenizer: tokenize,
                local: map(dict, function (value, key) {return value.name}),
            });

            bliss.cmd.typeahead.hist = new Bloodhound({
                datumTokenizer: tokenize,
                queryTokenizer: tokenize,
                prefetch: {url: '/cmd/hist.json', cache: false}
            });

            $('input[name="command"]', vnode.dom).typeahead({
                highlight: true,
            },
            {
                name:      'cmd-hist',
                limit:     10,
                source:    bliss.cmd.typeahead.hist,
                templates: {header: '<h4 class="typeahead-heading">History</h4>'}
            },
            {
                name:      'cmd-dict',
                limit:     10,
                source:    bliss.cmd.typeahead.dict,
                templates: {header: '<h4 class="typeahead-heading">Dictionary</h4>'},
            })
        })
    },

    view(vnode) {
        let submitBtnAttrs = {class: 'btn btn-success', type: 'submit'}
        if (this._cmding_disabled) {submitBtnAttrs['disabled'] = 'disabled'}

        return m('div', {id: 'bliss-command-input'},
                 m('form',
                   {
                       class: 'form-horizontal',
                       role: 'form',
                       method: 'POST',
                       action: '/cmd',
                       onsubmit: (e) => {
                           e.preventDefault()
                           let url = e.currentTarget.getAttribute('action')
                           let data = new FormData()
                           data.append('command', e.currentTarget.elements['command'].value)
                           m.request({method: 'POST', url: url, data: data})
                           $(e.currentTarget.elements['command']).typeahead('val', '').focus()
                       }
                   },
                   [
                       m('label', 'Send Command:'),
                       m('div', {class: 'input-group'}, [
                           m('input',
                             {
                                 class: 'typeahead form-control',
                                 type: 'text',
                                 name: 'command',
                                 placeholder: 'Select Command ...',
                                 onkeyup: (e) => {
                                     if (e.keyCode == 17) {
                                         this._cntrl_toggled = false
                                     }
                                 },
                                 onkeydown: (e) => {
                                     if (e.keyCode == 17) {
                                         this._cntrl_toggled = true
                                     }

                                     // If the user presses Enter without pressing Ctrl or
                                     // if commanding is currently disabled we cancel
                                     // the submission.
                                     if ((e.keyCode == 13 && ! this._cntrl_toggled) || this.cmding_disabled) {
                                         e.preventDefault()
                                         return false
                                     }

                                     return true
                                 }
                             }),
                           m('span', {class: 'input-group-btn'},
                               m('button', submitBtnAttrs, 'Send')
                           ),
                       ]),
                       m('span', {class: 'help-block'}, 'Ctrl + Enter to send command')
                   ])
               )
    }
}

let CommandSelectionData = {
    activeCommand: null,
}

const CommandSearch = {
    groupedCommands: {},
    commandFilter: '',

    oninit(vnode) {
        bliss.cmd.promise.then(() => {
            this.groupedCommands = bliss.cmd.dict.bySubsystem
        })
    },

    oncreate(vnode) {
        $(() => {$('[data-toggle="popover"]').popover()})
    },

    view(vnode) {
        var cmdAccordions = ""
        if (Object.keys(this.groupedCommands).length > 0) {
            let displayCommands = this.groupedCommands

            // Filter commands based on user search if necessary
            if (this.commandFilter.length !== 0) {
                let filteredCommands = {}
                each(displayCommands, (value, key) => {
                    filteredCommands[key] = filter(value, (cmd) => {
                        return cmd.name.toLowerCase().includes(this.commandFilter.toLowerCase())
                    })
                })
                displayCommands = filteredCommands
            }

            let sortedKeys = Object.keys(displayCommands).sort()
            cmdAccordions = map(sortedKeys, (k) => {
                let v = displayCommands[k]

                // if there aren't any commands for this accordion, skip ...
                if (v.length === 0) {return []}

                // Generate the accordion header for the current subsystem key
                let header = m('a',
                                {
                                    class: 'panel-heading',
                                    role: 'tab',
                                    id: 'heading' + k,
                                    'data-toggle': 'collapse',
                                    'data-target': '#collapse' + k
                                },
                                m('h4', {class: 'panel-title'}, k))
                let commandList = map(v, (v) => {
                    return m('li',
                            m('a',
                            {
                                class: 'btn',
                                role: 'button',
                                'data-toggle': 'popover',
                                'data-trigger': 'hover',
                                'data-content': v.desc,
                                onmousedown: () => {
                                    CommandSelectionData.activeCommand = v
                                }
                            },
                            v.name))
                })

                // Generate the accordion body containing each of the commands
                let body = m('div',
                             {
                                 class: 'panel-collapse collapse',
                                 role: 'tabpanel',
                                 id: 'collapse' + k,
                             },
                             m('div', {class: 'panel-body'},
                               m('ul', {class: 'command_list'}, commandList)))
                return m('div', {
                            class: 'panel panel-default',
                         },
                         [header, body])
            })
        }

        let commandSearchInput = m('input', {
                                       class: 'form-control',
                                       name: 'command-search',
                                       placeholder: 'Search ...',
                                       type: 'search',
                                       onfocus: (e) => {
                                           $('.panel-collapse').collapse('show')
                                       },
                                       onkeyup: (e) => {
                                           this.commandFilter = e.currentTarget.value
                                       },
                                   })
        let commandSearchReset = m('div', {class: 'input-group-btn'},
                                   m('button', {
                                        class: 'btn btn-default',
                                        onmousedown: (e) => {
                                            e.preventDefault()
                                            e.currentTarget.parentElement.parentElement.elements['command-search'].value = ''
                                            this.commandFilter = ''
                                            // This redraw is mandatory. We need to re-render the accordions before we
                                            // toggle focus on the input box so that we end up with the accordions
                                            // being properly expanded.
                                            m.redraw()
                                            e.currentTarget.parentElement.parentElement.elements['command-search'].blur()
                                            e.currentTarget.parentElement.parentElement.elements['command-search'].focus()
                                        }
                                     },
                                     m('span', {
                                           class: 'glyphicon glyphicon-remove-circle',
                                       })))
        let commandSearchBox = m('form', {class: 'input-group', onsubmit: () => {return false}}, [
                                     commandSearchInput,
                                     commandSearchReset
                                 ])
        let cmdTree = m('bliss-commandsearch', {
                            onmouseleave: () => {
                                if (CommandSelectionData.activeCommand !== null) {
                                    $('.panel-collapse').collapse('hide')
                                }
                            },
                            onmouseenter: () => {
                                if (CommandSelectionData.activeCommand === null ||
                                    this.commandFilter !== '') {
                                    $('.panel-collapse').collapse('show')
                                }
                            }
                        },
                        m('div', {
                            class: 'panel-group command_tree',
                            role: 'tablist',
                        }, [
                            commandSearchBox,
                            m('div', {
                                class: 'command_accordions_list',
                            }, cmdAccordions)
                        ]))
        return cmdTree
    },
}

/**
 * Handle the configuration of command arguments for the currently select
 * command (specified via CommandSelectionData.activeCommand)
 */
const CommandConfigure = {
    _cmding_disabled: false,
    oninit(vnode) {
        bliss.events.on('seq:exec', () => {
            this._cmding_disabled = true
        })

        bliss.events.on('seq:done', () => {
            this._cmding_disabled = false
        })

        bliss.events.on('seq:err', () => {
            this._cmding_disabled = false
        })
    },

    view(vnode) {
        let commandSelection = null
        // If a command has been selected, render the command customization screen
        if (CommandSelectionData.activeCommand !== null) {
            commandSelection = m('div', [
                                 m('div', {class: 'row'},
                                   m('div', {class: 'col-lg-10'},
                                     m('h3', CommandSelectionData.activeCommand.name))),
                                 m('div', {class: 'row'},
                                   m('div', {class: 'col-lg-10 col-lg-offset-1'},
                                     m('div', CommandSelectionData.activeCommand.desc.replace(/(\r\n|\n|\r)/gm," ")))),
                                 m('div', {class: 'row'},
                                   m('div', {class: 'col-lg-10 col-lg-offset-1'},
                                     m('div', this.generateCommandArgumentsForm(CommandSelectionData.activeCommand)))),
                               ])
        // If no command has been selected, render some help info
        } else {
            commandSelection = m('div', {class: 'row'}, m('div',
                                 {
                                     class: 'col-lg-6 col-lg-offset-3 alert alert-info command_selection_help',
                                     role: 'alert',
                                 },
                                 [
                                     m('span', {class: 'glyphicon glyphicon-info-sign'}),
                                     ' Please select a command to configure'
                                ]))
        }
        return m('bliss-commandconfigure', commandSelection)
    },

    /**
     * Generate the argument configuring form for a given command
     * dictionary object.
     */
    generateCommandArgumentsForm(command) {
        let argdefns = Object.keys(command.arguments)
                             .map((k) => command.arguments[k])
                             .filter((arg) => {
                                 if (arg.fixed === true) {
                                     return false
                                 } else {
                                     return true
                                 }
                             })

        // Argument definitions needs to be sorted in byte order for display
        argdefns.sort((a, b) => {
            let aCmp, bCmp = null
            if (Array.isArray(a.bytes)) {
                aCmp = a.bytes[0]
            } else {
                aCmp = a.bytes
            }

            if (Array.isArray(b.bytes)) {
                bCmp = b.bytes[0]
            } else {
                bCmp = b.bytes
            }

            if (aCmp < bCmp)
                return -1
            else if (bCmp < aCmp)
                return 1
            else
                return 0
        })

        var cmdArgs = map(argdefns, (arg) => {
            return m('div', {class: 'form-group'}, flatten([
              m('label', {class: 'control-label'}, this.prettifyName(arg.name)),
              this.generateArgumentInput(arg)
            ]))
        })

        let submitBtnAttrs = {class: 'btn btn-default', type: 'submit'}
        if (this._cmding_disabled) {submitBtnAttrs['disabled'] = 'disabled'}

        return m('form',
                 {
                     class: 'command_customization_form',
                     onsubmit: this.handleCommandFormSubmission,
                     method: 'POST',
                     action: '/cmd'
                 },
                 [
                     m('input',
                       {
                           name: 'command-arg-name',
                           type: 'hidden',
                           value: CommandSelectionData.activeCommand.name
                       }),
                     cmdArgs,
                     m('button', submitBtnAttrs, "Send Command")
                 ]
                )
    },

    /**
     *
     */
     prettifyName(name) {
         let name_parts = name.split('_')
         name_parts = map(name_parts, (v) => v.charAt(0).toUpperCase() + v.slice(1))
         return name_parts.join(' ')
     },

    /**
     * Generate the argument input field for a given command's argument object.
     */
    generateArgumentInput(argument) {
        var argInput = null
        if ('enum' in argument) {
            argInput = m('select', {class: 'form-control'},
                          map(argument.enum, (v, k) => {
                            return m('option', {value: k}, k + ' (' + v + ')')
                          })
                        )
        } else {
            argInput = m('input', {class: 'form-control'})
        }

        if ('units' in argument && argument.units !== 'none') {
            return m('div', {class: 'input-group'}, [
                argInput,
                m('div', {class: 'input-group-addon'}, argument.units)
            ])
        } else {
            return argInput
        }
    },

    /**
     * Handles construction of the command and submission to the backend
     */
    handleCommandFormSubmission(e) {
        e.preventDefault()

        let url = e.currentTarget.action
        let command = e.currentTarget.elements['command-arg-name'].value

        $(':input', e.currentTarget).each((index, input) => {
            if (! $(input).hasClass('form-control')) return
            command += ' ' + $(input).val()
        })

        // Note: FormData resoles issues with m.request passing data to the
        // backend in a form that the existing /cmd endpoint doesn't like.
        let data = new FormData()
        data.append('command', command)
        m.request({method: 'POST', url: url, data: data})

        CommandSelectionData.activeCommand = null
        bliss.events.emit('cmd:submit', {})
    },
}

export default {CommandHistory, CommandInput, CommandSearch, CommandConfigure}
export {CommandHistory, CommandInput, CommandSearch, CommandConfigure}
