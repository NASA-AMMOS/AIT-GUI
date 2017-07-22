import m from 'mithril'
import Highcharts from 'highcharts/highstock';

// See https://github.com/highcharts/highcharts/issues/4994
window.Highcharts = Highcharts


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
                series.addPoint([x, y], true, series.data.length > 600)
            }
        })
    },


    /**
     * Process tag: `<bliss-plot-time packet="..." name="...">`.
     */
    processTagTime (vnode) {
        this._time = new PlotTimeField(vnode.attrs.packet, vnode.attrs.name)
    },


    // Mithril lifecycle method
    oninit (vnode) {
        this._options = {
            credits: {
                enabled: false
            },

            legend: {
                enabled: true
            },

            rangeSelector: {
                enabled: false
            },

            series: [ ],

            title: {
                text: vnode.attrs.title
            },

            xAxis: {
                title: { text: 'Time (UTC)' }
            },

            yAxis: {
                title: { text: vnode.attrs['y-title'] }
            }
        }
        this._packets = { }
        this._time    = null

        vnode.children.forEach( (child) => {
            if (child.tag === 'bliss-plot-time') {
                this.processTagTime(child)
            }
            else if (child.tag.startsWith('bliss-plot-')) {
                const name   = child.attrs.name
                const packet = child.attrs.packet
                const type   = child.tag.substr(11)
                const id     = packet + '.' + name

                this._options.series.push({
                    id:      id,
                    name:    child.attrs.caption || name,
                    color:   child.attrs.color,
                    data:    [ ],
                    tooltip: { valueDecimals: 2 },
                    type:    type,
                    showInNavigator: true
                })

                this._packets[packet] = this._packets[packet] || [ ]
                this._packets[packet].push(name)
            }
        })

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
