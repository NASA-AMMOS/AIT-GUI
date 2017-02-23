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


    normalizeMessage (msg) {
        return {
            timestamp: Date.parse(msg.asctime),
            severity : msg.levelname,
            message  : msg.message
        }
    },


    oninit (vode) {
        this._source           = new EventSource('/messages')
        this._source.onmessage = event => this.add( JSON.parse(event.data) )
    },


    view (vnode) {
        const rows = this._messages.map( msg =>
            m('div', { class: 'row log-' + msg.severity.toLowerCase() }, [
                m('td', {class: 'col-lg-3'}, format.datetime(msg.timestamp)),
                m('td', {class: 'col-lg-2'}, msg.severity),
                m('td', {class: 'col-lg-7'}, msg.message)
            ])
        )

        return m('bliss-messages', vnode.attrs,
                 m('hr',
                 m('div', {class: 'container'}, rows)))
    }
}

export default Messages
export { Messages }
