/**
 * detailModalHot.js
 * - Toast UI Grid 기반 작업내역 상세 모달
 * - (A) START (출발지) Grid
 * - (B) END (목적지) Grid
 * - 체크박스 열(rowHeaders: ['checkbox'])로 행 선택
 * - "추가" 버튼 시 부모창 addDetailRows(rowObj) 호출
 */

// 전역 그리드 인스턴스
let startHot = null; // 출발지 Grid
let endHot = null; // 목적지 Grid

// 문서 로드가 완료되면, 작업내역 상세 모달 오픈 버튼에 이벤트를 바인딩합니다.
$(document).ready(function () {
    $('#btnOpenDetailModal').off('click').on('click', openDetailModal);

    // 기존 모달 이벤트도 유지 (부모창에서의 직접 호출 지원)
    setupDetailModalEvents();
});

/**
 * 기존 detailModal에 대한 이벤트 설정
 * - 부모창에서의 직접 호출 지원을 위해 유지
 */
function setupDetailModalEvents() {
    // 모달 열릴 때 이벤트
    $('#detailModal').on('shown.bs.modal', function () {
        resetDetailModal();
    });

    // 출발지 검색
    $("#btnSearchStart").on("click", function () {
        loadSearchStart();
    });

    // 목적지 검색
    $("#btnSearchEnd").on("click", function () {
        loadSearchEnd();
    });

    // "추가" 버튼 -> 부모창
    $("#btnAddDetail").on("click", function () {
        addDetailToParent();
    });

    // [1] START 영역: 검색필드에 엔터키 입력 시, 검색 버튼 클릭
    $("#startAssetIdSearch, #startConfigIdSearch").on("keypress", function (e) {
        if (e.which === 13) {
            $("#btnSearchStart").click();
        }
    });

    // [2] END 영역: 검색필드에 엔터키 입력 시, 검색 버튼 클릭
    $("#endAssetIdSearch, #endConfigIdSearch").on("keypress", function (e) {
        if (e.which === 13) {
            $("#btnSearchEnd").click();
        }
    });
}

/**
 * 모달 내용을 초기화합니다.
 * - 그리드 데이터 초기화
 * - 폼 필드 초기화
 */
function resetDetailModal() {
    if (startHot) startHot.resetData([]);
    if (endHot) endHot.resetData([]);

    $('#cableType').prop('selectedIndex', 0);  // 첫 번째 옵션 "UTP" 선택
    $('#cableColor').prop('selectedIndex', 0); // 첫 번째 옵션 "적색" 선택

    // 텍스트필드는 공백
    $('#cableLength').val('');
    $('#startLocation').val('');
    $('#endLocation').val('');
    $('#cableRemark').val('');

    $('#startAssetIdSearch').val('');
    $('#startConfigIdSearch').val('');
    $('#endAssetIdSearch').val('');
    $('#endConfigIdSearch').val('');
}

/**
 * 작업내역 상세 모달 열기
 * - 모달 HTML을 생성하고, modalManager.show를 통해 모달을 표시합니다.
 * - 모달이 열리고 나면 그리드 초기화와 이벤트 핸들러 세팅을 진행합니다.
 */

 // modalHtml 생성 부분 수정
 function getOptionsFromTemplate() {
     const typeOptionsHtml = $('#template-cable-type').html()
     const colorOptionsHtml = $('#template-cable-color').html()

     return {
         typeOptionsHtml,
         colorOptionsHtml
     };
 }

 // 모달 HTML에서:
 const options = getOptionsFromTemplate();
function openDetailModal() {
    console.log("작업내역 상세 모달 열기");

    // 모달 HTML 구조
    const modalHtml = `
        <div class="modal-content-inner" style="width: 100%; max-width: 100%; margin: 0 auto; position: relative; padding: 15px;">
            <!-- 케이블 기본 정보 영역 -->
            <div class="tbl-bootstrap-wrap custom-border-top-solid">
                <table class="table-hover-delete w-100">
                    <tbody>
                    <tr>
                        <td class="custom-tb-title">
                            <label class="custom-tb-title-text">타입</label>
                        </td>
                        <td class="custom-tb-content">
                            <select id="detailModalCableType" class="custom-select">
                                   ${options.typeOptionsHtml}
                            </select>
                        </td>
                        <td class="custom-tb-title">
                            <label class="custom-tb-title-text">색상</label>
                        </td>
                        <td class="custom-tb-content">
                            <select id="detailModalCableColor" class="custom-select">
                                   ${options.colorOptionsHtml}
                             </select>
                        </td>
                        <td class="custom-tb-title">
                            <label class="custom-tb-title-text">길이</label>
                        </td>
                        <td class="custom-tb-content">
                            <input type="text" id="detailModalCableLength" class="custom-input" />
                        </td>
                    </tr>
                    <tr>
                        <td class="custom-tb-title">
                            <label class="custom-tb-title-text">START좌표</label>
                        </td>
                        <td class="custom-tb-content">
                            <input type="text" id="detailModalStartLocation" class="custom-input" />
                        </td>
                        <td class="custom-tb-title">
                            <label class="custom-tb-title-text">END좌표</label>
                        </td>
                        <td class="custom-tb-content">
                            <input type="text" id="detailModalEndLocation" class="custom-input" />
                        </td>
                        <td class="custom-tb-title">
                            <label class="custom-tb-title-text">비고</label>
                        </td>
                        <td class="custom-tb-content">
                            <input type="text" id="detailModalCableRemark" class="custom-input" />
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <!-- START/END 검색 영역 -->
          <div class="tbl-bootstrap-wrap custom-border-top-solid" style="margin-top:10px; height:450px;overflow-x:hidden;">
              <div class="row g-3">
                  <div class="col-md-6" style="border:1px solid #ddd; padding:10px; border-radius:4px;">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                          <strong style="margin-left:10px;">START</strong>
                          <div>
                              <button type="button" class="custom-btn custom-blue-btn" id="detailModalBtnSearchStart">
                                  <img src='/images/icon/btn/search.svg' alt='검색' class='btn-icon btn-icon-small'>검색
                              </button>
                          </div>
                      </div>
                      <table class="table-hover-delete" style="margin-bottom:10px;">
                          <tbody>
                          <tr>
                              <td class="custom-tb-title">
                                  <label class="custom-tb-title-text">자산ID</label>
                              </td>
                              <td class="custom-tb-content">
                                  <input type="text" id="detailModalStartAssetIdSearch" class="custom-input" />
                              </td>
                              <td class="custom-tb-title">
                                  <label class="custom-tb-title-text">구성ID</label>
                              </td>
                              <td class="custom-tb-content">
                                  <input type="text" id="detailModalStartConfigIdSearch" class="custom-input" />
                              </td>
                          </tr>
                          </tbody>
                      </table>
                      <div id="detailModalStartHot" class="custom-modal-grid-container" style="width:100%; height:100%; overflow-x:auto;"></div>
                  </div>

                  <div class="col-md-6" style="border:1px solid #ddd; padding:10px; border-radius:4px;">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                          <strong>END</strong>
                          <div>
                              <button type="button" class="custom-btn custom-blue-btn" id="detailModalBtnSearchEnd">
                                  <img src='/images/icon/btn/search.svg' alt='검색' class='btn-icon btn-icon-small'>검색
                              </button>
                          </div>
                      </div>
                      <table class="table-hover-delete" style="margin-bottom:10px;">
                          <tbody>
                          <tr>
                              <td class="custom-tb-title">
                                  <label class="custom-tb-title-text">자산ID</label>
                              </td>
                              <td class="custom-tb-content">
                                  <input type="text" id="detailModalEndAssetIdSearch" class="custom-input" />
                              </td>
                              <td class="custom-tb-title">
                                  <label class="custom-tb-title-text">구성ID</label>
                              </td>
                              <td class="custom-tb-content">
                                  <input type="text" id="detailModalEndConfigIdSearch" class="custom-input" />
                              </td>
                          </tr>
                          </tbody>
                      </table>
                      <div id="detailModalEndHot" class="custom-modal-grid-container" style="width:100%; height:100%; overflow-x:auto;"></div>
                  </div>
              </div>
          </div>

            <!-- 로딩 인디케이터 -->
            <div id="detailModalLoading" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
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
        title: '작업내역 추가',
        html: modalHtml,
        icon: 'info',
        showConfirmButton: true,
        confirmButtonText: '작업내역 등록',
        showCancelButton: true,
        cancelButtonText: '취소',
        showCloseButton: true,
        allowOutsideClick: false,
        didOpen: function () {
            console.log("모달이 열렸습니다");

            // 이벤트 전파 방지 설정
            const modalContentInner = document.querySelector('.modal-content-inner');
            if (modalContentInner) {
                modalContentInner.addEventListener('click', function (e) {
                    e.stopPropagation();
                });
            }

            // 모달 콘텐츠 래퍼의 크기를 조정
            const modalContentWrapper = document.querySelector('.modal-content-wrapper');
            if (modalContentWrapper) {
                modalContentWrapper.style.width = '90%';
                modalContentWrapper.style.height = '700px';
                modalContentWrapper.style.maxWidth = '1430px'; // 최대 너비 증가
                modalContentWrapper.addEventListener('click', function (e) {
                    e.stopPropagation();
                });
            }

            // 그리드 초기화 및 이벤트 핸들러 설정
            setTimeout(function () {
                try {
                    initDetailModalGrids();
                    setupDetailModalEventHandlers();
                } catch (error) {
                    console.error('모달 초기화 중 오류:', error);
                }
            }, 200);
        },
        didClose: function () {
            console.log("모달이 닫혔습니다");
            // 그리드 인스턴스 정리
            startHot = null;
            endHot = null;
        },
        preConfirm: function() {
            console.log("preConfirm 실행 - 작업내역 등록 준비");

            // 확인 버튼 클릭 시 작업내역 등록 및 결과 반환
            if (!startHot || !endHot) {
                console.error("그리드가 초기화되지 않았습니다");
                modalManager.showValidationMessage('그리드가 초기화되지 않았습니다');
                return false;
            }

            // 포트 열 데이터 반영
            startHot.finishEditing();
            endHot.finishEditing();

            // 케이블 정보
            let cableType = $("#detailModalCableType").val();
            let cableColor = $("#detailModalCableColor").val();
            let cableLength = $("#detailModalCableLength").val();
            let startLocation = $("#detailModalStartLocation").val();
            let endLocation = $("#detailModalEndLocation").val();
            let remark = $("#detailModalCableRemark").val();

            if (!cableLength || !startLocation || !endLocation) {
                console.error("케이블 정보가 누락되었습니다");
                modalManager.showValidationMessage("케이블 정보를 입력해주세요.");
                return false;
            }

            // START/END 체크
            let sArr = startHot.getCheckedRows();
            let eArr = endHot.getCheckedRows();

            if (sArr.length !== 1 || eArr.length !== 1) {
                console.error("START/END 체크가 잘못되었습니다", sArr.length, eArr.length);
                modalManager.showValidationMessage("START와 END 각각 1개씩 체크해주세요.");
                return false;
            }

            let s = sArr[0];
            let e = eArr[0];

            if (s.port === "" || e.port === "") {
                console.error("포트 정보가 누락되었습니다");
                modalManager.showValidationMessage("포트 정보를 입력해주세요.");
                return false;
            }

            // 행 객체 구성
            let rowObj = {
                cableType,
                cableColor,
                cableLength,
                startLocation,
                endLocation,
                remark,
                startAssetId: s.assetId,
                startConfigId: s.configId,
                startEqpName: s.eqpName,
                startHostName: s.hostName,
                startPort: s.port,
                endAssetId: e.assetId,
                endConfigId: e.configId,
                endEqpName: e.eqpName,
                endHostName: e.hostName,
                endPort: e.port
            };

            console.log("작업내역 데이터가 준비되었습니다:", rowObj);

            // 전역 변수에 데이터 저장 (모달이 닫힌 후 사용)
            window._tempRowData = rowObj;

            return true;
        },
        callback: function() {
            console.log("모달 callback 실행");

            // 저장된 데이터 확인
            if (window._tempRowData) {
                console.log("저장된 데이터로 부모창 함수 호출 준비");

                // window.addDetailRows 함수 확인 및 호출
                if (typeof window.addDetailRows === 'function') {
                    console.log("부모창 addDetailRows 함수 호출 중...");
                    try {
                        window.addDetailRows(window._tempRowData);
                        console.log("부모창 함수 호출 성공");
                        alert2('알림', '작업내역이 추가되었습니다', 'success', '확인');
                    } catch (error) {
                        console.error("부모창 함수 호출 중 오류 발생:", error);
                        alert2('오류', '작업내역 추가 중 오류가 발생했습니다', 'error', '확인');
                    }

                    // 임시 데이터 정리
                    delete window._tempRowData;
                } else {
                    console.error('부모창의 addDetailRows 함수를 찾을 수 없습니다', typeof window.addDetailRows);
                    alert2('오류', '작업내역을 추가할 수 없습니다 (함수 없음)', 'error', '확인');
                }
            } else {
                console.warn("저장된 임시 데이터가 없습니다");
            }
        }
    }).catch(function (error) {
        console.error('모달 오류:', error);
    });
}

/**
 * 로딩 인디케이터를 표시합니다.
 */
function showDetailModalLoading() {
    const loadingDiv = document.getElementById('detailModalLoading');
    if (loadingDiv) {
        loadingDiv.style.display = 'flex';
    }
}

/**
 * 로딩 인디케이터를 숨깁니다.
 */
function hideDetailModalLoading() {
    const loadingDiv = document.getElementById('detailModalLoading');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
}

/**
 * 상세 모달에서 그리드를 초기화합니다.
 */
function initDetailModalGrids() {
    console.log("그리드 초기화 시작");
    initDetailModalStartHot();
    initDetailModalEndHot();
}

/**
 * 상세 모달에서 이벤트 핸들러를 설정합니다.
 */
function setupDetailModalEventHandlers() {
    console.log("이벤트 핸들러 설정 시작");

    // 검색 버튼 이벤트
    $('#detailModalBtnSearchStart').off('click').on('click', function() {
        console.log("START 검색 버튼 클릭");
        loadDetailModalSearchStart();
    });

    $('#detailModalBtnSearchEnd').off('click').on('click', function() {
        console.log("END 검색 버튼 클릭");
        loadDetailModalSearchEnd();
    });

    // 엔터키 이벤트
    $('#detailModalStartAssetIdSearch, #detailModalStartConfigIdSearch').off('keypress').on('keypress', function(e) {
        if (e.which === 13) {
            console.log("START 검색 엔터키 입력");
            $('#detailModalBtnSearchStart').click();
        }
    });

    $('#detailModalEndAssetIdSearch, #detailModalEndConfigIdSearch').off('keypress').on('keypress', function(e) {
        if (e.which === 13) {
            console.log("END 검색 엔터키 입력");
            $('#detailModalBtnSearchEnd').click();
        }
    });

    // 각 필드의 초기 값을 설정
    if ($('#detailModalCableType').length) {
        $('#detailModalCableType').val('UTP'); // 기본값: UTP
        console.log("cableType 기본값 설정 성공");
    } else {
        console.warn("cableType 요소를 찾을 수 없습니다");
    }

    if ($('#detailModalCableColor').length) {
        $('#detailModalCableColor').val('적색'); // 기본값: 적색
        console.log("cableColor 기본값 설정 성공");
    } else {
        console.warn("cableColor 요소를 찾을 수 없습니다");
    }

    console.log("이벤트 핸들러 설정 완료");
}

/**
 * [A] 모달의 출발지(START) Grid 초기화
 */
function initDetailModalStartHot() {
    const container = document.getElementById('detailModalStartHot');
    if (!container) {
        console.error('detailModalStartHot 요소를 찾을 수 없습니다');
        return;
    }

    console.log("START Grid 초기화 시작");

    // 컬럼 정의
    startHot = new tui.Grid({
        el: container,
        data: [],
        scrollX: true,
        scrollY: true,
        bodyHeight: 300,  // 높이 증가
        rowHeaders: ['checkbox'], // 체크박스 열
        columns: [
            {
                header: '자산ID',
                name: 'assetId',
                align: 'center',
                width: 150,
                editor: false,
                escapeHTML: false
            },
            {
                header: '구성ID',
                name: 'configId',
                align: 'center',
                width: 110,
                editor: false,
                escapeHTML: false
            },
            {
                header: '업무명',
                name: 'eqpName',
                align: 'center',
                width: 200,
                editor: false,
                escapeHTML: false
            },
            {
                header: '호스트명',
                name: 'hostName',
                align: 'center',
                width: 110,
                editor: false,
                escapeHTML: false
            },
            {
                header: '포트',
                name: 'port',
                align: 'center',
                width: 60,
                editor: 'text',
                escapeHTML: false
            }
        ],
        columnOptions: { resizable: true }
    });

    console.log("START Grid 초기화 완료");
}

/**
 * [B] 모달의 목적지(END) Grid 초기화
 */
function initDetailModalEndHot() {
    const container = document.getElementById('detailModalEndHot');
    if (!container) {
        console.error('detailModalEndHot 요소를 찾을 수 없습니다');
        return;
    }

    console.log("END Grid 초기화 시작");

    endHot = new tui.Grid({
        el: container,
        data: [],
        scrollX: true,
        scrollY: true,
        bodyHeight: 300,  // 높이 증가
        rowHeaders: ['checkbox'],
        columns: [
            {
                header: '자산ID',
                name: 'assetId',
                align: 'center',
                width: 150,
                editor: false,
                escapeHTML: false
            },
            {
                header: '구성ID',
                name: 'configId',
                align: 'center',
                width: 110,
                editor: false,
                escapeHTML: false
            },
            {
                header: '업무명',
                name: 'eqpName',
                align: 'center',
                width: 200,
                editor: false,
                escapeHTML: false
            },
            {
                header: '호스트명',
                name: 'hostName',
                align: 'center',
                width: 110,
                editor: false,
                escapeHTML: false
            },
            {
                header: '포트',
                name: 'port',
                align: 'center',
                width: 60,
                editor: 'text',
                escapeHTML: false
            }
        ],
        columnOptions: { resizable: true }
    });

    console.log("END Grid 초기화 완료");
}

/**
 * 모달의 출발지 검색 AJAX
 * - 성공 시 startHot.resetData(converted) + refreshLayout()
 */
function loadDetailModalSearchStart() {
    if (!startHot) {
        console.error('startHot 그리드가 초기화되지 않았습니다');
        return;
    }

    showDetailModalLoading();
    console.log("START 데이터 로딩 시작");

    let param = {
        assetId: $("#detailModalStartAssetIdSearch").val(),
        configId: $("#detailModalStartConfigIdSearch").val()
    };

    console.log("검색 파라미터:", param);

    $.ajax({
        url: "/eqp/searchTemp", // 실제 API
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(param),
        success: function (data) {
            hideDetailModalLoading();
            console.log("START 데이터 로딩 성공:", data);

            // data => [{ASSET_ID,CONFIG_ID,EQP_NAME,HOST_NAME,MODEL_NAME}, ...]
            let converted = (data || []).map(item => ({
                assetId: item.ASSET_ID,
                configId: item.CONFIG_ID,
                eqpName: item.EQP_NAME,
                hostName: item.HOST_NAME,
                modelName: item.MODEL_NAME,
                port: "" // 사용자 입력 칸
            }));

            console.log("변환된 데이터:", converted);

            startHot.resetData(converted);
            // 레이아웃 갱신
            setTimeout(function () {
                startHot.refreshLayout();
                console.log("START Grid 레이아웃 갱신 완료");
            }, 0);
        },
        error: function (err) {
            hideDetailModalLoading();
            console.error('출발지 검색 오류:', err);
            modalManager.showValidationMessage('출발지 검색 중 오류가 발생했습니다');
        }
    });
}

/**
 * 모달의 목적지 검색 AJAX
 * - 성공 시 endHot.resetData(converted) + refreshLayout()
 */
function loadDetailModalSearchEnd() {
    if (!endHot) {
        console.error('endHot 그리드가 초기화되지 않았습니다');
        return;
    }

    showDetailModalLoading();
    console.log("END 데이터 로딩 시작");

    let param = {
        assetId: $("#detailModalEndAssetIdSearch").val(),
        configId: $("#detailModalEndConfigIdSearch").val()
    };

    console.log("검색 파라미터:", param);

    $.ajax({
        url: "/eqp/searchTemp",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(param),
        success: function (data) {
            hideDetailModalLoading();
            console.log("END 데이터 로딩 성공:", data);

            let converted = (data || []).map(item => ({
                assetId: item.ASSET_ID,
                configId: item.CONFIG_ID,
                eqpName: item.EQP_NAME,
                hostName: item.HOST_NAME,
                modelName: item.MODEL_NAME,
                port: ""
            }));

            console.log("변환된 데이터:", converted);

            endHot.resetData(converted);
            setTimeout(function () {
                endHot.refreshLayout();
                console.log("END Grid 레이아웃 갱신 완료");
            }, 0);
        },
        error: function (err) {
            hideDetailModalLoading();
            console.error('목적지 검색 오류:', err);
            modalManager.showValidationMessage('목적지 검색 중 오류가 발생했습니다');
        }
    });
}

/**
 * 모달에서 작업내역 등록 버튼 클릭 처리 (수정됨)
 * - preConfirm에서 사용하는 함수 (이전 버전과 동일하게 유지)
 */
function addDetailFromModal() {
    console.log("addDetailFromModal 호출됨");

    if (!startHot || !endHot) {
        console.error("그리드가 초기화되지 않았습니다");
        modalManager.showValidationMessage('그리드가 초기화되지 않았습니다');
        return false;
    }

    // **중요**: 포트 열에 입력한 값이 실데이터에 반영되도록 finishEditing()
    startHot.finishEditing();
    endHot.finishEditing();

    // 상단 케이블 정보
    let cableType = $("#detailModalCableType").val();
    let cableColor = $("#detailModalCableColor").val();
    let cableLength = $("#detailModalCableLength").val();
    let startLocation = $("#detailModalStartLocation").val();
    let endLocation = $("#detailModalEndLocation").val();
    let remark = $("#detailModalCableRemark").val();

    console.log("케이블 정보:", {
        cableType, cableColor, cableLength, startLocation, endLocation, remark
    });

    if (!cableLength || !startLocation || !endLocation) {
        console.error("케이블 정보가 누락되었습니다");
        modalManager.showValidationMessage("케이블 정보를 입력해주세요.");
        return false;
    }

    // START 체크 (1개)
    let sArr = startHot.getCheckedRows();
    // END 체크 (1개)
    let eArr = endHot.getCheckedRows();

    console.log("선택된 행:", { sArr, eArr });

    if (sArr.length !== 1 || eArr.length !== 1) {
        console.error("START/END 체크가 잘못되었습니다", sArr.length, eArr.length);
        modalManager.showValidationMessage("START와 END 각각 1개씩 체크해주세요.");
        return false;
    }

    let s = sArr[0];
    let e = eArr[0];

    if (s.port === "" || e.port === "") {
        console.error("포트 정보가 누락되었습니다");
        modalManager.showValidationMessage("포트 정보를 입력해주세요.");
        return false;
    }

    // rowObj
    let rowObj = {
        cableType,
        cableColor,
        cableLength,
        startLocation,
        endLocation,
        remark,

        // 출발지
        startAssetId: s.assetId,
        startConfigId: s.configId,
        startEqpName: s.eqpName,
        startHostName: s.hostName,
        startPort: s.port,

        // 목적지
        endAssetId: e.assetId,
        endConfigId: e.configId,
        endEqpName: e.eqpName,
        endHostName: e.hostName,
        endPort: e.port
    };

    console.log("작업내역을 부모창에 추가합니다:", rowObj);

    // 부모창 함수
    if (typeof window.addDetailRows === 'function') {
        console.log("부모창 addDetailRows 함수 실행");
        window.addDetailRows(rowObj);
        alert2('알림', '작업내역이 추가되었습니다', 'success', '확인');
        return true;
    } else {
        console.error('부모창의 addDetailRows 함수를 찾을 수 없습니다', typeof window.addDetailRows);
        modalManager.showValidationMessage('작업내역을 추가할 수 없습니다');
        return false;
    }
}

/*******************************************************
 * 기존 함수들 (이전 코드와의 호환성 유지)
 *******************************************************/

/*******************************************************
 * [A] 출발지(START) Grid
 *******************************************************/
function initStartHot() {
    const container = document.getElementById("startHot");
    if (!container) return;

    // 1) 컬럼 정의
    startHot = new tui.Grid({
        el: container,
        data: [],
        scrollX: true,
        scrollY: true,
        bodyHeight: 380,
        rowHeaders: ['checkbox'], // 체크박스 열
        columns: [
            {
                header: '자산ID',
                name: 'assetId',
                align: 'center',
                width: 150,
                editor: false,
                escapeHTML: false
            },
            {
                header: '구성ID',
                name: 'configId',
                align: 'center',
                width: 110,
                editor: false,
                escapeHTML: false
            },
            {
                header: '업무명',
                name: 'eqpName',
                align: 'center',
                width: 200,
                editor: false,
                escapeHTML: false
            },
            {
                header: '호스트명',
                name: 'hostName',
                align: 'center',
                width: 110,
                editor: false,
                escapeHTML: false
            },
            {
                header: '포트',
                name: 'port',
                align: 'center',
                width: 60,
                editor: 'text',
                escapeHTML: false
            }
        ],
        columnOptions: { resizable: true }
    });
}

/**
 * 출발지 검색 AJAX
 * - 성공 시 startHot.resetData(converted) + refreshLayout()
 */
function loadSearchStart() {
    if (!startHot) return;

    let param = {
        assetId: $("#startAssetIdSearch").val(),
        configId: $("#startConfigIdSearch").val(),
        eqpName: $("#startEqpNameSearch").val()
    };

    $.ajax({
        url: "/eqp/searchTemp", // 실제 API
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(param),
        success: function (data) {
            // data => [{ASSET_ID,CONFIG_ID,EQP_NAME,HOST_NAME,MODEL_NAME}, ...]
            let converted = (data || []).map(item => ({
                assetId: item.ASSET_ID,
                configId: item.CONFIG_ID,
                eqpName: item.EQP_NAME,
                hostName: item.HOST_NAME,
                modelName: item.MODEL_NAME,
                port: "" // 사용자 입력 칸
            }));

            console.log("converted (start) =", converted);

            startHot.resetData(converted);
            // 레이아웃 갱신
            setTimeout(function () {
                startHot.refreshLayout();
            }, 0);
        }
    });
}

/*******************************************************
 * [B] 목적지(END) Grid
 *******************************************************/
function initEndHot() {
    const container = document.getElementById("endHot");
    if (!container) return;

    endHot = new tui.Grid({
        el: container,
        data: [],
        scrollX: true,
        scrollY: true,
        bodyHeight: 380,
        rowHeaders: ['checkbox'],
        columns: [
            {
                header: '자산ID',
                name: 'assetId',
                align: 'center',
                width: 150,
                editor: false,
                escapeHTML: false
            },
            {
                header: '구성ID',
                name: 'configId',
                align: 'center',
                width: 110,
                editor: false,
                escapeHTML: false
            },
            {
                header: '업무명',
                name: 'eqpName',
                align: 'center',
                width: 200,
                editor: false,
                escapeHTML: false
            },
            {
                header: '호스트명',
                name: 'hostName',
                align: 'center',
                width: 110,
                editor: false,
                escapeHTML: false
            },
            {
                header: '포트',
                name: 'port',
                align: 'center',
                width: 60,
                editor: 'text',
                escapeHTML: false
            }
        ],
        columnOptions: { resizable: true }
    });
}

/**
 * 목적지 검색 AJAX
 * - 성공 시 endHot.resetData(converted) + refreshLayout()
 */
function loadSearchEnd() {
    if (!endHot) return;

    let param = {
        assetId: $("#endAssetIdSearch").val(),
        configId: $("#endConfigIdSearch").val(),
        eqpName: $("#endEqpNameSearch").val()
    };

    $.ajax({
        url: "/eqp/searchTemp",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(param),
        success: function (data) {
            let converted = (data || []).map(item => ({
                assetId: item.ASSET_ID,
                configId: item.CONFIG_ID,
                eqpName: item.EQP_NAME,
                hostName: item.HOST_NAME,
                modelName: item.MODEL_NAME,
                port: ""
            }));

            console.log("converted (end) =", converted);

            endHot.resetData(converted);
            setTimeout(function () {
                endHot.refreshLayout();
            }, 0);
        }
    });
}

/*******************************************************
 * "추가" 버튼 -> 부모창 addDetailRows(rowObj)
 *******************************************************/
function addDetailToParent() {
    if (!startHot || !endHot) {
        alert("그리드가 초기화되지 않았습니다");
        return;
    }

    // **중요**: 포트 열에 입력한 값이 실데이터에 반영되도록 finishEditing()
    startHot.finishEditing();
    endHot.finishEditing();

    // 상단 케이블 정보
    let cableType = $("#cableType").val();
    let cableColor = $("#cableColor").val();
    let cableLength = $("#cableLength").val();
    let startLocation = $("#startLocation").val();
    let endLocation = $("#endLocation").val();
    let remark = $("#cableRemark").val();

    if(!cableLength || !startLocation || !endLocation){
        alert("케이블 정보를 입력해주세요.");
        return;
    }

    // START 체크 (1개)
    // rowHeaders: ['checkbox'] → getCheckedRows()로 획득
    let sArr = startHot.getCheckedRows();
    // END 체크 (1개)
    let eArr = endHot.getCheckedRows();

    if(sArr.length !== 1 || eArr.length !== 1){
        alert("START와 END 각각 1개씩 체크해주세요.");
        return;
    }

    let s = sArr[0];
    let e = eArr[0];

    if(sArr[0].port === "" || eArr[0].port === ""){
        alert("포트 정보를 입력해주세요.");
        return;
    }

    // rowObj
    let rowObj = {
        cableType,
        cableColor,
        cableLength,
        startLocation,
        endLocation,
        remark,

        // 출발지
        startAssetId : s.assetId,
        startConfigId: s.configId,
        startEqpName : s.eqpName,
        startHostName: s.hostName,
        startPort    : s.port,

        // 목적지
        endAssetId   : e.assetId,
        endConfigId  : e.configId,
        endEqpName   : e.eqpName,
        endHostName  : e.hostName,
        endPort      : e.port
    };

    // 부모창 함수
    if (window.addDetailRows) {
        window.addDetailRows(rowObj);
    }
    $("#detailModal").modal("hide");
}