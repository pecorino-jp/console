var table;

$(function () {
    var accountType = $('form input[name="accountType"]').val();
    if (accountType === '') {
        alert('口座タイプを指定してください');
    } else {
        table = $("#actions-table").DataTable({
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
                        return '<span>' + moment(data.startDate).utc().format() + '</span>';
                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        var html = '';
                        if (typeof data.endDate === 'string') {
                            html += '<span>' + moment(data.endDate).utc().format() + '</span>';
                        }

                        return html;
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
                        var html = '<span>' + '<span class="badge badge-light ' + fromLocation.typeOf + '">' + fromLocation.typeOf + '</span></span>';

                        if (fromLocation.accountType !== undefined) {
                            var href = '/projects/' + PROJECT_ID + '/accounts/' + fromLocation.accountType + '/' + fromLocation.accountNumber
                            html += ' <span class="badge badge-light ' + fromLocation.accountType + '">' + fromLocation.accountType + '</span>'
                                + ' <span><a target="_blank" href="' + href + '">' + fromLocation.accountNumber + '</a></span>';
                        }

                        if (fromLocation !== undefined && fromLocation !== null) {
                            var name = fromLocation.name;
                            if (typeof name === 'string' && name.length > 10) {
                                name = name.slice(0, 10) + '...';
                            }

                            html += '<br><a href="#" data-toggle="tooltip" title="' + fromLocation.name + '"><span>' + name + '</span></a>';
                        }

                        return html;
                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        var toLocation = data.toLocation;
                        var html = '<span class="badge badge-light ' + toLocation.typeOf + '">' + toLocation.typeOf + '</span>';

                        if (toLocation.accountType !== undefined) {
                            var href = '/projects/' + PROJECT_ID + '/accounts/' + toLocation.accountType + '/' + toLocation.accountNumber
                            html += ' <span class="badge badge-light ' + toLocation.accountType + '">' + toLocation.accountType + '</span>'
                                + ' <span><a target="_blank" href="' + href + '">' + toLocation.accountNumber + '</a></span>';
                        }

                        if (toLocation !== undefined && toLocation !== null) {
                            var name = toLocation.name;
                            if (typeof name === 'string' && name.length > 10) {
                                name = name.slice(0, 10) + '...';
                            }

                            html += '<br><a href="#" data-toggle="tooltip" title="' + toLocation.name + '"><span>' + name + '</span></a>';
                        }

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
                        var html = '';
                        var description = data.description;

                        if (typeof description === 'string' && description.length > 10) {
                            description = description.slice(0, 10) + '...';
                        }

                        html += '<a href="#" data-toggle="tooltip" title="' + data.description + '"><span>' + description + '</span></a>';

                        return html;
                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        return '<a href="#" class="showPurpose" data-id="' + data.id + '"><span class="badge badge-light ' + data.purpose.typeOf + '">' + data.purpose.typeOf + '</span></a>';
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
    });

    $(document).on('click', '.showPurpose', function (event) {
        var id = $(this).attr('data-id');

        showPurpose(id);
    });
});

function showPurpose(id) {
    var actions = table
        .rows()
        .data()
        .toArray();
    var action = actions.find(function (a) {
        return a.id === id
    })
    if (action === undefined) {
        alert('アクション' + id + 'が見つかりません');

        return;
    }

    var modal = $('#modal-action');
    var title = '取引';

    var purpose = action.purpose;
    var body = $('<dl>').addClass('row');
    if (purpose !== undefined && purpose !== null) {
        body.append($('<dt>').addClass('col-md-3').append($('<span>').text('タイプ')))
            .append($('<dd>').addClass('col-md-9').append(purpose.typeOf))
            .append($('<dt>').addClass('col-md-3').append($('<span>').text('ID')))
            .append($('<dd>').addClass('col-md-9').append(purpose.id))
            .append($('<dt>').addClass('col-md-3').append($('<span>').text('取引番号')))
            .append($('<dd>').addClass('col-md-9').append(purpose.transactionNumber));
    }

    modal.find('.modal-title').html(title);
    modal.find('.modal-body').html(body);
    modal.modal();
}
