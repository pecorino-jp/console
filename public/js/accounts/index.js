$(function () {
    $("#accounts-table").DataTable({
        processing: true,
        serverSide: true,
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
                        + '<li>'
                        + '<span class="badge ' + data.accountType + '">' + data.accountType + '</span>'
                        + ' <a target="_blank" href="/accounts/' + data.accountType + '/' + data.accountNumber + '">' + data.accountNumber + '</a>'
                        + '</li>'
                        + '<span class="badge ' + data.status + '">' + data.status + '</span>'
                        + '</ul>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return '<ul class="list-unstyled">'
                        + '<li>' + data.name + '</li>'
                        + '</ul>';

                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return '<ul class="list-unstyled">'
                        + '<li>' + data.balance + '</li>'
                        + '</ul>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return '<ul class="list-unstyled">'
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

    //Date range picker
    $('#orderDateRange').daterangepicker({
        timePicker: false,
        // timePickerIncrement: 30,
        format: 'YYYY-MM-DDT00:00:00Z'
    })
});