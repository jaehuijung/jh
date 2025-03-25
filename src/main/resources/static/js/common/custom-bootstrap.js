function tableRefresh(id){
    $(id).bootstrapTable('refresh');
}

function customRenderPagination(tbl, res, containerId="") {
    let pageSize = res.pageSize;
    let pageNumber = res.pageNumber;
    let totalPages = Math.ceil(res.total / pageSize);

    let $pagination = $('<div class="custom-pagination"></div>');

    // 현재 페이지 그룹의 시작과 종료 페이지 번호 계산
    let startPage = Math.floor((pageNumber - 1) / pageSize) * pageSize + 1;
    let endPage = Math.min(startPage + pageSize - 1, totalPages);

    // 이전 버튼 추가
    if (startPage > 1) {
        let $prevButton = $('<a href="#" class="page-num">이전</a>');
        $pagination.append($prevButton);

        $prevButton.on('click', function(e) {
            e.preventDefault();
            $(tbl).bootstrapTable('selectPage', startPage - 1);
        });
    }

    // 페이지 번호 버튼 추가
    for (let i = startPage; i <= endPage; i++) {
        let $pageLink = $('<a href="#" class="page-num">' + i + '</a>');
        if (i === pageNumber) {
            $pageLink.addClass('active');
        }
        $pagination.append($pageLink);

        $pageLink.on('click', function(e) {
            e.preventDefault();
            $(tbl).bootstrapTable('selectPage', i);
        });
    }

    // 다음 버튼 추가
    if (endPage < totalPages) {
        let $nextButton = $('<a href="#" class="page-num">다음</a>');
        $pagination.append($nextButton);

        $nextButton.on('click', function(e) {
            e.preventDefault();
            $(tbl).bootstrapTable('selectPage', endPage + 1);
        });
    }

    // 테이블의 부모 요소에서 fixed-table-pagination 요소를 찾습니다.
    let $wrap = $(tbl).closest('.tbl-bootstrap-wrap');
    let $paginationContainer = $wrap.find('.fixed-table-pagination');

    // 기존 페이지네이션에 커스터마이즈된 페이지네이션을 삽입합니다.
    $paginationContainer.html($pagination);
}

/**
 * BootstrapTable에서 사용할 컬럼 리스트를 생성하는 함수
 *
 * @param {string} field - 컬럼 데이터 필드명
 * @param {boolean} checkbox - 체크박스 여부
 * @param {string} title - 컬럼 제목
 * @returns {object} 컬럼 설정 객체
 */
// 모든 유형의 컬럼을 생성할 수 있는 공통 함수
function createBootstrapTableColumn(field, checkbox = false, title, type = 'default') {
    let column = {
        title: title,
        field: field,
        align: 'center',
        valign: 'middle',
        checkbox: checkbox
    };

    if(field === 'NO'){
        column.formatter = function(value, row, index) {
            let tableOptions = $(tbl).bootstrapTable('getOptions');
            return tableOptions.totalRows - index;
        };
    }
    if (type === 'underline') {
        column.class = 'nowrap underline custom-width-min-160';
    } else {
        column.class = 'nowrap';
    }

    if (field === 'operating_status') {
        column.formatter = function(value, row, index) {
            if (value === '1') {
                return '사용';
            } else {
                return '정지';
            }
        };
    }

    if (field === 'info_update') {
        column.formatter = function(value, row, index) {
            // 팝업 테스트용으로 row 전체를 보냄...
            // 실제로 기능 구현할 때는 row의 id 등을 사용해서 id값만 보내기
            const rowData = encodeURIComponent(JSON.stringify(row));
            return `<button type="button" class="custom-btn custom-gray-btn" onclick="infoUpdate('${rowData}');">수정</button>`;
        }
    }

    return column;
}