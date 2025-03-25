const gridManager = {
    initialConfigs: {},

    /**
     * Grid 데이터를 서버에서 불러와 그리드를 생성하거나 업데이트
     * @param {Object} config - Grid 설정
     * @returns {Promise<any>}
     */
    grid: function (config) {
        return new Promise((resolve, reject) => {
            const defaultConfig = {
                url: "",                   // url
                columns: [],               // toast ui column
                complexColumns: "",        // toast ui complex column
                checkbox: false,           // checkbox 여부
                data: "",                  // 그 외 파라미터 (검색 등)
                gridElementId: "grid",     // 기본 그리드 DOM ID
                tableCountId: "",          // 기본 그리드 카운트 표시 DOM ID
                paginationOption: false,   // 페이지네이션 활성화 여부
                itemsPerPage: 50,          // 페이지네이션 개수 (기본 50)
            };

            const finalConfig = { ...defaultConfig, ...config };
            const { gridElementId } = finalConfig;

            if (!gridElementId) {
                reject('gridElementId가 필요합니다.');
                return;
            }
            this.initialConfigs[gridElementId] = finalConfig;

            this._ensureGridElements(gridElementId, finalConfig.paginationOption);

            this._loadGridData(finalConfig)
                .then(resolve)
                .catch(reject);
        });
    },

    /**
     * 기본적으로 테이블 및 페이지네이션 요소가 존재하지 않으면 생성
     * @param {String} gridElementId - Grid의 ID를 기반으로 DOM 요소 생성
     * @param {boolean} paginationOption - Grid 페이지네이션 활성화 여부
     */
    _ensureGridElements: function (gridElementId, paginationOption) {
        const tableId = `${gridElementId}Table`;
        const paginationId = `${gridElementId}Pagination`;

        const parentElement = document.getElementById(gridElementId); // 부모 요소 가져오기
        if (!parentElement) {
            console.error(`부모 엘리먼트 "${gridElementId}"이(가) 존재하지 않습니다.`);
            return;
        }

        if (!document.getElementById(tableId)) {
            const tableElement = document.createElement('div');
            tableElement.id = tableId;
            parentElement.appendChild(tableElement); // gridElementId 아래에 추가
        }

        if (!document.getElementById(paginationId) && paginationOption) {
            const paginationElement = document.createElement('div');
            paginationElement.id = paginationId;
            paginationElement.className = 'tui-pagination';
            parentElement.appendChild(paginationElement); // gridElementId 아래에 추가
        }
    },

    /**
     * 페이지네이션 초기화
     * @param {String} gridElementId - Grid의 ID를 기반으로 Pagination 초기화
     * @param {Object} paginationOptions - 페이지네이션 설정 값({ totalItems, itemsPerPage, currentPage })
     */
    _initPagination: function (gridElementId, paginationOptions) {
        const { totalItems, itemsPerPage, currentPage } = paginationOptions;
        const paginationId = `${gridElementId}Pagination`;
        const paginationElement = document.getElementById(paginationId);

        if (!paginationElement) {
            console.error(`Pagination 엘리먼트 "${paginationId}"가 존재하지 않습니다.`);
            return;
        }

        let pagination = this.initialConfigs[gridElementId]?.pagination;
        if (!pagination) {
            pagination = new tui.Pagination(paginationElement, {
                totalItems: totalItems || 0,            // 전체 아이템 수
                itemsPerPage: itemsPerPage || 10,       // 한 페이지에 보일 아이템 수
                page: currentPage || 1,                 // 초기 페이지
                centerAlign: true,                      // 페이지네이션 중앙 정렬
            });

            this.initialConfigs[gridElementId].pagination = pagination;

            pagination.on('afterMove', (event) => {
                const newPage = event.page;
                this._onPageChange(gridElementId, newPage);
            });
        } else {

        }
    },


    /**
     * 페이지 변경 시 데이터를 로드하고 Grid 업데이트
     * @param {String} gridElementId - Grid의 ID
     * @param {Number} currentPage - 현재 페이지 번호
     */
    _onPageChange: function (gridElementId, currentPage) {
        const initialConfig = this.initialConfigs[gridElementId];

        if (!initialConfig) {
            console.error(`"${gridElementId}"에 대한 초기 설정이 존재하지 않습니다.`);
            return;
        }

        const data = initialConfig.data;
        console.log(data);

        const updatedConfig = {
            ...initialConfig,
            data: data,
            page: currentPage,
        };

        // 데이터를 로드하고 Grid 업데이트
        this._loadGridData(updatedConfig)
            .then((result) => {
                console.log(`"${gridElementId}" 그리드가 페이지 ${currentPage}로 업데이트되었습니다.`);
            })
            .catch((err) => {
                console.error(`"${gridElementId}" 페이지 업데이트 중 오류 발생:`, err);
            });
    },

    /**
     * Grid 데이터를 업데이트 (특정 gridElementId에 대해 초기 설정 유지하며 일부 검색 조건 변경)
     * @param {String} gridElementId - 업데이트할 grid의 DOM ID
     * @param {String|Object} data - 추가로 서버로 전달할 데이터
     * @returns {Promise<any>}
     */
    updateGrid: function (gridElementId, data= "") {
        return new Promise((resolve, reject) => {

            const initialConfig = this.initialConfigs[gridElementId];
            if (!initialConfig) {
                reject(`gridElementId "${gridElementId}"에 대한 초기 설정이 존재하지 않습니다.`);
                return;
            }

            const pagination = this.initialConfigs[gridElementId]?.pagination;
            let currentPage = 1;

            if (pagination) {
                currentPage = pagination.getCurrentPage();
            }

            this.initialConfigs[gridElementId] = {
                ...initialConfig,
                data,
                page: currentPage
            };

            const updatedConfig = {
                ...initialConfig,
                data,
                page: currentPage
            };

            this._loadGridData(updatedConfig)
                .then((result) => {
                    const totalItems = result.total;
                    if (pagination) {
                        pagination.reset(totalItems);
                        pagination.movePageTo(currentPage);
                    }

                    resolve(result);
                })
                .catch(reject);
        });
    },

    /**
     * 내부적으로 AJAX 요청을 통해 데이터를 로드하고 그리드 갱신
     * @param {Object} config - 서버 요청 및 Grid 갱신 설정
     * @returns {Promise<any>}
     */
    _loadGridData: function (config) {
        return new Promise((resolve, reject) => {
            let pagination = config.paginationOption;
            let currentPage;
            let itemsPerPage;
            let start;
            let data = { data : config.data };

            if (pagination) {
                currentPage = config.page || 1; // 현재 페이지 (기본값: 1)
                itemsPerPage = config.itemsPerPage || 10; // 페이지당 항목 수 (기본값: 10)
                start = (currentPage - 1) * itemsPerPage;

                data.start = start;
                data.page = itemsPerPage;
            }

            $.ajax({
                url: config.url,
                method: 'post',
                contentType: 'application/json',
                data: JSON.stringify(data),
                dataType: 'JSON',
                success: (res) => {
                    const rowData = res.rows;
                    const total = res.total;

                    // 전체 개수 업데이트
                    if (total !== undefined && config.tableCountId !== "") {
                        const tableCountElement = document.getElementById(config.tableCountId);
                        if (tableCountElement) {
                            tableCountElement.textContent = `전체 개수 : ${total}개`;
                        }

                        if (pagination) {
                            this._initPagination(config.gridElementId, {
                                totalItems: total,
                                itemsPerPage,
                                currentPage,
                            });
                        }
                    }

                    // Grid 초기화 또는 데이터 리셋
                    const gridElement = document.getElementById(`${config.gridElementId}Table`);
                    if (gridElement) {
                        if (gridElement.gridInstance) {
                            const allRowElements = document.querySelectorAll(`#${config.gridElementId}Table [data-row-key]`);
                            allRowElements.forEach((cell) => {
                                cell.classList.remove('tui-selected-row');
                            });
                            gridElement.gridInstance.resetData(rowData);
                        } else {
                            const gridOptions = {
                                el: gridElement,
                                scrollX: false,
                                scrollY: true,
                                data: rowData,
                                columns: config.columns,
                            };

                            if (config.checkbox) {
                                gridOptions.rowHeaders = ['checkbox'];
                            }

                            if (Array.isArray(config.complexColumns)) {
                                gridOptions.header = {
                                    height: 65,
                                    complexColumns: config.complexColumns,
                                };
                            }

                            gridElement.gridInstance = new tui.Grid(gridOptions);

                            gridElement.gridInstance.on('check', (ev) => {
                                const rowElements = document.querySelectorAll(`#${config.gridElementId}Table [data-row-key="${ev.rowKey}"]`);
                                rowElements.forEach((cell) => {
                                    cell.classList.add('tui-selected-row');
                                });
                            });

                            gridElement.gridInstance.on('uncheck', (ev) => {
                                const rowElements = document.querySelectorAll(`#${config.gridElementId}Table [data-row-key="${ev.rowKey}"]`);
                                rowElements.forEach((cell) => {
                                    cell.classList.remove('tui-selected-row');
                                });
                            });

                            gridElement.gridInstance.on('checkAll', () => {
                                const allRowElements = document.querySelectorAll(`#${config.gridElementId}Table [data-row-key]`);
                                allRowElements.forEach((cell) => {
                                    cell.classList.add('tui-selected-row');
                                });
                            });

                            gridElement.gridInstance.on('uncheckAll', () => {
                                const allRowElements = document.querySelectorAll(`#${config.gridElementId}Table [data-row-key]`);
                                allRowElements.forEach((cell) => {
                                    cell.classList.remove('tui-selected-row');
                                });
                            });
                        }

                        this._setGridHeight(config.gridElementId);
                        resolve({
                            instance: gridElement.gridInstance,
                            total: total,
                        });
                    } else {
                        reject('그리드를 렌더링할 요소를 찾을 수 없습니다.');
                    }
                },
                error: () => {
                    alert2('알림', '데이터를 불러오는 중 오류가 발생했습니다.', 'info', '확인');
                    reject('AJAX 요청 에러');
                },
            });
        });
    },

    /**
     * 그리드 높이를 설정
     * @param {String} gridElementId - Grid의 ID
     */
    _setGridHeight: function (gridElementId) {
        const gridElement = document.getElementById(`${gridElementId}Table`);
        if (gridElement && gridElement.gridInstance) {
            const gridTop = gridElement.getBoundingClientRect().top; // 그리드 상단 위치
            const windowHeight = window.innerHeight;
            const remainingHeight = windowHeight - gridTop - 80; // 남은 공간
            const minHeight = 200; // 최소 높이 (필요에 따라 조정)
            const gridHeight = Math.max(remainingHeight, minHeight); // 최소 높이 보장

            gridElement.style.height = `${gridHeight}px`;
            gridElement.gridInstance.setHeight(gridHeight); // Grid 높이 재설정
        }
    },


    /**
     * 특정 그리드에서 선택된 체크박스 Row 정보를 반환
     * @param {String} gridElementId - 데이터를 가져올 grid의 DOM ID
     * @returns {Array<Object>} - 선택된 행 데이터 배열
     */
    getCheckedRows: function (gridElementId) {
        const gridElement = document.getElementById(`${gridElementId}Table`);
        if (gridElement && gridElement.gridInstance) {
            return gridElement.gridInstance.getCheckedRows();
        } else {
            console.error(`gridElementId "${gridElementId}"에 해당하는 그리드가 존재하지 않습니다.`);
            return [];
        }
    },

    /**
     * 특정 그리드에서 선택된 라디오 Row 정보를 반환
     * @param {String} gridElementId - 데이터를 가져올 grid의 DOM ID
     * @param {String} rowIndex - 선택된 row의 index
     * @returns {Object|null} - 선택된 행 데이터 배열
     */
    getRadioRows: function (gridElementId, rowIndex) {
        const gridElement = document.getElementById(`${gridElementId}Table`);

        if (!gridElement || !gridElement.gridInstance) {
            console.error(`gridElementId "${gridElementId}"에 해당하는 그리드가 존재하지 않습니다.`);
            return null;
        }

        const gridInstance = gridElement.gridInstance;
        const rowKey = gridInstance.getIndexOfRow(rowIndex);

        if (rowKey === -1 || rowKey === undefined) {
            console.error(`rowIndex ${rowIndex}에 해당하는 행을 찾을 수 없습니다.`);
            return null;
        }

        return gridInstance.getRow(rowKey);
    },


    /**
     * 특정 그리드에서 수정된 행 데이터 반환
     * @param {String} gridElementId - 데이터를 가져올 grid의 DOM ID
     * @returns {Object} - { createdRows: [], updatedRows: [], deletedRows: [] }
     */
    getModifiedRows: function (gridElementId) {
        const gridElement = document.getElementById(`${gridElementId}Table`);

        if (!gridElement || !gridElement.gridInstance) {
            console.error(`gridElementId "${gridElementId}"에 해당하는 그리드가 존재하지 않습니다.`);
            return { createdRows: [], updatedRows: [] };
        }

        const gridInstance = gridElement.gridInstance;
        return gridInstance.getModifiedRows();
    },

    /**
     * 클릭된 요소 기준으로 그리드의 Row 데이터를 반환
     * @param {String} gridElementId - 데이터를 가져올 grid의 DOM ID
     * @param {Event|HTMLElement} target - 클릭 이벤트 객체나 기준이 될 HTMLElement
     * @returns {Object|null} - 관련 행의 데이터 (존재하지 않을 경우 null 반환)
     */
    getRowDataByEvent: function (gridElementId, target) {
        const gridElement = document.getElementById(`${gridElementId}Table`);

        if (!gridElement || !gridElement.gridInstance) {
            console.error(`gridElementId "${gridElementId}"에 해당하는 그리드가 존재하지 않습니다.`);
            return null;
        }

        const gridInstance = gridElement.gridInstance;
        let targetElement;

        if (target && 'target' in target) {
            targetElement = target.target;
        } else if (target instanceof HTMLElement) {
            targetElement = target;
        } else {
            console.error('target은 jQuery Event 객체나 HTMLElement여야 합니다.');
            return null;
        }

        const $target = $(targetElement);
        const rowIndex = $target.closest('tr').index();  // DOM 인덱스 가져오기
        const rowKey = gridInstance.getIndexOfRow(rowIndex); // RowKey 가져오기

        if (rowKey === -1) {
            console.error('해당 행의 rowKey를 찾을 수 없습니다.');
            return null;
        }

        return gridInstance.getRow(rowKey);
    },

};

// 브라우저 창 크기 변경 시 높이 재설정
$(window).on('resize', function () {
    for (const gridElementId in gridManager.initialConfigs) {
        gridManager._setGridHeight(gridElementId);
    }
});