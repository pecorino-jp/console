var account = JSON.parse($('#jsonViewer textarea').val());
var moneyTransferActions = [];
var searchedAllMoneyTransferActions = false;
var limit = 100;
var page = 0;
var balanceChart;

$(function () {
    console.log('searching moneyTransferActions...', page);
    searchMoneyTransferActions(function () {
        console.log('creating line chart...');
        var balance = account.balance;
        var datas = moneyTransferActions
            .filter(function (action) {
                return action.actionStatus === 'CompletedActionStatus';
            })
            .reduce(
                (a, b) => {
                    a.push({
                        x: moment(b.endDate).toISOString(),
                        y: balance,
                    });
                    if (b.fromLocation.accountNumber === account.accountNumber) {
                        balance += b.amount;
                    } else {
                        balance -= b.amount;
                    }

                    return a;
                },
                [
                ],
            );
        createBalanceChart(datas);
    });

    // $("#actions-table").DataTable();
    // $('#actions-table').DataTable({
    //     "paging": true,
    //     "lengthChange": true,
    //     "searching": true,
    //     "order": [[2, 'desc']], // デフォルトは完了日時降順
    //     "ordering": true,
    //     "info": true,
    //     "autoWidth": true
    // });
});
function searchMoneyTransferActions(cb) {
    page += 1;
    $.getJSON(
        '/projects/' + PROJECT_ID + '/accounts/' + account.accountType + '/' + account.accountNumber + '/actions/moneyTransfer',
        { limit: limit, page: page }
    ).done(function (data) {
        searchedAllMoneyTransferActions = true;
        // searchedAllMoneyTransferActions = (data.data.length < limit);
        $.each(data.data, function (_, action) {
            moneyTransferActions.push(action);
            var html = '';

            html += '<td>'
                + moment(action.startDate).utc().format()
                + '</td>';
            if (typeof action.endDate === 'string') {
                html += '<td>'
                    + moment(action.endDate).utc().format()
                    + '</td>';
            } else {
                html += '<td></td>';
            }
            html += '<td>'
                + '<span class="badge badge-light ' + action.actionStatus + '">'
                + action.actionStatus
                + '</span>'
                + '</td>'
                + '<td>'
                + '<span class="badge badge-light ' + action.fromLocation.typeOf + '">'
                + action.fromLocation.typeOf
                + '</span>';
            if (action.fromLocation.accountType !== undefined) {
                html += ' <span class="badge badge-light ' + action.fromLocation.accountType + '">'
                    + action.fromLocation.accountType
                    + '</span>'
                    + '<span>'
                    + ' <a target="_blank" href="/projects/' + PROJECT_ID + '/accounts/' + action.fromLocation.accountType + '/' + action.fromLocation.accountNumber + '">'
                    + action.fromLocation.accountNumber
                    + '</a>'
                    + '</span>';
            }
            html += '</td>'
                + '<td>'
                + '<span class="badge badge-light ' + action.toLocation.typeOf + '">'
                + action.toLocation.typeOf
                + '</span>';

            if (action.toLocation.accountType !== undefined) {
                html += ' <span class="badge badge-light ' + action.toLocation.accountType + '">'
                    + action.toLocation.accountType
                    + '</span>'
                    + '<span>'
                    + ' <a target="_blank" href="/projects/' + PROJECT_ID + '/accounts/' + action.toLocation.accountType + '/' + action.toLocation.accountNumber + '">'
                    + action.toLocation.accountNumber
                    + '</a>'
                    + '</span>';
            }
            html += '</td>'
                + '<td>'
                + action.amount
                + '</td>';

            var description = action.description;
            if (typeof description === 'string' && description.length > 10) {
                description = description.slice(0, 10) + '...';
            }
            html += '<td><a href="#" data-toggle="tooltip" title="' + action.description + '">' + description + '</a></td>';

            html += '<td>'
                + '<a href="#" class="showPurpose" data-id="' + action.id + '"><span class="badge badge-light ' + action.purpose.typeOf + '">' + action.purpose.typeOf + '</span></a>'
                + '</td>';

            $('<tr>').html(html).appendTo("#moneyTransferActions tbody");
        });
        if (!searchedAllMoneyTransferActions) {
            searchMoneyTransferActions(cb);
        } else {
            $('#numTransactions').html(moneyTransferActions.length.toString());
            cb();
        }
    }).fail(function () {
        console.error('取引履歴を取得できませんでした')
    });

    $(document).on('click', '.showPurpose', function (event) {
        var id = $(this).attr('data-id');

        showPurpose(id);
    });
}

function showPurpose(id) {
    var action = moneyTransferActions.find(function (a) {
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

function createBalanceChart(datas) {
    console.log('creating chart...datas:', datas.length);

    balanceChart = new Chart($('#balanceChart').get(0).getContext('2d'), {
        type: 'line',
        data: {
            // labels: ['2011 Q1', '2011 Q2', '2011 Q3', '2011 Q4', '2012 Q1', '2012 Q2', '2012 Q3', '2012 Q4', '2013 Q1', '2013 Q2'],
            datasets: [
                {
                    label: status,
                    fill: false,
                    borderWidth: 2,
                    lineTension: 0,
                    spanGaps: true,
                    borderColor: '#efefef',
                    pointRadius: 2,
                    pointHoverRadius: 7,
                    pointColor: '#efefef',
                    pointBackgroundColor: '#efefef',
                    data: datas
                        .map(function (data) {
                            return { x: moment(data.x).toDate(), y: data.y }
                        }),
                }
            ]
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            legend: {
                display: false,
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'day'
                        // displayFormats: {
                        //     quarter: 'MMM YYYY'
                        // }
                    },
                    ticks: {
                        fontColor: '#fff',
                        fontFamily: 'Open Sans',
                        fontSize: 10
                    },
                    gridLines: {
                        display: false
                    }
                }],
                yAxes: [{
                    ticks: {
                        min: 0,
                        // stepSize: 5000,
                        fontColor: '#fff',
                        fontFamily: 'Open Sans',
                        fontSize: 10
                    },
                    gridLines: {
                        display: true,
                        // color: '#555c62',
                        // color: '#efefef',
                        lineWidth: 1,
                        drawBorder: false,
                    }
                }]
            }
        }
    });

    // balanceChart = new Morris.Line({
    //     element: 'balanceChart',
    //     resize: true,
    //     data: datas.map(function (data) {
    //         return { y: data.x, balance: data.y }
    //     }),
    //     xkey: 'y',
    //     ykeys: ['balance'],
    //     labels: ['残高遷移'],
    //     lineColors: ['#efefef'],
    //     lineWidth: 2,
    //     hideHover: 'auto',
    //     gridTextColor: '#fff',
    //     gridStrokeWidth: 0.4,
    //     pointSize: 2,
    //     pointStrokeColors: ['#efefef'],
    //     gridLineColor: '#efefef',
    //     gridTextFamily: 'Open Sans',
    //     gridTextSize: 10,
    //     smooth: false
    // });
}
