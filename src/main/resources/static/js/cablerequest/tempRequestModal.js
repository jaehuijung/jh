/**
 * tempRequestModal.js
 * - 임시저장 목록 모달
 * - tb_request_temp_save 테이블 기반: (request_id, title, reg_dt 등)
 * - 체크박스로 선택 후, "불러오기" => 부모창 폼에 매핑
 * - custom-modal.js 사용
 */

// 전역 그리드 인스턴스
let tempRequestHot = null;

// 문서 로드가 완료되면 기본 이벤트 설정
$(document).ready(function() {
    $('#btnTempLoad').off('click').on('click', openTempRequestModal);
});

/**
 * 임시저장 불러오기 모달 열기
 * - modalManager를 통해 모달 생성 및 표시
 * - 모달 내부에 그리드 초기화 및 데이터 로딩
 */
function openTempRequestModal() {
    // 모달 HTML 구조
    const modalHtml = `
        <div class="modal-content-inner" style="width: 100%; max-width: 100%; margin: 0 auto; position: relative; padding: 15px;">
            <!-- 그리드 영역 -->
            <div id="tempRequestHot" class="custom-modal-grid-container"></div>

            <!-- 로딩 인디케이터 -->
            <div id="tempRequestLoading" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                 background-color: rgba(255,255,255,0.7); align-items: center; justify-content: center; z-index: 2000;">
                <div style="text-align: center;">
                    <img src="/images/loading.gif" alt="Loading" style="width: 50px; height: 50px;" />
                    <p style="margin-top: 10px; font-weight: bold;">로딩 중...</p>
                </div>
            </div>
        </div>
    `;

    // 모달 표시
    modalManager.show({
        title: '임시저장 목록',
        html: modalHtml,
        icon: 'info',
        showConfirmButton: true,
        confirmButtonText: '불러오기',
        showCancelButton: true,
        cancelButtonText: '닫기',
        allowOutsideClick: false,
        preConfirm: function() {
            // 불러오기 버튼 클릭 시 실행
            return new Promise((resolve, reject) => {
                if (!tempRequestHot) {
                    modalManager.showValidationMessage('그리드가 초기화되지 않았습니다');
                    reject('그리드 초기화 오류');
                    return;
                }

                const checked = tempRequestHot.getCheckedRows();
                if (!checked || checked.length === 0) {
                    modalManager.showValidationMessage('선택된 항목이 없습니다');
                    reject('선택된 항목 없음');
                    return;
                }

                const row = checked[0];
                const requestId = row.requestId;
                if (!requestId) {
                    modalManager.showValidationMessage('유효하지 않은 요청입니다');
                    reject('유효하지 않은 요청');
                    return;
                }

                resolve(requestId);
            });
        },
        didOpen: function() {
            // 이벤트 전파 방지 설정
            const modalContentInner = document.querySelector('.modal-content-inner');
            if (modalContentInner) {
                modalContentInner.addEventListener('click', function(e) {
                    e.stopPropagation();
                });
            }

            // 그리드 초기화 및 데이터 로딩
            setTimeout(function() {
                try {
                    initTempRequestHot();
                    loadTempRequestList();
                } catch (error) {
                    console.error('모달 초기화 중 오류:', error);
                }
            }, 200);
        },
        didClose: function() {
            tempRequestHot = null;
        }
    }).then(function(result) {
        if (result.isConfirmed && result.value) {
            // 부모창에 불러오기
            if (typeof window.loadTempRequestData === 'function') {
                window.loadTempRequestData(result.value);
                alert2('알림', '임시저장 데이터를 불러왔습니다', 'success', '확인');
            } else {
                console.error("부모창에 loadTempRequestData 함수가 없습니다.");
                alert2('오류', '임시저장 데이터를 불러올 수 없습니다', 'error', '확인');
            }
        }
    }).catch(function(error) {
        console.error('모달 오류:', error);
    });
}

/**
 * 로딩 인디케이터를 표시합니다.
 */
function showLoading() {
    const loadingDiv = document.getElementById('tempRequestLoading');
    if (loadingDiv) {
        loadingDiv.style.display = 'flex';
    }
}

/**
 * 로딩 인디케이터를 숨깁니다.
 */
function hideLoading() {
    const loadingDiv = document.getElementById('tempRequestLoading');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
}

/**
 * 그리드를 초기화합니다.
 */
function initTempRequestHot() {
    try {
        const container = document.getElementById('tempRequestHot');
        if (!container) {
            console.error('tempRequestHot 요소를 찾을 수 없습니다');
            return;
        }

        // 초기 그리드 생성
        tempRequestHot = new tui.Grid({
            el: container,
            data: [],
            scrollX: true,
            scrollY: true,
            bodyHeight: 260,
            rowHeaders: ['checkbox'],
            columns: [
                {
                    header: "제목",
                    name: "title",
                    align: "center"
                },
                {
                    header: "등록일자",
                    name: "regDt",
                    width: 150,
                    align: "center"
                },
                {
                    header: "작성자",
                    name: "userId",
                    align: "center"
                },
                // requestId 숨김
                {
                    header: "requestId",
                    name: "requestId",
                    hidden: true
                }
            ],
            columnOptions: { resizable: true }
        });

        // 라디오 버튼처럼 동작하도록 체크박스 이벤트 설정
        tempRequestHot.on('check', (ev) => {
            const checkedRowKey = ev.rowKey;
            console.log("[SingleSelect] checked:", checkedRowKey);

            // 전체 row 개수
            const rowCount = tempRequestHot.getRowCount();

            for (let i = 0; i < rowCount; i++) {
                const row = tempRequestHot.getRowAt(i);
                const rowKey = row.rowKey;
                if (rowKey !== checkedRowKey) {
                    tempRequestHot.uncheck(rowKey);
                }
            }
        });
    } catch (error) {
        console.error('그리드 초기화 오류:', error);
        alert2('오류', '그리드 초기화 중 오류가 발생했습니다', 'error', '확인');
    }
}

/**
 * 임시저장 목록을 서버에서 조회합니다.
 */
function loadTempRequestList() {
    if (!tempRequestHot) {
        return;
    }

    showLoading();

    $.ajax({
        url: "/cable/request/getTempList",
        type: "GET",
        success: function(res) {
            hideLoading();
            tempRequestHot.resetData(res || []);
            setTimeout(function() {
                tempRequestHot.refreshLayout();
                applyGridStyles();
            }, 0);
        },
        error: function(err) {
            hideLoading();
            console.error("임시저장 목록 조회 실패:", err);
            alert2('오류', '임시저장 목록을 불러오는데 실패했습니다', 'error', '확인');
        }
    });
}

/**
 * 그리드 스타일을 강제로 적용합니다.
 */
function applyGridStyles() {
    function applyStyle(selector, styles) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(function(el) {
            Object.assign(el.style, styles);
        });
    }

    applyStyle('.tui-grid-container', { display: 'block', visibility: 'visible', opacity: '1' });
    applyStyle('.tui-grid-header-area', { display: 'block', visibility: 'visible' });
    applyStyle('.tui-grid-body-area', { display: 'block', visibility: 'visible' });
    applyStyle('.tui-grid-cell', { display: 'table-cell', visibility: 'visible' });
}

/**
 * 선택된 임시저장 항목을 불러옵니다.
 */
function loadSelectedTempRequest() {
    if (!tempRequestHot) {
        modalManager.showValidationMessage('그리드가 초기화되지 않았습니다');
        return;
    }

    const checked = tempRequestHot.getCheckedRows();
    if (!checked || checked.length === 0) {
        modalManager.showValidationMessage('선택된 항목이 없습니다');
        return;
    }

    const row = checked[0];
    const requestId = row.requestId;
    if (!requestId) {
        modalManager.showValidationMessage('유효하지 않은 요청입니다');
        return;
    }

    // 모달 닫기
    modalManager.close();

    // 부모창에 불러오기
    if (typeof window.loadTempRequestData === 'function') {
        window.loadTempRequestData(requestId);
        alert2('알림', '임시저장 데이터 불러오기 완료', 'success', '확인');
    } else {
        console.error("부모창에 loadTempRequestData 함수가 없습니다.");
        alert2('오류', '임시저장 데이터를 불러올 수 없습니다', 'error', '확인');
    }
}