$(function () {
    var accountType = $('form input[name="accountType"]').val();
    if (accountType === '') {
        alert('口座タイプを指定してください');
    } else {
        $("#actions-table").DataTable({
            processing: true,
            serverSide: true,
            pagingType: 'simple',
            language: {
                info: 'Showing page _PAGE_',
                infoFiltered: ''
            },
            ajax: {
                url: '/projects/' + PROJECT_ID + '/actions/moneyTransfer?' + $('form').serialize(),
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
                            + '<li>' + '<span class="badge badge-secondary ' + data.typeOf + '">' + data.typeOf + '</span></li>'
                            + '<li>' + '<a href="#">' + data.id + '</a>' + '</li>'
                            + '<li>' + data.startDate + '</li>'
                            + '<li>' + data.endDate + '</li>'
                            + '<li>' + '<span class="badge badge-secondary ' + data.actionStatus + '">' + data.actionStatus + '</span>' + '</li>'
                            + '</ul>';
                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        var fromLocation = data.fromLocation;
                        var html = '<ul class="list-unstyled">'
                            + '<li>' + '<span class="badge badge-secondary ' + fromLocation.typeOf + '">' + fromLocation.typeOf + '</span></li>';

                        if (fromLocation.accountType !== undefined) {
                            html += '<li>'
                                + '<span class="badge badge-secondary ' + fromLocation.accountType + '">' + fromLocation.accountType + '</span>'
                                + ' <span><a target="_blank" href="/accounts/' + fromLocation.accountType + '/' + fromLocation.accountNumber + '">' + fromLocation.accountNumber + '</a></span>'
                                + '</li>';
                        }

                        html += '<li><span>' + fromLocation.name + '</span></li>'
                            + '</ul>';

                        return html;
                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        var toLocation = data.toLocation;
                        var html = '<ul class="list-unstyled">'
                            + '<li>' + '<span class="badge badge-secondary ' + toLocation.typeOf + '">' + toLocation.typeOf + '</span></li>';

                        if (toLocation.accountType !== undefined) {
                            html += '<li>'
                                + '<span class="badge badge-secondary ' + toLocation.accountType + '">' + toLocation.accountType + '</span>'
                                + ' <span><a target="_blank" href="/accounts/' + toLocation.accountType + '/' + toLocation.accountNumber + '">' + toLocation.accountNumber + '</a></span>'
                                + '</li>';
                        }

                        html += '<li><span>' + toLocation.name + '</span></li>'
                            + '</ul>';

                        return html;
                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        return '<ul class="list-unstyled">'
                            + '<li>' + data.amount + '</li>'
                            + '<li>' + data.description + '</li>'
                            + '</ul>';
                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        return '<ul class="list-unstyled">'
                            + '<li><span class="badge badge-secondary ' + data.purpose.typeOf + '">' + data.purpose.typeOf + '</span></li>'
                            + '<li><a href="#">' + data.purpose.id + '</a></li>'
                            + '</ul>';
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