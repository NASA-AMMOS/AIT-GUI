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
                const x = Date.now()
                const y = packet.__get__(name)
                series.addPoint([x, y], true, series.data.length > 600)
            }
        })
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

        vnode.children.forEach( (child) => {
            if (child.tag.startsWith('bliss-plot-')) {
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


export default Plot
export { Plot }
