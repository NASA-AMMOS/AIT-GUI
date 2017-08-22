import map from 'lodash/map'

const Sequence = {
    _disableControls: false,
    sequences: [],

    refreshSequenceList() {
        m.request('/seq').then((data) => {
            this.sequences = map(data, (value) => {return m('option', {value: value}, value)})
        })
    },

    handleFormSubmit() {
        let url = document.getElementById("form-seq").getAttribute('action')
        let $btn = document.getElementById('send-seq-btn')
        let data = new FormData()
        data.append('seqfile', document.getElementById('seqfile').value)

        $btn.setAttribute("disabled", "disabled")

        m.request({method: 'POST', url: url, data: data})
        return false
    },

    oninit(vnode) {
        this.refreshSequenceList()

        bliss.events.on('seq:exec', () => {
            this._disableControls = true
        })

        bliss.events.on('seq:done', () => {
            submitBtn.removeAttribute("disabled")
            this._disableControls = false
        })

        bliss.events.on('seq:err', () => {
            this._disableControls = false
        })
    },

    view(vnode) {
        let submitBtnAttrs = {
            id: 'send-seq-btn',
            type: 'submit',
            class: 'btn btn-success'
        }

        if (self._disableControls) {
            submitBtnAttrs['disabled'] = 'disabled'
        }

        return m('form',
                 {
                     class: 'form-horizontal',
                     id: 'form-seq',
                     role: 'form',
                     method: 'POST',
                     action: '/seq',
                     onsubmit: () => {return this.handleFormSubmit()}
                 }, [
                     m('div', {class: 'form-group'}, [
                         m('label', {style: 'width: 50%'}, 'Send Sequence'),
                         m('div', {style: 'width: 50%; float: right; text-align: right'},
                           m('button',
                             {
                                 type: 'button',
                                 class: 'btn btn-default seq-refresh-btn',
                                 style: 'line-height: 75%; font-size:75%',
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
                               id: 'seqfile'
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
