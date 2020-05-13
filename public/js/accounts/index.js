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
                url: '/projects/' + PROJECT_ID + '/accounts?' + $('form').serialize(),
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
                        return '<span class="badge ' + data.accountType + '">' + data.accountType + '</span>';
                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        return '<span><span class="badge ' + data.status + '">' + data.status + '</span></span>';
                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        var href = '/projects/' + PROJECT_ID + '/accounts/' + data.accountType + '/' + data.accountNumber;
                        return '<span><a target="_blank" href="' + href + '">' + data.accountNumber + '</a></span>';

                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        return '<span>' + data.name + '</span>';

                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        return '<span>' + data.balance + '</span>';
                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        return '<span>' + data.availableBalance + '</span>';
                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        var html = '<span>' + moment(data.openDate).utc().format() + '</span>'

                        return html;
                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        var html = ''
                        if (data.closeDate !== undefined) {
                            html += '<span>' + moment(data.closeDate).utc().format() + '</span>'
                        }
                        html += '';

                        return html;
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