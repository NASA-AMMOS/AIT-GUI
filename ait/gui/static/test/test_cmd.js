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

//import m from 'mithril'
//global.m = m

describe('CommandDictionary object', function () {
    let dict = {"NO_OP": {"subsystem": "CORE", "name": "NO_OP", "title": "NO_OP", "opcode": 1, "arguments": [], "desc": "Standard NO_OP command.\n"}}
    let dict_no_subsystem = {"NO_OP": {"name": "NO_OP", "title": "NO_OP", "opcode": 1, "arguments": [], "desc": "Standard NO_OP command.\n"}}

    it('should split the dict by subsystem', function() {
        let parsed = ait.cmd.CommandDictionary.parse(dict)
        assert('CORE' in parsed.bySubsystem)
    })

    it('should split cmds without a substem into a default group', function() {
        let parsed = ait.cmd.CommandDictionary.parse(dict_no_subsystem)
        assert('GENERAL' in parsed.bySubsystem)
    })
})


//
