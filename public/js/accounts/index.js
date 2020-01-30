$(function () {
    var accountType = $('form input[name="accountType"]').val();
    if (accountType === '') {
        alert('口座タイプを指定してください');
    } else {

        $("#accounts-table").DataTable({
            processing: true,
            serverSide: true,
            pagingType: 'simple',
            language: {
                info: 'Showing page _PAGE_',
                infoFiltered: ''
            },
            ajax: {
                url: '/accounts?' + $('form').serialize(),
                data: function (d) {
                    d.limit = d.length;
                    d.page = (d.start / d.length) + 1;
                    // d.name = d.search.value;
                    d.format = 'datatable';
                }
            },
            searching: false,
            order: [[1, 'asc']], // デフォルトは枝番号昇順
            ordering: false,
            columns: [
                {
                    data: null,
                    render: function (data, type, row) {
                        return '<ul class="list-unstyled">'
                            + '<li><span class="badge badge-light">' + data.project.id + '</span></li>'
                            + '<li><span class="badge ' + data.accountType + '">' + data.accountType + '</span></li>'
                            + '<li><span class="badge ' + data.status + '">' + data.status + '</span></li>'
                            + '</ul>';
                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        return '<ul class="list-unstyled">'
                            + '<li><a target="_blank" href="/accounts/' + data.accountType + '/' + data.accountNumber + '">' + data.accountNumber + '</a></li>'
                            + '<li>' + data.name + '</li>'
                            + '</ul>';

                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        return '<ul class="list-unstyled">'
                            + '<li>' + data.balance + '</li>'
                            + '<li>' + data.availableBalance + '</li>'
                            + '</ul>';
                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        var html = '<ul class="list-unstyled">'
                            + '<li>' + data.openDate + '</li>';
                        if (data.closeDate !== undefined) {
                            html += '<li>' + data.closeDate + '</li>'
                        }
                        html += '</ul>';

                        return html;
                    }
                }
            ]
        });
    }

    //Date range picker
    $('#orderDateRange').daterangepicker({
        timePicker: false,
        // timePickerIncrement: 30,
        format: 'YYYY-MM-DDT00:00:00Z'
    })
});