import 'babel-polyfill'

global.window = Object.assign(require("mithril/test-utils/browserMock.js")(), require('mithril/test-utils/domMock.js')(), require('mithril/test-utils/pushStateMock')())
global.document = window.document
let mq = require('mithril-query')

let chai = require('chai')
let assert = chai.assert
chai.should()

let sinon = require('sinon')

import * as bliss from 'bliss'
global.bliss = bliss

import m from 'mithril'
global.m = m

import cloneDeep from 'lodash/cloneDeep'

describe('CommandInput object', function () {
    let ci = null
    let ciOut = null

    beforeEach(function() {
        ci = cloneDeep(bliss.gui.CommandInput)
        ciOut = mq(ci)
    })

    it('should track command history', function() {
        assert.property(bliss.events._listeners, 'cmd:hist')

        let addSpy = sinon.spy()
        bliss.cmd.typeahead.hist.add = addSpy

        bliss.events.emit('cmd:hist', 'foobar')

        assert(addSpy.called)
        assert(addSpy.calledWith, ['foobar'])
    })

    it('should disable command functionality while sequences are running', function() {
        assert.property(bliss.events._listeners, 'seq:exec')
        assert.property(bliss.events._listeners, 'seq:done')
        assert.property(bliss.events._listeners, 'seq:err')

        ci._cmding_disabled.should.equal(false)
        bliss.events.emit('seq:exec', null)
        ci._cmding_disabled.should.equal(true)
        bliss.events.emit('seq:done', null)
        ci._cmding_disabled.should.equal(false)
        bliss.events.emit('seq:exec', null)
        ci._cmding_disabled.should.equal(true)
        bliss.events.emit('seq:err', null)
        ci._cmding_disabled.should.equal(false)

        bliss.events.emit('seq:exec', null)
        ciOut.redraw()
        ciOut.should.have('button[disabled=disabled]')
    })

    it('should require ctrl+enter to submit commands', function() {
        ci._cntrl_toggled.should.equal(false)
        ciOut.keydown('input#command-typeahead', 17)
        ci._cntrl_toggled.should.equal(true)
        ciOut.keyup('input#command-typeahead', 17)
        ci._cntrl_toggled.should.equal(false)

        let e = {
            keyCode: 13,
            preventDefault: sinon.spy()
        }

        // If the user pressed Enter w/o Ctrl, we should see
        // preventDefault called as part of the submission rejection.
        ciOut.trigger('input#command-typeahead','onkeydown', e)
        assert(e.preventDefault.called)

        e = {
            keyCode: 13,
            preventDefault: sinon.spy()
        }

        ciOut.keydown('input#command-typeahead', 17)
        ciOut.trigger('input#command-typeahead','onkeydown', e)
        assert(e.preventDefault.notCalled)
    })
})
