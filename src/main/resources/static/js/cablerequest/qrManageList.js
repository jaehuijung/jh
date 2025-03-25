/**
 * qrManageList.js
 * - gridManager.grid()로 "qrinfoDetail" 그리드 생성
 * - NO 열(순차번호), checkbox 열
 * - 검색 시 이전 결과에 append
 * - 삭제 버튼 클릭 시 선택된 행만 제거
 * - [신규] exportExcel() 함수: 현재 그리드 데이터를 CSV로 다운로드
 */

$(document).ready(function() {
    initQrGrid();
    bindQrInputEnter();

    // 페이지 로드 시 포커스
    $("#qrInput").focus();

    updateCurrentTime();
});

/** 1) 그리드 초기화 */
function initQrGrid(){
    const columns = [
        {
            header: "NO",
            name: "no",
            width: 50,
            align: "center"
        },
        {
            header: "자산ID(START)",
            name: "startAssetId",
            align: "center"
        },
        {
            header: "포트(START)",
            name: "startPort",
            align: "center"
        },
        {
            header: "업무명(START)",
            name: "startEqpName",
            align: "center"
        },
        {
            header: "자산ID(END)",
            name: "endAssetId",
            align: "center"
        },
        {
            header: "포트(END)",
            name: "endPort",
            align: "center"
        },
        {
            header: "업무명(END)",
            name: "endEqpName",
            align: "center"
        },
        {
            header: "케이블타입",
            name: "cableType",
            align: "center",
            formatter: ({ value }) => {
                if(value==="INSTALL") return "포설";
                if(value==="REMOVE")  return "제거";
                return value||"";
            }
        },
        { header: "색상",   name: "cableColor",   align: "center" },
        { header: "길이",   name: "cableLength",  align: "center" },
        { header: "비고",   name: "remarks",      align: "left" }
    ];

    const complexColumns = [
        {
            header: "START",
            name: "startGroup",
            childNames: ["startAssetId","startPort","startEqpName"]
        },
        {
            header: "END",
            name: "endGroup",
            childNames: ["endAssetId","endPort","endEqpName"]
        }
    ];

    gridManager.grid({
        url: "/cable/qr/getCable",
        columns: columns,
        complexColumns: complexColumns,
        gridElementId: "qrinfoDetail",
        tableCountId: "table-cnt",
        checkbox: true,
        paginationOption: false
    });
}

/** 2) qrInput에 엔터치면 검색 */
function bindQrInputEnter(){
    $("#qrInput").on('keydown', function(e){
        if(e.key === 'Enter'){
            searchButton();
        }
    });
}

/** 3) 검색 버튼 -> append */
function searchButton(){
    const val = $("#qrInput").val().trim();
    if(!val){
        alert("QR코드를 입력하세요.");
        return;
    }

    $.ajax({
        url: "/cable/qr/getCable",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ qrCode: val }),
        success: function(res){
            let newRows = [];
            let totalVal = 0;

            if(Array.isArray(res)){
                newRows = res;
                totalVal = res.length;
            } else if(res.rows && Array.isArray(res.rows)){
                newRows = res.rows;
                totalVal = res.total || newRows.length;
            } else {
                console.warn("Unknown response format", res);
                return;
            }

            // (A) 현재 그리드 데이터
            let existing = getGridData("qrinfoDetail");
            let startIndex = existing.length;

            // (B) 새 데이터에 NO 필드 부여
            newRows.forEach((row, i) => {
                row.no = startIndex + i + 1;
            });

            let appended = existing.concat(newRows);

            // (C) resetData
            setGridData("qrinfoDetail", appended, appended.length);

            updateCurrentTime();
            $("#qrInput").val('');
        },
        error: function(err){
            console.error(err);
            alert("조회 오류가 발생했습니다.");
        }
    });
}

/** 4) 삭제 버튼 */
function deleteData(){
    const checked = gridManager.getCheckedRows("qrinfoDetail");
    if(checked.length===0){
        alert("삭제할 항목을 선택하세요.");
        return;
    }
    // if(!confirm("선택된 항목을 삭제하시겠습니까?")) return;

    // 로컬에서 제거 (서버 연동 필요시 ajax 추가)
    removeLocalRows(checked);
}

function removeLocalRows(checkedRows) {
    let data = getGridData("qrinfoDetail");
    let removeNos = checkedRows.map(r => r.no);
    let remain = data.filter(row => !removeNos.includes(row.no));

    // no 재할당
    remain.forEach((row, idx) => {
        row.no = idx + 1;
    });

    setGridData("qrinfoDetail", remain, remain.length);
}

/** --- [신규] 엑셀(CSV) 내보내기 --- */
function exportExcel(){
    // 1) 현재 그리드 데이터
    let data = getGridData("qrinfoDetail");
    if(data.length === 0){
        alert("데이터가 없습니다.");
        return;
    }

    // 2) 내보낼 컬럼 정의 (엑셀 헤더 + 필드 매핑)
    //    실제로는 gridInstance.getColumns() 등을 활용할 수도 있지만
    //    예제에서는 명시적으로 작성
    const excelColumns = [
        { header: "NO",             name: "no" },
        { header: "자산ID(START)",  name: "startAssetId" },
        { header: "포트(START)",    name: "startPort" },
        { header: "업무명(START)",  name: "startEqpName" },
        { header: "자산ID(END)",    name: "endAssetId" },
        { header: "포트(END)",      name: "endPort" },
        { header: "업무명(END)",    name: "endEqpName" },
        { header: "케이블타입",     name: "cableType" },
        { header: "색상",          name: "cableColor" },
        { header: "길이",          name: "cableLength" },
        { header: "비고",          name: "remarks" }
    ];

    // 3) CSV 헤더 만들기
    let csvContent = excelColumns.map(col => col.header).join(",") + "\r\n";

    // 4) CSV 본문 (각 행)
    data.forEach(row => {
        // 각 컬럼 순서대로 값 추출 (없으면 공백)
        let rowArray = excelColumns.map(col => row[col.name] ? row[col.name] : "");
        // 쉼표 구분
        csvContent += rowArray.join(",") + "\r\n";
    });

    // 5) Blob 생성 -> URL -> 다운로드
    let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // 파일명 예: qr_export_20230224_1510.csv
    let now = new Date();
    let yyyy = now.getFullYear();
    let MM   = String(now.getMonth()+1).padStart(2,'0');
    let dd   = String(now.getDate()).padStart(2,'0');
    let hh   = String(now.getHours()).padStart(2,'0');
    let mm   = String(now.getMinutes()).padStart(2,'0');
    let filename = `qr_export_${yyyy}${MM}${dd}_${hh}${mm}.csv`;

    // 임시 a 태그를 만들어 링크 다운로드
    let link = document.createElement("a");
    let url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();   // 다운로드 실행
    document.body.removeChild(link);
}

/** getGridData : 현재 그리드 rows */
function getGridData(gridElementId){
    const tblId = gridElementId + "Table";
    const el = document.getElementById(tblId);
    if(el && el.gridInstance){
        return el.gridInstance.getData();
    }
    return [];
}

/** setGridData : rows + totalCount 세팅 */
function setGridData(gridElementId, rows, totalCount){
    const tblId = gridElementId + "Table";
    const el = document.getElementById(tblId);
    if(el && el.gridInstance){
        el.gridInstance.resetData(rows);
    }
    const cntEl = document.getElementById("table-cnt");
    if(cntEl){
        cntEl.textContent = totalCount ? `${totalCount}건` : `0건`;
    }
}

/** 접이식 */
function toggleFold(){
    $("#foldableContent").toggle();
}

/** 시각표시 */
function updateCurrentTime(){
    let now = new Date();
    let str = now.getFullYear() + "-"
        + String(now.getMonth()+1).padStart(2,'0') + "-"
        + String(now.getDate()).padStart(2,'0') + " "
        + String(now.getHours()).padStart(2,'0') + ":"
        + String(now.getMinutes()).padStart(2,'0') + ":"
        + String(now.getSeconds()).padStart(2,'0');
    $("#inquiry_time").text("조회시간 : " + str);
}
