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


describe('Field component error limit checks', () => {
    let field = null

    beforeEach(function() {
        field = bliss.gui.Field
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
        field = bliss.gui.Field
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
