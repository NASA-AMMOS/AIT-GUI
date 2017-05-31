/**
 * PrimitiveType
 *
 * A PrimitiveType contains a number of fields that provide
 * information on the details of a primitive type, including: name
 * (e.g. "MSB_U32"), endianness ("MSB" or "LSB"), float, signed,
 * nbits, nbytes, min, and max.
 *
 * PrimitiveTypes can decode() binary representations stored in a
 * Javascript DataView.
 */
class PrimitiveType
{
    /**
     * Creates a new PrimitiveType based on the given typename
     * (e.g. 'MSB_U16' for a big endian, 16-bit short integer).
     */
    constructor(name) {
        this._name   = name
        this._decode = PrimitiveTypeDecoder[name]
        this._endian = null
        this._float  = false
        this._max    = null
        this._min    = null
        this._signed = false
        this._string = false

        if (this._name.startsWith('LSB_') || this._name.startsWith('MSB_')) {
            this._endian = this._name.substr(0, 3)
            this._signed = this._name[4] !== 'U'
            this._float  = this._name[4] === 'F' || this._name[4] === 'D'
            this._nbits  = parseInt(this._name.substr(-2))
        }
        else if (this._name.startsWith('S')) {
            this._nbits  = parseInt(this._name.substr(1)) * 8
            this._string = true
        }
        else {
            this._signed = this._name[0] !== 'U'
            this._nbits  = parseInt(this._name.substr(-1))
        }

        this._nbytes = this._nbits / 8

        if (this._float) {
            this._max = +Number.MAX_VALUE
            this._min = -Number.MAX_VALUE
        }
        else if (this._signed) {
            this._max =  Math.pow(2, this._nbits - 1)
            this._min = -1 * (this._max - 1)
        }
        else if (this._string === false) {
            this._max = Math.pow(2, this._nbits) - 1
            this._min = 0
        }
    }


    /**
     * Decodes the given DataView (starting at optional byte offset)
     * according to this PrimitiveType definition
     *
     * @return the decoded value or null (on error).
     */
    decode (view, offset=0) {
        return this._decode ? this._decode(view, offset) : null
    }
}


// Used by PrimitiveType.decode():
//
//     PrimitiveTypeDecoder[typename](view, offset)
//
const PrimitiveTypeDecoder = {
    'I8'     : (view, offset) => view.getUint8  (offset),
    'U8'     : (view, offset) => view.getUint8  (offset),
    'LSB_I16': (view, offset) => view.getInt16  (offset, true ),
    'MSB_I16': (view, offset) => view.getInt16  (offset, false),
    'LSB_U16': (view, offset) => view.getUint16 (offset, true ),
    'MSB_U16': (view, offset) => view.getUint16 (offset, false),
    'LSB_I32': (view, offset) => view.getInt32  (offset, true ),
    'MSB_I32': (view, offset) => view.getInt32  (offset, false),
    'LSB_U32': (view, offset) => view.getUint32 (offset, true ),
    'MSB_U32': (view, offset) => view.getUint32 (offset, false),
    'LSB_F32': (view, offset) => view.getFloat32(offset, true ),
    'MSB_F32': (view, offset) => view.getFloat32(offset, false),
    'LSB_D64': (view, offset) => view.getFloat64(offset, true ),
    'MSB_D64': (view, offset) => view.getFloat64(offset, false),
}


//
// PrimitiveTypeMap
//
// Maps typenames to PrimitiveType.  Use bliss.dtype.get(typename).
// (Populated below based on information in PrimitiveTypeDecoder).
//
let PrimitiveTypeMap = { }
Object.keys(PrimitiveTypeDecoder).map( (typename) => {
    PrimitiveTypeMap[typename] = new PrimitiveType(typename)
})


/**
 * @returns the PrimitiveType for typename or undefined.
 */
function get (typename) {
    return PrimitiveTypeMap[typename]
}


export { get }
