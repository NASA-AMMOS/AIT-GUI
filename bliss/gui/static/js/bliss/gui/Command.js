import each from 'lodash/each'
import filter from 'lodash/filter'
import flatten from 'lodash/flatten'
import flatMap from 'lodash/flatMap'
import groupBy from 'lodash/groupBy'
import map from 'lodash/map'
import values from 'lodash/values'

var typeahead = require('typeahead.js/dist/typeahead.jquery');
var Bloodhound = require('typeahead.js/dist/bloodhound');

const CommandInput = {
    oninit(vnode) {
        bliss.cmd.typeahead = {dict: {}, hist:{}}

        bliss.events.on('cmd:hist', (cmdname) => {
            bliss.cmd.typeahead.hist.add([cmdname])
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

            $('#command-typeahead').typeahead({
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


        $('#command-submit-form').submit((e) => {
            e.preventDefault()
            let url = $('#command-submit-form').attr('action')
            let data = new FormData()
            data.append('command', $('#command-typeahead').val())
            m.request({method: 'POST', url: url, data: data})
            $('#command-typeahead').typeahead('val', '').focus()
        })
    },

    view(vnode) {
        return m('div', {id: 'bliss-command-input'},
                 m('form',
                   {
                       class: 'form-horizontal',
                       role: 'form',
                       method: 'POST',
                       action: '/cmd',
                       id:'command-submit-form'
                   },
                   [
                       m('label', 'Send Command:'),
                       m('div', {class: 'input-group'}, [
                           m('input',
                             {
                                 class: 'typeahead form-control',
                                 id: 'command-typeahead',
                                 type: 'text',
                                 name: 'command',
                                 placeholder: 'Select Command ...'
                             }),
                           m('span', {class: 'input-group-btn'}, 
                               m('button', {class: 'btn btn-success', type: 'submit'}, 'Send')
                           ),
                       ]) 
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
    commandSelected: false,
    
    oninit(vnode) {
        bliss.cmd.promise.then(() => {
            this.groupedCommands = groupBy(bliss.cmd.dict, (v) => {return v.subsystem})
        })
    },

    oncreate(vnode) {
        $(() => {$('[data-toggle="popover"]').popover()})

        $('#command-search').focus((e) => {
            $('.panel-collapse').collapse('show')
        })

        $('#command-search').keyup((e) => {
            this.commandFilter = $('#command-search').val()
            m.redraw()
        })

        $('#command-search').blur((e) => {
            if ($('#command-search').val() === '') {
                $('.panel-collapse').collapse('hide')
            }
        })

        $('#command-search-clear').mousedown((e) => {
            e.preventDefault()
            this.resetCommandFiltering()
        })
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

            cmdAccordions = flatMap(displayCommands, (v, k) => {
                // Generate the accordion header for the current subsystem key
                let header = m('div', {class: 'panel-heading', role: 'tab', id: 'heading' + k},
                               m('h4', {class: 'panel-title'},
                                 m('a',
                                   {
                                       role: 'button',
                                       'data-toggle': 'collapse',
                                       'data-parent': '#cmdTree',
                                       href: '#collapse' + k,
                                   },
                                   k + ' Subsystem Commands')))
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
                                                        this.selectCommand(v)
                                                    }
                                                },
                                                v.name))})
                // Generate the accordion body containing each of the commands
                let body = m('div',
                             {
                                 class: 'panel-collapse collapse',
                                 role: 'tabpanel',
                                 id: 'collapse' + k,
                             },
                             m('div', {class: 'panel-body'},
                               m('ul', commandList)))
                return [header, body]
            })
        }

        let commandSearchInput = m('input', {
                                       class: 'form-control',
                                       id: 'command-search',
                                       placeholder: 'Filter command list ...',
                                       type: 'search'
                                   })
        let commandSearchReset = m('div', {class: 'input-group-btn'},
                                   m('button', {class: 'btn btn-default', id: 'command-search-clear'}, 
                                     m('span', {
                                           class: 'glyphicon glyphicon-remove-circle',
                                       })))
        let commandSearchBox = m('div', {class: 'input-group'}, [
                                     commandSearchInput,
                                     commandSearchReset
                                 ])
        let cmdTree = m('div', {
                            class: 'panel-group',
                            role: 'tablist',
                            id: 'cmdTree',
                            style: 'margin-top: 20px;'},
                        [
                            commandSearchBox,
                            m('div', {
                                class: 'panel panel-default',
                                id: 'cmdAccordions'},
                              cmdAccordions)
                        ])
        return cmdTree
    },

    resetCommandFiltering() {
        $('#command-search').val('')
        $('#command-search').blur()
        this.commandFilter = ''
        m.redraw()
    },

    selectCommand(command) {
        this.commandSelected = true
        CommandSelectionData.activeCommand = command
        this.resetCommandFiltering()
    }
}

/**
 * Handle the configuration of command arguments for the currently select
 * command (specified via CommandSelectionData.activeCommand)
 */
const CommandConfigure = {
    view(vnode) {
        let commandSelection = null
        // If a command has been selected, render the command customization screen
        if (CommandSelectionData.activeCommand !== null) {
            commandSelection = m('div', {id: 'commandCustomizer'}, [
                                 m('div', {class: 'row'},
                                   //m('div', {class: 'col-lg-4 col-lg-offset-1'},
                                   m('div', {class: 'col-lg-12'},
                                     m('h3', CommandSelectionData.activeCommand.name))),
                                 m('div', {class: 'row'},
                                   //m('div', {class: 'col-lg-7 col-lg-offset-1'},
                                   m('div', {class: 'col-lg-10 col-lg-offset-1'},
                                     m('div', CommandSelectionData.activeCommand.desc.replace(/(\r\n|\n|\r)/gm," ")))),
                                 m('div', {class: 'row'},
                                   //m('div', {class: 'col-lg-7 col-lg-offset-1'},
                                   m('div', {class: 'col-lg-10 col-lg-offset-1'},
                                     this.generateCommandArgumentsForm(CommandSelectionData.activeCommand))),
                               ])
        // If no command has been selected, render some help info
        } else {
            commandSelection = m('div',
                                 {
                                     class: 'col-lg-6 col-lg-offset-3 alert alert-info',
                                     role: 'alert',
                                     style: 'margin-top: 20px;'
                                 },
                                 [
                                     m('span', {class: 'glyphicon glyphicon-info-sign'}),
                                     ' Please select a command to configure'
                                 ])
        }
        return commandSelection
    },

    /**
     * Generate the argument configuring form for a given command
     * dictionary object.
     */
    generateCommandArgumentsForm(command) {
        let argdefns = Object.keys(command.argdefns)
                             .map((k) => command.argdefns[k])

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
            let label = arg.fixed === true ? 'Fixed Value' : arg.name
            return m('div', {class: 'form-group'}, flatten([
              m('label', label),
              this.generateArgumentInput(arg)
            ]))
        })
        return m('form',
                 {
                     id: 'command-args-form',
                     onsubmit: this.handleCommandFormSubmission,
                     method: 'POST',
                     action: '/cmd'
                 },
                 [
                     m('input',
                       {
                           id: 'command-arg-name',
                           type: 'hidden',
                           value: CommandSelectionData.activeCommand.name
                       }),
                     cmdArgs,
                     m('button', {class: "btn btn-default", type: "submit"}, "Send Command")
                 ]
                )
    },

    /**
     * Generate the argument input field for a given command's argument object.
     */
    generateArgumentInput(argument) {
        var argInput = null
        if ('enum' in argument) {
            argInput = m('select', {class: 'form-control'},
                          map(argument.enum, (v, k) => {
                            //return m('option', {value: v}, k)
                            return m('option', {value: k}, k)
                          })
                        )
        } else {
            if (argument.fixed === true) {
                argInput = m('input', {class: 'form-control', disabled: true, value: argument.value})
            } else {
                argInput = m('input', {class: 'form-control'})
            }
        }

        if ('units' in argument && argument.units !== 'none') {
            argInput = m('div', {class: 'input-group'}, [
                argInput,
                m('div', {class: 'input-group-addon'}, argument.units)
            ])
        }

        return argInput
    },
    
    /**
     * Handles construction of the command and submission to the backend
     */
    handleCommandFormSubmission(e) {
        e.preventDefault()

        let url = $('#command-args-form').attr('action')

        // Generate command from name + configured arguments
        let command = $('#command-args-form > input#command-arg-name').val()
        $('#command-args-form :input').each((index, input) => {
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

export default {CommandInput, CommandSearch, CommandConfigure}
export {CommandInput, CommandSearch, CommandConfigure}
