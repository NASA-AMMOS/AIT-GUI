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

/*
 * Example functions for AIT integration with OpenMCT. The below code can be
 * used in place of the examples provided in the OpenMCT Tutorial so that
 * AIT telemetry can be viewed in real time.
 *
 * https://github.com/nasa/openmct-tutorial
 *
 * Important Notes and Setup:
 *  - The current AIT backend implementation does not support the OpenMCT
 *    historical data query implementation. To work around this, ensure
 *    that the historical data endpoint in OpenMCT returns an empty
 *    dataset for any queried point. The AITHistoricalTelemetryPlugin
 *    function calls the default OpenMCT Tutorial historical endpoint.
 *  - The below example code queries for the AIT telemetry dictionary
 *    in the getDictionary call so the example implementation follows along
 *    with the OpenMCT tutorial. The endpoint that it calls can be added
 *    to the example OpenMCT server file (server.js). The code for this
 *    can be found in example_ait_telem_fetch.js.
 *  - Include the below code into OpenMCT by including this file in the
 *    example index.html file and installing the various components.
 *
 *    <script src="ait_integration.js"></script>
 *
 *    openmct.install(AITIntegration());
 *    openmct.install(AITHistoricalTelemetryPlugin());
 *    openmct.install(AITRealtimeTelemetryPlugin());
 *
 * How to run:
 *  Assuming the above "Important Notes and Setup" have been handled and
 *  the installation instructions in the OpenMCT Tutorial have been run:
 *
 *  1) Run `ait-gui 8081` to start the AIT backend
 *  2) Run `npm start` to run the OpenMCT server
 *  3) Point your browser to localhost:8080
 */

let AIT_HOST = 'localhost'
let AIT_PORT = 8081
let tlmdict = getDictionary()

function getDictionary() {
    return http.get('/telemdict')
    .then(function (result) {
        return result.data
    });
};

function AITIntegration() {
    let objectProvider = {
        get: function (identifier) {
            return tlmdict.then(function (dictionary) {
                if (identifier.key === 'spacecraft') {
                    return {
                        identifier: identifier,
                        name: dictionary.name,
                        type: 'folder',
                        location: 'ROOT'
                    };
                } else {
                    let measurement = dictionary.measurements.filter(function (m) {
                        return m.key === identifier.key;
                    })[0];
                    return {
                        identifier: identifier,
                        name: measurement.name,
                        type: 'telemetry',
                        telemetry: {
                            values: measurement.values
                        },
                        location: 'taxonomy:spacecraft'
                    };
                }
            });
        }
    };

    let compositionProvider = {
        appliesTo: function (domainObject) {
            return domainObject.identifier.namespace === 'taxonomy' &&
                   domainObject.type === 'folder';
        },
        load: function (domainObject) {
            return tlmdict
                .then(function (dictionary) {
                    return dictionary.measurements.map(function (m) {
                        return {
                            namespace: 'taxonomy',
                            key: m.key
                        };
                    });
                });
        }
    };

    return function install(openmct) {
        openmct.objects.addRoot({
            namespace: 'taxonomy',
            key: 'spacecraft'
        });

        openmct.objects.addProvider('taxonomy', objectProvider);

        openmct.composition.addProvider(compositionProvider);

        openmct.types.addType('telemetry', {
            name: 'Telemetry Point',
            description: 'Spacecraft Telemetry point',
            cssClass: 'icon-telemetry'
        });
    };
};

function AITHistoricalTelemetryPlugin() {
    return function install (openmct) {
        let provider = {
            supportsRequest: function (domainObject) {
                return domainObject.type === 'telemetry';
            },
            request: function (domainObject, options) {
                let url = '/history/' + domainObject.identifier.key +
                    '?start=' + options.start + '&end=' + options.end;

                return http.get(url)
                    .then(function (resp) {
                        return resp.data
                    });
            }
        };

        openmct.telemetry.addProvider(provider);
    }
};

function AITRealtimeTelemetryPlugin() {
    return function install(openmct) {
        let socket = new WebSocket(
            'ws://' + AIT_HOST + ':' + AIT_PORT + '/tlm/realtime/openmct');
        let listener = {};

        socket.onmessage = function (event) {
            let now = Date.now()

            let data = JSON.parse(event.data)
            let packet = data['packet']
            for (let p in data['data'])  {
                let point = {
                    'id': packet + '.' + p,
                    'timestamp': Date.now(),
                    'value': data['data'][p]
                }

                if (listener[point.id]) {
                    listener[point.id](point);
                }
            }
        };

        let provider = {
            supportsSubscribe: function (domainObject) {
                return domainObject.type === 'telemetry';
            },
            subscribe: function (domainObject, callback) {
                listener[domainObject.identifier.key] = callback;
                return function unsubscribe() {
                    delete listener[domainObject.identifier.key];
                };
            }
        };

        openmct.telemetry.addProvider(provider);
    }
};
