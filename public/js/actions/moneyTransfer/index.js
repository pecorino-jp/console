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
            lengthChange: false,
            searching: false,
            order: [[1, 'asc']], // デフォルトは枝番号昇順
            ordering: false,
            columns: [
                {
                    data: null,
                    render: function (data, type, row) {
                        return '<a href="#">' + data.id + '</a>';
                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        return '<span>' + data.startDate + '</span>';
                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        return '<span>' + data.endDate + '</span>';
                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        return '<span class="badge badge-secondary ' + data.actionStatus + '">' + data.actionStatus + '</span>';
                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        var fromLocation = data.fromLocation;
                        var html = '<span>' + '<span class="badge badge-secondary ' + fromLocation.typeOf + '">' + fromLocation.typeOf + '</span></span>';

                        return html;
                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        var fromLocation = data.fromLocation;
                        var html = '';

                        if (fromLocation.accountType !== undefined) {
                            var href = '/projects/' + PROJECT_ID + '/accounts/' + fromLocation.accountType + '/' + fromLocation.accountNumber
                            html += ' <span class="badge badge-secondary ' + fromLocation.accountType + '">' + fromLocation.accountType + '</span>'
                                + '<br><span><a target="_blank" href="' + href + '">' + fromLocation.accountNumber + '</a></span>';
                        }

                        return html;
                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        var fromLocation = data.fromLocation;
                        var html = '';

                        html += '<span>' + fromLocation.name + '</span>';

                        return html;
                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        var toLocation = data.toLocation;
                        var html = '<span class="badge badge-secondary ' + toLocation.typeOf + '">' + toLocation.typeOf + '</span>';

                        return html;
                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        var toLocation = data.toLocation;
                        var html = '';

                        if (toLocation.accountType !== undefined) {
                            var href = '/projects/' + PROJECT_ID + '/accounts/' + toLocation.accountType + '/' + toLocation.accountNumber
                            html += ' <span class="badge badge-secondary ' + toLocation.accountType + '">' + toLocation.accountType + '</span>'
                                + '<br><span><a target="_blank" href="' + href + '">' + toLocation.accountNumber + '</a></span>';
                        }

                        return html;
                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        var toLocation = data.toLocation;
                        var html = '';

                        html += '<span>' + toLocation.name + '</span>';

                        return html;
                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        return '<span>' + data.amount + '</span>';
                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        var description = String(data.description);
                        if (description.length > 10) {
                            description = String(data.description).slice(0, 10) + '...';
                        }
                        var html = '<span>' + description + '</span>';

                        return html;
                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        return '<span class="badge badge-secondary ' + data.purpose.typeOf + '">' + data.purpose.typeOf + '</span>'
                            + '<br><a href="#">' + data.purpose.id + '</a>';
                    }
                }
            ]
        });
    }

    $(document).on('click', '.btn.search', function () {
        $('form').submit();
    });

    //Date range picker
    $('#orderDateRange').daterangepicker({
        timePicker: false,
        // timePickerIncrement: 30,
        format: 'YYYY-MM-DDT00:00:00Z'
    })
});