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

import * as format from 'ait/format'
import { getFieldType } from '../util.js'
import Field from './Field'
import Clock from './Clock'


/**
 * Search for a Packets's telemetry fields by name and display dictionary data
 * and data snapshot of selected value in a modal.
 *
 * Requires that ait-modal is included in the page for modal functionality
 * to work. Default styling via the display-border and invert-colors attributes
 * is set for display as part of the default Bootstrap navbar. You should consider
 * adjusting these settings if you plan to display the component in a different part
 * of the UI.
 *
 * **Required Attributes:**
 *
 * packet
 *   The name of the packet in the telemetry dictionary that should be searched for fields
 *
 * **Optional Attributes:**
 *
 * result-count
 *   The number of results to show when autocompleting (default: 20)
 *
 * display-border
 *   Adds the 'no-borders' css class to the component display. This drops borders
 *   from the displayed input field. (default: false)
 *
 * invert-colors
 *   Adds the 'inverse-colors' class to the component display. When included
 *   this displays the component as a black background with white
 *   foreground / icons when unfocused. (default: true)
 *
 * @example
 * <ait-mnemonic-search packet="1553_HS_Packet"></ait-mnemonic-search>
 *
 * @example
 * <ait-mnemonic-search packet="1553_HS_Packet"
 *     result-count="10"
 *     display-border="true"
 *     invert-colors="false">
 * </ait-mnemonic-search>
 */
const MnemonicSearch = {
    _packet: null,
    _selection: null,

    oninit(vnode) {
        this._packet = vnode.attrs.packet
        ait.tlm.search = {dict: {}}
    },

    oncreate(vnode) {
        ait.tlm.promise.then((dict) => {
            defaults(vnode.attrs, {'result-count': 20})

            let tokenize = function (str) {
                return str ? str.split('_') : [];
            }

            ait.tlm.search.dict = new Bloodhound({
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
                source:    ait.tlm.search.dict,
            }).bind('typeahead:select', (ev, suggestion) => {
                this._selection = suggestion
                ev.target.blur()

                // This is necessary to reset the typeahead query suggestions.
                // If we don't do this the user will see a list containing
                // their previous choice when they next focus the text field
                // even though they haven't entered anything.
                $('input[name="tlmsearch"]', vnode.dom).typeahead('val', '')

                ait.events.emit('modal:show', this._generateModalContent())
                m.redraw()
            }).bind('typeahead:autocomplete', (ev, suggestion) => {
                this._selection = suggestion
                ev.target.blur()
                $('input[name="tlmsearch"]', vnode.dom).typeahead('val', '')

                ait.events.emit('modal:show', this._generateModalContent())
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

        let val = 'N/A'
        let raw = 'N/A'
        let dneu = 'N/A'
        let curTime = format.datetime(new Date(), {utc: true, gps: false})
        let curPacket = (ait.packets[this._packet] ?
            ait.packets[this._packet].get(0) :
            null
        )

        if (curPacket !== null) {
            dneu = this._selection in curPacket['dntoeu']
            val = getFieldType(curPacket, !dneu)
            val = val[this._selection]
            raw = curPacket['raw'][this._selection]
        }

        let data = {}
        let tlm = ait.tlm.dict[this._packet]._fields
        let limits = ait.limits.dict[`${this._packet}.${this._selection}`]

        if (this._selection in tlm) {
            let tlm_point = tlm[this._selection]
            data.header = tlm_point['name']
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

            if (limits) {
                let l = []
                if (limits.value) {
                    for (let k of ['warn', 'error']) {
                        if (! (k in limits.value)) {continue}

                        l.push(m('div', [
                            m('b', `\u2003${k}:`),
                            m('br')
                        ]))

                        let vals = (typeof limits.value[k] === 'object') ? limits.value[k] : [limits.value[k]]
                        for (let v of vals) {
                            l.push(m('div', [
                                m('span', `\u2003\u2003${v}`),
                                m('br')
                            ]))
                        }
                    }
                } else {
                    for (let t of ['lower', 'upper']) {
                        if (! (t in limits)) {continue}

                        l.push(m('div', [
                            m('b', `\u2003${t}:`),
                            m('br')
                        ]))

                        for (let k of ['warn', 'error']) {
                            if (k in limits[t]) {
                                l.push(m('div', [
                                    m('b', `\u2003\u2003${k}: `),
                                    m('span', limits[t][k]),
                                    m('br')
                                ]))
                            }
                        }
                    }
                }

                data.body.push(m('div', [m('b', 'Limits: ', m('br'))].concat(l)))
            }

            data.body.push(m('hr'))
            let logTlmBtnAttrs = {
                class: 'btn glyphicon glyphicon glyphicon-save pull-right',
                onclick: () => {
                    let msg = `Telemetry field: ${this._selection} -- value: ${val} -- raw: ${raw} -- time: ${curTime}`
                    m.request({
                        method: 'POST',
                        url: '/messages',
                        data: {
                            severity: 'notice',
                            message: msg
                        }
                    })
                }
            }
            if (curPacket === null) {logTlmBtnAttrs['disabled'] = 'disabled'}

            let logTlmBtn = m('button', logTlmBtnAttrs)

            data.body.push(m('div', [
                m('div', [
                    m('b', 'Value Snapshot:'),
                    logTlmBtn
                ]),
                m('table', {class: 'table table-condensed'}, [
                    m('tr', [
                        m('td', m('b', `\u2003Time: `)),
                        m('td', curTime),
                    ]),
                    m('tr', [
                        m('td', m('b', `\u2003Value: `)),
                        m('td', val),
                    ]),
                    m('tr', [
                        m('td', m('b', `\u2003Raw Value: `)),
                        m('td', raw),
                    ])
                ])
            ]))

            data.body = m('ait-mnemonicsearch-modalbody', data.body)
        }
        return data
    },

    view(vnode) {
        let form = m('div', {class: 'search'}, [
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
           m('span', {class: 'search_icon glyphicon glyphicon-search'})
        ])

        let componentClasses = ''
        defaults(vnode.attrs, {
            'display-border': false,
            'invert-colors': true
        })

        if (! vnode.attrs['display-border']) {
            componentClasses += 'no-borders '
        }

        if (vnode.attrs['invert-colors']) {
            componentClasses += 'inverse-colors '
        }

        return m('ait-mnemonicsearch', {class: componentClasses}, form)
    }
}

export default {MnemonicSearch}
export {MnemonicSearch}
