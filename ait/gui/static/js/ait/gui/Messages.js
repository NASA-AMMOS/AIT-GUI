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

import m from 'mithril'
import * as format from 'ait/format'


/**
 *
 * Component for displaying log messages
 *
 * @example <ait-messages></ait-messages>
 *
 */
const Messages =
{
    _messages: [],
    _source: null,
    _scrollTop: 0,
    _updateScroll: true,


    add(msg) {
        this._messages.push(this.normalizeMessage(msg))
        m.redraw()
    },

    normalizeMessage(msg) {
        return {
            timestamp: Date.parse(msg.timestamp),
            severity : msg.msgid,
            message  : msg.msg
        }
    },

    oninit(vode) {
        this._source = new EventSource('/messages')
        this._source.onmessage = event => {
            this.add(JSON.parse(event.data))
        }
    },

    onupdate(vnode) {
        let msgs = vnode.dom.getElementsByClassName('entry_container')[0]
        if (this._updateScroll) {
            this._scrollTop = msgs.scrollHeight
        }

        msgs.scrollTop = this._scrollTop
    },

    view(vnode) {
        const rows = this._messages.map(msg =>
            m('div', {class: 'entry entry--' + msg.severity.toLowerCase()}, [
                m('div', {class: 'timestamp'}, format.datetime(msg.timestamp, {utc: true, gps: false})),
                m('div', {class: 'severity'}, msg.severity),
                m('div', {class: 'message'}, msg.message)
            ])
        )

        let header_contents =  [
            m('div', {class: 'timestamp'}, 'Timestamp'),
            m('div', {class: 'severity'}, 'Severity'),
            m('div', {class: 'message'}, 'Message')
        ]

        // If the users moved the scrollbar out of the auto-scroll position
        // provide them with a button to return to the default scroll position.
        if (! (this._updateScroll)) {
            header_contents.push(m('div', {
                class: 'scroll-reset',
                onclick: (e) => {
                    this._updateScroll = true
                }
            }, m('span', {class: 'glyphicon glyphicon-chevron-down'})))
        }

        let header = m('div', {class: 'entry entry--header'}, header_contents)

        return m('ait-messages', [
                 header,
                 m('div', {
                   class: 'entry_container',
                   onscroll: (e) => {
                       let msgs = vnode.dom.getElementsByClassName('entry_container')[0]
                       if (msgs.scrollTop == msgs.scrollHeight - msgs.clientHeight) {
                           this._updateScroll = true
                       } else {
                           this._updateScroll = false
                           this._scrollTop = msgs.scrollTop
                       }
                   }
                 }, rows)
               ])
    }
}

export default Messages
export {Messages}
