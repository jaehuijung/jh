/*********************************
 * view.js
 * - 선번장(케이블 설치) 목록 예시
 * - Handsontable 표시
 * - 검색기간(데이터피커) 설정
 * - 체크박스 전체선택
 * - "수정" 버튼 클릭 시 팝업(infoUpdate)
 * - loadData는 getList로 가져오는 데이터 사용
 *********************************/

// [1] 전역 데이터(처음엔 빈 배열)
let handsonData = [];
let hot = null;  // Handsontable 인스턴스

$(function(){
    /*****************************************
     * [2] 날짜 범위 설정 (daterangepicker)
     *****************************************/
    $('input[name="multi-datetime"]').daterangepicker({
        startDate: moment().subtract(1, 'years'),
        endDate: moment(),
        locale: { format: 'YYYY-MM-DD' }
    }, function (start, end) {
        $('input[name="multi-datetime"]').val(
            start.format('YYYY-MM-DD') + ' ~ ' + end.format('YYYY-MM-DD')
        );
    });

    /*****************************************
     * [3] Handsontable 컬럼 정의
     *****************************************/
    let handsonColumns = [
        createHandsonColumn('checkbox',               ''),
        //createHandsonColumn('NO',                     'NO', rowNumberRenderer),
        // START
        /*createHandsonColumn('start_asset_id',         '자산ID(시작)'),
        createHandsonColumn('start_configuration_id', '구성ID(시작)'),
        createHandsonColumn('start_coordinates',      '좌표(시작)'),
        createHandsonColumn('start_business_name',    '업무명(시작)'),
        createHandsonColumn('start_port',             '포트(시작)'),
        // END
        createHandsonColumn('end_asset_id',           '자산ID(종료)'),
        createHandsonColumn('end_configuration_id',   '구성ID(종료)'),
        createHandsonColumn('end_coordinates',        '좌표(종료)'),
        createHandsonColumn('end_business_name',      '업무명(종료)'),
        createHandsonColumn('end_port',               '포트(종료)'),
        // Cable
        createHandsonColumn('cable_type',             '케이블 타입'),
        createHandsonColumn('cable_color',            '케이블 색상'),
        createHandsonColumn('cable_length',           '케이블 길이'),
        createHandsonColumn('cable_statement_date',   '포설 일자'),
*/

        // DB columns (소문자로 매핑)
        createHandsonColumn('install_id',   'NO'),
       /* createHandsonColumn('request_id',   'REQUEST_ID'),
        createHandsonColumn('work_detail_id','WORK_DETAIL_ID'),*/

        createHandsonColumn('start_asset_id',     '자산ID(시작)'),
        createHandsonColumn('start_config_id',    '구성ID(시작)'),
        createHandsonColumn('start_location',     '좌표(시작)'),
        createHandsonColumn('start_eqp_name',     '업무명(시작)'),
        createHandsonColumn('start_port',         '포트(시작)'),

        createHandsonColumn('end_asset_id',  '자산ID(종료)'),
        createHandsonColumn('end_config_id',   '구성ID(종료)'),
        createHandsonColumn('end_location',  '좌표(종료)'),
        createHandsonColumn('end_eqp_name',      '업무명(종료)'),
        createHandsonColumn('end_port',      '포트(종료)'),

        createHandsonColumn('cable_type',    '케이블 타입'),
        createHandsonColumn('cable_color',   '케이블 색상'),
        createHandsonColumn('cable_length',  '케이블 길이'),
        createHandsonColumn('install_date',  '포설일자'),
      /*  createHandsonColumn('line_status',   'LINE_STATUS'),
        createHandsonColumn('reg_id',        'REG_ID'),
        createHandsonColumn('reg_dt',        'REG_DT'),*/


        createHandsonColumn('cable_info_update',      '수정', infoUpdate)
    ];

    /*****************************************
     * [4] Handsontable 초기화 (빈 배열)
     *****************************************/
    let container = document.getElementById('handsontable-container');
    hot = new Handsontable(container, {
        data: handsonData,  // 초기 비어있음
        columns: handsonColumns,
        colHeaders: true,
        rowHeaders: false,
        contextMenu: true,
        autoRowSize: true,
        autoColumnSize: true,
        columnSorting: true,
        width: '100%',
        height: 500,
        stretchH: 'all',
        overflow: 'hidden',

        // 전체선택 체크박스
        afterGetColHeader(col, TH) {
            if(col === 0){ // checkbox 열
                let existingCheckbox = TH.querySelector('input[type="checkbox"]');
                if(!existingCheckbox){
                    let checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.addEventListener('click', function(){
                        toggleSelectAll(hot, col, this.checked);
                    });
                    TH.innerHTML = '';
                    TH.appendChild(checkbox);
                }
            }
        },
    });

    // (선택) 페이지 로딩 후 자동 검색
    doSearch();
});

/************************************************
 * [5] doSearch() -> AJAX /cable/agencyLine/getList
 ************************************************/
function doSearch(){
    // 예: 검색 조건 수집
    let param = {
        startDate:  $('input[name="multi-datetime"]').data('daterangepicker').startDate.format('YYYY-MM-DD'),
        endDate:    $('input[name="multi-datetime"]').data('daterangepicker').endDate.format('YYYY-MM-DD'),
        cableType:  $("#someCableType").val() || ""
        // etc...
    };

    $.ajax({
        url: "/cable/agency/getList",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(param),
        success: function(res){
            // res => 배열 e.g. [{start_asset_id:"A001", ...}, ...]
            if(!res){
                console.warn("No data returned.");
                handsonData = [];
            } else {
                console.log(res);
                handsonData = res.map((item, idx) => ({start_asset_id:          item.START_ASSET_ID,
                    install_id:      item.INSTALL_ID,
                    start_asset_id:  item.START_ASSET_ID,
                    start_config_id: item.START_CONFIG_ID,
                    start_location:  item.START_LOCATION,
                    start_eqp_name:   item.START_EQP_NAME,
                    start_port:      item.START_PORT,
                    end_asset_id:    item.END_ASSET_ID,
                    end_config_id: item.END_CONFIG_ID,
                    end_eqp_name:   item.END_EQP_NAME,
                    end_location:    item.END_LOCATION,
                    end_port:        item.END_PORT,
                    cable_type:      item.CABLE_TYPE,
                    cable_color:     item.CABLE_COLOR,
                    cable_length:    item.CABLE_LENGTH,
                    install_date:    item.INSTALL_DATE,   // e.g. '2023-05-12'
                    line_status:     item.LINE_STATUS,
                    reg_id:          item.REG_ID,
                    reg_dt:          item.REG_DT,

                    cable_info_update:       item.CABLE_INFO_UPDATE || "수정"
                }));
            }

            // Handsontable 데이터 갱신
            hot.loadData(handsonData);
        },
        error: function(err){
            console.error("doSearch error", err);
            hot.loadData([]); // 에러 시 빈 데이터
        }
    });
}

/************************************************
 * [6] 기타 렌더러/함수들
 ************************************************/

/** createHandsonColumn */
function createHandsonColumn(dataProp, colHeader, rendererFn){
    let colDef = {
        data: dataProp,
        readOnly: true, // 대부분 readOnly
    };
    if(colHeader) {
        colDef.title = colHeader; // Handsontable 12.x
    }
    if(dataProp === 'checkbox'){
        // 체크박스 열
        colDef.type = 'checkbox';
        colDef.readOnly = false; // 편의를 위해 false
    }
    if(rendererFn){
        colDef.renderer = function(instance, td, row, col, prop, value, cellProps){
            let rowData = instance.getSourceDataAtRow(row);
            return rendererFn({ rowData, td, row, col, prop, value, cellProps });
        };
    }
    return colDef;
}

/** 행번호(N0) 렌더러 */
function rowNumberRenderer({ row, td }){
    Handsontable.dom.empty(td);
    td.innerText = row+1;
}

/** infoUpdate renderer => "수정" 버튼 표시 */
function infoUpdate({ rowData, td }){
    Handsontable.dom.empty(td);
    let btn = document.createElement("button");
    btn.className = "btn btn-sm btn-secondary";
    btn.innerText = rowData.cable_info_update || "수정";
    btn.onclick = function(){
        openInfoUpdatePopup(rowData);
    };
    td.appendChild(btn);
}

/** 팝업 열기 */
function openInfoUpdatePopup(rowData){
    console.log("openInfoUpdatePopup =>", rowData);
    Swal.fire({
        html: generateCableAgencyLineHTML(),
        focusConfirm: false,
        confirmButtonText: '저장',
        cancelButtonText: '취소',
        showCancelButton: true,
        allowOutsideClick: false,
        heightAuto: false,
        customClass: {
            popup: 'custom-width'
        },
    }).then((result) => {
        if (result.isConfirmed) {
            // 저장 로직
            alert("저장.. (미구현)");
        }
    });
}

/** 전체선택/해제 */
function toggleSelectAll(hotInstance, colIndex, isChecked){
    let rowCount = hotInstance.countRows();
    for(let r=0; r<rowCount; r++){
        let rowData = hotInstance.getSourceDataAtRow(r);
        if(rowData) rowData['checkbox'] = isChecked;
    }
    hotInstance.render();
}

/** 팝업 HTML */
function generateCableAgencyLineHTML(){
    return `
    <div class="custom-width-700">
        <div class="flex-row-between custom-padding-10">
            <p style="margin: 0;">정보수정</p>
            <div class="custom-button-wrap custom-margin-left-10">
                <button type="button" class="custom-btn custom-blue-btn" onclick="searchButton()">등록</button>
            </div>
        </div>
        <div class="tbl-bootstrap-wrap custom-border-top-solid">
            <table class="table-hover-delete">
                <tbody>
                    <tr>
                        <td colspan="2" class="custom-tb-title custom-width-5per">
                            <label for="asset_id" class="custom-tb-title-text">회선사용기관명</label>
                        </td>
                        <td class="custom-tb-content custom-width-11per">
                            <input id="asset_id" name="asset_id" class="custom-input" />
                        </td>
                        <td colspan="2" class="custom-tb-title custom-width-5per">
                            <label for="asset_id" class="custom-tb-title-text">청약(장애소관)</label>
                        </td>
                        <td class="custom-tb-content custom-width-11per">
                            <input id="asset_id" name="asset_id" class="custom-input" />
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2" class="custom-tb-title custom-width-5per">
                            <label for="asset_id" class="custom-tb-title-text">회선사업자</label>
                        </td>
                        <td class="custom-tb-content custom-width-11per">
                            <select id="asset_id" name="asset_id" class="custom-select" style="width: 52% !important;">
                                <option value="1">전체</option>
                                <option value="2">테스트 1</option>
                                <option value="3">테스트 2</option>
                            </select>
                        </td>
                        <td colspan="2" class="custom-tb-title custom-width-5per">
                            <label for="asset_id" class="custom-tb-title-text">회선번호</label>
                        </td>
                        <td class="custom-tb-content custom-width-11per">
                            <input id="asset_id" name="asset_id" class="custom-input" />
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2" class="custom-tb-title custom-width-5per">
                            <label for="asset_id" class="custom-tb-title-text">회선용도</label>
                        </td>
                        <td class="custom-tb-content custom-width-11per">
                            <input id="asset_id" name="asset_id" class="custom-input" />
                        </td>
                        <td colspan="2" class="custom-tb-title custom-width-5per">
                            <label for="asset_id" class="custom-tb-title-text">회선속도</label>
                        </td>
                        <td class="custom-tb-content custom-width-11per">
                            <input id="asset_id" name="asset_id" class="custom-input" />
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2" class="custom-tb-title custom-width-5per">
                            <label for="asset_id" class="custom-tb-title-text">회선종류</label>
                        </td>
                        <td class="custom-tb-content custom-width-11per">
                            <input id="asset_id" name="asset_id" class="custom-input" />
                        </td>
                        <td colspan="2" class="custom-tb-content custom-width-11per">
                        </td>
                    </tr>
                    <tr>
                        <td rowspan="6" class="custom-tb-title custom-width-5per">
                            <label for="asset_id" class="custom-tb-title-text">상위</label>
                        </td>
                        <tr>
                            <td class="custom-tb-title custom-width-5per">
                                <label for="asset_id" class="custom-tb-title-text">기관명</label>
                            </td>
                            <td class="custom-tb-content custom-width-11per">
                                <input id="asset_id" name="asset_id" class="custom-input" />
                            </td>
                        </tr>
                        <tr>
                            <td class="custom-tb-title custom-width-5per">
                                <label for="asset_id" class="custom-tb-title-text">지역</label>
                            </td>
                            <td class="custom-tb-content custom-width-11per">
                                <input id="asset_id" name="asset_id" class="custom-input" />
                            </td>
                        </tr>
                        <tr>
                            <td class="custom-tb-title custom-width-5per">
                                <label for="asset_id" class="custom-tb-title-text">담당기관</label>
                            </td>
                            <td class="custom-tb-content custom-width-11per">
                                <input id="asset_id" name="asset_id" class="custom-input" />
                            </td>
                        </tr>
                        <tr>
                            <td class="custom-tb-title custom-width-5per">
                                <label for="asset_id" class="custom-tb-title-text">담당자</label>
                            </td>
                            <td class="custom-tb-content custom-width-11per">
                                <input id="asset_id" name="asset_id" class="custom-input" />
                            </td>
                        </tr>
                        <tr>
                            <td class="custom-tb-title custom-width-5per">
                                <label for="asset_id" class="custom-tb-title-text">연락처</label>
                            </td>
                            <td class="custom-tb-content custom-width-11per">
                                <input id="asset_id" name="asset_id" class="custom-input" />
                            </td>
                        </tr>
                        <tr>
                            <td class="custom-tb-title custom-width-5per">
                                <label for="asset_id" class="custom-tb-title-text">좌표</label>
                            </td>
                            <td class="custom-tb-content custom-width-11per">
                                <input id="asset_id" name="asset_id" class="custom-input" />
                            </td>
                        </tr>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
  `;
}
