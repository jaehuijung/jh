/********************************* requestFormHot.js
 * 전역
 *********************************/
let workerHot = null; // 작업자 목록 (TUI Grid)
let detailHot = null; // 작업내역 목록 (TUI Grid)

$(document).ready(function(){
    // A) 작업자 목록 초기화
    initWorkerHot();
    // B) 작업내역 목록 초기화
    initDetailHot();

    // 1) 오늘 날짜를 moment()로 가져오기
    const baseDate = moment();
    // 2) 기본 상태: '금일(D)' 라디오 → '오늘 ~ 오늘'
    const todayStr = baseDate.format("YYYY-MM-DD");
    $("input[name='multi-datetime']").val(todayStr + " - " + todayStr);

    // 3) 라디오 버튼 change 이벤트
    $("input[name='radio-group']").on("change", function(){
        const selectedVal = $(this).val(); // D / M / R
        let rangeText = "";
        if(selectedVal === "D"){
            // 금일: 오늘 ~ 오늘
            rangeText = todayStr + " - " + todayStr;
        } else if(selectedVal === "M"){
            // 금월: 이번 달 시작일 ~ 말일
            const endOfMonth = baseDate.clone().endOf("month");
            rangeText = baseDate.format("YYYY-MM-DD") + " - " + endOfMonth.format("YYYY-MM-DD");
        } else if(selectedVal === "R"){
            // 기간선택: 오늘 ~ 오늘+7일
            const endDate = baseDate.clone().add(7, 'days');
            rangeText = todayStr + " - " + endDate.format("YYYY-MM-DD");
        }
        $("input[name='multi-datetime']").val(rangeText);
    });

    // 임시저장 불러오기 버튼
    $("#btnTempLoad").on("click", function(){
        loadRequest();
    });

    // 작업내역 추가 버튼
    $("#addDetailRowBtn").on("click", addEmptyDetailRow);

    // 임시저장 버튼 이벤트
    $("#btnConfirmTempSave").on("click", function(){
        doTempSaveWithTitle();
    });
});

/*******************************************************
 * [공통] 임시저장 불러오기
 *******************************************************/
function loadRequest(){
    // 모달 열기 (실제 목록 조회는 tempRequestModal.js 쪽에서)
    $("#tempRequestModal").modal("show");
}

/*******************************************************
 * [A] 작업자 목록 (workerHot)
 *******************************************************/
function initWorkerHot() {
    const workerColumns = [
        {
            header: "회사명",
            name: "companyName",
            align: "center",
            editor: "text"    // 입력 가능
        },
        {
            header: "직책",
            name: "jobTitle",
            align: "center",
            editor: "text"   // 입력 가능
        },
        {
            header: "성명",
            name: "workerName",
            align: "center",
            editor: "text"
        },
        {
            header: "연락처",
            name: "contact",
            align: "center",
            editor: "text"
        },
        {
            header: "삭제",
            name: "deleteBtn",
            align: "center",
            width: 80,
            escapeHTML: false,
            formatter: function(props) {
                return `<button class="btn btn-sm btn-secondary delete-worker-btn">삭제</button>`;
            }
        }
    ];

    workerHot = new tui.Grid({
        el: document.getElementById('workerParentHot'),
        data: [],
        columns: workerColumns,
        rowHeaders: ['rowNum'],
        scrollX: true,
        scrollY: true,
        bodyHeight: 150,
        columnOptions: { resizable: true }
    });

    // 삭제 버튼 이벤트
    workerHot.on('click', (ev) => {
        if (ev.targetType === 'cell' && ev.columnName === 'deleteBtn') {
            const rowKey = ev.rowKey;
            workerHot.removeRow(rowKey);
        }
    });
}

function manuallyAddWorker() {
    if (!workerHot) return;

    // 필요하다면 기본값 설정 가능
    workerHot.appendRow({
        companyName: "",
        jobTitle: "",
        workerName: "",
        contact: ""
    });
}

/** 모달에서 선택된 작업자 목록 추가 */
function addSelectedWorkers(modalRows) {
    if (!workerHot) return;
    let dataArr = workerHot.getData();

    modalRows.forEach(newItem => {
        let alreadyExists = dataArr.some(existing => existing.workerId === newItem.workerId);
        if(!alreadyExists) {
            dataArr.push({
                workerId:    newItem.workerId,
                companyName: newItem.companyName,
                jobTitle:    newItem.jobTitle,
                workerName:  newItem.workerName,
                contact:     newItem.contact
            });
        }
    });
    workerHot.resetData(dataArr);
}

/** 현재 작업자들의 ID Set 반환 (중복 체크용) */
function getSelectedWorkerIdSet() {
    if (!workerHot) return new Set();
    let data = workerHot.getData();
    let idSet = new Set();
    data.forEach(r => {
        if (r.workerId) {
            idSet.add(r.workerId);
        }
    });
    return idSet;
}

/*******************************************************
 * [B] 작업내역 목록 (detailHot)
 *******************************************************/
const tuiComplexColumns = [
    {
        header: 'START',
        name: 'start',
        childNames: [
            'startAssetId',
            'startConfigId',
            'startLocation',
            'startEqpName',
            'startPort'
        ]
    },
    {
        header: 'END',
        name: 'end',
        childNames: [
            'endAssetId',
            'endConfigId',
            'endLocation',
            'endEqpName',
            'endPort'
        ]
    }
];

function initDetailHot() {
    const detailColumns = [
        {
            header: "자산ID",
            name: "startAssetId",
            align: "center",
            editor: "text"
        },
        {
            header: "구성ID",
            name: "startConfigId",
            align: "center",
            editor: "text"
        },
        {
            header: "좌표",
            name: "startLocation",
            align: "center",
            editor: "text"
        },
        {
            header: "업무명",
            name: "startEqpName",
            align: "center",
            editor: "text"
        },
        {
            header: "포트",
            name: "startPort",
            align: "center",
            editor: "text"
        },
        {
            header: "자산ID",
            name: "endAssetId",
            align: "center",
            editor: "text"
        },
        {
            header: "구성ID",
            name: "endConfigId",
            align: "center",
            editor: "text"
        },
        {
            header: "좌표",
            name: "endLocation",
            align: "center",
            editor: "text"
        },
        {
            header: "업무명",
            name: "endEqpName",
            align: "center",
            editor: "text"
        },
        {
            header: "포트",
            name: "endPort",
            align: "center",
            editor: "text"
        },
        {
            header: "타입",
            name: "cableType",
            align: "center",
            editor: "text"
        },
        {
            header: "색상",
            name: "cableColor",
            align: "center",
            editor: "text"
        },
        {
            header: "길이",
            name: "cableLength",
            align: "center",
            editor: "text"
        },
        {
            header: "비고",
            name: "remark",
            align: "center",
            editor: "text"
        },
        {
            header: "삭제",
            name: "deleteBtn",
            align: "center",
            width: 80,
            escapeHTML: false,
            formatter: function(props) {
                return `<button class="btn btn-sm btn-secondary delete-detail-btn">삭제</button>`;
            }
        }
    ];

    detailHot = new tui.Grid({
        el: document.getElementById('detailParentHot'),
        data: [],
        columns: detailColumns,
        header: {
            height: 65,
            complexColumns: tuiComplexColumns
        },
        rowHeaders: ['rowNum'],
        scrollX: true,
        scrollY: true,
        bodyHeight: 200,
        columnOptions: { resizable: true }
    });

    // 삭제 버튼 이벤트
    detailHot.on('click', (ev) => {
        if (ev.targetType === 'cell' && ev.columnName === 'deleteBtn') {
            const rowKey = ev.rowKey;
            detailHot.removeRow(rowKey);
        }
    });
}

/** 외부(모달 등)에서 가져온 작업내역 데이터 추가 */
function addDetailRows(rowObj) {
    if (!detailHot) return;
    let dataArr = detailHot.getData();
    dataArr.push(rowObj);
    detailHot.resetData(dataArr);
}

/** '추가' 버튼 → 빈 행을 1줄 추가하여 사용자가 직접 입력 */
function addEmptyDetailRow() {
    if (!detailHot) return;
    detailHot.appendRow({
        startAssetId: '',
        startConfigId: '',
        startLocation: '',
        startEqpName: '',
        startPort: '',
        endAssetId: '',
        endConfigId: '',
        endLocation: '',
        endEqpName: '',
        endPort: '',
        cableType: '',
        cableColor: '',
        cableLength: '',
        remark: ''
    });
}

/*******************************************************
 * [C] 최종 등록 => saveRequest()
 *******************************************************/
function saveRequest() {
    let orgName       = $("#orgNameSelect").val();
    let positionTitle = $("#positionTitle").val();
    let officerName   = $("#officerName").val();
    let officerContact= $("#officerContact").val();
    let deptName      = $("#deptName").val();
    let workPurpose   = $("#workPurpose").val();
    let workDateType  = $("input[name='radio-group']:checked").val() || "D";

    let dateRangeText = $("input[name='multi-datetime']").val() || "";
    let workStartDate = "";
    let workEndDate   = "";
    if (dateRangeText.includes(" - ")) {
        let parts = dateRangeText.split(" - ");
        workStartDate = parts[0] || "";
        workEndDate   = parts[1] || "";
    }

    let workerData = workerHot ? workerHot.getData() : [];
    let detailData = detailHot ? detailHot.getData() : [];

    // ================== [유효성 검사] ===================
    // (1) 기관명
    if (!orgName || orgName === "전체") {
        alert2("알림", "기관명을 선택해주세요.", "info", "확인");
        return;
    }
    // (2) 직급(직책)
    if (!positionTitle || positionTitle.trim().length === 0) {
        alert2("알림", "직급(직책)을 입력해주세요.", "info", "확인");
        return;
    }
    // (3) 주무관(성명)
    if (!officerName || officerName.trim().length === 0) {
        alert2("알림", "주무관(성명)을 입력해주세요.", "info", "확인");
        return;
    }
    // (4) 연락처
    if (!officerContact || officerContact.trim().length === 0) {
        alert2("알림", "연락처를 입력해주세요.", "info", "확인");
        return;
    }
    // (5) 부서명
    if (!deptName || deptName.trim().length === 0) {
        alert2("알림", "부서명을 입력해주세요.", "info", "확인");
        return;
    }
    // (6) 작업목적
    if (!workPurpose || workPurpose.trim().length === 0) {
        alert2("알림", "작업목적을 입력해주세요.", "info", "확인");
        return;
    }
    // (7) 날짜 범위
    if (!dateRangeText || !dateRangeText.includes(" - ")) {
        alert2("알림", "작업일자를 선택해주세요.", "info", "확인");
        return;
    }

    // (8) 작업자 목록 0명 → 바로 등록 불가능
    if (workerData.length === 0) {
        alert2("알림", "작업자 목록이 없습니다. 최소 1명 이상 추가해주세요.", "info", "확인");
        return;
    }

    // (9) 작업내역 목록 0건 → 바로 등록 불가능
    if (detailData.length === 0) {
        alert2("알림", "작업내역이 없습니다. 최소 1건 이상 추가해주세요.", "info", "확인");
        return;
    }

    // (10) 작업자 목록 상세 유효성 검사 (예시)
    for (let i = 0; i < workerData.length; i++) {
        const w = workerData[i];
        if (!w.companyName || !w.jobTitle || !w.workerName || !w.contact) {
            alert2("알림", `[작업자 ${i+1}번 행] 필수 항목을 모두 입력해주세요.`, "info", "확인");
            return;
        }
    }

    // (11) 작업내역 목록 상세 유효성 검사 (예시)
    //      START 자산ID, START 업무명, 케이블 타입 등
    for (let i = 0; i < detailData.length; i++) {
        const d = detailData[i];
        if (
            !d.startAssetId   || !d.startLocation   || !d.startEqpName   || !d.startPort ||
            !d.endAssetId     || !d.endConfigId     || !d.endLocation     || !d.endEqpName     || !d.endPort ||
            !d.cableType      || !d.cableColor      || !d.cableLength
        ) {
            alert2("알림", `[작업내역 ${i+1}번 행] 필수 항목을 모두 입력해주세요.`, "info", "확인");
            return;
        }
    }

    // ↑ 모든 검증 통과 시, 확인 모달 표시
    modalManager.show({
        title: "확인",
        html: "포설 신청을 등록하시겠습니까?",
        icon: "info",
        confirmButtonText: "등록",
        showCancelButton: true,
        cancelButtonText: "취소",
        callback: function() {
            // 사용자가 "등록" 버튼 클릭 시 Ajax 실행
            // Ajax 전송
            let param = {
                requestInfo: {
                    requestType:    "INSTALL",
                    orgName:        orgName,
                    positionTitle:  positionTitle,
                    officerName:    officerName,
                    officerContact: officerContact,
                    deptName:       deptName,
                    workPurpose:    workPurpose,
                    workDateType:   workDateType,
                    workStartDate:  workStartDate,
                    workEndDate:    workEndDate,
                    approvalStatus: "대기"
                },
                workerList: workerData,
                detailList: detailData
            };

            $.ajax({
                url: "/cable/request/save",
                type: "POST",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(param),
                success: function(res){
                    if(res.result === "SUCCESS"){
                        alert2("알림", "신청이 완료되었습니다.", "success", "확인", function() {
                            window.location.href = "/cable/manage/list";
                        });
                    } else {
                        alert2("오류", "오류: " + (res.message || "알 수 없는 오류가 발생했습니다."), "error", "확인");
                    }
                },
                error: function(err){
                    console.error("saveRequest error", err);
                    alert2("오류", "요청 처리 중 오류가 발생했습니다.", "error", "확인");
                }
            });
        }
    });
}

/*******************************************************
 * 임시저장 불러오기 + 폼 채우기
 *******************************************************/
function loadTempRequestData(requestId){
    alert3("load"); // 로딩 인디케이터 표시

    $.ajax({
        url: "/cable/request/getRequestData",
        type: "GET",
        data: { requestId: requestId },
        success: function(res){
            alert3Close(); // 로딩 인디케이터 닫기

            if(!res || !res.requestInfo){
                alert2("알림", "데이터를 불러오지 못했습니다.", "error", "확인");
                return;
            }
            fillFormWithRequestData(res.requestInfo);

            if(workerHot){
                workerHot.resetData(res.workerList || []);
            }
            if(detailHot){
                detailHot.resetData(res.detailList || []);
            }
            alert2("알림", "임시저장 데이터 세팅 완료.", "success", "확인");
        },
        error: function(err){
            alert3Close(); // 로딩 인디케이터 닫기
            console.error(err);
            alert2("알림", "임시저장 데이터 불러오기 실패", "error", "확인");
        }
    });
}

function fillFormWithRequestData(info){
    $("#orgNameSelect").val(info.ORG_NAME || "");
    $("#positionTitle").val(info.POSITION_TITLE || "");
    $("#deptName").val(info.DEPT_NAME || "");
    $("#officerName").val(info.OFFICER_NAME || "");
    $("#officerContact").val(info.OFFICER_CONTACT || "");
    $("#workPurpose").val(info.WORK_PURPOSE || "");

    let start = info.WORK_START_DATE || "";
    let end   = info.WORK_END_DATE   || "";
    if(start && end){
        $("input[name='multi-datetime']").val(start + " - " + end);
    } else {
        $("input[name='multi-datetime']").val("");
    }

    if(info.WORK_DATE_TYPE){
        $(`input[name='radio-group'][value='${info.WORK_DATE_TYPE}']`).prop("checked", true);
    }

    if(info.REQUEST_ID){
        $("#hiddenRequestId").val(info.REQUEST_ID);
    }
}

/*******************************************************
 * 임시저장 제목 입력 모달에서 저장 처리
 *******************************************************/
function doTempSaveWithTitle() {
    let titleVal = $("#tempSaveTitleInput").val().trim();
    if(!titleVal){
        modalManager.showValidationMessage("제목을 입력해주세요.");
        return;
    }

    // (A) 상단 폼 값 수집
    let orgName       = $("#orgNameSelect").val();
    let positionTitle = $("#positionTitle").val();
    let officerName   = $("#officerName").val();
    let officerContact= $("#officerContact").val();
    let deptName      = $("#deptName").val();
    let workPurpose   = $("#workPurpose").val();
    let workDateType  = $("input[name='radio-group']:checked").val() || "D";

    let dateRangeText = $("input[name='multi-datetime']").val() || "";
    let [workStartDate, workEndDate] = ["",""];
    if(dateRangeText.includes(" - ")){
        let parts = dateRangeText.split(" - ");
        workStartDate = parts[0].trim();
        workEndDate   = parts[1].trim();
    }

    // 간단 필수값 검사 (주무관, 작업목적)
    if(!officerName || officerName.trim().length===0){
        modalManager.showValidationMessage("주무관(성명)을 입력해주세요.");
        return;
    }
    if(!workPurpose || workPurpose.trim().length===0){
        modalManager.showValidationMessage("작업목적을 입력해주세요.");
        return;
    }

    // (B) workerList / detailList
    let workerData = workerHot ? workerHot.getData() : [];
    let detailData = detailHot ? detailHot.getData() : [];

    // (C) 기존 requestId 여부
    let existingRequestId = $("#hiddenRequestId").val() || null;

    // (D) 파라미터
    let param = {
        requestInfo: {
            requestId:    existingRequestId ? parseInt(existingRequestId,10) : null,
            requestType:  "INSTALL",
            orgName:      orgName,
            positionTitle: positionTitle,
            officerName:   officerName,
            officerContact:officerContact,
            deptName:      deptName,
            workPurpose:   workPurpose,
            workDateType:  workDateType,
            workStartDate: workStartDate,
            workEndDate:   workEndDate,
            approvalStatus:"임시저장"
        },
        workerList: workerData,
        detailList: detailData,
        // 새로 추가된 부분: 임시저장 테이블용 title
        tempTitle: titleVal
    };

    // 저장 중 로딩 인디케이터 표시
    alert3("save");

    // (E) Ajax: /cable/request/save
    $.ajax({
        url: "/cable/request/save",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(param),
        success: function(res){
            alert3Close(); // 로딩 인디케이터 닫기

            if(res.result==="SUCCESS"){
                alert2("알림", "임시저장 완료", "success", "확인", function() {
                    // hiddenRequestId 업데이트
                    $("#hiddenRequestId").val(res.requestId);
                    // 모달 닫기
                    $('#tempSaveTitleModal').modal('hide');
                });
            } else {
                alert2("오류", "오류: "+ (res.message||""), "error", "확인");
            }
        },
        error: function(err){
            alert3Close(); // 로딩 인디케이터 닫기
            console.error("doTempSaveWithTitle error", err);
            alert2("오류", "임시저장 실패", "error", "확인");
        }
    });
}