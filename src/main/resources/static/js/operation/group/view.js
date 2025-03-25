
let handsonData = [
    {
        group_id : "admin",
        group_name : "ADMIN",
        group_description : "시스템 관리자 계정 그룹",
        group_cnt : "20",
        group_setting : "메뉴 설정",
    },
    {
        group_id : "최고관리자",
        group_name : "보안통신과 통신망관리팀",
        group_description : "통신망 관리팀 공무원",
        group_cnt : "20",
        group_setting : "메뉴 설정",
    },
    {
        group_id : "운영요원_관리",
        group_name : "통신망관리_케이블관리팀",
        group_description : "운영요원 모든 권한 부여",
        group_cnt : "20",
        group_setting : "메뉴 설정",
    },
    {
        group_id : "운영요원_일반",
        group_name : "본원_정보시스템 일반 운영자",
        group_description : "3개 메뉴 읽기 권한, 신청관리",
        group_cnt : "8",
        group_setting : "메뉴 설정",
    },
];

$(function() {

    let handsonColumns = [
        createHandsonColumn('checkbox', ''),
        createHandsonColumn('group_id', '계정그룹ID'),
        createHandsonColumn('group_name', '계정그룹명'),
        createHandsonColumn('group_description', '계정그룹설명'),
        createHandsonColumn('group_cnt', '메뉴 수'),
        createHandsonColumn('group_setting', '메뉴 설정', menuSetting),
    ];

    let container = document.getElementById('handsontable-container');
    let hot = new Handsontable(container, {
        data: handsonData,
        columns: handsonColumns,
        colHeaders: true,            // 열 헤더 표시
        rowHeaders: false,            // 행 번호 표시
        contextMenu: true,           // 마우스 오른쪽 클릭 메뉴 활성화
        autoRowSize: true,           // 행 높이 자동 조정
        autoColumnSize: true,        // 열 높이 자동 조정
        columnSorting: true,
        width: '100%',
        height: 500,                 // 테이블 높이 설정
        stretchH: 'all',         // 열이 부모 크기에 맞게 늘어남
        overflow: 'hidden',

        // 전체 선택 체크박스 추가
        afterGetColHeader(col, TH) {
            if (col === 0) { // 'selected' 컬럼
                const existingCheckbox = TH.querySelector('input[type="checkbox"]');

                // 헤더에 체크박스가 없다면 생성
                if (!existingCheckbox) {
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.addEventListener('click', function () {
                        toggleSelectAll(hot, col, this.checked);
                    });
                    TH.innerHTML = ''; // 기존 텍스트 제거
                    TH.appendChild(checkbox);
                }
            }
        },

    });

});


