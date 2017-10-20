import m from 'mithril'
import Highcharts from 'highcharts/highstock';
require('highcharts/modules/boost')(Highcharts)

// See https://github.com/highcharts/highcharts/issues/4994
window.Highcharts = Highcharts


function createOptions (attrs) {
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


const Plot =
{
    /**
     * Plots data from the given packet.
     */
    plot (packet) {
        const pname = packet._defn.name
        const names = this._packets[pname]
        if (!names) return

        names.forEach( (name) => {
            const series = this._chart.get(pname + '.' + name)

            if (series) {
                const x = this._time.get(packet)
                const y = packet.__get__(name)
                series.addPoint([x, y])

                // Zoom axis once after data spans 60 seconds
                if (this._initZoom === false) {
                    const extremes = this._chart.axes[0].getExtremes()
                    const duration = (extremes.max - extremes.min) / 1e3

                    if (duration >= 60) {
                        this._chart.rangeSelector.clickButton(0, true)
                        this._initZoom = true
                    }
                }
            }
        })
    },


    /**
     * Processes a `<bliss-plot-xxx>` tag by dispatching to the
     * appropriate `processTagXXX()` method.
     */
    processTag (vnode) {
        if (vnode.tag === 'bliss-plot-config') {
            Object.assign(this._options, JSON.parse(vnode.text))
        }
        else if (vnode.tag === 'bliss-plot-series') {
            this.processTagSeries(vnode)
        }
        else if (vnode.tag === 'bliss-plot-time') {
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

        this._options.series.push({
            id:      id,
            name:    vnode.attrs.caption || name,
            color:   vnode.attrs.color,
            data:    [ ],
            tooltip: { valueDecimals: 2 },
            type:    type,
            showInNavigator: true
        })

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
        this._options  = createOptions(vnode.attrs)
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
        this._chart = new Highcharts.StockChart(vnode.dom, this._options)
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
 * An empty :class:`PlotTimeField` will always return `Date.now()`, i.e.:
 *
 * .. code-block:: javascript
 *
 *     new PlotTimeField().get(packet) === Date.now()
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
     * @returns the plot time for the current BLISS packet or Date.now().
     */
    get (packet) {
        let time = this.hasTime(packet) ? packet.__get__(this._fname) : null

        if (time instanceof Date) {
            time = time.getTime()
        }
        else if (typeof time !== 'number') {
            time = Date.now()
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
