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
        this._plot_id = Math.random().toString()
        this._user_specified_label = false
        this._series = []
    }

    addSeries (id, attrs) {
        this._series.push(id)
        this._plot._options.labels.push(attrs.caption || attrs.name)
    }

    createChart (vnode, options) {
        let startarray = [ ]
        this._plot._options.labels.forEach( (name) => {
            startarray.push(0)
        })

        // Dygraphs is being initialized off of a nested div within the
        // bliss-plot tag so that displaying the legend in an external
        // div works as expected. If the external div is nested within the
        // same tag that Dygraph is initialized on then functionality breaks.
        return new Dygraph(vnode.dom.children[0], [ startarray ], options)
    }

    createOptions (attrs) {
        // set window range
        this._plotrange = attrs['plot-range'] || 600

        return {
            drawPoints: true,
            connectSeparatedPoints: true,
            xlabel:     'Time',
            labels:     ['Time'],
            height:     500,
            width:      800,
            legend:     'always',
            labelsSeparateLines: false,
            labelsDiv: this._plot_id,
            showRangeSelector: true
        }
    }

    handleOptionsOverride(options, overrides) {
        Object.assign(options, overrides)

        if ('labelsDiv' in overrides) {
            this._plot_id = overrides['labelsDiv']
            this._user_specified_label = true
        }
    }

    plot (packet) {
        const pname = packet._defn.name
        const names = this._plot._packets[pname]

        if (!names) return

        let row = [ this._plot._time.get(packet) ]

        // For each series of data, if it's in the current packet
        // that we're updating, add the associated point. Otherwise,
        // add a null value. Dygraphs requires that the data added
        // to the plot maintains the same "shape" as the labels.
        this._series.forEach((id) => {
            if (id.startsWith(pname)) {
                row.push(packet.__get__(id.split('.')[1]))
            } else {
                row.push(null)
            }
        })

        this._plot._data.push(row)

        // If we get too many records, start to pop off the array
        // This is only way I can see to set a moving window
        if (this._plot._data.length > this._plotrange) {
            this._plot._data.shift()
        }

        if (this._plot.shouldRedraw()) {
            this._plot._chart.updateOptions( { 'file': this._plot._data } )
        }
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
            showInNavigator: true,
            boostThreshold: 1,

            // When the series contains less points than the crop threshold,
            // all points are drawn, even if the points fall outside the
            // visible plot area at the current zoom.
            cropThreshold: 1,

            // When a series contains a data array that is longer than this,
            // only one dimensional arrays of numbers, or two dimensional
            // arrays with x and y values are allowed. Also, only the first
            // point is tested, and the rest are assumed to be the same format.
            turboThreshold: 1
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

            /*
             * "Maximum Performance" series plot options that removes all
             * extra functionality to squeeze out a bit of performance.
             */
            //plotOptions: {
            //    series: { animation: false, enableMouseTracking: false, stickyTracking: true, shadow: false, dataLabels: { style: { textShadow: false } } },
            //},

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

    handleOptionsOverride(options, overrides) {
        Object.assign(options, overrides)
    }

    plot(packet) {
        const pname = packet._defn.name
        const names = this._plot._packets[pname]
        if (!names) return

        names.forEach( (name) => {
            const series = this._plot._chart.get(pname + '.' + name)

            if (series) {
                const x = this._plot._time.get(packet).getTime()
                const y = packet.__get__(name)

                series.addPoint([x, y], false)

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
        if (this._plot.shouldRedraw()) {
            this._plot._chart.redraw()
        }
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
            this._backend.handleOptionsOverride(this._options, JSON.parse(vnode.text))
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


    /**
     * Determine if a plot should redraw given the time since last rendering
     */
    shouldRedraw() {
        let curTime = Date.now()
        let redrawDelta = (curTime - this._lastRedrawTime) / 1000

        if (redrawDelta > this._redrawDelta) {
            this._lastRedrawTime = curTime
            return true
        } else {
            return false
        }
    },


    oninit (vnode) {
        this._backend = (window.Highcharts) ?
            new HighchartsBackend(this) : new DygraphsBackend(this)

        this._data     = [ ]
        this._options  = this._backend.createOptions(vnode.attrs)
        this._packets  = { }
        this._time     = null
        this._initZoom = false
        this._redrawFrequency = parseInt(vnode.attrs['redraw-frequency']) || 10
        let redrawFreqMin = parseInt(vnode.attrs['redraw-frequency-variation-min']) || -2
        let redrawFreqMax = parseInt(vnode.attrs['redraw-frequency-variation-max']) || 2
        let fuzzyRedrawVariation = ('redraw-frequency-variation' in vnode.attrs) ? vnode.attrs['redraw-frequency-variation'] === true : false

        // If we want a "fuzzy redraw frequency" we add a random value from
        // [redrawFreqMin to redrawFreqMax] to the redraw frequency.
        this._redrawDelta = this._redrawFrequency + (fuzzyRedrawVariation ?
            Math.random() * (redrawFreqMax - redrawFreqMin) + redrawFreqMin : 0)
        this._lastRedrawTime = Date.now()

        vnode.children.forEach(child => this.processTag(child))

        if (this._time === null) {
            this._time = new PlotTimeField()
        }

        bliss.events.on('bliss:tlm:packet', (p) => this.plot(p))
    },


    oncreate (vnode) {
        this._chart = this._backend.createChart(vnode, this._options)
    },


    view (vnode) {
        if (window.Highcharts) {
            return m('bliss-plot', vnode.attrs)
        } else {
            let plot_contents = [m('div')]

            if (! this._backend._user_specified_label) {
                plot_contents.push(
                    m('div', {
                        id: this._backend._plot_id,
                        class: 'dygraph-legend',
                        style: `width: ${this._options['width']}px;`
                    })
                )
            }

            return m('bliss-plot', vnode.attrs, plot_contents)
        }
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
