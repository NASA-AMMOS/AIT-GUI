import m from 'mithril'
import * as format from 'bliss/format'


const Messages =
{
    _messages: [ ],
    _source  : null,


    add (msg) {
        this._messages.push( this.normalizeMessage(msg) )
        m.redraw()
    },


    updateMessageBoxScroll() {
        let messageBox = document.getElementById("blisslogs");
        if (messageBox) {
            messageBox.scrollTop = messageBox.scrollHeight;
        }
    },


    normalizeMessage (msg) {
        return {
            timestamp: Date.parse(msg.asctime),
            severity : msg.levelname,
            message  : msg.message
        }
    },


    oninit (vode) {
        this._source           = new EventSource('/messages')
        this._source.onmessage = event => {
            this.add(JSON.parse(event.data))
            this.updateMessageBoxScroll()
        }
    },


    view (vnode) {
        const rows = this._messages.map( msg =>
            m('div', { class: 'row log-' + msg.severity.toLowerCase() }, [
                m('div', {class: 'col-lg-3'}, format.datetime(msg.timestamp)),
                m('div', {class: 'col-lg-2'}, msg.severity),
                m('div', {class: 'col-lg-7'}, msg.message)
            ])
        )

        return m('bliss-messages', vnode.attrs,
                   m('div', {class: 'container', id: 'blisslogs'}, rows))
    }
}

export default Messages
export { Messages }
