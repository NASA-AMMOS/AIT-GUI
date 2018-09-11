/*
 * Advanced Multi-Mission Operations System (AMMOS) Instrument Toolkit (AIT)
 * Bespoke Link to Instruments and Small Satellites (BLISS)
 *
 * Copyright 2018, by the California Institute of Technology. ALL RIGHTS
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

import 'babel-polyfill'

global.window = Object.assign(require("mithril/test-utils/browserMock.js")(), require('mithril/test-utils/domMock.js')(), require('mithril/test-utils/pushStateMock')())
global.document = window.document
let mq = require('mithril-query')

let chai = require('chai')
let assert = chai.assert
chai.should()

let sinon = require('sinon')

import * as ait from 'ait'
global.ait = ait

describe('EVRDefinition', function() {
    it('should default to EVR desc if message is not supplied when formatting message', function() {
        let evrdict = {'desc': 'The Description', 'name': 'Test without Message', 'code': 1}
        let evr = new ait.evr.EVRDefinition(evrdict)

        assert(evr.msg === null)
        assert(evr.formatMessage() === evrdict['desc'])
        assert(evr.formatMessage([1, 2, 3]) === evrdict['desc'])
    })

    it('should format message strings with simple printf formatters', function() {
        let evrdict = {'desc': 'desc', 'name': 'name', 'code': 1}
        let evr = new ait.evr.EVRDefinition(evrdict)

        evr._msg = '%s'
        assert(evr.formatMessage([0x46, 0x6f, 0x6f, 0x00, 0x01, 0x01]) === 'Foo')

        evr._msg = '%u'
        assert(evr.formatMessage([0xff, 0x11, 0x33, 0x44]) === ('4279317316'))

        evr._msg = '%d'
        assert(evr.formatMessage([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]) === '16909060')

        evr._msg = '%d'
        assert(evr.formatMessage([0xff, 0x00, 0x00, 0x00]) === '-16777216')

        evr._msg = '%i'
        assert(evr.formatMessage([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]) === '16909060')

        evr._msg = '%x'
        assert(evr.formatMessage([0x00, 0x00, 0x00, 0x0f]) === 'f')

        evr._msg = '%X'
        assert(evr.formatMessage([0x00, 0x00, 0x00, 0x0F]) === 'F')

        evr._msg = '%f'
        assert(evr.formatMessage([0x40, 0x5E, 0xDC, 0x14, 0x5D, 0x85, 0x16, 0x55]) === '123.438743')

        evr._msg = '%e'
        assert(evr.formatMessage([0x40, 0x5E, 0xDC, 0x14, 0x5D, 0x85, 0x16, 0x55]) === '1.23438743e+2')

        evr._msg = '%g'
        assert(evr.formatMessage([0x40, 0x5E, 0xDC, 0x14, 0x5D, 0x85, 0x16, 0x55]) === '123.438743')
    })

    it('should format message strings with complex printf formatters', function() {
        let evrdict = {'desc': 'desc', 'name': 'name', 'code': 1}
        let evr = new ait.evr.EVRDefinition(evrdict)

        evr._msg = '%hhu'
        assert(evr.formatMessage([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]) === '1')

        evr._msg = '%hu'
        assert(evr.formatMessage([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]) === '258')

        evr._msg = '%lu'
        assert(evr.formatMessage([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]) === '16909060')

        // No native 64 bit integer support in JS (yet?). Will need to add support for handling
        // via 3rd part library if this functionality is needed in the future
        //evr._msg = '%llu'
        //assert(evr.formatMessage([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]) === '72623859790382856')
    })
})
