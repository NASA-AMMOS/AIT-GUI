import m from 'mithril'
import { sprintf  }  from 'sprintf-js'
import { strftime } from 'strftime'


const Field =
{
    // Mithril lifecycle method
    oninit (vnode) {
        this._name   = vnode.attrs.name
        this._packet = vnode.attrs.packet
    },


    // Mithril view() method
    view (vnode) {
        const pname  = this._packet
        const buffer = bliss.packets[pname]
        const packet = buffer && buffer.get(0)
        let   value  = packet && packet[this._name]


        if ( (bliss.tlm.dict !== undefined) && (bliss.tlm.streams[pname] === undefined) ) { 
            const url  = '/tlm/realtime/' + pname + '/json'
            const defn = bliss.tlm.dict[pname]

            if (defn !== undefined) {
                bliss.tlm.streams[pname] = new bliss.tlm.TelemetryStream(url, defn)
            }
        }
        
        if (value === undefined) {
            value = 'N/A'
        }
        else {
            if (vnode.attrs.format) {
                const defn = packet._defn[this._name]
                const type = defn && defn.type
                
                if (type && type.indexOf('TIME', 0) === 0) {
                    let date = new Date((value * 1000) + 315964800000)
                    value = strftime.utc()(vnode.attrs.format, date)
                }
                else {
                    value = sprintf(vnode.attrs.format, value)
                }
            }
        }
        
        return m('bliss-field', vnode.attrs, value)
    }
}

export default Field
export { Field }
