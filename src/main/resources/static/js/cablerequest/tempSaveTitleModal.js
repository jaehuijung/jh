/**
 * tempSaveTitleModal.js
 * - 입력 데이터 임시저장 모달 관리 스크립트
 * - Bootstrap 4, 5 모두에서 닫기 버튼(X)의 색상 흰색을 유지하도록 스타일 적용
 */

$(document).ready(function() {
  // 모달 스타일(Modal Manager Style) 적용
  applyModalManagerStyle();

  // 1. 임시저장 버튼 클릭 시, 모달을 표시하며 외부 및 ESC로 닫히지 않도록 설정
  $('#btnTempSave').off('click').on('click', function() {
    $('#tempSaveTitleModal').modal({
      backdrop: 'static',
      keyboard: false
    });
    $('#tempSaveTitleModal').modal('show');
  });

  // 2. '저장' 버튼 클릭 시, 임시저장 기능 수행
  $('#btnConfirmTempSave').off('click').on('click', function() {
    doTempSaveWithTitle();
  });

  // 3. 모달이 열릴 때, 제목 입력 필드를 초기화하고 포커스
  $('#tempSaveTitleModal').on('shown.bs.modal', function() {
    $('#tempSaveTitleInput').val('').focus();
  });

  // 4. 제목 입력 필드에서 엔터키 누르면 '저장' 버튼 자동 클릭
  $('#tempSaveTitleInput').on('keypress', function(e) {
    if (e.which === 13) {
      e.preventDefault();
      $('#btnConfirmTempSave').click();
    }
  });
});

/**
 * 모달에 Modal Manager 스타일을 적용
 * - 모달 배경, 컨테이너, 헤더/바디/푸터, 버튼 등 공통 스타일 지정
 * - Bootstrap 4(.close)와 Bootstrap 5(.btn-close)를 모두 고려
 */
function applyModalManagerStyle() {
  // 중복 삽입 방지
  if ($('#modalManagerStyleForBootstrap').length === 0) {
    const styleEl = document.createElement('style');
    styleEl.id = 'modalManagerStyleForBootstrap';
    styleEl.textContent = `
      /* 모달 배경(Backdrop) 스타일 - 불투명도, 블러 제거 */
      .modal-backdrop.show {
        opacity: 0.5 !important;
        background-color: rgba(0, 0, 0, 0.5) !important;
      }

      /* 모달 컨테이너 스타일 */
      .modal-dialog.modal-manager-style {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: calc(100% - 3.5rem);
      }

      /* 모달 내용(전체 박스) 스타일 */
      .modal-content.modal-manager-style {
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        border: none;
      }

      /* 모달 헤더 스타일 */
      .modal-header.modal-manager-style {
        background: #00274D;
        color: white;
        border-radius: 10px 10px 0 0;
        padding: 0.75rem 1rem;
      }

      /* 모달 제목 스타일 */
      .modal-title.modal-manager-style {
        font-size: 1rem;
        display: flex;
        align-items: center;
        color: white;
      }

      /* 모달 아이콘 스타일 */
      .modal-icon {
        margin-right: 8px;
        font-size: 1rem;
        color: white;
      }

      /* ------------------------------------------------------------------
         [ 닫기 버튼(X) 흰색 유지 스타일 ]
         - Bootstrap 4: .close
         - Bootstrap 5: .btn-close (아이콘 필터로 흰색 표시)
      ------------------------------------------------------------------ */
      .modal-header .close.modal-manager-style,
      .modal-header .close.modal-manager-style span,
      .modal-header .close.modal-manager-style:hover,
      .modal-header .close.modal-manager-style:focus,
      .modal-header .close.modal-manager-style:active,
      .modal-header button.close.modal-manager-style,
      .modal-header button.close.modal-manager-style span {
        color: white !important;
        opacity: 1 !important;
        text-shadow: none !important;
        font-weight: normal !important;
        outline: none !important;
      }

      /* Bootstrap 5 닫기 버튼(.btn-close) - invert 필터로 흰색 표시 */
      .modal-header .btn-close.modal-manager-style {
        filter: invert(1) brightness(2) !important;
      }
      .modal-header .btn-close.modal-manager-style:hover,
      .modal-header .btn-close.modal-manager-style:focus,
      .modal-header .btn-close.modal-manager-style:active {
        filter: invert(1) brightness(2) !important;
      }

      /* 닫기 버튼(X) 스팬 스타일 */
      .modal-header .close.modal-manager-style span {
        display: inline-block;
        font-size: 1.5rem;
      }

      /* 모달 본문(Body) 스타일 */
      .modal-body.modal-manager-style {
        padding: 1.25rem;
        border-bottom: 1px solid #e9ecef;
      }

      /* 모달 푸터(Footer) 스타일 */
      .modal-footer.modal-manager-style {
        justify-content: flex-end;
        padding: 0.75rem;
        border-top: none;
      }

      /* 모달 내부 버튼 스타일 */
      .modal-manager-btn {
        padding: 0.375rem 0.75rem;
        font-size: 0.875rem;
        border: none;
        border-radius: 0.25rem;
        margin-left: 0.5rem;
        cursor: pointer;
      }
      .modal-manager-btn-confirm {
        background-color: #708090;
        color: white;
      }
      .modal-manager-btn-cancel {
        background-color: #ccc;
        color: white;
      }

      /* 유효성 검사 메시지 스타일 (잘못된 입력 경고 등) */
      .modal-validation-message {
        background-color: lightcoral;
        color: white;
        padding: 0.5rem;
        margin-top: 1rem;
        display: none;
        border-radius: 0.25rem;
      }

      /* 로딩 인디케이터(Spinner) 영역 스타일 */
      .modal-loading {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        z-index: 2000;
      }

      /* 입력 필드 포커스 시 테두리 제거 */
      #tempSaveTitleInput:focus {
        outline: none !important;
        box-shadow: none !important;
        border-color: #ced4da !important;
      }
    `;

    document.head.appendChild(styleEl);

    // 모달이 열릴 때, backdrop에 스타일을 동적으로 적용
    document.addEventListener('shown.bs.modal', function() {
      setTimeout(function() {
        const backdrops = document.querySelectorAll('.modal-backdrop.show');
        backdrops.forEach(backdrop => {
          backdrop.style.opacity = '0.5';
          backdrop.style.backdropFilter = 'none';
          backdrop.style.webkitBackdropFilter = 'none';
          backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        });
      }, 50);
    });

    // 모달 요소에 클래스(Modal Manager Style) 적용
    updateModalClasses();
  }
}

/**
 * 모달 요소(헤더, 바디, 푸터 등)에 지정한 Modal Manager 클래스를 부여
 * - 추가 아이콘, 유효성 검사 영역 등도 처리
 */
function updateModalClasses() {
  const $modal = $('#tempSaveTitleModal');
  if ($modal.length > 0) {
    // 모달 대화상자에 스타일 클래스 적용
    $modal.find('.modal-dialog').addClass('modal-manager-style');

    // 모달 전체 컨테이너에 스타일 클래스 적용
    $modal.find('.modal-content').addClass('modal-manager-style');

    // 모달 헤더에 스타일 클래스 적용, 아이콘 추가
    const $header = $modal.find('.modal-header');
    $header.addClass('modal-manager-style');

    // 모달 타이틀에 스타일 및 아이콘 추가
    const $title = $header.find('.modal-title');
    if ($title.length > 0 && !$title.hasClass('modal-manager-style')) {
      $title.addClass('modal-manager-style');
      $title.html(`<div class="modal-icon">ℹ</div>${$title.text()}`);
    }

    // 닫기 버튼(.close - Bootstrap 4, .btn-close - Bootstrap 5)에 공통 스타일 적용
    $header.find('.close, .btn-close').addClass('modal-manager-style');

    // 모달 본문에 스타일 클래스 적용
    $modal.find('.modal-body').addClass('modal-manager-style');

    // 유효성 검사 메시지 요소가 없으면 생성
    if ($modal.find('.modal-validation-message').length === 0) {
      $modal.find('.modal-body').append('<div class="modal-validation-message"></div>');
    }

    // 모달 푸터에 스타일 클래스 적용
    const $footer = $modal.find('.modal-footer');
    $footer.addClass('modal-manager-style');

    // 모달 내부 버튼들에 공통 스타일 적용
    $footer.find('button').each(function() {
      const $btn = $(this);
      $btn.addClass('modal-manager-btn');

      if ($btn.attr('id') === 'btnConfirmTempSave') {
        $btn.addClass('modal-manager-btn-confirm');
      } else {
        $btn.addClass('modal-manager-btn-cancel');
      }
    });
  }
}

/**
 * 유효성 검사 메시지를 표시
 * @param {string} message - 표시할 메시지
 */
function showValidationMessage(message) {
  const $validationMsg = $('#tempSaveTitleModal').find('.modal-validation-message');
  $validationMsg
    .text(message)
    .css({
      'display': 'block',
      'background-color': 'gray' // 동적으로 배경색 변경
    });
}
/**
 * 유효성 검사 메시지를 숨김
 */
function hideValidationMessage() {
  const $validationMsg = $('#tempSaveTitleModal').find('.modal-validation-message');
  $validationMsg.text('').css('display', 'none');
}

/**
 * 임시저장 기능 수행
 * - 제목 입력값을 포함해 서버로 데이터 전송
 * - Spinner(로딩) 표시/해제 및 유효성 검사 처리
 */
function doTempSaveWithTitle() {
  hideValidationMessage();

  // 1. 제목 값 유효성 검사
  const titleVal = $('#tempSaveTitleInput').val().trim();
  if (!titleVal) {
    showValidationMessage("제목을 입력해주세요.");
    return;
  }

  // 2. '저장 중' 상태로 버튼 비활성화, 로딩 표시
  $('#btnConfirmTempSave')
    .prop('disabled', true)
    .html('<i class="fas fa-spinner fa-spin"></i> 저장 중...');

  if ($('#tempSaveModalLoading').length === 0) {
    $('#tempSaveTitleModal .modal-content').append(`
      <div id="tempSaveModalLoading" class="modal-loading">
        <div style="text-align: center;">
          <img src="/images/loading.gif" alt="Loading" style="width: 50px; height: 50px;" />
          <p style="margin-top: 10px; font-weight: bold;">저장 중...</p>
        </div>
      </div>
    `);
  } else {
    $('#tempSaveModalLoading').css('display', 'flex');
  }

  // 3. 폼 데이터 수집
  try {
    // 기본 정보
    const orgName = $('#orgNameSelect').val();
    const positionTitle = $('#positionTitle').val();
    const officerName = $('#officerName').val();
    const officerContact = $('#officerContact').val();
    const deptName = $('#deptName').val();
    const workPurpose = $('#workPurpose').val();
    const workDateType = $('input[name="radio-group"]:checked').val() || 'D';

    // 날짜 정보
    const dateRangeText = $('input[name="multi-datetime"]').val() || '';
    let workStartDate = '';
    let workEndDate = '';

    if (dateRangeText.includes(' - ')) {
      const parts = dateRangeText.split(' - ');
      workStartDate = parts[0].trim();
      workEndDate = parts[1].trim();
    }

    // Grid 정보 (작업자, 작업내용 등)
    let workerData = [];
    if (typeof workerHot !== 'undefined' && workerHot !== null) {
      try {
        workerData = workerHot.getData();
      } catch (warn) {
        console.warn("작업자 데이터 가져오기 실패:", warn);
      }
    }

    let detailData = [];
    if (typeof detailHot !== 'undefined' && detailHot !== null) {
      try {
        detailData = detailHot.getData();
      } catch (warn) {
        console.warn("작업내역 데이터 가져오기 실패:", warn);
      }
    }

    // 기존 요청 ID(수정 시) 처리
    const existingRequestId = $('#hiddenRequestId').val() || null;

    // 서버에 전달할 파라미터 구성
    const param = {
      requestInfo: {
        requestId: existingRequestId ? parseInt(existingRequestId, 10) : null,
        requestType: "INSTALL",
        orgName: orgName,
        positionTitle: positionTitle,
        officerName: officerName,
        officerContact: officerContact,
        deptName: deptName,
        workPurpose: workPurpose,
        workDateType: workDateType,
        workStartDate: workStartDate,
        workEndDate: workEndDate,
        approvalStatus: "임시저장"
      },
      workerList: workerData,
      detailList: detailData,
      tempTitle: titleVal
    };

    // 4. AJAX로 서버 요청
    $.ajax({
      url: "/cable/request/save",
      type: "POST",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(param),
      success: function(res) {
        // 로딩 중 화면 숨기기
        $('#tempSaveModalLoading').css('display', 'none');

        // 저장 버튼 상태 복원
        $('#btnConfirmTempSave')
          .prop('disabled', false)
          .html('<img src="/images/icon/etc/register.svg" alt="저장" class="btn-icon">저장');

        if (res.result === "SUCCESS") {
          // 생성된 요청 ID를 hidden 필드에 설정
          $('#hiddenRequestId').val(res.requestId);

          // 모달 닫기
          $('#tempSaveTitleModal').modal('hide');

          // 필요 시: 임시저장 완료 메시지 표시 등
          // alert("임시저장이 완료되었습니다.");
        } else {
          showValidationMessage("오류: " + (res.message || "알 수 없는 오류가 발생했습니다."));
        }
      },
      error: function(err) {
        $('#tempSaveModalLoading').css('display', 'none');
        $('#btnConfirmTempSave')
          .prop('disabled', false)
          .html('<img src="/images/icon/etc/register.svg" alt="저장" class="btn-icon">저장');

        let errorMsg = "임시저장 중 오류가 발생했습니다.";
        if (err.responseJSON && err.responseJSON.message) {
          errorMsg += " 이유: " + err.responseJSON.message;
        }
        showValidationMessage(errorMsg);
        console.error("임시저장 오류:", err);
      }
    });
  } catch (e) {
    // 예외 발생 시 처리
    $('#tempSaveModalLoading').css('display', 'none');
    $('#btnConfirmTempSave')
      .prop('disabled', false)
      .html('<img src="/images/icon/etc/register.svg" alt="저장" class="btn-icon">저장');

    showValidationMessage("데이터 처리 중 오류가 발생했습니다: " + e.message);
    console.error("데이터 처리 오류:", e);
  }
}
