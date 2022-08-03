/*
 * Advanced Multi-Mission Operations System (AMMOS) Instrument Toolkit (AIT)
 * Bespoke Link to Instruments and Small Satellites (BLISS)
 *
 * Copyright 2016, by the California Institute of Technology. ALL RIGHTS
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

/**
 * PacketBuffer
 *
 * A `PacketBuffer` implements a circular FIFO queue with
 * constant-time insert and remove operations.  PacketBuffers have a
 * fixed-size `capacity` for a certain number of packets.  This allows
 * for a history of packets to be maintained (e.g. 600 1Hz packets
 * stores the last 10 minutes of packet data).
 *
 * Clients of `PacketBuffer` peek at packets in LIFO order.  That is,
 * they're often interested in the most recent packets.  Therefore,
 * `PacketBuffer.get(0)` is always the most current packet, `get(1)`
 * the next most current, and so on.  The oldest packet is retreived
 * via `get(capacity - 1)`.
 */
class PacketBuffer
{
    /**
     * Creates a new PacketBuffer to hold up to capacity packets.
     */
    constructor (capacity = 600) {
        this._buffer = new Array(capacity)
        this.flush()
    }


    /**
     * Maps a client packet index onto the underlying circular _buffer
     * index.
     *
     * @return the underlying circular _buffer index for n.
     */
    _index (n) {

        return (this._start + this._length + n) % this._buffer.length
    }


    /**
     * @return the total capacity of this PacketBuffer.
     */
    get capacity () {
        return this._capacity
    }


    /**
     * Flushes (empties) the contents of this PacketBuffer.
     */
    flush () {
        this._length = 0
        this._start  = 0
        this._buffer.fill(undefined)
    }


    /**
     * @return the nth most recent packet (starting at zero).
     */
    get (n) {
        const newest = this._start + this._length - 1
        const index  = (newest - n) % this._buffer.length
        return this._buffer[index]
    }


    /**
     * Inserts a packet into this PacketBuffer, removing the oldest
     * packet, if the buffer is at capacity.
     */
    insert (packet) {
        if ((this._length + 1) > this._buffer.length) {
            this.remove()
        }

        const next          = this._start + this._length
        const index         = next % this._buffer.length
        this._buffer[index] = packet
        this._length       += 1
    }


    /**
     * @return the length of this PacketBuffer.
     */
    get length () {
        return this._length
    }


    /**
     * Removes the oldest packet from this PacketBuffer.
     *
     * @return the removed packet
     */
    remove () {
        let packet    = this._buffer[this._start]
        this._start   = (this._start + 1) % this._buffer.length
        this._length -= 1

        return packet
    }
}


class PacketBuffers
{
    create (name, capacity = 600) {
        let created = false

        if (this[name] === undefined) {
            this[name] = new PacketBuffer(capacity)
            created    = true
        }

        return created
    }


    insert (name, packet) {
        if (this[name] === undefined) {
            this.create(name)
        }

        this[name].insert(packet)
    }
}


export default new PacketBuffers()
