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

import m from 'mithril'
import Dygraph from 'dygraphs';

/*
 * FIXME: The two Backend classes (Dygraphs and Highcharts) are not cleanly
 * separated from the Plot class and need to be refactored.  There's far
 * too much coupling.  This is because all functionality used to exist in
 * Plot, but was *quickly* refactored to support multiple plot backends.
 */

class DygraphsBackend
{
    constructor (plot) {
        this._plot = plot
    }

    addSeries (id, attrs) {
        this._plot._options.labels.push(attrs.caption || attrs.name)
    }

    createChart (vnode, options) {
        return new Dygraph(vnode.dom, [ [0, 0] ], options)
    }

    createOptions (attrs) {
        return {
            drawPoints: true,
            title:      attrs.title,
            xlabel:     'Time (UTC)',
            ylabel:     attrs['y-title'],
            labels:     ['Time']
        }
    }

    plot (packet) {
        const pname = packet._defn.name
        const names = this._plot._packets[pname]

        if (!names) return

        let row = [ this._plot._time.get(packet) ]

        names.forEach( (name) => {
            row.push( packet.__get__(name) )
        })

        this._plot._data.push(row)
        this._plot._chart.updateOptions( { 'file': this._plot._data } )
    }
}


class HighchartsBackend
{
    constructor (plot) {
        this._plot = plot
    }

    addSeries (id, attrs) {
        this._plot._options.series.push({
            id:      id,
            name:    attrs.caption || id,
            color:   attrs.color,
            data:    [ ],
            tooltip: { valueDecimals: 2 },
            type:    attrs.type,
            showInNavigator: true
        })

    }

    createChart (vnode, options) {
        return new Highcharts.StockChart(vnode.dom, options)
    }

    createOptions (attrs) {
        return {
            credits: {
                enabled: false
            },

            legend: {
                enabled: true
            },

            boost: {
                seriesThreshold: 1,
            },

            rangeSelector: {
                buttons: [
                    { count: 1 , text: '1m' , type: 'minute' },
                    { count: 10, text: '10m', type: 'minute' },
                    { count: 30, text: '30m', type: 'minute' },
                    { count:  1, text: '1h' , type: 'hour'   },
                    { count:  6, text: '6h' , type: 'hour'   },
                    { count: 12, text: '12h', type: 'hour'   },
                    { count:  1, text: '1d' , type: 'day'    },
                ],
                inputEnabled: false,
            },

            series: [ ],

            title: {
                text: attrs.title
            },

            xAxis: {
                title: { text: 'Time (UTC)' }
            },

            yAxis: {
                title: { text: attrs['y-title'] }
            }
        }
    }

    plot(packet) {
        const pname = packet._defn.name
        const names = this._plot._packets[pname]
        if (!names) return

        names.forEach( (name) => {
            const series = this._plot._chart.get(pname + '.' + name)

            if (series) {
                const x = this._plot._time.get(packet).getTime()
                console.log(x)
                const y = packet.__get__(name)
                series.addPoint([x, y])

                // Zoom axis once after data spans 60 seconds
                if (this._plot._initZoom === false) {
                    const extremes = this._plot._chart.axes[0].getExtremes()
                    const duration = (extremes.max - extremes.min) / 1e3

                    if (duration >= 60) {
                        this._plot._chart.rangeSelector.clickButton(0, true)
                        this._plot._initZoom = true
                    }
                }
            }
        })
    }
}


const Plot =
{
    /**
     * Plots data from the given packet.
     */
    plot (packet) {
        this._backend.plot(packet)
    },


    /**
     * Processes a `<bliss-plot-xxx>` tag by dispatching to the
     * appropriate `processTagXXX()` method.
     */
    processTag (vnode) {
        if (vnode.tag === 'bliss-plotconfig') {
            Object.assign(this._options, JSON.parse(vnode.text))
        }
        else if (vnode.tag === 'bliss-plotseries') {
            this.processTagSeries(vnode)
        }
        else if (vnode.tag === 'bliss-plottime') {
            this.processTagTime(vnode)
        }
    },


    /**
     * Process tag: `<bliss-plot-series type="..." caption="..." ...>`.
     */
    processTagSeries (vnode) {
        const name   = vnode.attrs.name
        const packet = vnode.attrs.packet
        const type   = vnode.attrs.type
        const id     = packet + '.' + name

        this._backend.addSeries(id, vnode.attrs)

        // For each packet, maintain a list of fields to plot
        this._packets[packet] = this._packets[packet] || [ ]
        this._packets[packet].push(name)
    },


    /**
     * Process tag: `<bliss-plot-time packet="..." name="...">`.
     */
    processTagTime (vnode) {
        this._time = new PlotTimeField(vnode.attrs.packet, vnode.attrs.name)
    },


    // Mithril lifecycle method
    oninit (vnode) {
        this._backend = (window.Highcharts) ?
            new HighchartsBackend(this) : new DygraphsBackend(this)

        this._data     = [ ]
        this._options  = this._backend.createOptions(vnode.attrs)
        this._packets  = { }
        this._time     = null
        this._initZoom = false

        vnode.children.forEach(child => this.processTag(child))

        if (this._time === null) {
            this._time = new PlotTimeField()
        }

        bliss.events.on('bliss:tlm:packet', (p) => this.plot(p))
    },


    // Mithril lifecycle method
    oncreate (vnode) {
        this._chart = this._backend.createChart(vnode, this._options)
    },


    // Mithril lifecycle method
    view (vnode) {
        return m('bliss-plot', vnode.attrs)
    }
}


/**
 * PlotTimeField
 *
 * A :class:`PlotTimeField` identifies a packet and constituent field
 * (by name) to use for the the time axis in BLISS plots.  If the
 * packet name, field name, or resulting field value are invalid
 * (e.g. not a number or Javascript :class:`Date`), the current time
 * will be used.
 *
 * An empty :class:`PlotTimeField` will always return `Date()`, i.e.:
 *
 * .. code-block:: javascript
 *
 *     new PlotTimeField().get(packet) === new Date()
 */
class PlotTimeField
{
    /**
     * Creates a new :class:`PlotTimeField` with the given packet name
     * and field name.
     */
    constructor(pname=null, fname=null) {
        this._pname = pname
        this._fname = fname
    }

    /**
     * @returns the plot time for the current BLISS packet or new Date().
     */
    get (packet) {
        let time = this.hasTime(packet) ? packet.__get__(this._fname) : null

        if ( !(time instanceof Date) ) {
            if (typeof time !== 'number') {
                time = new Date()
            }
            else {
                time = new Date(time)
            }
        }

        return time
    }

    /**
     * @returns ``true`` or ``false`` to indicate whether or not the
     * given packet has the field referenced by this
     * :class:`PlotTimeField`.
     */
    hasTime (packet) {
        const defn = packet && packet._defn
        return defn && this._pname === defn.name && this._fname in defn.fields
    }
}


export default Plot
export { Plot }
