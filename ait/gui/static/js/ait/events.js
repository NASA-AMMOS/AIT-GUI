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

class EventBus
{
    constructor () {
        this._listeners = { }
    }


    emit (event /* , ... */) {
        const listeners = this._listeners[event]

        if (listeners !== undefined) {
            const args = Array.prototype.slice.call(arguments, 1)
            listeners.forEach( (fn) => fn.apply(this, args) )
        }
    }


    off (event, fn) {
        const listeners = this._listeners[event]
        const index     = listeners && listeners.indexOf(fn)
        const found     = index !== undefined && index !== -1

        if (found) {
            listeners.splice(index, 1)
        }

        return found
    }


    on (event, fn) {
        this._listeners[event] = this._listeners[event] || [ ]
        this._listeners[event].push(fn)
    }
}


export default new EventBus()
