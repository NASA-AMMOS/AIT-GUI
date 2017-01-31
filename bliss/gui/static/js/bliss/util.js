/**
 * Maps the given function over the elements of `array`.
 *
 * This is equivalent to `array.map(fn)`.  Use this function when
 * `array` is only *array-like* (i.e. has a length property and is
 * integer indexable).  For example:
 *
 *     'Foo'.map(fn)    // TypeError: 'Foo'.map is not a function.
 *     map('Foo', fn)   // Works!
 */
function map (array, fn) {
    return Array.prototype.map.call(array, fn)
}


/**
 * Maps the given function over the integers `[0, n - 1]`.  This
 * is equivalent to:
 *
 *   [0, 1, 2, ..., n - 1].map(fn)
 */
function mapN (n, fn) {
    let array = [ ]

    for (let index = 0; index < n; ++index) {
        array.push( fn(index) )
    }

    return array
}


/**
 * Object.assign(target, ...sources) merges sources into target.
 *
 * @return target
 */
const merge = Object.assign


/**
 * Moves array element at index `from` to index `to`, shifting all
 * other values up and down, as appropriate.
 */
function move (array, from, to) {
    array.splice(to, 0, array.splice(from, 1)[0])
}


/**
 * @returns an array in the range `[0, stop - 1]`.  This is equivalent
 * to Python's `range()` function with a single argument.
 */
function range (stop) {
    return mapN(stop, index => index)
}


export { map, mapN, merge, move, range }
