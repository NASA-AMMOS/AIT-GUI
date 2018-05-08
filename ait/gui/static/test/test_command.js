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

import m from 'mithril'
global.m = m

import cloneDeep from 'lodash/cloneDeep'

describe('CommandInput object', function () {
    let ci = null
    let ciOut = null

    beforeEach(function() {
        ci = cloneDeep(ait.gui.CommandInput)
        ciOut = mq(ci)
    })

    it('should track command history', function() {
        assert.property(ait.events._listeners, 'cmd:hist')

        let addSpy = sinon.spy()
        ait.cmd.typeahead.hist.add = addSpy

        ait.events.emit('cmd:hist', 'foobar')

        assert(addSpy.called)
        assert(addSpy.calledWith, ['foobar'])
    })

    it('should disable command functionality while sequences are running', function() {
        assert.property(ait.events._listeners, 'seq:exec')
        assert.property(ait.events._listeners, 'seq:done')
        assert.property(ait.events._listeners, 'seq:err')

        ci._cmding_disabled.should.equal(false)
        ait.events.emit('seq:exec', null)
        ci._cmding_disabled.should.equal(true)
        ait.events.emit('seq:done', null)
        ci._cmding_disabled.should.equal(false)
        ait.events.emit('seq:exec', null)
        ci._cmding_disabled.should.equal(true)
        ait.events.emit('seq:err', null)
        ci._cmding_disabled.should.equal(false)

        ait.events.emit('seq:exec', null)
        ciOut.redraw()
        ciOut.should.have('button[disabled=disabled]')
    })

    it('should require ctrl+enter to submit commands', function() {
        ci._cmd_valid = true
        ci._cntrl_toggled.should.equal(false)
        ciOut.keydown('input[name="command"]', 17)
        ci._cntrl_toggled.should.equal(true)
        ciOut.keyup('input[name="command"]', 17)
        ci._cntrl_toggled.should.equal(false)

        let e = {
            keyCode: 13,
            preventDefault: sinon.spy()
        }

        // If the user pressed Enter w/o Ctrl, we should see
        // preventDefault called as part of the submission rejection.
        ciOut.trigger('input[name="command"]','onkeydown', e)
        assert(e.preventDefault.called)

        e = {
            keyCode: 13,
            preventDefault: sinon.spy()
        }

        ciOut.keydown('input[name="command"]', 17)
        ciOut.trigger('input[name="command"]','onkeydown', e)
        assert(e.preventDefault.notCalled)
    })
})
