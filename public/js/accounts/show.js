var account = JSON.parse($('#jsonViewer textarea').val());
var moneyTransferActions = [];
var searchedAllMoneyTransferActions = false;
var limit = 100;
var page = 0;

$(function () {
    console.log('searching moneyTransferActions...', page);
    searchMoneyTransferActions(function () {
        console.log('creating line chart...');
        // var datas = orders.reduce(
        //     (a, b) => {
        //         numberOfSeats -= b.acceptedOffers.length;
        //         // 予約開始からの時間
        //         // const diff = moment(b.orderDate).diff(moment(reservationStartDate), 'hours', true);
        //         a.push({
        //             x: moment(b.orderDate).toISOString(),
        //             y: numberOfSeats,
        //         });

        //         return a;
        //     },
        //     [
        //         { x: moment(reservationStartDate).toISOString(), y: numberOfSeats },
        //         { x: moment(event.endDate).toISOString(), y: null }
        //     ],
        // );
        // createBalanceChart(datas);
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
                + action.typeOf + '<br>'
                + '<a href="#">' + action.id + '</a>'
                + action.endDate + '<br>'
                + '<span class="badge ' + action.actionStatus + '">'
                + action.actionStatus
                + '</span>'
                + '</td>'
                + '<td>'
                + '<span class="badge ' + action.purpose.typeOf + '">'
                + action.purpose.typeOf
                + '</span>'
                + '<br>'
                + '<a href="#">' + action.purpose.id + '</a>'
                + '</td>'
                + '<td>'
                + '<span class="badge ' + action.fromLocation.typeOf + '">'
                + action.fromLocation.typeOf
                + '</span>';
            if (action.fromLocation.accountType !== undefined) {
                html += '<br>'
                    + '<span class="badge ' + action.fromLocation.accountType + '">'
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
                + '<span class="badge ' + action.toLocation.typeOf + '">'
                + action.toLocation.typeOf
                + '</span>';

            if (action.toLocation.accountType !== undefined) {
                html += '<br>'
                    + '<span class="badge ' + action.toLocation.accountType + '">'
                    + action.toLocation.accountType
                    + '</span>'
                    + '<span>'
                    + '<a target="_blank" href="/accounts/' + action.toLocation.accountType + '/' + action.toLocation.accountNumber + '">'
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
    remainingAttendeeCapacityChart2 = new Morris.Line({
        element: 'remainingAttendeeCapacityChart2',
        resize: true,
        data: datas.map(function (data) {
            return { y: data.x, remainingCapacity: data.y }
        }),
        xkey: 'y',
        ykeys: ['remainingCapacity'],
        labels: ['残席数遷移'],
        lineColors: ['#efefef'],
        lineWidth: 2,
        hideHover: 'auto',
        gridTextColor: '#fff',
        gridStrokeWidth: 0.4,
        pointSize: 4,
        pointStrokeColors: ['#efefef'],
        gridLineColor: '#efefef',
        gridTextFamily: 'Open Sans',
        gridTextSize: 10
    });
}
