/**
 * requestManageList.js (gridManager.grid 버전 + custom-modal.js 적용)
 * - "requestListHot" 영역에 Toast UI Grid를 "gridManager"로 생성
 * - "workerBtn", "targetBtn", "briefBtn" 클릭을 DOM 이벤트로 처리
 * - 검색 시 gridManager.updateGrid(...) 호출
 * - Bootstrap 모달 대신 modalManager를 사용
 */

// 전역 변수 정의
let requestWorkerHot = null;
let requestDetailHot = null;
let currentRequestId = null;
let currentRequestIdForDetail = null;
let lossTestDropzone = null;
let totalSize = 0;
let fileCount = 0;
const MAX_FILE_COUNT = 7;
const MAX_TOTAL_SIZE = 10 * 1024 * 1024; // 10MB

$(document).ready(function() {
    // 1) 그리드 초기 설정
    initRequestListGrid();

    // 2) 모달 그리드 초기화는 모달 열릴 때 수행

    // 3) Dropzone 설정
    Dropzone.autoDiscover = false;

    updateCurrentTime();
});

/**
 * 메인 목록을 gridManager.grid로 생성
 */
function initRequestListGrid() {
    // 컬럼 정의
    const columns = [
        {
            header: "NO",
            sortable: true,
            name: "requestId",
            align: "center"
        },
        {
            header: "기관명",
            sortable: true,
            name: "orgName",
            align: "center"
        },
        {
            header: "구분",
            sortable: true,
            name: "requestType",
            formatter: ({value}) => {
                if (value === "INSTALL") return "포설";
                if (value === "REMOVE") return "제거";
                return value || "";
            },
            align: "center"
        },
        {
            header: "시작일",
            sortable: true,
            name: "workStartDate",
            formatter: ({value}) => {
                let startStr = value ? moment(value).format("YYYY-MM-DD") : "";
                return startStr;
            },
            align: "center"
        },
        {
            header: "종료일",
            sortable: true,
            name: "workEndDate",
            formatter: ({value}) => {
                let endStr = value ? moment(value).format("YYYY-MM-DD") : "";
                return endStr;
            },
            align: "center"
        },
        {
            header: "목적",
            sortable: true,
            name: "workPurpose",
            align: "center"
        },
        {
            header: "작업자",
            sortable: true,
            name: "workerBtn",
            width: 100,
            align: "center",
            formatter: () => `<button type="button" class="btn btn-sm btn-secondary btn-xs-work">작업자</button>`
        },
        {
            header: "대상",
            sortable: true,
            name: "targetBtn",
            width: 100,
            align: "center",
            formatter: () => `<button type="button" class="btn btn-sm btn-secondary btn-xs-work">대상</button>`
        },
        {
            header: "주무관(명)",
            sortable: true,
            name: "officerName",
            align: "center"
        },
        {
            header: "연락처",
            sortable: true,
            name: "contact",
            align: "center"
        },
        {
            header: "직급(직책)",
            sortable: true,
            name: "positionTitle",
            align: "center"
        },
        {
            header: "부서명",
            sortable: true,
            name: "deptName",
            align: "center"
        },
        {
            header: "승인상태",
            sortable: true,
            name: "approvalStatus",
            align: "center"
        },
        {
            header: "신청서",
            name: "briefBtn",
            align: "center",
            formatter: () => `<button type="button" class="btn btn-sm btn-primary btn-xs-form">신청서</button>`
        }
    ];

    // 그리드 초기화
    gridManager.grid({
        url: "/cable/manage/getList",
        columns: columns,
        gridElementId: "requestListHot",
        tableCountId: "totalCount",
        checkbox: true,
        paginationOption: true,
    });

    // 그리드 내 버튼 클릭 이벤트
    $('#requestListHot').on('click', '.btn', function(event) {
        const rowData = gridManager.getRowDataByEvent("requestListHot", event);
        if (!rowData) return;
        const colName = getColumnNameByClick(event);

        if (colName === 'workerBtn') {
            openWorkerModal(rowData.requestId);
        } else if (colName === 'targetBtn') {
            openDetailModal(rowData.requestId);
        } else if (colName === 'briefBtn') {
            alert2('알림', '신청서 양식준비중 입니다.', 'info', '확인');
        }
    });
}

/**
 * 클릭된 컬럼 이름 식별
 */
function getColumnNameByClick(event) {
    const target = $(event.target);
    let colName = "";
    if (target.closest('td').length > 0) {
        colName = target.closest('td').data('columnName') || "";
    }
    return colName;
}

/**
 * 작업자 모달 Grid 초기화
 */
function initWorkerModalHot(container) {
    requestWorkerHot = new tui.Grid({
        el: container,
        data: [],
        scrollX: true,
        scrollY: true,
        bodyHeight: 250,
        rowHeaders: [],
        columns: [
            { header: "회사명", name: "companyName", align: "center" },
            { header: "직책", name: "jobTitle", align: "center" },
            { header: "성명", name: "workerName", align: "center" },
            { header: "연락처", name: "contact", align: "center" }
        ]
    });
}

/**
 * 작업자 모달 열기 - modalManager 사용
 */
function openWorkerModal(requestId) {
    console.log("openWorkerModal: requestId=", requestId);
    currentRequestId = requestId;

    // 모달 컨텐츠 HTML
    const modalHtml = `
        <div class="modal-content-inner" style="width: 100%; max-width: 100%; margin: 0 auto; position: relative; padding: 0px 15px;">
            <div id="requestWorkerHotContainer" class="custom-modal-grid-container"></div>
        </div>
    `;

    modalManager.show({
        title: '작업자정보',
        html: modalHtml,
        icon: 'info',
           showConfirmButton: true,  // 버튼은 생성하되
                      confirmButtonText: '',// 확인 버튼 숨기기
                   showCancelButton: true,
                   cancelButtonText: '닫기',
        allowOutsideClick: false,
        didOpen: function() {
         // 확인 버튼을 CSS로 숨김
                const confirmBtn = document.getElementById("custom-modal-confirm");
                if (confirmBtn) {
                    confirmBtn.style.display = 'none';
                }
            // 이벤트 전파 방지 설정
            const modalContentInner = document.querySelector('.modal-content-inner');
            if (modalContentInner) {
                modalContentInner.addEventListener('click', function(e) {
                    e.stopPropagation();
                });
            }
             // 모달 콘텐츠 래퍼의 크기를 조정
                        const modalContentWrapper = document.querySelector('.modal-content-wrapper');
                        if (modalContentWrapper) {
                            modalContentWrapper.style.width = '50%';
                            modalContentWrapper.style.height = '420px';
                            modalContentWrapper.style.maxWidth = '800px'; // 최대 너비 증가
                            modalContentWrapper.addEventListener('click', function (e) {
                                e.stopPropagation();
                            });
                        }


            // 그리드 컨테이너 초기화
            const container = document.getElementById('requestWorkerHotContainer');
            if (container) {
                initWorkerModalHot(container);

                // 데이터 로드
                if (requestId) {
                    loadWorkerListByRequest(requestId);
                }
            }
        },
        didClose: function() {
            document.activeElement.blur();
            currentRequestId = null;
            requestWorkerHot = null;
        }
    }).catch(function(error) {
        console.error('모달 오류:', error);
    });
}

/**
 * 작업자 목록 조회
 */
function loadWorkerListByRequest(reqId) {
    $.ajax({
        url: "/worker/getWorkerListByRequest",
        type: "GET",
        data: { requestId: reqId },
        success: function(res) {
            console.log("loadWorkerListByRequest =>", res);
            if (requestWorkerHot) {
                requestWorkerHot.resetData(res || []);

                // layout 갱신
                setTimeout(() => {
                    requestWorkerHot.refreshLayout();
                }, 0);
            }
        },
        error: function(err) {
            console.error(err);
            alert2('오류', '작업자 목록 조회 실패', 'error', '확인');
        }
    });
}

/**
 * 작업내역 모달 Grid 초기화
 */
function initDetailModalHot(container) {
    // 복합헤더: START / END
    const detailComplexColumns = [
        {
            header: "START",
            name: "startGroup",
            childNames: [
                "startAssetId", "startConfigId", "startLocation", "startEqpName", "startPort"
            ]
        },
        {
            header: "END",
            name: "endGroup",
            childNames: [
                "endAssetId", "endConfigId", "endLocation", "endEqpName", "endPort"
            ]
        }
    ];

    const detailColumns = [
        {
            header: "No.",
            name: "rowNum",
            width: 50,
            align: "center",
            hidden: true
        },

        // START cols
        { header: "자산ID", name: "startAssetId", align: "center" },
        { header: "구성ID", name: "startConfigId", align: "center" },
        { header: "좌표", name: "startLocation", align: "center", width: 80 },
        { header: "업무명", name: "startEqpName", align: "center" },
        { header: "포트", name: "startPort", align: "center", width: 80 },

        // END cols
        { header: "자산ID", name: "endAssetId", align: "center"},
        { header: "구성ID", name: "endConfigId", align: "center"},
        { header: "좌표", name: "endLocation", align: "center", width: 80 },
        { header: "업무명", name: "endEqpName", align: "center"},
        { header: "포트", name: "endPort", align: "center", width: 80 },

        { header: "타입", name: "cableType", align: "center", width: 80 },
        { header: "색상", name: "cableColor", align: "center", width: 80 },
        { header: "길이", name: "cableLength", align: "center", width: 80 },
        {
            header: "손실시험성적서",
            name: "examBtn",
            align: "center",
            formatter: () => `<button type="button" class="btn btn-sm btn-secondary btn-xs-exam">손실시험성적서</button>`
        }
    ];

    requestDetailHot = new tui.Grid({
        el: container,
        data: [],
        columns: detailColumns,
        header: {
            height: 65,
            complexColumns: detailComplexColumns
        },
        scrollX: true,
        scrollY: true,
        bodyHeight: 240,
        columnOptions: { resizable: true }
    });

    // 손실시험성적서 버튼 클릭 이벤트
    requestDetailHot.on('click', (ev) => {
        if (ev.targetType === 'cell' && ev.columnName === 'examBtn') {
            const rowData = requestDetailHot.getRow(ev.rowKey);
            const workDetailId = rowData.WORK_DETAIL_ID;
            openLossTestModal(workDetailId);
        }
    });
}

/**
 * 작업내역 모달 열기 - modalManager 사용
 */
function openDetailModal(requestId) {
    currentRequestIdForDetail = requestId;

    // 모달 컨텐츠 HTML
    const modalHtml = `
        <div class="modal-content-inner" style="width: 100%; max-width: 100%; margin: 0 auto; position: relative; padding: 15px;">
            <div id="requestDetailHotContainer" class="custom-modal-grid-container"></div>
        </div>
    `;

    modalManager.show({
        title: '작업내역',
        html: modalHtml,
        icon: 'info',
            showConfirmButton: true,  // 버튼은 생성하되
               confirmButtonText: '',// 확인 버튼 숨기기
            showCancelButton: true,
            cancelButtonText: '닫기',
     /*   showCancelButton: true,
                cancelButtonText: '닫기',*/
        allowOutsideClick: false,
        didOpen: function() {

          // 확인 버튼을 CSS로 숨김
                        const confirmBtn = document.getElementById("custom-modal-confirm");
                        if (confirmBtn) {
                            confirmBtn.style.display = 'none';
                        }
            // 이벤트 전파 방지 설정
            const modalContentInner = document.querySelector('.modal-content-inner');
            if (modalContentInner) {
                modalContentInner.addEventListener('click', function(e) {
                    e.stopPropagation();
                });
            }

             // 모달 콘텐츠 래퍼의 크기를 조정
                        const modalContentWrapper = document.querySelector('.modal-content-wrapper');
                        if (modalContentWrapper) {
                            modalContentWrapper.style.width = '90%';
                            modalContentWrapper.style.height = '450px';
                            modalContentWrapper.style.maxWidth = '1430px'; // 최대 너비 증가
                            modalContentWrapper.addEventListener('click', function (e) {
                                e.stopPropagation();
                            });
                        }


            // 그리드 컨테이너 초기화
            const container = document.getElementById('requestDetailHotContainer');
            if (container) {
                initDetailModalHot(container);

                // 데이터 로드
                if (requestId) {
                    loadWorkDetailListByRequest(requestId);
                }
            }
        },
        didClose: function() {
            currentRequestIdForDetail = null;
            requestDetailHot = null;
        }
    }).catch(function(error) {
        console.error('모달 오류:', error);
    });
}

/**
 * 작업내역 목록 조회
 */
function loadWorkDetailListByRequest(reqId) {
    $.ajax({
        url: "/cable/manage/getWorkDetailList",
        type: "GET",
        data: { requestId: reqId },
        success: function(res) {
            console.log("loadWorkDetailListByRequest =>", res);
            if (requestDetailHot) {
                requestDetailHot.resetData(res || []);

                // layout 갱신
                setTimeout(() => {
                    requestDetailHot.refreshLayout();
                }, 0);
            }
        },
        error: function(err) {
            console.error(err);
            alert2('오류', '작업내역 목록 조회 실패', 'error', '확인');
        }
    });
}

/**
 * 파일첨부 모달 열기 함수 - modalManager 사용
 */
function openLossTestModal(workDetailId) {
    // 모달 컨텐츠 HTML
    const modalHtml = `
        <div class="modal-content-inner" style="width: 100%; max-width: 100%; margin: 0 auto; position: relative; padding: 15px;">
            <!-- workDetailId를 hidden으로 보관 -->
            <input type="hidden" id="lossTestWorkDetailId" value="${workDetailId}" />

            <!-- 파일 드래그 & 드롭 영역 (평소에는 보이지 않음) -->
            <div id="dropArea" class="d-none mb-3 py-4 bg-light rounded-3 border border-dashed border-primary text-center">
                <div class="py-2">
                    <i class="bi bi-cloud-arrow-up fs-1 text-primary mb-2"></i>
                    <p class="mb-0 text-muted small">파일을 여기에 드래그하거나 클릭하여 업로드하세요</p>
                    <small class="text-muted d-block mt-1">지원 파일 형식: PDF, JPG, JPEG, PNG, ZIP</small>
                </div>
            </div>

            <!-- 업로드 상태 정보 영역 -->
            <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="d-flex align-items-center">
                    <button type="button" class="custom-btn custom-blue-btn" id="addFileBtn">
                        <img src='/images/icon/etc/plus.svg' alt='추가' class='btn-icon btn-icon-small'>파일추가
                    </button>
                    <button type="button" class="custom-btn custom-blue-btn" id="downloadSelectedBtn">
                        <img src='/images/icon/btn/download.svg' alt='다운로드' class='btn-icon btn-icon-small'>다운로드
                    </button>
                    <button type="button" class="custom-btn custom-gray-btn" id="deleteFileBtn">
                        <img src='/images/icon/etc/delete.svg' alt='삭제' class='btn-icon btn-icon-small'>삭제
                    </button>
                </div>
                <div id="fileInfoDisplay" class="badge bg-primary py-1 px-2 rounded-pill small">
                    일반 0.0MB/10.0MB (0개/7개)
                </div>
            </div>

            <!-- 파일 리스트 테이블 -->
            <div class="table-responsive rounded-3 border">
                <table class="table table-hover mb-0 small">
                    <thead class="table-light">
                    <tr>
                        <th style="width: 40px;" class="text-center">
                            <div class="form-check form-check-sm">
                                <input type="checkbox" class="form-check-input" id="selectAllFiles">
                            </div>
                        </th>
                        <th>파일명</th>
                        <th style="width: 100px;" class="text-center">상태</th>
                        <th style="width: 80px;" class="text-end">용량</th>
                    </tr>
                    </thead>
                    <tbody id="fileListContainer" class="border-top-0">
                    <!-- 파일 리스트가 여기에 동적으로 추가됨 -->
                    </tbody>
                </table>
            </div>

            <!-- 파일 없을 때 표시할 메시지 -->
            <div id="emptyFileList" class="text-center py-4 d-none">
                <i class="bi bi-file-earmark-x text-muted fs-1"></i>
                <p class="text-muted mt-2 small">'파일 추가' 버튼을 클릭하여 파일을 업로드하세요.</p>
            </div>

            <!-- Dropzone 영역 (숨겨둠) -->
            <form id="lossTestDropzone" class="dropzone d-none">
                <div class="dz-default dz-message">
                    파일을 드래그하거나 클릭하세요.
                </div>
            </form>
        </div>
    `;

    modalManager.show({
        title: '손실시험성적서 파일관리',
        html: modalHtml,
        icon: 'info',
        showConfirmButton: false,
        showCloseButton: true,
        allowOutsideClick: false,
        didOpen: function() {
            // 이벤트 전파 방지 설정
            const modalContentInner = document.querySelector('.modal-content-inner');
            if (modalContentInner) {
                modalContentInner.addEventListener('click', function(e) {
                    e.stopPropagation();
                });
            }

            // 모달 초기화 후 파일 목록 로드
            initLossTestDropzone();

            // 기존 파일 목록 로드
            loadExistingFiles(workDetailId);

            // 이벤트 핸들러 등록
            setupLossTestModalEvents();
        },
        didClose: function() {
            // Dropzone 인스턴스 정리
            if (lossTestDropzone) {
                lossTestDropzone.destroy();
                lossTestDropzone = null;
            }

            // 초기화
            totalSize = 0;
            fileCount = 0;
        }
    }).catch(function(error) {
        console.error('모달 오류:', error);
    });
}

/**
 * 손실시험 모달의 Dropzone 초기화
 */
function initLossTestDropzone() {
    if (lossTestDropzone) return;

    // Dropzone 생성
    lossTestDropzone = new Dropzone("#lossTestDropzone", {
        url: "/cable/file/upload",
        paramName: "files",
        method: "post",
        maxFilesize: 20,
        maxFiles: MAX_FILE_COUNT,
        uploadMultiple: false,
        parallelUploads: MAX_FILE_COUNT,
        autoProcessQueue: true,
        createImageThumbnails: false,
        acceptedFiles: ".pdf,.jpg,.jpeg,.png,.zip",
        init: function() {
            // 파일 추가 이벤트
            this.on("addedfile", function(file) {
                // 파일이 추가될 때 테이블에 행 추가
                const fileRow = document.createElement('tr');
                fileRow.classList.add('file-row', 'fade-in');  // 애니메이션 효과 추가

                fileRow.innerHTML = `
                    <td class="text-center align-middle">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input file-select-check" data-file-id="${file.upload.uuid}">
                        </div>
                    </td>
                    <td class="align-middle">
                        <div class="d-flex align-items-center">
                            <i class="${getFileIcon(file.type)} fs-4 me-2"></i>
                            <span class="text-truncate" style="max-width: 350px;" title="${file.name}">${file.name}</span>
                        </div>
                    </td>
                    <td class="text-center align-middle">
                        <span class="badge bg-secondary">대기</span>
                    </td>
                    <td class="text-end align-middle fw-bold">${(file.size / (1024 * 1024)).toFixed(1)} MB</td>
                `;

                document.getElementById('fileListContainer').appendChild(fileRow);

                // 파일 정보 업데이트
                totalSize += file.size;
                fileCount++;
                updateFileInfo();
            });

            // 파일 전송 이벤트
            this.on("sending", function(file, xhr, formData) {
                const detailId = document.getElementById("lossTestWorkDetailId").value;
                formData.append("workDetailId", detailId);

                // 상태 업데이트
                const fileRows = document.querySelectorAll(`[data-file-id="${file.upload.uuid}"]`);
                if (fileRows.length > 0) {
                    const row = fileRows[0].closest('tr');
                    const statusCell = row.querySelector('td:nth-child(3)');
                    statusCell.innerHTML = '<span class="badge bg-info">업로드 중</span>';
                }
            });

            // 업로드 성공 이벤트
            this.on("success", function(file, response) {
                // 상태 업데이트
                const fileRows = document.querySelectorAll(`[data-file-id="${file.upload.uuid}"]`);
                if (fileRows.length > 0) {
                    const row = fileRows[0].closest('tr');
                    const statusCell = row.querySelector('td:nth-child(3)');
                    statusCell.innerHTML = '<span class="badge bg-success">완료</span>';
                }
            });

            // 업로드 오류 이벤트
            this.on("error", function(file, errorMessage) {
                console.error("에러:", errorMessage);
                // 상태 업데이트
                const fileRows = document.querySelectorAll(`[data-file-id="${file.upload.uuid}"]`);
                if (fileRows.length > 0) {
                    const row = fileRows[0].closest('tr');
                    const statusCell = row.querySelector('td:nth-child(3)');
                    statusCell.innerHTML = '<span class="badge bg-danger">오류</span>';

                    // 툴팁으로 오류 메시지 표시
                    const errorSpan = statusCell.querySelector('span');
                    errorSpan.setAttribute('title', errorMessage || '업로드 오류');
                    errorSpan.setAttribute('data-bs-toggle', 'tooltip');
                    errorSpan.setAttribute('data-bs-placement', 'top');

                    // Bootstrap 툴팁 초기화
                    new bootstrap.Tooltip(errorSpan);
                }
            });

            // 파일 제거 이벤트
            this.on("removedfile", function(file) {
                // 파일이 제거될 때 테이블에서 행 제거
                const fileRows = document.querySelectorAll(`[data-file-id="${file.upload.uuid}"]`);
                if (fileRows.length > 0) {
                    fileRows[0].closest('tr').remove();
                }

                // 파일 정보 업데이트
                totalSize -= file.size;
                fileCount--;
                updateFileInfo();
            });
        }
    });
}

/**
 * 손실시험 모달의 이벤트 핸들러 등록
 */
function setupLossTestModalEvents() {
    // 파일 추가 버튼 이벤트
    document.getElementById('addFileBtn').addEventListener('click', function() {
        document.querySelector('#lossTestDropzone').click();
    });

    // 다운로드 버튼 이벤트
    document.getElementById('downloadSelectedBtn').addEventListener('click', function() {
        downloadSelectedFiles();
    });

    // 삭제 버튼 이벤트 핸들러
    document.getElementById('deleteFileBtn').addEventListener('click', function() {
        // Dropzone 파일 삭제
        const selectedDropzoneFiles = document.querySelectorAll('.file-select-check:checked');
        selectedDropzoneFiles.forEach(checkbox => {
            const fileId = checkbox.getAttribute('data-file-id');
            lossTestDropzone.files.forEach(file => {
                if (file.upload.uuid === fileId) {
                    lossTestDropzone.removeFile(file);
                }
            });
        });

        // DB 파일 삭제
        const selectedDbFiles = document.querySelectorAll('.file-db-check:checked');
        if (selectedDbFiles.length > 0) {
            if (confirm('선택한 파일을 삭제하시겠습니까?')) {
                const fileIds = Array.from(selectedDbFiles).map(checkbox =>
                    checkbox.getAttribute('data-file-db-id')
                );

                // 서버에 삭제 요청
                deleteFiles(fileIds);
            }
        }
    });

    // 전체 선택 체크박스 이벤트
    document.getElementById('selectAllFiles').addEventListener('change', function() {
        const isChecked = this.checked;
        // Dropzone 파일 체크박스
        document.querySelectorAll('.file-select-check').forEach(checkbox => {
            checkbox.checked = isChecked;
        });
        // DB 파일 체크박스
        document.querySelectorAll('.file-db-check').forEach(checkbox => {
            checkbox.checked = isChecked;
        });
    });
}

/**
 * 파일 타입에 따른 아이콘 선택
 */
function getFileIcon(fileType) {
    if (!fileType) return 'bi-file-earmark text-secondary';

    if (fileType.includes('zip') || fileType.includes('compressed')) {
        return 'bi-file-earmark-zip text-warning';
    } else if (fileType.includes('pdf')) {
        return 'bi-file-earmark-pdf text-danger';
    } else if (fileType.includes('image')) {
        return 'bi-file-earmark-image text-success';
    } else if (fileType.includes('excel') || fileType.includes('sheet')) {
        return 'bi-file-earmark-excel text-success';
    } else if (fileType.includes('word')) {
        return 'bi-file-earmark-word text-primary';
    } else {
        return 'bi-file-earmark text-secondary';
    }
}

/**
 * 기존 파일 정보 조회 및 표시
 */
async function loadExistingFiles(workDetailId) {
    try {
        // 기존 파일 목록 초기화
        const fileContainer = document.getElementById('fileListContainer');
        fileContainer.innerHTML = '';
        totalSize = 0;
        fileCount = 0;

        // 로딩 메시지 표시
        const emptyFileList = document.getElementById('emptyFileList');
        if (emptyFileList) {
            emptyFileList.innerHTML = '<div class="spinner-border text-primary" role="status"></div><p class="text-muted mt-3">파일 정보가 없습니다.</p>';
            emptyFileList.classList.remove('d-none');
        }

        // 서버에서 파일 목록 조회
        const response = await fetch(`/cable/file/list/${workDetailId}`);
        if (!response.ok) {
            throw new Error('파일 목록 조회 실패');
        }

        const files = await response.json();

        // 파일 목록 표시
        files.forEach(file => {
            const fileRow = document.createElement('tr');
            fileRow.setAttribute('data-file-db-id', file.fileId);
            fileRow.classList.add('file-row');

            // 파일 크기를 MB 단위로 변환
            const fileSizeMB = (file.fileSize / (1024 * 1024)).toFixed(1);

            fileRow.innerHTML = `
                <td class="text-center align-middle">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input file-db-check" data-file-db-id="${file.fileId}" data-file-name="${file.orgFileName}">
                    </div>
                </td>
                <td class="align-middle">
                    <div class="d-flex align-items-center">
                        <i class="${getFileIcon(file.fileType)} fs-4 me-2"></i>
                        <span class="text-truncate" style="max-width: 350px;" title="${file.orgFileName}">${file.orgFileName}</span>
                    </div>
                </td>
                <td class="text-center align-middle">
                    <span class="badge bg-success">완료</span>
                </td>
                <td class="text-end align-middle fw-bold">${fileSizeMB} MB</td>
            `;

            fileContainer.appendChild(fileRow);

            // 파일 정보 업데이트
            totalSize += file.fileSize;
            fileCount++;
        });

        // 파일 정보 표시 업데이트
        updateFileInfo();

    } catch (error) {
        console.error('파일 목록 조회 오류:', error);
        // 오류 메시지 표시
        const emptyFileList = document.getElementById('emptyFileList');
        if (emptyFileList) {
            emptyFileList.innerHTML = '<i class="bi bi-exclamation-circle text-danger display-4"></i><p class="text-danger mt-3">파일 목록을 불러오는 중 오류가 발생했습니다.</p>';
            emptyFileList.classList.remove('d-none');
        }
    }
}

/**
 * 파일 정보 업데이트
 */
function updateFileInfo() {
    const sizeMB = (totalSize / (1024 * 1024)).toFixed(1);
    const maxSizeMB = (MAX_TOTAL_SIZE / (1024 * 1024)).toFixed(1);
    const infoElement = document.getElementById('fileInfoDisplay');

    if (infoElement) {
        infoElement.textContent = `일반 ${sizeMB}MB/${maxSizeMB}MB (${fileCount}개/${MAX_FILE_COUNT}개)`;

        // 용량 상태에 따라 배지 색상 변경
        const usagePercent = (totalSize / MAX_TOTAL_SIZE) * 100;
        if (usagePercent > 90) {
            infoElement.className = 'badge bg-danger py-2 px-3 rounded-pill';
        } else if (usagePercent > 70) {
            infoElement.className = 'badge bg-warning py-2 px-3 rounded-pill';
        } else {
            infoElement.className = 'badge bg-primary py-2 px-3 rounded-pill';
        }
    }

    // 파일 유무에 따라 빈 메시지 표시/숨김
    const emptyFileList = document.getElementById('emptyFileList');
    const fileListTable = document.querySelector('.table-responsive');

    if (fileCount === 0) {
        if (emptyFileList) emptyFileList.classList.remove('d-none');
        if (fileListTable) fileListTable.classList.add('d-none');
    } else {
        if (emptyFileList) emptyFileList.classList.add('d-none');
        if (fileListTable) fileListTable.classList.remove('d-none');
    }
}

/**
 * 선택된 파일 일괄 다운로드
 */
function downloadSelectedFiles() {
    const selectedFiles = document.querySelectorAll('.file-db-check:checked, .file-select-check:checked');
    if (selectedFiles.length === 0) {
        alert2('알림', '다운로드할 파일을 선택해주세요.', 'info', '확인');
        return;
    }

    // 선택된 파일 순회
    selectedFiles.forEach(checkbox => {
        let fileId, fileName;

        // DB에서 가져온 파일인지 확인
        if (checkbox.classList.contains('file-db-check')) {
            fileId = checkbox.getAttribute('data-file-db-id');
            fileName = checkbox.getAttribute('data-file-name');
            downloadFile(fileId, fileName);
        }
        // Dropzone으로 새로 업로드한 파일인지 확인 (서버에 저장된 경우에만)
        else if (checkbox.classList.contains('file-select-check')) {
            const row = checkbox.closest('tr');
            const statusCell = row.querySelector('td:nth-child(3)');

            // 업로드가 완료된 파일만 다운로드
            if (statusCell.textContent.trim() === '완료') {
                const uploadId = checkbox.getAttribute('data-file-id');

                // Dropzone 파일 객체에서 서버 응답 확인
                lossTestDropzone.files.forEach(file => {
                    if (file.upload.uuid === uploadId && file.xhr && file.xhr.response) {
                        try {
                            // 서버 응답에서 파일 ID 추출
                            const response = JSON.parse(file.xhr.response);
                            if (response.fileId) {
                                downloadFile(response.fileId, file.name);
                            }
                        } catch (e) {
                            console.error('파일 응답 파싱 오류:', e);
                        }
                    }
                });
            } else {
                console.log('업로드가 완료되지 않은 파일은 다운로드할 수 없습니다.');
            }
        }
    });
}

/**
 * 단일 파일 다운로드
 */
function downloadFile(fileId, fileName) {
    const downloadUrl = `/cable/file/download/${fileId}`;

    // 다운로드 링크 생성 및 클릭
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName || '다운로드파일';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * 파일 삭제 API 호출
 */
async function deleteFiles(fileIds) {
    try {
        const response = await fetch('/cable/file/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fileIds: fileIds })
        });

        if (!response.ok) {
            throw new Error('파일 삭제 실패');
        }

        // 삭제 성공 시 화면에서 제거
        fileIds.forEach(fileId => {
            const fileRow = document.querySelector(`[data-file-db-id="${fileId}"]`);
            if (fileRow) {
                // 파일 크기 정보 업데이트
                const fileSizeText = fileRow.querySelector('td:nth-child(4)').textContent;
                const fileSize = parseFloat(fileSizeText) * 1024 * 1024;

                totalSize -= fileSize;
                fileCount--;

                // 행 제거
                fileRow.remove();
            }
        });

        // 파일 정보 업데이트
        updateFileInfo();

        // 성공 메시지
        alert2('알림', '파일이 성공적으로 삭제되었습니다.', 'success', '확인');

    } catch (error) {
        console.error('파일 삭제 오류:', error);
        alert2('오류', '파일 삭제 중 오류가 발생했습니다.', 'error', '확인');
    }
}

/**
 * 검색 실행
 */
function doSearch() {
    let param = {
        orgName: $("#searchOrgName").val(),
        requestType: $("#searchRequestType").val(),
        approvalStatus: $("#searchApprovalStatus").val()
    };

    // grid 업데이트
    gridManager.updateGrid("requestListHot", param);
    updateCurrentTime();
}

/**
 * 체크된 requestId 목록 반환
 */
function getSelectedIds() {
    const checkedRows = gridManager.getCheckedRows("requestListHot");
    let selected = [];
    checkedRows.forEach(row => {
        if (row.requestId) {
            selected.push(row.requestId);
        }
    });
    return selected;
}

/**
 * 체크된 requestId 목록 + rowData 반환
 */
function getCheckedRowsData() {
    return gridManager.getCheckedRows("requestListHot");
}

/**
 * 승인 처리
 */
function approveRequests() {
    const checkedRows = getCheckedRowsData();
    if (!checkedRows || checkedRows.length === 0) {
        alert2("알림", "선택된 항목이 없습니다.", "warning", "확인");
        return;
    }

    // 이미 승인된 항목은 걸러내기
    for (let row of checkedRows) {
        if (row.approvalStatus !== '대기') {
            alert2("알림", "대기상태가 아니면 승인할 수 없습니다.", "warning", "확인");
            return;
        }
    }

    // 확인 메시지
    modalManager.show({
        title: "알림",
        html: "승인 하시겠습니까? 승인후 선번장 관리에 반영됩니다.",
        icon: "warning",
        confirmButtonText: "승인",
        showCancelButton: true,
        cancelButtonText: "취소",
        callback: function() {
            $.ajax({
                url: "/cable/manage/approve",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    requestList: checkedRows,
                    loginUserId: "admin"
                }),
                success: function(res) {
                    if (res.result === "SUCCESS") {
                        alert2("알림", "승인 처리 완료", "success", "확인", function() {
                            // 확인 버튼 클릭 후 페이지 리프레시
                            window.location.reload();
                        });
                    } else {
                        alert2("오류", "오류 발생: " + (res.message || "알 수 없는 오류"), "error", "확인");
                    }
                },
                error: function(err) {
                    console.error(err);
                    alert2("오류", "승인처리 중 오류가 발생했습니다.", "error", "확인");
                }
            });
        }
    });
}

/**
 * 반려 처리
 */
function rejectRequests() {
    let idList = getSelectedIds();
    if (idList.length === 0) {
        alert2("알림", "선택된 항목이 없습니다.", "info", "확인");
        return;
    }

    // 승인 상태 확인
    const checkedRows = getCheckedRowsData();
    for (let row of checkedRows) {
        if (row.approvalStatus !== '대기') {
            alert2("알림", "대기상태가 아니면 반려할 수 없습니다.", "info", "확인");
            return;
        }
    }

    // 반려 사유 입력 모달
    modalManager.show({
        title: "반려 사유를 입력하세요",
        html: `<textarea id="rejectReason" class="form-control" placeholder="반려 사유를 입력하십시오." style="min-height: 120px;"></textarea>`,
        icon: "info",
        confirmButtonText: "반려",
        showCancelButton: true,
        cancelButtonText: "취소",
        preConfirm: () => {
            const reason = document.getElementById('rejectReason').value;
            if (!reason || reason.trim() === '') {
                modalManager.showValidationMessage('반려 사유를 입력해야 합니다.');
                return false;
            }
            return reason;
        },
        callback: function() {
            const reason = document.getElementById('rejectReason').value;

            $.ajax({
                url: "/cable/manage/reject",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    requestIdList: idList,
                    reason: reason,
                    loginUserId: regId
                }),
                success: function(res) {
                    if (!res.errorCode) {
                        alert2("알림", "반려처리 중 오류가 발생했습니다.", "info", "확인");
                        return false;
                    }
                    alert2("알림", "반려완료", "info", "확인", doSearch);
                },
                error: function(err) {
                    alert2("알림", "반려처리 중 오류가 발생했습니다.", "info", "확인");
                }
            });
        }
    });
}

/**
 * 삭제 처리
 */
function deleteRequests() {
    let idList = getSelectedIds();
    if (idList.length === 0) {
        alert2("알림", "선택된 항목이 없습니다.", "info", "확인");
        return;
    }

    modalManager.show({
        title: "알림",
        html: "선택된 항목을 삭제하시겠습니까?",
        icon: "warning",
        confirmButtonText: "삭제",
        showCancelButton: true,
        cancelButtonText: "취소",
        callback: function() {
            $.ajax({
                url: "/cable/manage/delete",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    requestIdList: idList,
                    loginUserId: "adminUser"
                }),
                success: function(res) {
                    if (res.result === "SUCCESS") {
                        alert2("알림", "삭제 처리 완료", "success", "확인");
                        doSearch();
                    } else {
                        alert2("오류", "오류 발생", "error", "확인");
                    }
                }
            });
        }
    });
}

/**
 * 시간표시 업데이트
 */
function updateCurrentTime() {
    let now = new Date();
    let formatted = now.getFullYear() + "-"
        + String(now.getMonth() + 1).padStart(2, '0') + "-"
        + String(now.getDate()).padStart(2, '0') + " "
        + String(now.getHours()).padStart(2, '0') + ":"
        + String(now.getMinutes()).padStart(2, '0') + ":"
        + String(now.getSeconds()).padStart(2, '0');
    $("#currentTime").text(formatted);
}

/**
 * 접이식 검색조건 토글
 */
function toggleFold() {
    $("#foldableArea").toggle();
}

/**
 * 엑셀 내보내기 함수
 */
function exportExcel() {
    fetch('/cable/manage/exportExcel', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cableManageListTemplate.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
    })
    .catch(error => {
        console.error('엑셀 파일 다운로드 중 오류 발생:', error);
        alert2("오류", "엑셀 파일 다운로드 중 오류가 발생했습니다.", "error", "확인");
    });
}