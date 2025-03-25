/**
 * patchStatus/view.js (Toast UI Grid 직접 사용 버전)
 *
 * - "patchStatusGrid" : 통신패치현황
 * - columns 예시:
 *   NO, 구분, 위치, OS2(총수량/사용량/사용율), OM1(총수량/사용량/사용율), OM3, OM4, UTP ...
 */

let patchStatusGrid = null;

$(document).ready(function(){
    // 1) 그리드 초기화
    initPatchStatusGrid();

    // 필요 시 자동 검색
    doSearch();

    updateCurrentTime();
});

/** 1) 통신패치현황 Grid 생성 */
function initPatchStatusGrid(){
    // 예시로, 컬럼 구조 (사용량/사용율 etc.)
    // 가상의 컬럼들: rowNum, category, location, OS2_total, OS2_used, OS2_usageRate, OM1_total, ...
    const columns = [
        { header:"NO",         name:"rowNum",          align:"center" },
        { header:"구분",       name:"category",       align:"center" },
        { header:"위치",       name:"location",      align:"center" },

        // OS2
        { header:"총수량",     name:"os2Total",        align:"center" },
        { header:"사용량",     name:"os2Used",         align:"center" },
        { header:"사용율(%)",   name:"os2Rate",        align:"center",
            formatter: ({value}) => value ? value+"%" : ""
        },

        // OM1
        { header:"총수량",     name:"om1Total",        align:"center" },
        { header:"사용량",     name:"om1Used",       align:"center" },
        { header:"사용율(%)",   name:"om1Rate",        align:"center",
            formatter: ({value}) => value ? value+"%" : ""
        },

        // OM3
        { header:"총수량",     name:"om3Total",        align:"center" },
        { header:"사용량",     name:"om3Used",         align:"center" },
        { header:"사용율(%)",   name:"om3Rate",        align:"center",
            formatter: ({value}) => value ? value+"%" : ""
        },

        // OM4
        { header:"총수량",     name:"om4Total",        align:"center" },
        { header:"사용량",     name:"om4Used",         align:"center" },
        { header:"사용율(%)",   name:"om4Rate",        align:"center",
            formatter: ({value}) => value ? value+"%" : ""
        },

        // UTP
        { header:"총수량",     name:"utpTotal",       align:"center" },
        { header:"사용량",     name:"utpUsed",      align:"center" },
        { header:"사용율(%)",   name:"utpRate",       align:"center",
            formatter: ({value}) => value ? value+"%" : ""
        },
    ];

    // Complex Header 예시: OS2, OM1, OM3, OM4, UTP 그룹핑
    const complexColumns = [
        {
            header: "OS2",
            name: "os2Group",
            childNames: ["os2Total","os2Used","os2Rate"]
        },
        {
            header: "OM1",
            name: "om1Group",
            childNames: ["om1Total","om1Used","om1Rate"]
        },
        {
            header: "OM3",
            name: "om3Group",
            childNames: ["om3Total","om3Used","om3Rate"]
        },
        {
            header: "OM4",
            name: "om4Group",
            childNames: ["om4Total","om4Used","om4Rate"]
        },
        {
            header: "UTP",
            name: "utpGroup",
            childNames: ["utpTotal","utpUsed","utpRate"]
        }
    ];

    patchStatusGrid = new tui.Grid({
        el: document.getElementById('patchstatus-container'),
        data: [],  // 초기 비어있음
        columns: columns,
        scrollX: true,
        scrollY: true,
        bodyHeight: 480,
        rowHeaders: [],  // 혹은 ['checkbox'] if needed
        columnOptions: { resizable: true },
        header: {
            height: 70,
            complexColumns: complexColumns
        }
    });
}

/** 검색 or 조회 함수 */
function doSearch(){
    // 예) 검색조건 수집
    const param = {
        requestType: $("#someSelectRequestType").val()||"",
        dateRange:   $("input[name='radio-group']:checked").val()||"all",
        // ...
    };

    loadPatchStatusData(param);
    updateCurrentTime();
}

/** AJAX -> /report/patchStatus/getList (예시) */
function loadPatchStatusData(param){
    $.ajax({
        url: "/report/patchstatus/getList",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(param),
        success: function(res){
            // res => { rows: [...], total: n }
            let rows = (res && res.rows) ? res.rows : [];
            // rowNum
            rows.forEach((item, idx) => {
                item.rowNum = (idx+1);
            });
            patchStatusGrid.resetData(rows);

            // 개수 표시
            $("#table-cnt").text(`전체 개수 : ${rows.length}개`);
        },
        error: function(err){
            console.error(err);
            alert("조회 오류 발생");
        }
    });
}

/** 접이식 영역 토글 */
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
