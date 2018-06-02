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

/**
 * Command History file display component
 *
 * Displays command history data and auto-refreshes on receipt of
 * **cmd:hist** or **seq:done** events.
 *
 * @example <ait-command-history></ait-command-history>
 */
const CommandHistory = {
    _cmdHistory: null,

    refreshCommandHistory() {
        m.request({url: '/cmd/hist.json?detailed=true'}).then((dict) => {
            this._cmdHistory = dict
        })
    },

    oninit(vnode) {
        this.refreshCommandHistory()

        ait.events.on('cmd:hist', () => {
            this.refreshCommandHistory()
        })

        ait.events.on('seq:done', () => {
            this.refreshCommandHistory()
        })
    },

    view(vnode) {
        return m('ait-commandhistory',
          m('table', {class: 'table table-striped'}, [
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
        ]))
    }
}

/**
 * Search input field for locating, verifying, and submitting commands.
 *
 * Searches over the command dictionary and command history. The component
 * will be automatically disabled when a sequence is being run. Responds to
 * the **cmd:hist**, **seq:exec**, **seq:done**, and **seq:err** events.
 *
 * @example <ait-command-input></ait-command-input>
 */
const CommandInput = {
    _cntrl_toggled: false,
    _cmding_disabled: false,
    _user_input_timer: null,
    _cmd_valid: false,
    _validating: false,
    _validation_msgs: [],

    oninit(vnode) {
        ait.cmd.typeahead = {dict: {}, hist:{}}

        ait.events.on('cmd:hist', (cmdname) => {
            ait.cmd.typeahead.hist.add([cmdname])
        })

        ait.events.on('seq:exec', () => {
            this._cmding_disabled = true
        })

        ait.events.on('seq:done', () => {
            this._cmding_disabled = false
        })

        ait.events.on('seq:err', () => {
            this._cmding_disabled = false
        })
    },

    oncreate(vnode) {
        ait.cmd.promise.then((dict) => {
            let tokenize = function (str) {
                return str ? str.split('_') : [];
            }

            ait.cmd.typeahead.dict = new Bloodhound({
                datumTokenizer: tokenize,
                queryTokenizer: tokenize,
                local: map(dict, function (value, key) {return value.name}),
            });

            ait.cmd.typeahead.hist = new Bloodhound({
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
                source:    ait.cmd.typeahead.hist,
                templates: {header: '<h4 class="typeahead-heading">History</h4>'}
            },
            {
                name:      'cmd-dict',
                limit:     10,
                source:    ait.cmd.typeahead.dict,
                templates: {header: '<h4 class="typeahead-heading">Dictionary</h4>'},
            }).bind('typeahead:select', (ev, suggestion) => {
                this._typeaheadEventHandler(ev, suggestion)
            }).bind('typeahead:autocomplete', (ev, suggestion) => {
                this._typeaheadEventHandler(ev, suggestion)
            }).bind('typeahead:close', (ev, suggestion) => {
                this._typeaheadEventHandler(ev, suggestion)
            }).bind('typeahead:cursorchange', (ev, suggestion) => {
                clearTimeout(this._user_input_timer)
                this._validating = false
                this._validation_msgs = []
                this._cmd_valid = false
            })
        })
    },

    view(vnode) {
        let btnText = 'Send'
        let submitBtnAttrs = {class: 'btn btn-success', type: 'submit'}

        if (this._cmding_disabled) {submitBtnAttrs['disabled'] = 'disabled'}

        if (this._validating || (! this._cmd_valid)) {
            submitBtnAttrs['class'] = 'btn btn-danger'
            submitBtnAttrs['disabled'] = 'disabled'

            if (this._validating) {
                btnText = m('span', {class: 'glyphicon glyphicon-refresh right-spin'})
            }
        }

        let errorDisplay = ''
        if (this._validation_msgs.length !== 0) {
            let errorAttrs = {class: 'alert alert-danger alert-dismissible error_display'}
            errorDisplay = m('div', errorAttrs, [
                m('div', [
                    m('button', {
                        type: 'button',
                        class: 'close',
                        'data-dimiss': 'alert',
                        onclick: () => {this._validation_msgs = []}
                    }, m('span', '\u00D7')),
                    m('span', {class: 'glyphicon glyphicon-info-sign'}),
                    m('strong', ' Command Validation Errors')
                ]),
                map(this._validation_msgs, (msg) => {return m('p', msg)}),
            ])
        }

        return m('ait-commandinput', [
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
                                 oninput: (e) => {
                                     this._cmd_valid = false
                                     this._validating = true
                                     this._validation_msgs = []
                                     clearTimeout(this._user_input_timer)
                                     let form = e.target.closest('form')

                                     if (form.elements['command'].value !== '') {
                                         this._user_input_timer = setTimeout(() => {
                                             this._validateCommand(form)
                                         }, 1000)
                                     } else {
                                         this._validating = false
                                     }
                                 },
                                 onkeyup: (e) => {
                                     if (e.keyCode == 17) {
                                         this._cntrl_toggled = false
                                     }
                                 },
                                 onkeydown: (e) => {
                                     if (e.keyCode == 17) {
                                         this._cntrl_toggled = true
                                     }
                                     
                                     // Cancel submission if
                                     //  - Enter was pressed without pressing Ctrl
                                     //  - Enter + Ctrl was pressed but the command isn't valid
                                     //  - Commanding is currently disabled
                                     if ((e.keyCode == 13 && ! this._cntrl_toggled) ||
                                         (e.keyCode == 13 && ! this._cmd_valid) ||
                                         this.cmding_disabled) {
                                         e.preventDefault()
                                         return false
                                     }

                                     return true
                                 }
                             }),
                           m('span', {class: 'input-group-btn'},
                               m('button', submitBtnAttrs, btnText)
                           ),
                       ]),
                       m('span', {class: 'help-block'}, 'Ctrl + Enter to send command')
                   ]),
                   errorDisplay
                ])
    },

    _typeaheadEventHandler(ev, suggestion) {
        // We can end up with empty / undefined suggestions depending on the
        // input value when the input field is blurred. For instance, clicking
        // in the input box and then outside of it will trigger a typeahead:close
        // event even though the suggestion box isn't displayed for empty input.
        if (suggestion === '' || suggestion === undefined) return

        let form = ev.target.closest('form')
        this._cmd_valid = false
        this._validating = true
        this._validation_msgs = []

        clearTimeout(this._user_input_timer)
        this._user_input_timer = setTimeout(() => {
            this._validateCommand(form)
        }, 1000)

        m.redraw()
    },

    _validateCommand(form) {
        let cmd = form.elements['command'].value
        let data = new FormData()
        data.append('command', cmd)

        m.request({
            method: 'POST',
            url: '/cmd/validate',
            data: data,
        }).then(() => {
            this._cmd_valid = true
            this._validating = false
        }).catch((res) => {
            this._cmd_valid = false
            this._validating = false
            this._validation_msgs = res.msgs
        })
    }
}

let CommandSelectionData = {
    activeCommand: null,
}

/**
 * Command Browser Search sub-component
 *
 * Handles command searching / filtering for the Command Browser component.
 * Displays commands by subsystem and filters choices based on user input.
 *
 * @example <ait-command-search></ait-command-search>
 */
const CommandSearch = {
    groupedCommands: {},
    commandFilter: '',

    oninit(vnode) {
        ait.cmd.promise.then(() => {
            this.groupedCommands = ait.cmd.dict.bySubsystem
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

                v = v.sort((a, b) => {
                    if (a.name < b.name) {
                        return -1
                    } else if (b.name < a.name) {
                        return 1
                    } else {
                        return 0
                    }
                })

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
        let cmdTree = m('ait-commandsearch', {
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
 * Command Browser Configure sub-component
 *
 * Handles command configuration, validation, and submission. This command to be
 * configured is set in *CommandSelectionData.activeCommand*.
 *
 * **CommandSelectionData.activeCommand Format:**
 *
 * .. code::
 *
 *    {
 *        name: <command name>,
 *        desc: <command description>
 *    }
 *
 * @example <ait-command-configure></ait-command-configure>
 */
const CommandConfigure = {
    _cmding_disabled: false,
    _cmd_valid: false,
    _validating: false,
    
    // We need to keep track of the selected command state for initial command
    // validation so we can handle commands that are always valid (commands
    // with no arguments or only enumerated values).
    _needsInitialValidityCheck: true,
    _prevActiveCmd: null,

    oninit(vnode) {
        this._display_enum_raw = 'display-enum-raw' in vnode.attrs

        ait.events.on('seq:exec', () => {
            this._cmding_disabled = true
        })

        ait.events.on('seq:done', () => {
            this._cmding_disabled = false
        })

        ait.events.on('seq:err', () => {
            this._cmding_disabled = false
        })
    },

    view(vnode) {
        if (this._prevActiveCmd !== CommandSelectionData.activeCommand) {
            this._prevActiveCmd = CommandSelectionData.activeCommand
            this._needsInitialValidityCheck = true
        }

        let commandSelection = null
        // If a command has been selected, render the command customization screen
        if (CommandSelectionData.activeCommand !== null) {
            commandSelection = m('div', [
                                 m('div', {class: 'row'},
                                   m('div', {class: 'col-lg-10'},
                                     m('h3', CommandSelectionData.activeCommand.name))),
                                 m('div', {class: 'row'},
                                   m('div', {class: 'col-lg-10 col-lg-offset-1'},
                                     m('div', m.trust(CommandSelectionData.activeCommand.desc.replace(/(\r\n|\n|\r)/gm,"<br>"))))),
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
        return m('ait-commandconfigure', commandSelection)
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

        let cmdArgs = map(argdefns, (arg) => {
            return m('div', {class: 'form-group'}, flatten([
              m('label', {class: 'control-label'}, this.prettifyName(arg.name)),
              this.generateArgumentInput(arg)
            ]))
        })

        // Run an initial validity check for the current command to make sure that
        // we don't require validation for commands that are always
        // going to be valid (Specifically, commands with no arguments or only
        // enumerated values). If we don't do an initial check for these commands
        // they'll never enter into a state where they're marked as valid / sent
        // by the user.
        if (this._needsInitialValidityCheck) {
            this._needsInitialValidityCheck = false
            this._cmd_valid = true

            for (let arg of cmdArgs) {
                for (let child of arg.children) {
                    if (child.tag === 'input') {
                        this._cmd_valid = false
                        break
                    }
                }
            }
        }

        let submitBtnAttrs = {class: 'btn btn-success', type: 'submit'}
        let btnText = "Send Command"

        if (this._cmding_disabled) {submitBtnAttrs['disabled'] = 'disabled'}

        if (this._validating || (! this._cmd_valid)) {
            submitBtnAttrs['class'] = 'btn btn-danger'
            submitBtnAttrs['disabled'] = 'disabled'

            if (this._validating) {
                btnText = m('span', [
                    'Validating ',
                    m('span', {class: 'glyphicon glyphicon-refresh right-spin'})
                ])
            }
        }

        return m('form',
                 {
                    class: 'command_customization_form',
                    onchange: this.handleCommandFormValidation.bind(this),
                    onsubmit: this.handleCommandFormSubmission.bind(this),
                    method: 'POST',
                    action: '/cmd',
                    novalidate: ''
                 },
                 [
                     m('input',
                       {
                           name: 'command-arg-name',
                           type: 'hidden',
                           value: CommandSelectionData.activeCommand.name
                       }),
                     cmdArgs,
                     m('button', submitBtnAttrs, btnText)
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
        let argInput = null
        if ('enum' in argument) {
            argInput = m('select', {class: 'form-control'},
                          map(argument.enum, (v, k) => {
                            return (this._display_enum_raw ?
                                m('option', {value: k}, k + ' (' + v + ')') :
                                m('option', {value: k}, k))
                          })
                        )
        } else {
            argInput = m('input', {
                class: 'form-control',
                oninput: (e) => {
                    let event = new Event('change', {bubbles: true});
                    e.target.dispatchEvent(event);
                }
            })
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

    validateCommand(cmd) {
        let data = new FormData()
        data.append('command', cmd)
        this._validating = true
        clearTimeout(this._validation_timer)
        this._validation_timer = setTimeout(() => {
            m.request({
                method: 'POST',
                url: '/cmd/validate',
                data: data,
                extract: (xhr) => {}
            }).then(() => {
                this._cmd_valid = true
                this._validating = false
            }).catch(() => {
                this._cmd_valid = false
                this._validating = false
            })
        }, 500)
    },

    buildCommand(form) {
        let command = form.elements['command-arg-name'].value

        $(':input', form).each((index, input) => {
            if (! $(input).hasClass('form-control')) return
            command += ' ' + $(input).val()
        })

        return command
    },

    /*
     *
     */
    handleCommandFormValidation(e) {
        let shouldRunValidation = true;

        if (! this._validating) {
            for (let elem of e.currentTarget.elements) {
                if (elem.getAttribute('type') === 'hidden' ||
                    elem.getAttribute('type') === 'submit') {continue}

                if (elem.value === '') {
                    shouldRunValidation = false
                    this._cmd_valid = false
                    break
                }
            }
        }

        if (shouldRunValidation) {
            this.validateCommand(this.buildCommand(e.currentTarget))
        }
    },

    /*
     * Handles construction of the command and submission to the backend
     */
    handleCommandFormSubmission(e) {
        e.preventDefault()

        let url = e.currentTarget.action
        let command = this.buildCommand(e.currentTarget)

        // Note: FormData resoles issues with m.request passing data to the
        // backend in a form that the existing /cmd endpoint doesn't like.
        let data = new FormData()
        data.append('command', command)
        m.request({method: 'POST', url: url, data: data})

        CommandSelectionData.activeCommand = null
        ait.events.emit('cmd:submit', {})
    },
}

export default {CommandHistory, CommandInput, CommandSearch, CommandConfigure}
export {CommandHistory, CommandInput, CommandSearch, CommandConfigure}
