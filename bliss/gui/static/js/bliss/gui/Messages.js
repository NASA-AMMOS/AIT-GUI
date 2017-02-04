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
            m('tr', { class: 'log-' + msg.severity.toLowerCase() }, [
                m('td', { width: '20%' }, format.datetime(msg.timestamp) ),
                m('td', { width: '10%' }, msg.levelname ),
                m('td', { width: '70%' }, msg.message   )
            ])
        )


        return m('bliss-messages', vnode.attrs,
                 m('table', { class: 'table table-condensed' },
                   m('tbody', rows)))
    }
}

export default Messages
export { Messages }
