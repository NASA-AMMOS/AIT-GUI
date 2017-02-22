import m from 'mithril'
import * as util from 'bliss/util'


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
 * BLISS TabSet
 *
 * BLISS TabSet is a Mithril UI component for a `<bliss-tabset>`,
 * which manages a set of children `<bliss-tab>`s.  Tabs have a title
 * attribute and their own child content.  When a TabSet is rendered
 * to the DOM via its `view()` method, it:
 *
 *     1.  Uses `<bliss-tabset>` and `<bliss-tab>` HTML5 custom tags
 *         for targeted CSS styling and customization, and
 *
 *     2.  Uses Bootstrap HTML structure and CSS classes
 *
 * A BLISS TabSet is signficantly more succinct than Bootstrap tabs.
 * For example, compare creating a BLISS TabSet directly in HTML:
 *
 *     <bliss-tabset class="nav-tabs">
 *         <bliss-tab title="Foo"> ... </bliss-tab>
 *         <bliss-tab title="Bar"> ... </bliss-tab>
 *         <bliss-tab title="Baz"> ... </bliss-tab>
 *     </bliss-tab>
 *
 * To the corresponding Bootstrap HTML and CSS:
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
 * Plus a BLISS TabSet only renders the contents of the active tab.
 *
 * Tabs may also be rendered as Bootstrap pills, stacked, justified,
 * etc. by adding the [appropriate CSS
 * classes](http://getbootstrap.com/components/#nav) to a
 * <bliss-tabset>.
 *
 * Tabs may be reordered programmatically via `TabSet.move(from, to)`
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
            draggable  : this.isActive(index),
            ondragstart: (e) => this._drag.start(e, index),
            ondragend  : (e) => this._drag.end(e, index)
        }

        return m('a', attrs, vnode.attrs.title)
    },


    /**
     * Mithril `view()`-helper method
     *
     * Renders the content of the currently active tab using Bootstrap
     * styling.  The passed-in `vnode` is the active `<bliss-tab>`.
     */
    content (vnode) {
        return m('bliss-tab', vnode.attrs,
                 m('.tab-content',
                   m('.tab-pane.active', vnode.children || vnode.text)))
    },


    /**
     * @returns an array of only those Mithril `vnodes` that are
     * `<bliss-tab>`s.
     *
     * This method is necessary because we cannot cache only child
     * `<bliss-tab>` vnodes outside of a `view()` and every time the
     * `view(vnodes)` render method is called, the passed-in `vnodes`
     * will contain every child of a `<bliss-tabset>` (i.e. whitespace
     * text fragments *and* `<bliss-tab>`s) in the original DOM
     * (i.e. the HTML5 written by a user).
     */
    filterTabs (vnodes) {
        return vnodes.filter(c => c.tag === 'bliss-tab')
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
        let   active = _.times(ntabs, index => index === this._active)

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
        this._pos  = _.range(tabs.length)
        this._uid  = _.range(tabs.length)
        this._drag = Object.create(DragDrop)
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
     * `<bliss-tab>` vnodes outside of a `view()` and every time the
     * `view(vnodes)` render method is called, the order of
     * `<bliss-tab>`s will be the same as the original DOM (i.e. the
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
            onclick   : ()  => this._active = index,
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

        return m('bliss-tabset', [
            m('ul.nav', vnode.attrs, tabs.map( TabSet.tab.bind(this) )),
            this.content( tabs[ this._active ] )
        ])
    }
}


export default TabSet
export { TabSet }
