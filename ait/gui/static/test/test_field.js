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


describe('Field component error limit checks', () => {
    let field = null

    beforeEach(function() {
        field = ait.gui.Field
    })

    it('should gracefully fail when no limits are defined', () => {
        field._limits =  {}

        field.valueIsInErrorRange('Hello').should.equal(false)
        field.valueIsInErrorRange(489).should.equal(false)
    })

    it('should handle a single value error limit', () => {
        field._limits = {
            value: {
                error: 'ERROR'
            }
        }

        field.valueIsInErrorRange('ERROR').should.equal(true)
        field.valueIsInErrorRange('NOT_AN_ERROR').should.equal(false)
    })

    it('should handle a list of error limits', () => {
        field._limits = {
            value: {
                error: ['ERROR', 'ALSO_AN_ERROR']
            }
        }

        field.valueIsInErrorRange('ERROR').should.equal(true)
        field.valueIsInErrorRange('ALSO_AN_ERROR').should.equal(true)
        field.valueIsInErrorRange('NOT_AN_ERROR').should.equal(false)
    })

    it('should handle value error bounds', () => {
        field._limits = {
            lower: {
                error: 5
            },
            upper: {
                error: 45
            }
        }

        field.valueIsInErrorRange(10).should.equal(false)
        field.valueIsInErrorRange(4).should.equal(true)
        field.valueIsInErrorRange(46).should.equal(true)
    })
})


describe('Field component warning limit checks', () => {
    let field = null

    beforeEach(function() {
        field = ait.gui.Field
    })

    it('should gracefully fail when no limits are defined', () => {
        field._limits =  {}

        field.valueIsInWarnRange('Hello').should.equal(false)
        field.valueIsInWarnRange(489).should.equal(false)
    })

    it('should handle a single value warning limit', () => {
        field._limits = {
            value: {
                warn: 'WARNING'
            }
        }

        field.valueIsInWarnRange('WARNING').should.equal(true)
        field.valueIsInWarnRange('NOT_A_WARNING').should.equal(false)
    })

    it('should handle a list of warning limits', () => {
        field._limits = {
            value: {
                warn: ['WARNING', 'ALSO_A_WARNING']
            }
        }

        field.valueIsInWarnRange('WARNING').should.equal(true)
        field.valueIsInWarnRange('ALSO_A_WARNING').should.equal(true)
        field.valueIsInWarnRange('NOT_A_WARNING').should.equal(false)
    })

    it('should handle value error bounds', () => {
        field._limits = {
            lower: {
                warn: 5
            },
            upper: {
                warn: 45
            }
        }

        field.valueIsInWarnRange(10).should.equal(false)
        field.valueIsInWarnRange(4).should.equal(true)
        field.valueIsInWarnRange(46).should.equal(true)
    })
})


describe('Field component should alert on limit trips', () => {
    let field = null
    let emitSpy = null

    before(() => {
        emitSpy = sinon.spy(global.ait.events, 'emit')
    })

    beforeEach(() => {
        field = ait.gui.Field
        emitSpy.reset()
    })

    after(() => {
        emitSpy.restore()
    })

    it('should emit an event on a warn trip', () => {
        field.valueIsInWarnRange = sinon.stub().returns(true)
        field.valueIsInErrorRange = sinon.stub().returns(false)
        field.hasLimitCheck = sinon.stub().returns(true)
        field.getValue = sinon.stub().returns('dummy field value')

        let fieldOutput = mq(field, {name: 'field', packet: 'packet'})

        emitSpy.called.should.equal(true)
        let args = emitSpy.getCall(0).args
        args[0].should.equal('field:limitOut')
        args[0].should.equal('field:limitOut')
        assert(typeof(args[1]) === 'object')
        args[1]['type'].should.equal('warning')
        args[1]['field'].should.equal('packet_field')
        field._limitOut.should.equal(true)

    })

    it('should emit an event on an error trip', () => {
        field.valueIsInWarnRange = sinon.stub().returns(false)
        field.valueIsInErrorRange = sinon.stub().returns(true)
        field.hasLimitCheck = sinon.stub().returns(true)
        field.getValue = sinon.stub().returns('dummy field value')

        let fieldOutput = mq(field, {name: 'field', packet: 'packet'})

        emitSpy.called.should.equal(true)
        let args = emitSpy.getCall(0).args
        args[0].should.equal('field:limitOut')
        args[0].should.equal('field:limitOut')
        assert(typeof(args[1]) === 'object')
        args[1]['type'].should.equal('error')
        args[1]['field'].should.equal('packet_field')
        field._limitOut.should.equal(true)
    })

    it('should emit an event when back in limit', () => {
        field.valueIsInWarnRange = sinon.stub().returns(false)
        field.valueIsInErrorRange = sinon.stub().returns(false)
        field.hasLimitCheck = sinon.stub().returns(true)
        field.getValue = sinon.stub().returns('dummy field value')
        field._limitOut = true;

        let fieldOutput = mq(field, {name: 'field', packet: 'packet'})

        emitSpy.called.should.equal(true)
        let args = emitSpy.getCall(0).args
        args[0].should.equal('field:limitIn')
        args[0].should.equal('field:limitIn')
        args[1].should.equal('packet_field')
        field._limitOut.should.equal(false)
    })
})
