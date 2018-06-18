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

import defaults from 'lodash/defaults'

/**
 * An event toggle-able Modal Component
 *
 * A customizable Modal component that is toggled and configured
 * via events. The Modal component will smoothly handle multiple
 * simultaneous modal requests by queueing additional 'show' calls
 * behind the currently displayed modal.
 *
 * **Events:**
 *
 * modal:show
 *   Display a modal to the user. Modal configuration should be included
 *   in the body of the event.
 *
 * modal:hide
 *   Stop displaying the current active modal.
 *
 * Modal configuration is passed via the 'modal:show' event body. The following
 * values are valid configuration values.
 *
 *   header
 *      Contains the content to be displayed as the modal's title.
 *
 *   body
 *      Contains the content to display as the modal's body
 *
 *   footer
 *      Contains the content to display as the modal's footer
 *
 *   insertHeaderCloseBtn
 *      Toggles whether a close button should be inserted
 *      into the modal header for the caller. Defaults to true.
 *
 *   insertFooterCloseBtn
 *      Toggles whether a close button should be inserted
 *      into the modal footer for the caller. Defaults to true.
 *
 *   displayBackground
 *      Toggles whether the modal background should be inserted
 *      when rendering the modal. Defaults to true.
 *
 * .. note::
 *
 *    The Modal component is automatically injected into the UI by default.
 *    If you wish to use the Modal functionality you can do so without
 *    adding anything to your UI.
 */
const Modal = {
    _display_modal: false,
    _modals: [],

    _reset_modal() {
        this._modals.shift()

        if (this._modals.length === 0) {
            this._display_modal = false
        }
    },

    oncreate(vnode) {
        ait.events.on('modal:show', (data) => {
            this._display_modal = true
            defaults(data, {
                displayBackground: true,
                insertHeaderCloseBtn: true,
                insertFooterCloseBtn: true
            })
            this._modals.push(data)
            m.redraw()
        })

        ait.events.on('modal:close', () => {
            this._reset_modal()
            m.redraw()
        })
    },

    view(vnode) {
        if (! this._display_modal) {return m('ait-modal')}

        let header = m('h4', {class: 'modal-title'})
        let body = m('span')
        let footer = m('span')

        if (this._modals.length !== 0) {
            if ('header' in this._modals[0]) {
                header = m('h4', {class: 'modal-title'}, this._modals[0].header)
            }

            if (this._modals[0].insertHeaderCloseBtn) {
                header = [
                    m('button', {
                        type: 'button',
                        class: 'close',
                        'data-dimiss': modal,
                        onclick: () => {
                            this._reset_modal()
                        }
                    }, m('span', "\u00D7")),
                    header
                ]
            }

            if ('body' in this._modals[0]) {
                body = this._modals[0].body
            }

            if ('footer' in this._modals[0]){
                footer = this._modals[0].footer
            }

            if (this._modals[0].insertFooterCloseBtn) {
                footer = [
                    footer,
                    m('div', {
                        type: 'button',
                        class: 'btn btn-default',
                        'data-dismiss': 'modal',
                        onclick: () => {
                            this._reset_modal()
                        }
                    }, 'Close')
                ]
            }
        }

        let modal = m('div', {class: 'modal show', tabindex: '-1', role: 'dialog'},
            m('div', {class: 'modal-dialog', 'role': 'document'},
                m('div', {class: 'modal-content'}, [
                    m('div', {class: 'modal-header'}, header),
                    m('div', {class: 'modal-body'}, body),
                    m('div', {class: 'modal-footer'}, footer)
                ])
            )
        )

        if (this._modals[0].displayBackground) {
            modal = [
                modal,
                m('div', {class: 'modal-backdrop fade in'})
            ]
        }

        return m('ait-modal', modal)
    }
}

export default {Modal}
export {Modal}
