import m from 'mithril'
import * as format from 'bliss/format'


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
            timestamp: Date.parse(msg.asctime),
            severity : msg.levelname,
            message  : msg.message
        }
    },

    oninit(vode) {
        this._source = new EventSource('/messages')
        this._source.onmessage = event => {
            this.add(JSON.parse(event.data))
        }
    },

    onupdate(vnode) {
        if (this._updateScroll) {
            this._scrollTop = vnode.dom.children.item(0).scrollHeight
        }

        vnode.dom.children.item(0).scrollTop = this._scrollTop
    },

    view(vnode) {
        const rows = this._messages.map(msg =>
            m('div', {class: 'bliss-messages__entry bliss-messages__entry--' + msg.severity.toLowerCase()}, [
                m('div', {class: 'bliss-messages__timestamp'}, format.datetime(msg.timestamp)),
                m('div', {class: 'bliss-messages__severity'}, msg.severity),
                m('div', {class: 'bliss-messages__message'}, msg.message)
            ])
        )

        return m('bliss-messages', vnode.attrs,
                   m('div', {
                    class: 'bliss-messages',
                    onscroll: (e) => {
                        let msg_window = vnode.dom.children.item(0)
                        if (msg_window.scrollTop == msg_window.scrollHeight - msg_window.clientHeight) {
                            this._updateScroll = true;
                        } else {
                            this._updateScroll = false;
                            this._scrollTop = vnode.dom.children.item(0).scrollTop
                        }
                    }
                   }, rows))
    }
}

export default Messages
export {Messages}
