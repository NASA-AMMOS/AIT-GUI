import map from 'lodash/map'

const Sequence = {
    _disableControls: false,
    sequences: [],

    refreshSequenceList() {
        m.request(this._action).then((data) => {
            this.sequences = map(data, (value) => {return m('option', {value: value}, value)})
        })
    },

    handleFormSubmit(event) {
        event.preventDefault()
        let data = new FormData()
        data.append('seqfile', event.currentTarget.querySelector('select').value)

        this._disableControls = true
        m.request({method: 'POST', url: this._action, data: data})
        return false
    },

    oninit(vnode) {
        this._action = vnode.attrs.action || '/seq'
        this.refreshSequenceList()

        bliss.events.on('seq:exec', () => {
            this._disableControls = true
            m.redraw()
        })

        bliss.events.on('seq:done', () => {
            this._disableControls = false
            m.redraw()
        })

        bliss.events.on('seq:err', () => {
            this._disableControls = false
            m.redraw()
        })
    },

    view(vnode) {
        let submitBtnAttrs = {
            type: 'submit',
            class: 'btn btn-success'
        }

        if (this._disableControls) {
            submitBtnAttrs['disabled'] = 'disabled'
        }

        return m('form',
                 {
                     class: 'form-horizontal',
                     role: 'form',
                     method: 'POST',
                     onsubmit: (e) => {this.handleFormSubmit(e)}
                 }, [
                     m('div', {class: 'form-group'}, [
                         m('label', 'Send Sequence'),
                         m('div', {class: 'bliss-sequence__controls'},
                           m('button',
                             {
                                 type: 'button',
                                 class: 'btn btn-default bliss-sequence__refresh',
                                 onclick: () => {this.refreshSequenceList()}
                             }, [
                                 m('span', {class: 'glyphicon glyphicon-refresh'}),
                                 'Refresh'
                             ]
                           )
                         ),
                         m('select',
                           {
                               class: 'form-control',
                               multiple: 'true',
                           },
                           this.sequences)
                     ]),
                     m('div', {class: 'form-group'},
                       m('button', submitBtnAttrs, 'Send'))
                ])
    },
}

export default {Sequence}
export {Sequence}
