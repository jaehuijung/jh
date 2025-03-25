
let handsonDataInfo = [

];

let handsonDataHistory = [

];


$(function() {

    $('input[name="multi-datetime"]').daterangepicker({
        startDate: moment().subtract(1, 'years'), // 1년 전 날짜
        endDate: moment(), // 현재 날짜
        locale: {
            format: 'YYYY-MM-DD' // 날짜 형식을 'yyyy-mm-dd'로 설정
        },
    }, function (start, end) {
        // 사용자 정의 날짜를 입력 필드에 표시
        $('input[name="multi-datetime"]').val(start.format('YYYY-MM-DD') + ' ~ ' + end.format('YYYY-MM-DD'));
    });

    let handsonColumnsInfo = [
        createHandsonColumn('NO', 'NO'),
        createHandsonColumn('company_name',    '회사명'),
        createHandsonColumn('position',        '직책'),
        createHandsonColumn('name',            '성명'),
        createHandsonColumn('contact',         '연락처'),
        createHandsonColumn('access_location', '출입장소'),
        createHandsonColumn('remark',          '비고'),
        createHandsonColumn('info_delete',     '삭제'),
    ];

    let handsonColumnsHistory = [
        createHandsonColumn('NO', 'NO'),
        /* start */
        createHandsonColumn('start_asset_id',      '자산ID(시작)'),
        createHandsonColumn('start_config_id',     '구성ID(시작)'),
        createHandsonColumn('start_coordinate',    '좌표(시작)'),
        createHandsonColumn('start_business_name', '업무명(시작)'),
        createHandsonColumn('start_port',          '포트(시작)'),
        /* end */
        createHandsonColumn('end_asset_id',      '자산ID(종료)'),
        createHandsonColumn('end_config_id',     '구성ID(종료)'),
        createHandsonColumn('end_coordinate',    '좌표(종료)'),
        createHandsonColumn('end_business_name', '업무명(종료)'),
        createHandsonColumn('end_port',          '포트(종료)'),
        /* type */
        createHandsonColumn('cable_type',   '타입'),
        createHandsonColumn('cable_color',  '색상'),
        createHandsonColumn('cable_length', '길이'),
        createHandsonColumn('remark',       '비고'),
        createHandsonColumn('info_delete',  '삭제'),
    ];

    let containerInfo = document.getElementById('info-handsontable-container');
    let hotInfo = new Handsontable(containerInfo, {
        data: handsonDataInfo,
        columns: handsonColumnsInfo,
        colHeaders: true,            // 열 헤더 표시
        rowHeaders: false,            // 행 번호 표시
        contextMenu: true,           // 마우스 오른쪽 클릭 메뉴 활성화
        autoRowSize: true,           // 행 높이 자동 조정
        autoColumnSize: true,        // 열 높이 자동 조정
        columnSorting: true,
        width: '100%',
        height: 300,                 // 테이블 높이 설정
        stretchH: 'all',         // 열이 부모 크기에 맞게 늘어남
        overflow: 'hidden',
    });

    let containerHistory = document.getElementById('history-handsontable-container');
    let hotHistory = new Handsontable(containerHistory, {
        data: handsonDataHistory,
        columns: handsonColumnsHistory,
        colHeaders: true,            // 열 헤더 표시
        rowHeaders: false,            // 행 번호 표시
        contextMenu: true,           // 마우스 오른쪽 클릭 메뉴 활성화
        autoRowSize: true,           // 행 높이 자동 조정
        autoColumnSize: true,        // 열 높이 자동 조정
        columnSorting: true,
        width: '100%',
        height: 300,                 // 테이블 높이 설정
        stretchH: 'all',         // 열이 부모 크기에 맞게 늘어남
        overflow: 'hidden',
    });

});