$(function () {
    // $("#actions-table").DataTable();
    $('#actions-table').DataTable({
        "paging": true,
        "lengthChange": true,
        "searching": true,
        "order": [[2, 'desc']], // デフォルトは完了日時降順
        "ordering": true,
        "info": true,
        "autoWidth": true
    });
});