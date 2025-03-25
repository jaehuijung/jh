/**
 * modalWorkerHot.js
 * 작업자 검색 및 관리를 위한 모달 인터페이스
 *
 * 주 기능
 * 1. 작업자 검색(회사명, 직책, 성명, 연락처)
 * 2. 작업자 리스트에서 선택하여 삭제 및 추가
 * 3. 새로운 작업자를 등록
 */

// 전역 그리드 인스턴스
let modalHot = null;

// 문서 로드가 완료되면, 작업자 검색 모달 오픈 버튼에 이벤트를 바인딩합니다.
$(document).ready(function () {
    $('#btnOpenWorkerModal').off('click').on('click', openWorkerModal);
});

/**
 * 작업자 검색 모달 열기
 * - 모달 HTML을 생성하고, modalManager.show를 통해 모달을 표시합니다.
 * - 모달이 열리고 나면 그리드 초기화와 이벤트 핸들러 세팅을 진행합니다.
 */
function openWorkerModal() {
    // 모달 HTML 구조
    const modalHtml = `
        <div class="modal-content-inner" style="width: 100%; max-width: 100%; margin: 0 auto; position: relative; padding: 15px;">
            <!-- 검색 영역 -->
            <div class="d-flex flex-row justify-content-between align-items-center mb-3">
                <div class="flex-grow-1">
                    <table class="table-hover-delete w-100">
                        <tbody>
                        <tr>
                            <td class="custom-tb-title" style="padding:0 15px;"><label class="custom-tb-title-text">회사명</label></td>
                            <td class="custom-tb-content"><input type="text" id="searchCompanyName" class="custom-input" /></td>
                            <td class="custom-tb-title" style="padding:0 15px;"><label class="custom-tb-title-text">직책</label></td>
                            <td class="custom-tb-content"><input type="text" id="searchJobTitle" class="custom-input" /></td>
                            <td class="custom-tb-title" style="padding:0 15px;"><label class="custom-tb-title-text">성명</label></td>
                            <td class="custom-tb-content"><input type="text" id="searchWorkerName" class="custom-input" /></td>
                            <td class="custom-tb-title" style="padding:0 15px;"><label class="custom-tb-title-text">연락처</label></td>
                            <td class="custom-tb-content"><input type="text" id="searchContact" class="custom-input" /></td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <div class="ms-3">
                    <button type="button" class="custom-btn custom-blue-btn" id="btnSearchWorker">
                        <img src='/images/icon/btn/search.svg' alt='검색' class='btn-icon btn-icon-small'> 검색
                    </button>
                </div>
            </div>

            <hr/>

            <!-- 작업 버튼 영역 -->
            <div class="d-flex flex-row justify-content-end mb-2">
                <button type="button" class="custom-btn custom-blue-btn me-2" id="btnAddSelected">
                    <img src='/images/icon/etc/plus.svg' alt='추가' class='btn-icon btn-icon-small'>리스트 추가
                </button>
                <button type="button" class="custom-btn custom-blue-btn" id="btnDeleteSelected">
                    <img src='/images/icon/etc/delete.svg' alt='삭제' class='btn-icon'>작업자 삭제
                </button>
            </div>

            <!-- 그리드 영역 -->
            <div id="workerModalHot" class="custom-modal-grid-container"></div>

            <!-- 로딩 인디케이터 -->
            <div id="workerModalLoading" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                 background-color: rgba(255,255,255,0.7); align-items: center; justify-content: center; z-index: 2000;">
                <div style="text-align: center;">
                    <img src="/images/loading.gif" alt="Loading" style="width: 50px; height: 50px;" />
                    <p style="margin-top: 10px; font-weight: bold;">로딩 중...</p>
                </div>
            </div>

            <hr/>

            <!-- 작업자 등록 영역 -->
            <p style="margin:0;padding:10px 0">작업자 등록</p>
            <div class="tbl-bootstrap-wrap custom-border-top-solid">
                <table class="table-hover-delete w-100">
                    <tbody>
                    <tr>
                        <td class="custom-tb-title"><label class="custom-tb-title-text">회사명</label></td>
                        <td class="custom-tb-content"><input type="text" id="newCompanyName" class="custom-input" /></td>
                        <td class="custom-tb-title"><label class="custom-tb-title-text">직책</label></td>
                        <td class="custom-tb-content"><input type="text" id="newJobTitle" class="custom-input" /></td>
                    </tr>
                    <tr>
                        <td class="custom-tb-title"><label class="custom-tb-title-text">성명</label></td>
                        <td class="custom-tb-content"><input type="text" id="newWorkerName" class="custom-input" /></td>
                        <td class="custom-tb-title"><label class="custom-tb-title-text">연락처</label></td>
                        <td class="custom-tb-content"><input type="text" id="newContact" class="custom-input" /></td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <!-- 등록 버튼 -->
            <div class="d-flex justify-content-end mt-3">
                <button type="button" class="custom-btn custom-blue-btn" id="btnCreateWorker">
                    <img src='/images/icon/etc/register.svg' alt='등록' class='btn-icon btn-icon-small'>작업자 등록
                </button>
            </div>
        </div>
    `;

    // 모달 표시
    modalManager.show({
        title: '작업자 검색',
        html: modalHtml,
        icon: 'info',
        showConfirmButton: false,
        showCloseButton: true,
        allowOutsideClick: false,
        didOpen: function () {
            // 이벤트 전파 방지 설정
            const modalContentInner = document.querySelector('.modal-content-inner');
            if (modalContentInner) {
                modalContentInner.addEventListener('click', function (e) {
                    e.stopPropagation();
                });
            }

            // 그리드 초기화 및 이벤트 핸들러 설정
            setTimeout(function () {
                try {
                    initModalHot();
                    setupEventHandlers();
                } catch (error) {
                    console.error('모달 초기화 중 오류:', error);
                }
            }, 200);
        },
        didClose: function () {
            modalHot = null;
        }
    }).catch(function (error) {
        console.error('모달 오류:', error);
    });
}

/**
 * 로딩 인디케이터를 표시합니다.
 */
function showLoading() {
    const loadingDiv = document.getElementById('workerModalLoading');
    if (loadingDiv) {
        loadingDiv.style.display = 'flex';
    }
}

/**
 * 로딩 인디케이터를 숨깁니다.
 */
function hideLoading() {
    const loadingDiv = document.getElementById('workerModalLoading');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
}

/**
 * 그리드를 초기화하고, 작업자 목록을 불러옵니다.
 * - TOAST UI 그리드 생성 후 데이터를 불러옵니다.
 */
function initModalHot() {
    try {
        const container = document.getElementById('workerModalHot');
        if (!container) {
            console.error('workerModalHot 요소를 찾을 수 없습니다');
            return;
        }

        // 초기 그리드 생성
        modalHot = new tui.Grid({
            el: container,
            data: [],
            scrollX: true,
            scrollY: true,
            bodyHeight: 250,
            rowHeaders: ['checkbox'],
            columns: [
                { header: '회사명', name: 'companyName', align: 'center' },
                { header: '직책', name: 'jobTitle', align: 'center' },
                { header: '성명', name: 'workerName', align: 'center' },
                { header: '연락처', name: 'contact', align: 'center' }
            ],
            columnOptions: { resizable: true }
        });

        // 모든 작업자 데이터를 로드합니다.
        loadAllWorkers();
    } catch (error) {
        console.error('그리드 초기화 오류:', error);
        alert2('오류', '그리드 초기화 중 오류가 발생했습니다', 'error', '확인');
    }
}

/**
 * 이벤트 핸들러를 등록합니다.
 * - 검색, 등록, 삭제, 선택 추가 등의 버튼 클릭 시 동작을 제어합니다.
 */
function setupEventHandlers() {
    // 이벤트 핸들러 공통 설정 함수
    function setupButtonHandler(selector, handler) {
        $(selector).off('click').on('click', function (e) {
            e.stopPropagation();
            handler();
        });
    }

    // 검색 버튼
    setupButtonHandler('#btnSearchWorker', function () {
        const param = {
            companyName: $('#searchCompanyName').val(),
            jobTitle: $('#searchJobTitle').val(),
            workerName: $('#searchWorkerName').val(),
            contact: $('#searchContact').val()
        };
        loadSearchWorkers(param);
    });

    // 엔터키로 검색 실행
    $('#searchCompanyName, #searchJobTitle, #searchWorkerName, #searchContact').off('keypress').on('keypress', function (e) {
        if (e.which === 13) {
            e.stopPropagation();
            $('#btnSearchWorker').click();
        }
    });

    // 작업 버튼들
    setupButtonHandler('#btnAddSelected', addSelectedWorkersToParent);
    setupButtonHandler('#btnDeleteSelected', deleteSelectedWorkers);
    setupButtonHandler('#btnCreateWorker', createWorker);
}

/**
 * 서버에서 전달받은 작업자 데이터를 그리드에서 사용하기 위한 형태로 가공합니다.
 */
function processGridData(data) {
    return (data || []).map(function (item) {
        return {
            workerId: item.WORKER_ID,
            companyName: item.COMPANY_NAME,
            jobTitle: item.JOB_TITLE,
            workerName: item.WORKER_NAME,
            contact: item.CONTACT
        };
    });
}

/**
 * 그리드 데이터를 로드한 뒤에 실행할 후처리를 진행합니다.
 * - 이미 추가된 작업자를 체크하고, 그리드 레이아웃과 스타일을 갱신합니다.
 */
function afterDataLoad() {
    setTimeout(function () {
        checkAlreadyAdded();
        modalHot.refreshLayout();
        applyGridStyles();
    }, 0);
}

/**
 * 모든 작업자 목록을 서버에서 조회하고, 그리드에 데이터로 표시합니다.
 */
function loadAllWorkers() {
    if (!modalHot) {
        return;
    }

    showLoading();

    $.ajax({
        url: '/worker/getListAll',
        type: 'GET',
        success: function (data) {
            hideLoading();
            const list = processGridData(data);
            modalHot.resetData(list);
            afterDataLoad();
        },
        error: function (err) {
            hideLoading();
            console.error('작업자 데이터 로드 실패:', err);
            alert2('오류', '작업자 목록을 불러오는데 실패했습니다', 'error', '확인');
        }
    });
}

/**
 * 입력받은 검색 조건으로 작업자 목록을 검색하고, 그리드에 표시합니다.
 * @param {Object} param - 검색 파라미터 (회사명, 직책, 성명, 연락처)
 */
function loadSearchWorkers(param) {
    if (!modalHot) {
        return;
    }

    showLoading();

    $.ajax({
        url: '/worker/search',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(param),
        success: function (data) {
            hideLoading();
            const list = processGridData(data);
            modalHot.resetData(list);
            afterDataLoad();
        },
        error: function (err) {
            hideLoading();
            console.error('작업자 검색 실패:', err);
            alert2('오류', '작업자 검색 중 오류가 발생했습니다', 'error', '확인');
        }
    });
}

/**
 * 그리드 스타일을 강제로 적용합니다.
 * - 일부 경우 그리드가 숨겨진 상태에서 초기화되어 스타일이 깨지는 것을 방지합니다.
 */
function applyGridStyles() {
    function applyStyle(selector, styles) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(function (el) {
            Object.assign(el.style, styles);
        });
    }

    applyStyle('.tui-grid-container', { display: 'block', visibility: 'visible', opacity: '1' });
    applyStyle('.tui-grid-header-area', { display: 'block', visibility: 'visible' });
    applyStyle('.tui-grid-body-area', { display: 'block', visibility: 'visible' });
    applyStyle('.tui-grid-cell', { display: 'table-cell', visibility: 'visible' });
}

/**
 * 이미 선택된 작업자를 체크 상태로 표시합니다.
 * - 부모 창에서 선택된 작업자 ID 목록을 가져와 그리드에서 체크합니다.
 */
function checkAlreadyAdded() {
    if (!modalHot) {
        return;
    }

    // 부모 창에서 이미 선택된 작업자 ID 목록 가져오기
    const selectedWorkerIds = (typeof getSelectedWorkerIdSet === 'function')
        ? getSelectedWorkerIdSet()
        : new Set();

    if (!selectedWorkerIds) {
        return;
    }

    // 선택된 작업자를 체크
    const gridData = modalHot.getData();
    for (let i = 0; i < gridData.length; i++) {
        const row = gridData[i];
        if (row.workerId && selectedWorkerIds.has(row.workerId)) {
            modalHot.check(i);
        }
    }
}

/**
 * 선택된 작업자를 부모 페이지에 추가합니다.
 * - 체크된 행을 가져와 부모 페이지 함수(addSelectedWorkers)에 넘깁니다.
 */
function addSelectedWorkersToParent() {
    if (!modalHot) {
        return;
    }

    const checkedRows = modalHot.getCheckedRows();

    if (checkedRows.length === 0) {
        modalManager.showValidationMessage('선택된 작업자가 없습니다');
        return;
    }

    // 부모 창 함수 호출
    if (typeof window.addSelectedWorkers === 'function') {
        window.addSelectedWorkers(checkedRows);
        modalManager.close();
        alert2('알림', '선택한 작업자가 추가되었습니다', 'success', '확인');
    } else {
        console.error('부모 창의 addSelectedWorkers 함수를 찾을 수 없습니다');
        modalManager.showValidationMessage('작업자를 추가할 수 없습니다');
    }
}

/**
 * 새 작업자를 등록합니다.
 * - 등록 후에는 작업자 목록을 새로고침합니다.
 */
function createWorker() {
    const param = {
        companyName: $('#newCompanyName').val(),
        jobTitle: $('#newJobTitle').val(),
        workerName: $('#newWorkerName').val(),
        contact: $('#newContact').val()
    };

    // 필수 입력값 검증
    if (!param.workerName) {
        modalManager.showValidationMessage('성명은 필수 입력값입니다');
        return;
    }

    showLoading();

    $.ajax({
        url: '/worker/create',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(param),
        success: function (res) {
            hideLoading();

            if (res.result === 'SUCCESS') {
                alert2('알림', '작업자 등록이 완료되었습니다', 'success', '확인');

                // 입력 필드를 초기화
                $('#newCompanyName, #newJobTitle, #newWorkerName, #newContact').val('');
                modalManager.resetValidationMessage();

                // 작업자 목록 새로고침
                loadAllWorkers();
            } else {
                alert2('오류', '등록 실패: ' + (res.message || '알 수 없는 오류'), 'error', '확인');
            }
        },
        error: function (err) {
            hideLoading();
            console.error('작업자 등록 오류:', err);
            alert2('오류', '작업자 등록 중 오류가 발생했습니다', 'error', '확인');
        }
    });
}

/**
 * 선택된 작업자를 삭제합니다.
 * - 확인 모달을 띄우고, 삭제 요청 후 그리드를 갱신합니다.
 */
function deleteSelectedWorkers() {
    if (!modalHot) {
        return;
    }

    const checkedRows = modalHot.getCheckedRows();

    if (checkedRows.length === 0) {
        modalManager.showValidationMessage('삭제할 작업자를 선택해주세요');
        return;
    }

    // 삭제 확인 모달
    modalManager.show({
        title: '작업자 삭제',
        html: '선택한 작업자를 삭제하시겠습니까?',
        icon: 'warning',
        confirmButtonText: '삭제',
        showCancelButton: true,
        cancelButtonText: '취소',
        allowOutsideClick: false,
        callback: function () {
            const workerIdList = checkedRows.map(function (row) {
                return row.workerId;
            });

            showLoading();

            $.ajax({
                url: '/worker/delete',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(workerIdList),
                success: function (res) {
                    hideLoading();

                    if (res.result === 'SUCCESS') {
                        alert2('알림', '선택한 작업자가 삭제되었습니다', 'success', '확인');

                        // 그리드에서 체크된 행 제거
                        modalHot.removeCheckedRows();

                        // 그리드 레이아웃 갱신
                        setTimeout(function () {
                            modalHot.refreshLayout();
                            applyGridStyles();
                        }, 0);
                    } else {
                        alert2('오류', '삭제 실패: ' + (res.message || '알 수 없는 오류'), 'error', '확인');
                    }
                },
                error: function (err) {
                    hideLoading();
                    console.error('작업자 삭제 오류:', err);
                    alert2('오류', '작업자 삭제 중 오류가 발생했습니다', 'error', '확인');
                }
            });
        }
    });
}
