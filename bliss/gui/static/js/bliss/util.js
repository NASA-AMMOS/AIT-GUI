/**
 * Object.assign(target, ...sources) merges sources into target.
 *
 * @return target
 */
 /// TODO Figure out if we want to just use _.assign here
const merge = Object.assign


/**
 * Moves array element at index `from` to index `to`, shifting all
 * other values up and down, as appropriate.
 *
 * Note, there is a proposal for this to end up in Lodash, but at the
 * moment it hasn't been integrated.
 *
 * https://github.com/lodash/lodash/issues/1701
 */
function move (array, from, to) {
    array.splice(to, 0, array.splice(from, 1)[0])
}


export { merge, move}
