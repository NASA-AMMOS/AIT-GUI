class FieldDefinition
{
    constructor(args) {
        args = args === undefined ? {} : args

        this.name    = args.name
        this.pdt     = args.type && args.type.pdt
        this.format  = args.type && args.type.format
        this.mask    = args.mask
        this.type    = args.type.name
        this.enum    = args.enum
        this.shift   = 0
        this.le      = this.format.length > 0 && this.format[0] === '<'
        this.bytes   = args.bytes

        // Bytes can be either one integer or an array,
        // all we need is the head
        if (args.bytes instanceof Array) {
            this.offset = args.bytes[0]
        }
        else {
            this.offset = args.bytes
        }

        if (this.format.length > 0 &&
            this.format[0] === '<' || this.format[0] === '>') {
            this.format = this.format.substr(1)
        }

        if (this.mask !== undefined && this.mask !== null) {
            while (this.mask !== 0 && (this.mask & 1) === 0) {
                this.shift += 1
                this.mask >>= 1
            }
        }
    }


    decode (view) {
        let value

        switch (this.format) {
            case 'b': value = view.getInt8   (this.offset, this.le); break;
            case 'B': value = view.getUint8  (this.offset, this.le); break;
            case 'h': value = view.getInt16  (this.offset, this.le); break;
            case 'H': value = view.getUint16 (this.offset, this.le); break;
            case 'i': value = view.getInt32  (this.offset, this.le); break;
            case 'I': value = view.getUint32 (this.offset, this.le); break;
            case 'f': value = view.getFloat32(this.offset, this.le); break;
            case 'd': value = view.getFloat64(this.offset, this.le); break;
            default:  break;
        }

        if (this.mask !== undefined && this.mask !== null) {
            value &= this.mask
        }

        if (this.shift > 0) {
            value >>= this.shift
        }

        // If enumeration exists, display that value
        if (this.enum !== undefined) {
            return this.enum[value]
        }

        return value
    }
}


class Packet
{
    constructor (defn, data) {
        this._defn = defn
        this._data = data

        this._defn.fields.forEach( (field) => {
            const getter = () => {
                if (this.data instanceof DataView) {
                    return field.decode(this.data)
                }
                else {
                    return this.data[field.name]
                }
            }

            Object.defineProperty(this, field.name, { get: getter })
        })
    }


    get data () {
        return this._data
    }


    get defn () {
        return this._defn
    }


    set data (value) {
        this._data = value
    }
}


class PacketDefinition
{
    constructor (name, fields) {
        this._name   = name
        this._fields = [ ]

        for (let key in fields) {
            const defn = new FieldDefinition( fields[key] )

            this[key] = defn
            this._fields.push(defn)
        }
    }

    get fields () {
        return this._fields
    }

    get name () {
        return this._name
    }
}


class TelemetryDictionary
{
    constructor (json) {
        for (let packet in json) {
            let fields   = json[packet]['fields']
            this[packet] = new bliss.tlm.PacketDefinition(packet, fields)
        }
    }
}


class TelemetryStream
{
    constructor (url, defn) {
        this._defn     = defn
        this._interval = 0
        this._packet   = new Packet(defn)
        this._socket   = new EventSource(url)
        this._stale    = 0
        this._url      = url

        this._socket.onmessage = event => {
            this.onMessage( JSON.parse(event.data) )
        }
    }


    _emit (name, data) {
        bliss.events.emit('bliss:tlm:' + name, data)
    }
        
    onClose (event) {
        clearInterval(this._interval)
        this._emit('close', this)
    }


    onMessage (data) {
        this._packet.data = data

        clearInterval(this._interval)
        this._stale    = 0
        this._interval = setInterval(this.onStale.bind(this), 1500)

        bliss.packets.insert(this._defn.name, this._packet)
        this._emit('packet', this._packet)
    }


    onOpen (event) {
        this._interval = setInterval(this.onStale.bind(this), 1500)
        this._stale    = 0

        bliss.packets.create(this._defn.name)
        this._emit('open', this)
    }


    onStale () {
        this._stale++
        this._emit('stale', this)
    }
}


export {
    FieldDefinition,
    Packet,
    PacketDefinition,
    TelemetryDictionary,
    TelemetryStream
}
