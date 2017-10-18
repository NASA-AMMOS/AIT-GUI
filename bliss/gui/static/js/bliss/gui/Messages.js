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
            this._scrollTop = vnode.dom.scrollHeight
        }

        vnode.dom.scrollTop = this._scrollTop
    },

    view(vnode) {
        const rows = this._messages.map(msg =>
            m('div', {class: 'entry entry--' + msg.severity.toLowerCase()}, [
                m('div', {class: 'timestamp'}, format.datetime(msg.timestamp)),
                m('div', {class: 'severity'}, msg.severity),
                m('div', {class: 'message'}, msg.message)
            ])
        )

        return m('bliss-messages', Object.assign(vnode.attrs, {
                    onscroll: (e) => {
                        if (vnode.dom.scrollTop == vnode.dom.scrollHeight - vnode.dom.clientHeight) {
                            this._updateScroll = true;
                        } else {
                            this._updateScroll = false;
                            this._scrollTop = vnode.dom.scrollTop
                        }
                    }}) , rows)
    }
}

export default Messages
export {Messages}
