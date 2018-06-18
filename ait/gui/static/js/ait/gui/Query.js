import map from 'lodash/map'

/**
 * Generate and run queries against captured telemetry data in PCAP files and
 * retrieve a CSV of the resulting data.
 *
 * **Optional Attributes:**
 *
 *  data-dir
 *    The data directory key specifying which directory should be used when
 *    gathering telemetry data PCAPs.
 *
 *  packet
 *    The name of the packet definition in the telemetry dictionary from which
 *    fields will be selected for the query.
 *
 *  time-field
 *    The telemetry field name that will be used as the time baseline in the
 *    query.
 *
 *  .. note::
 *
 *     Specifying one or more of these optional attributes will remove the
 *     corresponding input field from the UI.
 *
 * @example
 * <ait-telemetryquery></ait-telemetryquery>
 *
 * @example
 * <ait-telemetryquery
 *   data-dir='/tmp/fakepcapdir'
 *   packet='1553_EHS_Packet'
 *   time-field='time_coarse'>
 * </ait-telemetryquery>
 */
const TelemetryQuery = {
    _data_paths: {},
    _packet: null,
    _fields: [],
    _querying: false,
    _validation_errors: {},
    _tlm_dict: null,

    oninit(vnode) {
        m.request({
            method: 'GET',
            url: '/data',
        }).then((data) => {
           this._data_paths = data
        })

        // We need to delay setting the _packet value to the corresponding
        // attribute in vnode.attrs (if specified) to ensure that we aren't
        // attempting to read from the potentially unloaded tlm dictionary. We
        // could use the tlm.promise in the other sections of the code but
        // it increases the complexity a good bit and the logic is already
        // present to check if this._packet is set regardless of packet being
        // set in vnode.attrs or not.
        ait.tlm.promise.then(() => {
            if ('packet' in vnode.attrs) {
                this._packet = vnode.attrs['packet']
            }
        })
    },

    view(vnode) {
        let dataDir
        if ('data-dir' in vnode.attrs) {
            dataDir = m('input', {type: 'hidden', name: 'dataDir', value: vnode.attrs['data-dir']})
        } else {
            dataDir = m('div', {class: 'form-group'}, [
                m('label', 'Data Directory'),
                m('select', {class: 'form-control', name: 'dataDir'},
                    [m('option', {
                        disabled: 'disabled',
                        selected: 'selected'
                    }, 'Select an option ...')].concat(
                        map(Object.keys(this._data_paths), (k) => {
                            return m('option', {value: k}, `${k}: ${this._data_paths[k]}`)
                        })
                    )
                ),
                m('p', {class: 'help-block'}, 'The archive data directory containing the relevant telemetry data over which to search')
            ])

            if (this._validation_errors['dataDir']) {
                dataDir.attrs.className += ' has-error'
            }
        }

        let packets
        if ('packet' in vnode.attrs) {
            packets = m('input', {type: 'hidden', name: 'packet', value: vnode.attrs['packet']})
        } else {
            packets = m('div', {class: 'form-group'}, [
                m('label', 'Telemetry Packet'),
                m('select', {
                        class: 'form-control',
                        name: 'packet',
                        onchange: (e) => {
                            this._packet = e.currentTarget.value
                        }
                    },
                    [m('option', {
                        disabled: 'disabled',
                        selected: 'selected'
                    }, 'Select an option ...')].concat(
                        map(Object.keys(ait.tlm.dict), (k) => {
                            return m('option', {value: k}, k)
                        })
                    )
                ),
                m('p', {class: 'help-block'}, 'The telemetry packet that contains the fields to be queried')
            ])
        }

        if (this._validation_errors['packet']) {
            packets.attrs.className += ' has-error'
        }

        let fieldOpts = null
        if (this._packet === null) {
            fieldOpts = []
        } else {
            fieldOpts = [m('option', {
                disabled: 'disabled',
                selected: 'selected',
                value: 'bogusDefaultSelectOption'
            }, 'Select an option ...')].concat(
                map(Object.keys(ait.tlm.dict[this._packet].fields).sort(), (k) => {
                    return m('option', {value: k}, k)
                })
            )
        }

        let timeField
        if ('time-field' in vnode.attrs) {
            timeField = m('input', {type: 'hidden', name: 'timeField', value: vnode.attrs['time-field']})
        } else {
            timeField = m('div', {class: 'form-group'}, [
                m('label', 'Telemetry Time Field'),
                m('select', {class: 'form-control', name: 'timeField'}, fieldOpts),
                m('p', {class: 'help-block'}, 'Select and add the telemetry time field to use as a basis for the query')
            ])

            if (this._validation_errors['timeField']) {
                timeField.attrs.className += ' has-error'
            }
        }

        let fields = m('div', {class: 'form-group'}, [
            m('label', 'Telemetry Fields'),
            m('div', {class: 'input-group'},
                m('select', {class: 'form-control', name: 'fields'}, fieldOpts),
                m('div', {class: 'input-group-btn'},
                    m('button', {
                        class: 'btn btn-default',
                        type: 'button',
                        onmousedown: (e) => {
                            e.preventDefault()
                            let select = e.currentTarget.parentElement.parentElement.children[0]
                            this._fields.push(select.value)
                            select.value = 'bogusDefaultSelectOption'
                        }
                    }, 'Add')
                )
            ),
            m('p', {class: 'help-block'}, 'Select and add the telemetry field(s) to query')
        ])

        if (this._validation_errors['fields']) {
            fields.attrs.className += ' has-error'
        }

        let selectedFields = m('span')
        if (this._fields.length !== 0) {
            selectedFields = m('div', {class: 'form-group'}, [
                m('label', 'Fields selected for query'),
                m('div', {class: 'field_selection'}, map(this._fields, (val, i) => {
                    return m('div', {
                        class: 'label label-default field_label',
                        onmouseover: (e) => {
                            e.currentTarget.classList.add('label-danger')
                        },
                        onmouseout: (e) => {
                            e.currentTarget.classList.remove('label-danger')
                        },
                        onclick: (e) => {
                            this._fields.splice(i, 1)
                        }
                    }, val)
                })),
                m('p', {class: 'help-block'}, 'The telemetry points that will be filtered from the selected data')
            ])
        }

        let startTime = m('div', {class: 'form-group'}, [
            m('label', 'Start Time'),
            m('input', {class: 'form-control', placeholder: 'Start time YYYY-MM-DDTHH:MM:SSZ', name: 'startTime'}),
            m('p', {class: 'help-block'}, 'Start time for data filtering. Expected format: YYYY-MM-DDTHH:MM:SSZ')
        ])

        if (this._validation_errors['startTime']) {
            startTime.attrs.className += ' has-error'
        }

        let endTime = m('div', {class: 'form-group'}, [
            m('label', 'End Time'),
            m('input', {class: 'form-control', placeholder: 'End time YYYY-MM-DDTHH:MM:SSZ', name: 'endTime'}),
            m('p', {class: 'help-block'}, 'End time for data filtering. Expected format: YYYY-MM-DDTHH:MM:SSZ')
        ])

        if (this._validation_errors['endTime']) {
            endTime.attrs.className += ' has-error'
        }

        let btnText = 'Query'
        let btnAttrs = {class: 'btn btn-success pull-right', type: 'submit'}

        if (this._querying) {
            btnText = m('span', {class: 'glyphicon glyphicon-refresh right-spin'})
            btnAttrs['disabled'] = 'disabled'
        }

        let queryBtn = m('button', btnAttrs, btnText)

        let form = m('form', {
            onsubmit: (e) => {
                e.preventDefault()
                let data = new FormData()
                let form = e.currentTarget

                if (! this._validate_form(form)) {
                    return false
                }

                data.append('dataDir', this._data_paths[form.elements['dataDir'].value])
                data.append('timeField', form.elements['timeField'].value)
                data.append('packet', form.elements['packet'].value)
                data.append('fields', this._fields)
                data.append('startTime', form.elements['startTime'].value)
                data.append('endTime', form.elements['endTime'].value)

                this._querying = true
                m.request({
                    url: '/tlm/query',
                    method: 'POST',
                    data: data,
                    extract: (xhr) => {return xhr}
                }).then((r) => {
                    this._querying = false

                    // Trigger download of the returned CSV
                    let blob = new Blob([r.response])
                    let link = document.createElement('a')
                    link.href = window.URL.createObjectURL(blob)
                    link.download = "query_output.csv"
                    link.click()

                    form.reset()
                    if (! ('data-dir' in vnode.attrs)) {
                        form.elements['dataDir'].selectedIndex = 0
                    }

                    if (! ('packet' in vnode.attrs)) {
                        form.elements['packet'].selectedIndex = 0
                        this._packet = null
                    } else {
                        // If packet is specified in vnode.attrs we need to
                        // explicitly reset the Telemetry Fields select to make
                        // sure we end up back on the default value. If we don't
                        // it will reset to the first non-disabled value in the
                        // select box.
                        form.elements['fields'].selectedIndex = 0
                    }

                    if (! ('time-field' in vnode.attrs)) {
                        form.elements['timeField'].selectedIndex = -1
                    }

                    this._fields = []
                }).catch((e) => {
                    this._querying = false
                })

                return false
            },
        }, [
            dataDir,
            packets,
            timeField,
            fields,
            selectedFields,
            startTime,
            endTime,
            queryBtn
        ])

        return m('ait-telemetryquery', vnode.attrs, form)
    },

    _validate_form(form) {
        this._validation_errors = {}

        if (form.elements['dataDir'].selectedIndex === 0) {
            this._validation_errors['dataDir'] = true
        }
        if (form.elements['packet'].selectedIndex === 0) {
            this._validation_errors['packet'] = true
        }
        if (form.elements['timeField'].selectedIndex === -1 ||
            form.elements['timeField'].selectedIndex === 0) {
            this._validation_errors['timeField'] = true
        }
        if (this._fields.length === 0) {
            this._validation_errors['fields'] = true
        }

        let datetimeRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\dZ/
        if (! datetimeRegex.test(form.elements['startTime'].value)) {
            this._validation_errors['startTime'] = true
        }
        if (! datetimeRegex.test(form.elements['endTime'].value)) {
            this._validation_errors['endTime'] = true
        }

        return Object.keys(this._validation_errors).length === 0
    }
}

export default {TelemetryQuery}
export {TelemetryQuery}
