/**
 * reportStatistics/view.js (Toast UI Grid 직접 사용 버전)
 *
 * - "agencyLineGrid": 1) 기관회선 현황
 * - "cableTypeGrid": 2) 케이블 타입별 현황
 * - "workListGrid":   3) 작업리스트
 */

let agencyLineGrid = null;
let cableTypeGrid  = null;
let workListGrid   = null;

$(document).ready(function(){
    // 1) 그리드 초기화
    initAgencyLineGrid();
    initCableTypeGrid();
    initWorkListGrid();

    // 필요 시 자동 검색
    doSearch();

    updateCurrentTime();
});

/** 1) 기관회선 현황 Grid 생성 */
function initAgencyLineGrid(){
    const columns = [
        { header:"NO",        name:"rowNum",                width:50,  align:"center" },
        { header:"구분",      name:"categoryName",          align:"center" },
        { header:"수직",      name:"verticalCount",         align:"center" },
        { header:"인프라",    name:"infraCount",            align:"center" },
        { header:"수직+수평", name:"verticalHorizontalSum", align:"center" },
        { header:"직접연결",  name:"directConnection",       align:"center" },
        { header:"합계",      name:"totalCount",            align:"center" }
    ];

    agencyLineGrid = new tui.Grid({
        el: document.getElementById('agencyLine-container'),
        data: [],
        columns: columns,
        scrollX: false,
        scrollY: false,
        bodyHeight: 'auto',
        rowHeaders: [],
        columnOptions: {
            resizable: true
        }
    });
}

/** 2) 케이블 타입별 현황 Grid 생성 */
function initCableTypeGrid(){
    const columns = [
        { header:"NO",         name:"rowNum",          width:50,  align:"center" },
        { header:"케이블 타입",  name:"cableType",       align:"center" },
        { header:"총 회선수",    name:"lineCount",       align:"center" },
        { header:"수직",        name:"verticalCount",   align:"center" },
        { header:"수평",        name:"horizontalCount", align:"center" },
        { header:"인프라",      name:"infraCount",      align:"center" },
        { header:"수직+수평",   name:"vhSum",           align:"center" },
        { header:"직접연결",    name:"directConnection", align:"center" }
    ];

    cableTypeGrid = new tui.Grid({
        el: document.getElementById('cableTyle-container'),
        data: [],
        columns: columns,
        scrollX: false,
        scrollY: false,
        bodyHeight: 'auto',
        rowHeaders: [],
        columnOptions: {
            resizable: true
        }
    });
}

/** 3) 작업리스트 Grid 생성 */
function initWorkListGrid(){
    const columns = [
        { header:"NO",         name:"rowNum",        width:50,  align:"center" },
        { header:"기관명",      name:"orgName",       align:"center" },
        { header:"구분",        name:"requestType",   align:"center" },
        { header:"시작",        name:"startDate",     align:"center" },
        { header:"종료",        name:"endDate",       align:"center" },
        { header:"목적",        name:"workPurpose",   align:"center" },
        { header:"작업자",      name:"workerName",    align:"center" },
        { header:"대상",        name:"targetLine",    align:"center" },
        { header:"회선수",      name:"lineCount",     align:"center" },
        { header:"연락처",      name:"contact",       align:"center" },
        { header:"직급(직책)",   name:"positionTitle", align:"center" },
        { header:"부서명",      name:"deptName",      align:"center" },
        { header:"신청날짜",    name:"requestDate",   align:"center" },
        {
            header:"신청서",
            name:"briefBtn",
            align:"center",
            formatter: () => `<button type="button" class="custom-btn custom-gray-btn">신청서</button>`
        }
    ];

    workListGrid = new tui.Grid({
        el: document.getElementById('workDetail-container'),
        data: [],
        columns: columns,
        scrollX: false,
        scrollY: false,
        bodyHeight: 350,
        rowHeaders: [],
        columnOptions: {
            resizable: true
        }
    });

    // 신청서 버튼 클릭
    $('#workDetail-container').on('click', '.custom-btn', function(evt){
        // rowKey 찾기
        const rowIndex = $(this).closest('tr').index();
        const rowKey   = workListGrid.getIndexOfRow(rowIndex);
        if(rowKey < 0) return;

        const rowData  = workListGrid.getRow(rowKey);
        if(!rowData) return;
        alert("신청서 버튼 - requestId=" + rowData.requestId);
    });
}

/** 실제 검색(로딩) 함수 */
function doSearch(){
    // 수집할 검색조건
    const param = {
        orgName:    $("#searchOrgName").val()||"",
        dataCenter: $("#searchDataCenter").val()||""
    };

    // 1) 기관회선 현황
    loadAgencyLineData(param);

    // 2) 케이블 타입별 현황
    loadCableTypeData(param);

    // 3) 작업리스트
    loadWorkListData(param);

    updateCurrentTime();
}

/** AJAX 1) 기관회선 현황 */
function loadAgencyLineData(param){
    $.ajax({
        url: "/report/statistics/agencyLine",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(param),
        success: function(res){
            // res => {rows: [...], total: N} (예시)
            let rows = (res && res.rows) ? res.rows : [];
            // rowNum 세팅
            rows.forEach((item, idx) => item.rowNum = (idx+1));
            if(agencyLineGrid){
                agencyLineGrid.resetData(rows);
            }
            // 개수 표시
            $("#line-table-cnt").text(`1. 기관회선 현황`);
        }
    });
}

/** AJAX 2) 케이블 타입별 현황 */
function loadCableTypeData(param){
    $.ajax({
        url: "/report/statistics/cableType",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(param),
        success: function(res){
            let rows = (res && res.rows) ? res.rows : [];
            rows.forEach((item, idx) => item.rowNum = (idx+1));
            if(cableTypeGrid){
                cableTypeGrid.resetData(rows);
            }
            $("#type-table-cnt").text(`2. 케이블 타입별 현황`);
        }
    });
}

/** AJAX 3) 작업리스트 */
function loadWorkListData(param){
    $.ajax({
        url: "/report/statistics/workList",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(param),
        success: function(res){
            let rows = (res && res.rows) ? res.rows : [];
            rows.forEach((item, idx) => item.rowNum = (idx+1));
            if(workListGrid){
                workListGrid.resetData(rows);
            }
            $("#work-table-cnt").text(`3. 작업리스트`);
        }
    });
}

/** 접이식 */
function toggleFold(){
    $("#foldableContent").toggle();
}

/** 시간표시 */
function updateCurrentTime(){
    const now = new Date();
    const str = now.getFullYear() + "-"
        + String(now.getMonth()+1).padStart(2,'0') + "-"
        + String(now.getDate()).padStart(2,'0') + " "
        + String(now.getHours()).padStart(2,'0') + ":"
        + String(now.getMinutes()).padStart(2,'0') + ":"
        + String(now.getSeconds()).padStart(2,'0');
    $("#inquiry_time").text("조회시간 : " + str);
}
