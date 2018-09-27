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

let AIT_HOST = 'localhost'
let AIT_PORT = 8081

function AITTlmDict(body) {
    let retJSON = JSON.parse(body);
    let dict = {}
    dict['name'] = 'AIT Telemetry'
    dict['key'] = 'ait_telemetry_dictionary'
    dict['measurements'] = []

    Object.keys(retJSON).forEach((packet) => {
        let fieldDefns = retJSON[packet]["fields"]
        Object.keys(fieldDefns).forEach((key) => {
            let fDict = {
                'key': packet + '.' + key,
                'name': packet + ' ' + fieldDefns[key]['name']
            }

            let vals = [
                {
                    "key": "value",
                    "name": "Value",
                    "hints": {
                        "range": 1
                    }
                },
                {
                    "key": "utc",
                    "source": "timestamp",
                    "name": "Timestamp",
                    "format": "utc",
                    "hints": {
                        "domain": 1
                    }
                }
            ]
            fDict['values'] = vals
            dict['measurements'].push(fDict)
        })
    })
    return dict
};

app.get('/telemdict', function (req, res) {
        let url = 'http://' + AIT_HOST + ':' + AIT_PORT + '/tlm/dict'
        http.get(url, function(response){
            var body = '';

            response.on('data', function(chunk){
                body += chunk;
            });

            response.on('end', function() {
                let dict = AITTlmDict(body)
                res.json(dict)
            });
        }).on('error', function(e){
              console.log("Got an error: ", e);
        });
});
