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
        var datas = moneyTransferActions.reduce(
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
        '/accounts/' + account.accountType + '/' + account.accountNumber + '/actions/moneyTransfer',
        { limit: limit, page: page }
    ).done(function (data) {
        $('#numTransactions').html(data.totalCount.toString());
        searchedAllMoneyTransferActions = (data.data.length < limit);
        $.each(data.data, function (_, action) {
            moneyTransferActions.push(action);
            var html =
                '<td>'
                + '<span class="badge badge-secondary ' + action.typeOf + '">'
                + action.typeOf
                + '</span>'
                + '<br>'
                + '<a href="#">' + action.id + '</a>' + '<br>'
                + action.startDate + '<br>'
                + action.endDate + '<br>'
                + '<span class="badge badge-secondary ' + action.actionStatus + '">'
                + action.actionStatus
                + '</span>'
                + '</td>'
                + '<td>'
                + '<span class="badge badge-secondary ' + action.fromLocation.typeOf + '">'
                + action.fromLocation.typeOf
                + '</span>';
            if (action.fromLocation.accountType !== undefined) {
                html += '<br>'
                    + '<span class="badge badge-secondary ' + action.fromLocation.accountType + '">'
                    + action.fromLocation.accountType
                    + '</span>'
                    + '<span>'
                    + ' <a target="_blank" href="/accounts/' + action.fromLocation.accountType + '/' + action.fromLocation.accountNumber + '">'
                    + action.fromLocation.accountNumber
                    + '</a>'
                    + '</span>';
            }
            html += '<br>'
                + '<span>'
                + action.fromLocation.name
                + '</span>'
                + '</td>'
                + '<td>'
                + '<span class="badge badge-secondary ' + action.toLocation.typeOf + '">'
                + action.toLocation.typeOf
                + '</span>';

            if (action.toLocation.accountType !== undefined) {
                html += '<br>'
                    + '<span class="badge badge-secondary ' + action.toLocation.accountType + '">'
                    + action.toLocation.accountType
                    + '</span>'
                    + '<span>'
                    + ' <a target="_blank" href="/accounts/' + action.toLocation.accountType + '/' + action.toLocation.accountNumber + '">'
                    + action.toLocation.accountNumber
                    + '</a>'
                    + '</span>';
            }
            html += '<br>'
                + '<span>'
                + action.toLocation.name
                + '</span>'
                + '</td>'
                + '<td>'
                + action.amount + '<br>'
                + action.description
                + '</td>'
                + '<td>'
                + '<span class="badge badge-secondary ' + action.purpose.typeOf + '">'
                + action.purpose.typeOf
                + '</span>'
                + '<br>'
                + '<a href="#">' + action.purpose.id + '</a>'
                + '</td>';

            $('<tr>').html(html).appendTo("#moneyTransferActions tbody");
        });
        if (!searchedAllMoneyTransferActions) {
            searchMoneyTransferActions(cb);
        } else {
            cb();
        }
    }).fail(function () {
        console.error('取引履歴を取得できませんでした')
    });
}
function createBalanceChart(datas) {
    console.log('creating chart...datas:', datas.length);
    balanceChart = new Morris.Line({
        element: 'balanceChart',
        resize: true,
        data: datas.map(function (data) {
            return { y: data.x, balance: data.y }
        }),
        xkey: 'y',
        ykeys: ['balance'],
        labels: ['残高遷移'],
        lineColors: ['#efefef'],
        lineWidth: 2,
        hideHover: 'auto',
        gridTextColor: '#fff',
        gridStrokeWidth: 0.4,
        pointSize: 2,
        pointStrokeColors: ['#efefef'],
        gridLineColor: '#efefef',
        gridTextFamily: 'Open Sans',
        gridTextSize: 10,
        smooth: false
    });
}
