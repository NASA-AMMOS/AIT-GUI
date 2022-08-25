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
import * as util from 'ait/util'

import range from 'lodash/range'
import times from 'lodash/times'



/**
 * DragDrop
 *
 * DragDrop manages the drag-and-drop state and behavior for a TabSet,
 * keeping track of the indicies of the `from` tab (i.e. the tab being
 * dragged) and the current tab which is being dragged `over`.
 */
const DragDrop =
{
    _from: -1,
    _over: -1,


    /**
     * Handle an HTML5 drop event for the tab at the given `index`.
     *
     * Calls `callback(from, to)`, where `from` is the index of the
     * tab that was dragged and `to` is the index of the drop target
     * tab.  In practical terms, callback is `TabSet.move(from, to)`.
     */
    drop (event, index, callback) {
        if (this._from !== -1) {
            event.preventDefault()
            callback(this._from, index)
        }
    },


    /**
     * Handle the HTML5 `dragend` event for the tab at the given index.
     */
    end (event, index) {
        this._from = -1
        this._over = -1
    },


    /**
     * @returns true if the tab at the given index is being dragged
     * over, false otherwise.
     */
    isOver (index) {
        return index === this._over
    },


    /**
     * Handle the HTML5 `dragover` event for the tab at the given index.
     */
    over (event, index) {
        event.preventDefault()
        this._over = index
    },


    /**
     * Return CSS classes for the tab at the given index that is being
     * dragged over.
     *
     * @pre  this.isOver(index) === true
     */
    overClass (index) {
        return 'drag-over-' + (this._from > index ? 'before' : 'after')
    },


    /**
     * Handle the HTML5 `dragstart` event for the tab at the given index.
     */
    start (event, index) {
        event.dataTransfer.effectAllowed = 'move'
        this._from = index
    }
}


/**
 * AIT TabSet
 *
 * AIT TabSet is a Mithril UI component for a **<ait-tabset>**,
 * which manages a set of children **<ait-tab>**'s.  Tabs have a title
 * attribute and their own child content.  When a TabSet is rendered
 * to the DOM via its **view()** method, it:
 *
 *     1.  Uses **<ait-tabset>** and **<ait-tab>** HTML5 custom tags
 *         for targeted CSS styling and customization, and
 *
 *     2.  Uses Bootstrap HTML structure and CSS classes
 *
 * A AIT TabSet is signficantly more succinct than Bootstrap tabs.
 * For example, compare creating a AIT TabSet directly in HTML::
 *
 *     <ait-tabset class="nav-tabs">
 *         <ait-tab title="Foo"> ... </ait-tab>
 *         <ait-tab title="Bar"> ... </ait-tab>
 *         <ait-tab title="Baz"> ... </ait-tab>
 *     </ait-tab>
 *
 * To the corresponding Bootstrap HTML and CSS::
 *
 *     <ul class="nav nav-tabs">
 *         <li> <a href="#">Foo</a> </li>
 *         <li> <a href="#">Bar</a> </li>
 *         <li> <a href="#">Baz</a> </li>
 *     </ul>
 *
 *     <div class="tab-content">
 *         <div class="tab-pane active"> ... </div>
 *     </div>
 *     <!-- Repeat for the contents of all three tabs -->
 *
 * Tabs may also be rendered as Bootstrap pills, stacked, justified,
 * etc. by adding the `appropriate CSS
 * classes <http://getbootstrap.com/components/#nav>`_ to a
 * <ait-tabset>.
 *
 * Tabs may be reordered programmatically via **TabSet.move(from, to)**
 * or by interactively via drag-and-drop.
 */
const TabSet =
{
    _active: 0,       // The index of the active tab
    _drag  : null,    // A DragDrop object, created in oninit()
    _pos   : [ ],     // Maps tab position to initial DOM order
    _uid   : [ ],     // Unique numeric ID for each tab (for Mithril keys)


    /**
     * Mithril `view()`-helper method
     *
     * Renders the `<a>` element of a Bootstrap tab.
     *
     * NOTE: The anchor element (`<a>`) of a tab is dragged, but it is
     * dragged `over` and `drop`ped on parent `<li>` elements.  This
     * is due primarily to the way Bootstrap tabs are styled and
     * needing to accommodate CSS animations to slide tabs left or
     * right to indicate where the dropped tab will be positioned.
     */
    anchor (vnode, index) {
        const attrs = {
            href       : '#',
            class      : '',
            html       : true,
            draggable  : this.isActive(index),
            ondragstart: (e) => this._drag.start(e, index),
            ondragend  : (e) => this._drag.end(e, index)
        }

        const tabName = vnode.attrs.title
        let tab = m('a', attrs, vnode.attrs.title)
        if (this.tabs && Object.keys(this.tabs[tabName]['___limit_error']).length > 0) {
            attrs['class'] += ' tab_title--out-of-limit--error'
            let num_limit = Object.keys(this.tabs[tabName]['___limit_error']).length.toString()
            tab = m('a', attrs, vnode.attrs.title, [
                    m('span', {
                            class: 'badge badge-light',
                            style: 'margin-left:0.25em;',
                            "data-toggle": "tooltip",
                            "data-placement": "bottom",
                            title: "Number of fields that are out of limit: " + num_limit
                        },
                        num_limit
                    )
                  ])
        } else if (this.tabs && Object.keys(this.tabs[tabName]['___limit_warning']).length > 0) {
            attrs['class'] += ' tab_title--out-of-limit--warning'
        }

        return tab
    },


    /**
     * Mithril `view()`-helper method
     *
     * Renders the content of the given tab using Bootstrap styling.
     *
     * NOTE: The passed-in `index` is is used to determine if the tab
     * is the active and to lookup the Mithril key for the element.
     */
    content (vnode, index) {
        const attrs   = { key: this._uid[index] }
        const classes = this.isActive(index) ? '.tab-pane.active' : '.tab-pane'

        return m(classes, attrs, vnode.children || vnode.text)
    },


    /**
     * @returns an array of only those Mithril `vnodes` that are
     * `<ait-tab>`s.
     *
     * This method is necessary because we cannot cache only child
     * `<ait-tab>` vnodes outside of a `view()` and every time the
     * `view(vnodes)` render method is called, the passed-in `vnodes`
     * will contain every child of a `<ait-tabset>` (i.e. whitespace
     * text fragments *and* `<ait-tab>`s) in the original DOM
     * (i.e. the HTML5 written by a user).
     */
    filterTabs (vnodes) {
        return vnodes.filter(c => c.tag === 'ait-tab')
    },


    /**
     * @returns true if the tab at the given `index` is active, false
     * otherwise.
     */
    isActive (index) {
        return index === this._active
    },


    /**
     * Moves the tab at index `from` to index `to`.
     */
    move (from, to) {
        if (from === to) return

        const ntabs  = this._pos.length
        let   active = times(ntabs, index => index === this._active)

        util.move(this._pos, from, to)
        util.move(this._uid, from, to)
        util.move(active   , from, to)

        this._active = active.findIndex(elem => elem)
    },


    /**
     * Mithril lifecycle method
     *
     * Initializes this TabSet.
     */
    oninit (vnode) {
        const tabs = this.filterTabs(vnode.children)
        this._pos  = range(tabs.length)
        this._uid  = range(tabs.length)
        this._drag = Object.create(DragDrop)
    },

    filterFields(children) {
        let fields = []

        if (! children) {return fields}

        for (let e of children) {
            if (e['instance'] && e['instance']['tag'] &&
                e['instance']['tag'] === 'ait-field') {
                fields.push(e['attrs']['packet'] + '_' + e['attrs']['name'])
            } else if (e.children && typeof(e.children) === 'object' &&
                       e.children.length > 0) {
                fields = fields.concat(this.filterFields(e.children))
            }
        }

        return fields
    },

    oncreate (vnode) {
        this.tabs = {}
        for (let t of this.filterTabs(vnode.children)) {

            let tabName = t['attrs']['title']
            this.tabs[tabName] = {
                '___limit_warning': {},
                '___limit_error': {},
            }

            for (let name of this.filterFields(t.children)) {
                this.tabs[tabName][name] = null
            }
        }

        ait.events.on('field:limitOut', (f) => {
            let field = f['field']
            let type = '___limit_' + f['type']
            let other_type = `___limit_${(f['type'] === 'warning'? 'error': 'warning')}`
            for (let t in this.tabs) {
                if (field in this.tabs[t]) {
                    this.tabs[t][type][field] = null
                    delete this.tabs[t][other_type][field]
                }
            }
        })

        ait.events.on('field:limitIn', (f) => {
            for (let t in this.tabs) {
                if (f in this.tabs[t]) {
                    delete this.tabs[t]['___limit_warning'][f]
                    delete this.tabs[t]['___limit_error'][f]
                }
            }
        })
    },


    /**
     * @returns an array of tabs, reordered according to the positions
     * in `this._pos`.  For example, the following `pos[]` array would
     * reverse the order of four tabs:
     *
     *   pos = [ 3, 2, 1, 0 ]
     *
     * By returning:
     *
     *     [ tabs[3], tabs[2], tabs[1], tabs[0] ]
     *
     * This method is necessary because we cannot cache child
     * `<ait-tab>` vnodes outside of a `view()` and every time the
     * `view(vnodes)` render method is called, the order of
     * `<ait-tab>`s will be the same as the original DOM (i.e. the
     * HTML5 written by a user).
     */
    reorder (tabs) {
        return this._pos.map(index => tabs[index])
    },


    /**
     * Mithril `view()`-helper method
     *
     * Renders the `<li>` element of a Bootstrap tab.
     *
     * NOTE: The anchor element (`<a>`) of a tab is dragged, but it is
     * dragged `over` and `drop`ped on parent `<li>` elements.  This
     * is due primarily to the way Bootstrap tabs are styled and
     * needing to accomodate CSS animations to slide tabs left or
     * right to indicate where the dropped tab will be positioned.
     */
    tab (vnode, index) {
        const move  = TabSet.move.bind(this)
        const attrs = {
            class     : this.tabClass(index),
            key       : this._uid[index],
            onclick   : ()  => { this._active = index; return false; },
            ondragover: (e) => this._drag.over(e, index),
            ondrop    : (e) => this._drag.drop(e, index, move)
        }

        return m('li', attrs, this.anchor(vnode, index))
    },


    /**
     * @returns the CSS class(es) for the tab at the given `index`.
     */
    tabClass (index) {
        let name = ''


        if (this.isActive(index)) {
            name = 'active'
        }
        else if (this._drag.isOver(index)) {
            name = this._drag.overClass(index)
        }

        return name
    },


    /**
     * Mithril `view()` method
     *
     * Renders this TabSet and its constituent tabs.
     */
    view (vnode) {
        const tabs = this.reorder( this.filterTabs(vnode.children) )

        return m('ait-tabset', [
            m('ul.nav', vnode.attrs, tabs.map( TabSet.tab.bind(this) )),
            m('.tab-content', tabs.map( TabSet.content.bind(this) ))
        ])
    }
}


export default TabSet
export { TabSet }
