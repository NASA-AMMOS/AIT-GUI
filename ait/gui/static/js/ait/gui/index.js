/*
 * Advanced Multi-Mission Operations System (AMMOS) Instrument Toolkit (AIT)
 * Bespoke Link to Instruments and Small Satellites (BLISS)
 *
 * Copyright 2017, by the California Institute of Technology. ALL RIGHTS
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

export * from './Clock.js'
export * from './Command.js'
export * from './Field.js'
export * from './Messages.js'
export * from './Playback.js'
export * from './Plot.js'
export * from './Script.js'
export * from './Query.js'
export * from './Search.js'
export * from './Sequence.js'
export * from './Status.js'
export * from './TabSet.js'
export * from './Util.js'

import filter from 'lodash/filter'
import map    from 'lodash/map'

import { CommandDictionary } from '../cmd.js'
import { EVRDictionary     } from '../evr.js'
import { TelemetryDictionary, TelemetryStream } from '../tlm.js'


let Registry = { }

// NOTE: The `exports` symbol in the two lines below used to read
// `ait.gui` before I moved this code inside the `ait.gui` module.
// Looking at the Babel ES6 => ES5 transpiled code, `exports` resolves
// as the current module.  I'm not sure whether reyling on `exports`
// is valid ES6, but from my quick perusal of The ECMAScript 2015
// Language Specification, Section 9.4.6 Module Namespace Exotic
// Objects (p. 105), it just might be valid.

Object.keys(exports).map( (name) => {
    Registry['ait-' + name.toLowerCase()] = exports[name]
})


/**
 * @returns a plain Javascript object representation of the HTML
 * element attributes in a DOM NamedNodeMap.  That is:
 *
 *     `<... name="value" ...>`
 *
 * pairs become:
 *
 * `{ ..., name: value, ... }`
 *
 * pairs.
 */
function attrs2obj (attrs) {
    let obj = { }

    for (let n = 0; n < attrs.length; ++n) {
        const item  = attrs.item(n)
        let   value = item.value

        if (value == 'true' ) value = true
        if (value == 'false') value = false

        obj[item.name] = value
    }

    return obj
}


/**
 * Creates a Mithril vnode for the given DOM element `elem`.
 *
 * @returns a Mithril vnode
 */
function createMithrilNode (elem) {
    let node = null

    if (elem.nodeType == Node.ELEMENT_NODE) {
        let name     = elem.nodeName.toLowerCase()
        const attrs    = attrs2obj(elem.attributes)
        const children = createMithrilNodes(elem.childNodes)

        if (name.substring(0, 4) === 'ait-') {
            name = 'ait-' + name.substring(4).replace('-', '')
        }

        node = m(Registry[name] || name, attrs, children)
    }
    else if (elem.nodeType == Node.TEXT_NODE) {
        node = elem.nodeValue;
    }

    return node
}


function makeMithrilNode(e) {
    if (e === undefined || e.tag === undefined) {
        return e
    }

    if (e.children && typeof(e.children) === 'object') {
        e.children = filterNodes(e.children)
    }

    if (e.attrs && e.attrs.className && e.attrs.className.indexOf('make-mithril-node') !== -1) {
        let template = document.createElement('template')
        template.innerHTML = e.text
        let name = template.content.firstChild.nodeName.toLowerCase()
        let attrs = {}
        for (let i = 0; i < template.content.firstChild.attributes.length; i++) {
            let a = template.content.firstChild.attributes.item(i)
            attrs[a.name] = a.value
        }
        return m(Registry[name] || name, attrs)
    } else {
        return e
    }

}

function filterNodes(n) {
    let nodes =  map(n, makeMithrilNode)
    return nodes
}




/**
 * Creates a Mithril vnode for each DOM element in `elems`.
 *
 * @returns an array of Mithril vnodes.
 */
function createMithrilNodes (elems) {
    return filter(map(elems, createMithrilNode), n => n !== null)
}


/**
 * Initializes the AIT GUI.
 */
function init () {
    ready(() => {
        const root   = document.body
        root.appendChild(document.createElement('ait-prompt'))
        root.appendChild(document.createElement('ait-modal'))
        const cloned = root.cloneNode(true)
        const elems  = map(cloned.childNodes, c => c)

        ait.cmd         = { dict: {} }
        ait.cmd.promise = m.request({ url: '/cmd/dict' })
        ait.cmd.promise.then( (dict) => {
            ait.cmd.dict = CommandDictionary.parse(dict)
        })

        m.request({ url: '/evr/dict' }).then( (dict) => {
            ait.evr.dict = EVRDictionary.parse(dict)
        })

        ait.tlm = {dict: {}}

        ait.tlm.promise = m.request({ url: '/tlm/dict' })
        ait.tlm.promise.then((dict) => {
            const proto = location.protocol === 'https:' ? 'wss' : 'ws'
            const url = proto + '://' + location.host + '/tlm/realtime'

            ait.tlm.dict   = TelemetryDictionary.parse(dict)
            ait.tlm.stream = new TelemetryStream(url, ait.tlm.dict)

            setInterval(() => {
                m.redraw()
            }, 1000)
        })

        m.request({url: '/limits/dict'}).then((dict) => {
            ait.limits = {}
            ait.limits.dict = dict
        })

        let source = new EventSource('/events');
        source.addEventListener('message', function (event) {
            let e = JSON.parse(event.data);
            ait.events.emit(e.name, e.data)
        });

        m.request({ url: '/tlm/latest' }).then((latest) => {
            ait.tlm.state = latest
        })

        m.mount(root, { view: () => createMithrilNodes(elems) })
    })
}


/**
 * Calls the given when the HTML document is loaded and ready.
 */
function ready (fn) {
    if (document.readyState !== 'loading') {
        fn();
    }
    else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

export { init, filterNodes }
