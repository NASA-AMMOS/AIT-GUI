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
import { getFieldType } from '../util.js'

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
        // ait-plot tag so that displaying the legend in an external
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
            showRangeSelector: true,
            digitsAfterDecimal: 5
        }
    }

    handleOptionsOverride(options, overrides) {
        Object.assign(options, overrides)

        if ('labelsDiv' in overrides) {
            this._plot_id = overrides['labelsDiv']
            this._user_specified_label = true
        }
    }

    plot (data, raw) {
        const pname = data['packet']
        let packet = getFieldType(data['data'], raw)
        const names = this._plot._packets[pname]

        if (!names) return

        let row = [ this._plot._time.get(packet) ]
        // For each series of data, if it's in the current packet
        // that we're updating, add the associated point. Otherwise,
        // add a null value. Dygraphs requires that the data added
        // to the plot maintains the same "shape" as the labels.
        this._series.forEach((id) => {
            if (id.startsWith(pname)) {
                row.push(packet[id.split('.')[1]])
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
            this.redraw()
        }
    }

    redraw() {
        this._plot._chart.updateOptions( { 'file': this._plot._data })
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

    plot(data, raw) {
        const pname = data['packet']
        let packet = getFieldType(data['data'], raw)
        const names = this._plot._packets[pname]
        if (!names) return

        names.forEach( (name) => {
            const series = this._plot._chart.get(pname + '.' + name)

            if (series) {
                const x = this._plot._time.get(packet).getTime()
                const y = packet[name]

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
            this.redraw()
        }
    }

    redraw() {
        this._plot._chart.redraw()
    }
}


/**
 *
 * Display a plot of telemetry data
 *
 * Plot configuration can be done with a number of children tags and
 * attributes. A plot must have at least one **ait-plot-series** child
 * so that it has something to plot
 *
 * The Plot component supports graphing with Dygraphs (default) and
 * HighCharts. If you want to use HighCharts instead of Dygraphs you
 * need to include the Highcharts JS file in your page. If the
 * *window.Highcharts* object is defined then Highcharts will be used.
 *
 * **Optional Attributes:**
 *
 * redraw-frequency
 *   The frequency, in seconds, that the plot should be redrawn. (default: 10)
 *
 * redraw-frequency-variation
 *   Toggle whether plot redraw frequency should be affected by random
 *   variation. If enabled, the redraw frequency of the plot will vary
 *   by [redraw-frequency-var-min, redraw-frequency-variation-max] seconds each
 *   refresh. This is useful if you have a large number of plots and need
 *   to avoid all of them attempting to redraw at the same time.
 *   (default: false)
 *
 * redraw-frequency-variation-min (-2)
 *   The minimum variation in seconds to add to the redraw frequency
 *
 * redraw-frequency-variation-max (2)
 *   The maximum variation in seconds to add to the redraw frequency
 *
 * **ait-plot-series:**
 *
 * Configure the series of data that should be plotted. At least 1 series of
 * data is required for the plot to function.
 *
 * Required attributes:
 *
 * packet
 *   The packet in which the series telemetry point is located.
 *
 * field
 *   The name of the field in the packet that defines this series.
 *
 * Optional attributes:
 *
 * type
 *   The type of series being displayed. This is not relevant for all plot
 *   backends. For instance, Highcharts would use this to define the type
 *   of plot to show whereas Dygraphs does not support this value. If you're
 *   using Highcharts this attribute is required and would most commonly be
 *   set to **line**.
 *
 * plot-range
 *   The number of data points that should be stored and used for plotting.
 *   Defaults to 600. Data received beyond this maximum causes the oldest
 *   point to be removed from the queue. This is only used by the Dygraphs
 *   backend.
 *
 * raw
 *   If the `raw` parameter is true, the raw value will be returned.
 *   DN to EU conversions will be skipped. (Default: raw=false)
 *
 * .. code:: Javascript
 *
 *    <ait-plot-series packet="1553_HS_Packet" field="Voltage_A" raw=true></ait-plot-series>
 *
 * **ait-plot-config:**
 *
 * Allows the passing of a JSON object for configuration of the current
 * backend into the plot. Any setting that is valid for the backend
 * being used can be included in the JSON object. Please consult the relevant
 * backend's documentation for information on valid settings.
 *
 * .. code::
 *
 *    <ait-plot-config>
 *      {
 *         "title": "Plot title",
 *         "xlabel": "X label",
 *         "ylabel": "Y label"
 *      }
 *    </ait-plot-config>
 *
 * **ait-plot-time:**
 *
 * Facilitates setting the name of a telemetry field defining the timestamp
 * used when plotting data. If the evaluation of the specified telemetry field
 * does not result in a number of Date() object the current time is used
 * instead. If no **ait-plot-time** tag is specified the current time
 * is used.
 *
 * .. code:: Javascript
 *
 *    <ait-plot-time packet="1553_HS_Packet" field="FSWTimeField"></ait-plot-time>
 *
 * @example
 * <ait-plot redraw-frequency="1">
 *   <ait-plot-config>
 *     {
 *       "width": 600,
 *       "height": 300
 *     }
 *   </ait-plot-config>
 *   <ait-plot-series packet="1553_HS_Packet" name="Voltage_A" raw=true></ait-plot-series>
 *   <ait-plot-series packet="1553_HS_Packet" name="Voltage_B" raw=true></ait-plot-series>
 *   <ait-plot-series packet="1553_HS_Packet" name="Voltage_C" raw=true></ait-plot-series>
 *   <ait-plot-series packet="1553_HS_Packet" name="Voltage_D" raw=true></ait-plot-series>
 * </ait-plot>
 */
const Plot =
{
    /**
     * Plots data from the given packet.
     */
    plot (packet, raw=false) {
        this._backend.plot(packet, raw)
    },


    /**
     * Processes a `<ait-plot-xxx>` tag by dispatching to the
     * appropriate `processTagXXX()` method.
     */
    processTag (vnode) {
        if (vnode.tag === 'ait-plotconfig') {
            try {
                this._backend.handleOptionsOverride(this._options, JSON.parse(vnode.text))
            }
            catch(error) {
                if (error instanceof SyntaxError) {
                    console.error('Error parsing plot config. Printing trace back ' +
                                  'and reverting to default options.')
                }
                console.error(error)
            }
        }
        else if (vnode.tag === 'ait-plotseries') {
            this.processTagSeries(vnode)
        }
        else if (vnode.tag === 'ait-plottime') {
            this.processTagTime(vnode)
        }
    },


    /**
     * Process tag: `<ait-plot-series type="..." ...>`.
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

        this._raw   = vnode.attrs.raw
    },


    /**
     * Process tag: `<ait-plot-time packet="..." name="...">`.
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

        ait.events.on('ait:tlm:packet', (p) => this.plot(p, this._raw))
        ait.events.on('ait:playback:on', () => this.redraw())
        ait.events.on('ait:playback:off', () => this.redraw())
    },


    oncreate (vnode) {
        this._chart = this._backend.createChart(vnode, this._options)
    },


    view (vnode) {
        if (window.Highcharts) {
            return m('ait-plot', vnode.attrs)
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

            return m('ait-plot', vnode.attrs, plot_contents)
        }
    },

    redraw() {
        this._data = []
        this._backend.redraw()
    }
}


/**
 * PlotTimeField
 *
 * A :class:`PlotTimeField` identifies a packet and constituent field
 * (by name) to use for the the time axis in AIT plots.  If the
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
     * @returns the plot time for the current AIT packet or new Date().
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
