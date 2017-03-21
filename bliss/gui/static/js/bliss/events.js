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
