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

var typeahead = require('typeahead.js/dist/typeahead.jquery');
var Bloodhound = require('typeahead.js/dist/bloodhound');

import map from 'lodash/map'
import defaults from 'lodash/defaults'

import Field from './Field'
import Clock from './Clock'

const MnemonicSearch = {
    _packet: null,
    _selection: null,

    oninit(vnode) {
        this._packet = vnode.attrs.packet
        bliss.tlm.search = {dict: {}}
    },

    oncreate(vnode) {
        bliss.tlm.promise.then((dict) => {
            defaults(vnode.attrs, {'result-count': 20})

            let tokenize = function (str) {
                return str ? str.split('_') : [];
            }

            bliss.tlm.search.dict = new Bloodhound({
                datumTokenizer: tokenize,
                queryTokenizer: tokenize,
                local: map(dict[this._packet].fields, (value, key) => {return value.name}).sort(),
            });

            $('input[name="tlmsearch"]', vnode.dom).typeahead({
                highlight: true,
            },
            {
                name:      'tlm-mnemonics',
                limit:     vnode.attrs['result-count'],
                source:    bliss.tlm.search.dict,
            }).bind('typeahead:select', (ev, suggestion) => {
                this._selection = suggestion
                ev.target.blur()

                // This is necessary to reset the typeahead query suggestions.
                // If we don't do this the user will see a list containing
                // their previous choice when they next focus the text field
                // event though they haven't entered anything.
                $('input[name="tlmsearch"]', vnode.dom).typeahead('val', '')

                bliss.events.emit('modal:show', this._generateModalContent())
                m.redraw()
            }).bind('typeahead:autocomplete', (ev, suggestion) => {
                this._selection = suggestion
                ev.target.blur()
                $('input[name="tlmsearch"]', vnode.dom).typeahead('val', '')

                bliss.events.emit('modal:show', this._generateModalContent())
                m.redraw()
            }).bind('typeahead:close', (ev, suggestion) => {
                ev.target.blur()
                $('input[name="tlmsearch"]', vnode.dom).typeahead('val', '')
                m.redraw()
            })
        })
    },

    _generateModalContent() {
        // TODO: Need to update handling of Fields here and fix the issue of
        // items not updating as expected. As a stop gap we should be displaying
        // Field values by pulling values out of a packet so we can add logging
        // functionality in a follow up ticket.
        //
        // TODO: Figure out how we're going to pull a time value of the Clock
        // object to use a timestamp when logging a value so there's consistency
        // between the displayed value snapshot and what is logged.

        let cur_packet = (bliss.packets[this._packet] ?
            bliss.packets[this._packet]._buffer[0] :
            null
        )

        let data = {}
        let tlm = bliss.tlm.dict[this._packet]._fields

        if (this._selection in tlm) {
            let tlm_point = tlm[this._selection]
            data.header = m('h4', tlm_point['name'])
            data.body = []

            let desc = tlm_point.desc ? tlm_point.desc : "None"
            data.body.push(m('div', [
                m('b', 'Description: '),
                desc,
                m('br')
            ]))

            let type = tlm_point.type ? tlm_point.type._name : "Unknown"
            data.body.push(m('div', [
                m('b', 'Data Type: '),
                type,
                m('br')
            ]))

            let bytes = typeof(tlm_point.bytes) == "object" ? (
                tlm_point.bytes[0] + " - " + tlm_point.bytes[1]) : (
                tlm_point.bytes)
            data.body.push(m('div', [
                m('b', 'Byte(s) in Packet: '),
                bytes,
                m('br')
            ]))

            let mask = tlm_point.mask ? tlm_point.mask : 'None'
            data.body.push(m('div', [
                m('b', 'Bit Mask: '),
                mask,
                m('br')
            ]))

            if (tlm_point.enum) {
                data.body.push(m('div', [
                    m('b', 'Enumerated Values: '),
                    map(tlm_point.enum, (k, v) => {
                        return m('div', [
                            m('b', `\u2003${v}: `),
                            m('span', k),
                            m('br')
                        ])
                    }),
                ]))
            }

            if (tlm_point.dntoeu) {
                data.body.push(m('div', [
                    m('b', 'DN-to-EU: '),
                    map(tlm_point.dntoeu, (k, v) => {
                        return m('div', [
                            m('b', `\u2003${v}: `),
                            m('span', k),
                            m('br')
                        ])
                    }),
                ]))
            }

            if (tlm_point.aliases) {
                data.body.push(m('div', [
                    m('b', 'Aliases: '),
                    map(tlm_point.aliases, (k, v) => {
                        return m('div', [
                            m('b', `\u2003${v}: `),
                            m('span', k),
                            m('br')
                        ])
                    }),
                ]))
            }

            data.body.push(m('hr'))
            let log_tlm_btn = m('button', {
                class: 'btn glyphicon glyphicon glyphicon-save pull-right',
                disabled: 'disabled',
                onclick: () => {
                    // TODO: Implement snapshot logging
                }
            })

            data.body.push(m('div', [
                m('b', m('span', 'Value Snapshot:')),
                log_tlm_btn,
                m('span', [
                    m('br'),
                    m('b', `\u2003Time: `),
                    m(Clock, {style: 'display:inline;'}),
                    m('br'),
                    m('b', `\u2003Value: `),
                    m(Field, {packet: this._packet, name: this._selection}),
                    m('br'),
                    m('b', `\u2003Raw Value: `),
                    m(Field, {packet: this._packet, name: this._selection, raw: true}),
                ])
            ]))
        }
        return data
    },

    view(vnode) {
        let form = m('div', {class: 'search search-icon-group right-icon'}, [
           m('input',
             {
                 class: 'form-control typeahead',
                 type: 'text',
                 name: 'tlmsearch',
                 onfocus: (e) => {
                     this._selection = null
                 },
                 onblur: (e) => {
                     e.target.value = ''
                 }
             }),
           m('span', {class: 'glyphicon glyphicon-search'})
        ])

        let componentClasses = ''
        defaults(vnode.attrs, {
            'display-border': false,
            'invert-colors': true
        })

        if (! vnode.attrs['display-border']) {
            componentClasses += 'no_borders '
        }

        if (vnode.attrs['invert-colors']) {
            componentClasses += 'inverse_colors '
        }

        return m('bliss-mnemonicsearch', {class: componentClasses}, form)
    }
}

export default {MnemonicSearch}
export {MnemonicSearch}
