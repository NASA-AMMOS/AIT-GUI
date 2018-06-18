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

import map from 'lodash/map'

/**
 * Sequence selection and execution component
 *
 * **Optional Attributes:**
 *
 * action
 *   The form action attribute to POST. (default: '/seq')
 */
const Sequence = {
    _disableControls: false,
    _filter_val: '',
    sequences: [],

    refreshSequenceList() {
        m.request(this._action).then((data) => {
            data = data.sort((a, b) => {
                if (a.indexOf('/') !== -1 && b.indexOf('/') !== -1) {
                    return a < b ? -1 : 1
                } else if (a.indexOf('/') !== -1) {
                    return -1
                } else if (b.indexOf('/') !== -1) {
                    return 1
                }
            })
            this.sequences = map(data, (value, index) => {
                return m('option', {value: value, key: index}, value)
            })
        })
    },

    handleFormSubmit(event) {
        event.preventDefault()
        let data = new FormData()
        data.append('seqfile', event.currentTarget.querySelector('select').value)

        if (data.get('seqfile') === '') {
            return false
        }

        this._disableControls = true
        m.request({method: 'POST', url: this._action, data: data})
        return false
    },

    oninit(vnode) {
        this._action = vnode.attrs.action || '/seq'
        this.refreshSequenceList()

        ait.events.on('seq:exec', () => {
            this._disableControls = true
            m.redraw()
        })

        ait.events.on('seq:done', () => {
            this._disableControls = false
            m.redraw()
        })

        ait.events.on('seq:err', () => {
            this._disableControls = false
            m.redraw()
        })
    },

    view(vnode) {
        let submitBtnAttrs = {
            type: 'submit',
            class: 'btn btn-success pull-right'
        }

        let abortBtnAttrs = {
            type: 'button',
            class: 'btn btn-danger pull-right',
            onclick: (e) => {
                e.preventDefault()
                m.request({
                    method: 'POST',
                    url: '/seq/abort'
                })
            }
        }

        if (this._disableControls) {
            submitBtnAttrs['style'] = 'display:none;'
        } else {
            abortBtnAttrs['style'] = 'display:none;'
        }

        let seqDisplayList = this.sequences
        if (this._filter_val !== '') {
            seqDisplayList = this.sequences.filter((e) => {
                return e.attrs.value.indexOf(this._filter_val) !== -1
            })
        }

        let sequenceSelectGroup = m('div', {
                class: 'form-group'
            }, [
                m('label', 'Send Sequence'),
                m('div', {class: 'controls'},
                    m('button',
                     {
                         type: 'button',
                         class: 'btn btn-default refresh',
                         onclick: () => {this.refreshSequenceList()}
                     }, [
                         m('span', {class: 'glyphicon glyphicon-refresh'}),
                         'Refresh'
                     ]
                    )
                ),
                m('select', {
                   class: 'form-control',
                   multiple: 'true',
                   size: 10,
                }, seqDisplayList)
            ])

        let filterInputGroup = m('div', {class: 'form-group'}, [
            m('label', 'Filter Sequences'),
            m('div', {
                class: 'input-group'
            },
            [
                m('input', {
                    class: 'form-control',
                    placeholder: 'Filter list ...',
                    name: 'sequence-filter',
                    oninput: (e) => {
                        this._filter_val = e.currentTarget.value
                    }
                }),
                m('div', {class: 'input-group-btn'},
                m('button', {
                    class: 'btn btn-default',
                    type: 'button',
                    onmousedown: (e) => {
                        let cur = e.currentTarget
                        while (cur.parentElement && ! cur.elements) {
                            cur = cur.parentElement
                        }
                        cur.elements['sequence-filter'].value = ''
                        this._filter_val = ''
                    }
                  },
                  m('span', {class: 'glyphicon glyphicon-remove-circle'})))
            ])
        ])

        return m('ait-sequence', m('form',
                 {
                     class: 'form-horizontal',
                     role: 'form',
                     method: 'POST',
                     onkeypress: (e) => {return e.keyCode !== 13},
                     onsubmit: (e) => {this.handleFormSubmit(e)}
                 }, [
                     filterInputGroup,
                     sequenceSelectGroup,
                     m('div', {class: 'form-group'},
                       m('button', abortBtnAttrs, 'Abort'),
                       m('button', submitBtnAttrs, 'Send'))
                 ]))
    },
}

export default {Sequence}
export {Sequence}
