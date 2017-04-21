import map from 'lodash/map'

const Sequence = {
    sequences: [],

    refreshSequenceList() {
        m.request('/seq').then((data) => {
            this.sequences = map(data, (value) => {return m('option', {value: value}, value)})
        })
    },

    handleFormSubmit() {
        let url  = $('#form-seq').attr('action');
        let $btn = $('#form-seq button');
        let data = new FormData()
        data.append('seqfile', $('#seqfile').val())

        $btn.prop('disabled', true);

        m.request({method: 'POST', url: url, data: data}).
            then(() => {
                $btn.prop('disabled', false)
            }).
            catch((e) => {
                $btn.prop('disabled', false)
                console.log(e.message)
            })
        return false
    },

    oninit(vnode) {
        this.refreshSequenceList()
    },

    view(vnode) {
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
                       m('button',
                         {
                             id: 'send-seq-btn',
                             type: 'submit',
                             class: 'btn btn-success'
                         },
                         'Send'))
                ])
    },
}

export default {Sequence}
export {Sequence}
