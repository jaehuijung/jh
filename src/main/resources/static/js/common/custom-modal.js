class modalManager {
    static modalContainer = null;
    static userRoleChangeHandler = {};
    static willCloseCallback = null;
    static didCloseCallback = null;

    /**
     * 모달 생성 및 속성 초기화
     */
    static initialize() {
        if (!this.modalContainer) {
            this.modalContainer = document.createElement("div");
            this.modalContainer.id = "custom-modal-container";
            this.modalContainer.style.position = "fixed";
            this.modalContainer.style.top = "0";
            this.modalContainer.style.left = "0";
            this.modalContainer.style.width = "100vw";
            this.modalContainer.style.height = "100vh";
            this.modalContainer.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
            this.modalContainer.style.backdropFilter = "blur(10px)";
            this.modalContainer.style.display = "none";
            this.modalContainer.style.alignItems = "center";
            this.modalContainer.style.justifyContent = "center";
            this.modalContainer.style.zIndex = "1000";
            document.body.appendChild(this.modalContainer);
        }
    }

    /**
     * 모달 표시
     * @param {Object} options - 모달 설정
     * @param {string} options.title - 모달 제목
     * @param {string} options.html - 모달 내용
     * @param {string} options.icon - 모달 아이콘 (info, success, warning 등)
     * @param {string} options.confirmButtonText - 확인 버튼 텍스트
     * @param {function|Promise<any>} options.callback - 확인 버튼 콜백 함수
     * @param {boolean} [options.allowOutsideClick=true] - 외부 클릭 허용 여부
     */
    static show(config) {
        return new Promise((resolve, reject) => {
            const defaultConfig = {
                title: "", // 제목
                html: "", // 내용 HTML
                icon: null, // 아이콘 (success, error, warning, info, question)
                allowOutsideClick: true, // 외부 클릭으로 닫기 허용 여부
                showConfirmButton: true, // 확인 버튼 표시 여부
                confirmButtonText: "OK", // 확인 버튼 텍스트
                showCancelButton: false, // 취소 버튼 표시 여부
                cancelButtonText: "Cancel", // 취소 버튼 텍스트
                showCloseButton: true, // 닫기 버튼 표시 여부
                preConfirm: null, // 확인 버튼 클릭 전 실행할 Promise 함수
                preDeny: null, // 취소 버튼 클릭 전 실행할 Promise 함수
                didOpen: null, // 모달 열린 후 실행할 콜백 함수
                didClose: null, // 모달 닫힌 후 실행할 콜백 함수
                didRender: null, // 모달 렌더링 후 실행할 콜백 함수
                willOpen: null, // 모달 열리기 전 실행할 콜백 함수
                willClose: null, // 모달 닫히기 전 실행할 콜백 함수
                callback: null, // 확인 버튼 콜백 함수
            };

            const finalConfig = { ...defaultConfig, ...config };

            // 콜백 함수 저장
            this.willCloseCallback = finalConfig.willClose;
            this.didCloseCallback = finalConfig.didClose;

            this.initialize();

            const iconHtml = this.getIconHtml(finalConfig.icon);

            // 모달 내용 래핑을 위한 추가 div (이벤트 버블링 방지)
            const modalContentWrapper = `
                <div class="modal-content-wrapper" style="background: white; border-radius: 10px; width: auto; min-width: 400px; position: relative; text-align: center;">
                    <div style="background: #00274D; border-radius: 10px 10px 0px 0px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <div style="padding: 0px 20px; display: flex; align-items: center;">
                            ${iconHtml}
                            <h2 style="font-size: 1rem; color: white; margin: 10px;">${finalConfig.title || ""}</h2>
                        </div>
                        ${finalConfig.showCloseButton ? `<button id="custom-modal-close" style="background: none; margin-right: 20px; padding: 0; border: none; font-size: 1rem; color: white; cursor: pointer;">×</button>` : ''}
                    </div>

                    <div style="font-size: 17px; color: #555; border-bottom: 1px solid black; text-align: left;">
                        <div style="${isHTML(finalConfig.html) ? '' : 'margin: 10px 0px 15px 15px;'}">${finalConfig.html || ""}</div>

                        <div id="custom-modal-validation-message" style="color: white; background: lightcoral; margin: 15px 0px 0px 0px; height:40px; display: none;"></div>
                    </div>

                    ${
                        finalConfig.showConfirmButton ?
                            `<div style="text-align: right;">
                                <button id="custom-modal-confirm" style="padding: 8px 15px; font-size: 0.8rem; background: #708090; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 10px 10px 10px 0px;">${finalConfig.confirmButtonText}</button>
                                ${finalConfig.showCancelButton ? `<button id="custom-modal-cancel" style="padding: 8px 15px; font-size: 0.8rem; background: #ccc; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 10px 10px 10px 0px;">${finalConfig.cancelButtonText}</button>` : ''}
                            </div>`
                            : ""
                    }
                </div>
            `;

            this.modalContainer.innerHTML = modalContentWrapper;
            this.modalContainer.style.display = "flex";

            // 모달 내용 영역에 클릭 이벤트 중지 리스너 추가 (중요)
            const modalContentWrapperEl = document.querySelector('.modal-content-wrapper');
            if (modalContentWrapperEl) {
                modalContentWrapperEl.addEventListener('click', function(e) {
                    e.stopPropagation(); // 클릭 이벤트가 modalContainer로 전파되는 것을 방지
                });
            }

            // 외부 클릭 이벤트 (수정된 부분)
            if (finalConfig.allowOutsideClick) {
                const handleOutsideClick = (e) => {
                    // 모달 컨테이너 자체가 클릭된 경우에만 닫기
                    if (e.target === this.modalContainer) {
                        this.close();
                        resolve(false);
                    }
                };

                this.modalContainer.addEventListener("click", handleOutsideClick);
            }

            if (finalConfig.showCloseButton) {
                document.getElementById("custom-modal-close").addEventListener("click", (e) => {
                    e.stopPropagation(); // 이벤트 버블링 방지
                    this.close();
                    resolve(false);
                });
            }

            if (finalConfig.showCancelButton) {
                document.getElementById("custom-modal-cancel").addEventListener("click", (e) => {
                    e.stopPropagation(); // 이벤트 버블링 방지
                    this.close();
                    resolve(false);
                });
            }

            if (finalConfig.willOpen && typeof finalConfig.willOpen === "function") {
                finalConfig.willOpen();
            }

            requestAnimationFrame(() => {
                if (finalConfig.didOpen && typeof finalConfig.didOpen === "function") {
                    finalConfig.didOpen();
                }
            });

            if (finalConfig.didRender && typeof finalConfig.didRender === "function") {
                finalConfig.didRender();
            }

            const confirmButton = document.getElementById("custom-modal-confirm");
            if (confirmButton) {
                confirmButton.addEventListener("click", (e) => {
                    e.stopPropagation(); // 이벤트 버블링 방지
                    let preConfirmResult = finalConfig.preConfirm ? finalConfig.preConfirm() : Promise.resolve();

                    if (!(preConfirmResult instanceof Promise)) {
                        preConfirmResult = Promise.resolve(preConfirmResult);
                    }

                    preConfirmResult
                        .then((result) => {
                            this.close();
                            if (finalConfig.callback && typeof finalConfig.callback === "function") {
                                finalConfig.callback();
                            }

                            resolve({ isConfirmed: true, value: result }); // 결과를 value에 포함
                        })
                        .catch((err) => {
                            console.error("preConfirm 오류:", err);
                            reject(err);
                        });
                });
            } else {
                resolve({ isConfirmed: true });
            }
        });
    }

    static showValidationMessage(message) {
        const validationMessageElement = document.getElementById("custom-modal-validation-message");
        if (validationMessageElement) {
            validationMessageElement.textContent = message;
            validationMessageElement.style.display = "flex";
            validationMessageElement.style.alignItems = "center";
            validationMessageElement.style.justifyContent = "center";
        }
    }

    static resetValidationMessage() {
        const validationMessageElement = document.getElementById("custom-modal-validation-message");
        if (validationMessageElement) {
            validationMessageElement.textContent = "";
            validationMessageElement.style.display = "none";
        }
    }

    /**
     * 아이콘 HTML 반환
     * @param {string} iconType - 아이콘 종류 (success, error, info, warning)
     * @returns {string}
     */
    static getIconHtml(iconType) {
        const icons = {
            success: "✔",
            error: "✖",
            info: "ℹ",
            warning: "⚠"
        };

        if (!icons[iconType]) return "";
        return `<div style="font-size: 1rem; color: ${
            iconType === "success"
                ? "green"
                : iconType === "error"
                ? "red"
                : iconType === "info"
                ? "white"
                : "darkorange"
        };">${icons[iconType]}</div>`;
    }

    /**
     * 모달 닫기
     */
    static close() {
        if (this.modalContainer) {
            console.log("모달 닫기 실행");

            // willClose 콜백 함수 호출 (저장된 함수 사용)
            if (this.willCloseCallback && typeof this.willCloseCallback === "function") {
                try {
                    this.willCloseCallback();
                } catch (e) {
                    console.error("willClose 콜백 실행 중 오류:", e);
                }
            }

            this.modalContainer.style.display = "none";
            this.modalContainer.innerHTML = "";

            // didClose 콜백 함수 호출 (저장된 함수 사용)
            if (this.didCloseCallback && typeof this.didCloseCallback === "function") {
                try {
                    this.didCloseCallback();
                } catch (e) {
                    console.error("didClose 콜백 실행 중 오류:", e);
                }
            }

            // 콜백 참조 정리
            this.willCloseCallback = null;
            this.didCloseCallback = null;
        }
    }
}

function isHTML(str) {
  const htmlTagRegex = /<([a-zA-Z]+)(?:\s[^>]*)?>(.*?)<\/\1>/g;
  return htmlTagRegex.test(str);
}

function alert2(title, html, icon, confirmButtonText, callback) {
    modalManager.show({
        title: title,
        html: html,
        icon: icon,
        confirmButtonText: confirmButtonText,
        callback: callback
    });
}

function alert3(type) {
    let title = "";
    let html = "";
    let icon = ""; // 아이콘 변수 추가

    if (type === "load") {
        title = "loading ...";
        html = `<img src="/images/loading.gif" alt="Loading" />`;
        icon = "info"; // 로딩 아이콘 설정
    } else if (type === "delete") {
        title = "deleting ...";
        html = `<img src="/images/loading.gif" alt="Loading" />`;
        icon = "warning"; // 삭제 아이콘 설정
    } else if (type === "save") {
        title = "saving ...";
        html = `<img src="/images/upload.gif" alt="Loading" />`;
        icon = "success"; // 저장 아이콘 설정
    } else if (type === "download") {
        title = "downloading ...";
        html = `<img src="/images/download.gif" alt="Loading" />`;
        icon = "info"; // 다운로드 아이콘 설정
    }

    modalManager.show({
        title: title,
        html: html,
        icon: icon,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
            const closeBtn = document.getElementById("custom-modal-close");
            if (closeBtn) {
                closeBtn.style.display = 'none';
            }
        }
    });
}

function alert3Close() {
    modalManager.close();
}

// Grid 호환성 확장 메서드 추가
modalManager.gridCompatibility = {
    // Toast UI Grid와의 호환성을 위한 스타일 추가
    addGridStyles: function() {
        // 이미 스타일이 추가되었는지 확인
        if (document.getElementById('custom-modal-grid-styles')) {
            return;
        }

        // 스타일 요소 생성
        const styleEl = document.createElement('style');
        styleEl.id = 'custom-modal-grid-styles';
        styleEl.innerHTML = `
            #custom-modal-container {
                z-index: 2000 !important;
            }

            #custom-modal-container .tui-grid-container,
            #custom-modal-container .tui-grid,
            #custom-modal-container .tui-grid-header-area,
            #custom-modal-container .tui-grid-body-area {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                z-index: 100 !important;
                position: relative !important;
            }

            #custom-modal-container .tui-grid-cell {
                display: table-cell !important;
                visibility: visible !important;
                opacity: 1 !important;
            }

            #custom-modal-container > div {
                overflow: visible !important;
            }

            .custom-modal-grid-container {
                width: 100% !important;
                max-width: 100% !important;
                height: 300px !important;
                min-height: 300px !important;
                overflow: visible !important;
                position: relative !important;
                display: block !important;
                background-color: #ffffff !important;
                border: 1px solid #ddd !important;
            }

            /* 모달 내 콘텐츠 래퍼에 포인터 이벤트 설정 */
            .modal-content-wrapper {
                pointer-events: auto !important;
            }
        `;

        // 스타일을 head에 추가
        document.head.appendChild(styleEl);
        console.log("Toast UI Grid 호환 스타일이 추가되었습니다.");
    },

    // Grid 인스턴스 관리
    gridInstances: [],

    // Grid 인스턴스 등록
    registerGrid: function(gridInstance) {
        this.gridInstances.push(gridInstance);
        console.log("Grid 인스턴스가 등록되었습니다. 총", this.gridInstances.length, "개");
    },

    // Grid 인스턴스 정리
    clearGrids: function() {
        this.gridInstances = [];
        console.log("Grid 인스턴스 목록이 초기화되었습니다.");
    },

    // 모든 Grid 인스턴스의 레이아웃 갱신
    refreshAllGrids: function() {
        console.log("모든 Grid 레이아웃 갱신 시도...");
        this.gridInstances.forEach((grid, index) => {
            if (grid && typeof grid.refreshLayout === 'function') {
                try {
                    grid.refreshLayout();
                    console.log("Grid", index, "레이아웃 갱신 성공");
                } catch (e) {
                    console.error("Grid", index, "레이아웃 갱신 중 오류:", e);
                }
            }
        });
    }
};

// 원본 modalManager.show 함수 백업
modalManager._originalShow = modalManager.show;

// modalManager.show 함수 오버라이드
modalManager.show = function(config) {
    // Grid 호환성 스타일 추가
    this.gridCompatibility.addGridStyles();

    // Grid 인스턴스 목록 초기화
    this.gridCompatibility.clearGrids();

    // 원본 함수 호출
    const result = this._originalShow(config);

    // 모달 열린 후 추가 처리
    const modalContentElement = document.querySelector('#custom-modal-container > div');
    if (modalContentElement) {
        modalContentElement.style.overflow = 'visible';
    }

    // 모달 내 Grid 레이아웃 갱신을 위한 타이머 설정
    const refreshGridsInterval = setInterval(() => {
        this.gridCompatibility.refreshAllGrids();
    }, 300);

    // 5초 후 타이머 해제
    setTimeout(() => {
        clearInterval(refreshGridsInterval);
    }, 5000);

    return result;
};

// Toast UI Grid 생성자 오버라이드
if (typeof tui !== 'undefined' && tui.Grid) {
    const originalGridConstructor = tui.Grid;

    tui.Grid = function() {
        const grid = new originalGridConstructor(...arguments);

        // 생성된 Grid 인스턴스 등록
        modalManager.gridCompatibility.registerGrid(grid);

        return grid;
    };

    // 정적 프로퍼티/메서드 복사
    for (const prop in originalGridConstructor) {
        if (originalGridConstructor.hasOwnProperty(prop)) {
            tui.Grid[prop] = originalGridConstructor[prop];
        }
    }

    // 프로토타입 복사
    tui.Grid.prototype = originalGridConstructor.prototype;
}

/**
 * modalManager에 외부 페이지 로드 기능 추가
 * - showExternalPage 메서드 추가: 외부 URL을 iframe으로 모달에 표시
 * - Grid 호환성 유지 및 추가
 */

modalManager.showExternalPage = function(config) {
    return new Promise((resolve, reject) => {
        // 기본 설정값
        const defaultConfig = {
            url: "",                 // 로드할 외부 페이지 URL (필수)
            title: "",               // 모달 제목
            width: "80%",            // 모달 너비 (기본값: 화면의 80%)
            height: "80vh",          // 모달 높이 (기본값: 화면 높이의 80%) - vh 단위로 변경
            maxWidth: "1200px",      // 최대 너비
            allowOutsideClick: true, // 외부 클릭으로 닫기 허용 여부
            showCloseButton: true,   // 닫기 버튼 표시 여부
            footerButtons: [],       // 푸터에 표시할 버튼 배열 [{text, class, callback}]
            onLoad: null,            // iframe 로드 완료 시 호출할 콜백
            onClose: null,           // 모달 닫힐 때 호출할 콜백
            passParams: {}           // iframe에 전달할 파라미터 (URL 쿼리스트링으로 전달)
        };

        const finalConfig = { ...defaultConfig, ...config };

        if (!finalConfig.url) {
            reject(new Error("URL이 지정되지 않았습니다."));
            return;
        }

        // iframe에 전달할 파라미터가 있으면 URL에 추가
        let pageUrl = finalConfig.url;
        if (finalConfig.passParams && Object.keys(finalConfig.passParams).length > 0) {
            const urlObj = new URL(finalConfig.url, window.location.origin);
            for (const [key, value] of Object.entries(finalConfig.passParams)) {
                urlObj.searchParams.append(key, value);
            }
            pageUrl = urlObj.toString();
        }

        // 스타일 추가 (한 번만)
        this._addExternalPageStyles();

        // 모달 콘텐츠 생성 (iframe 포함)
        const iframeId = `modal-iframe-${Date.now()}`;
        const iframeHtml = `
            <div class="modal-iframe-container" style="position: relative; width: 100%; height: calc(100% - 40px); min-height: 500px;">
                <iframe
                    id="${iframeId}"
                    src="${pageUrl}"
                    frameborder="0"
                    style="width: 100%; height: 100%; min-height: 500px; border: none;"
                    allowfullscreen
                ></iframe>
                <div id="${iframeId}-loading" class="iframe-loading-overlay">
                    <div class="spinner-container">
                        <div class="spinner"></div>
                        <p>로딩 중...</p>
                    </div>
                </div>
            </div>
        `;

        // 푸터 버튼 생성
        let footerHtml = '';
        if (finalConfig.footerButtons && finalConfig.footerButtons.length > 0) {
            footerHtml = '<div class="modal-footer-buttons">';
            finalConfig.footerButtons.forEach(btn => {
                const btnClass = btn.class || 'custom-btn custom-blue-btn';
                footerHtml += `<button class="${btnClass}" data-action="${btn.action || ''}">${btn.text}</button>`;
            });
            footerHtml += '</div>';
        }

        // modalManager.show 호출하여 모달 생성
        this.show({
            title: finalConfig.title,
            html: iframeHtml + footerHtml,
            allowOutsideClick: finalConfig.allowOutsideClick,
            showCloseButton: finalConfig.showCloseButton,
            didOpen: () => {
                // 모달 콘텐츠 래퍼의 크기를 직접 조정
                const modalContentWrapper = document.querySelector('.modal-content-wrapper');
                if (modalContentWrapper) {
                    modalContentWrapper.style.width = finalConfig.width;
                    modalContentWrapper.style.height = finalConfig.height;
                    modalContentWrapper.style.maxWidth = finalConfig.maxWidth;
                    modalContentWrapper.style.padding = '0';
                    modalContentWrapper.style.overflow = 'hidden';

                    // 모달 내부 클릭이 외부로 전파되지 않도록 설정
                    modalContentWrapper.addEventListener('click', function (e) {
                        e.stopPropagation();
                    });
                }

                // iframe 로드 이벤트 처리
                const iframe = document.getElementById(iframeId);
                const loadingOverlay = document.getElementById(`${iframeId}-loading`);

                if (iframe) {
                    iframe.onload = function() {
                        // 로딩 오버레이 숨기기
                        if (loadingOverlay) {
                            loadingOverlay.style.display = 'none';
                        }

                        // iframe과 부모 창 간 통신 설정
                        try {
                            // iframe 내부 window 객체에 접근
                            const iframeWindow = iframe.contentWindow;

                            // 부모 창 참조 설정
                            iframeWindow.parentModal = {
                                close: () => modalManager.close(),
                                returnValue: null
                            };

                            // iframe 내부 문서의 스타일 조정
                            try {
                                const iframeDoc = iframe.contentDocument || iframeWindow.document;
                                const iframeHtml = iframeDoc.documentElement;
                                const iframeBody = iframeDoc.body;

                                if (iframeHtml) {
                                    iframeHtml.style.height = '100%';
                                    iframeHtml.style.overflow = 'auto';
                                }

                                if (iframeBody) {
                                    iframeBody.style.height = '100%';
                                    iframeBody.style.minHeight = '500px';
                                    iframeBody.style.overflow = 'auto';
                                }
                            } catch (e) {
                                console.warn('iframe 내부 스타일 조정 오류:', e);
                            }

                            // 콜백 호출
                            if (typeof finalConfig.onLoad === 'function') {
                                finalConfig.onLoad(iframe, iframeWindow);
                            }
                        } catch (e) {
                            console.error('iframe 통신 설정 중 오류:', e);
                        }
                    };
                }

                // 사용자 정의 didOpen 콜백이 있으면 호출
                if (typeof finalConfig.didOpen === 'function') {
                    finalConfig.didOpen();
                }

                // 푸터 버튼 이벤트 설정
                if (finalConfig.footerButtons && finalConfig.footerButtons.length > 0) {
                    const footerButtons = document.querySelectorAll('.modal-footer-buttons button');
                    footerButtons.forEach((btn, index) => {
                        btn.addEventListener('click', () => {
                            const buttonConfig = finalConfig.footerButtons[index];
                            if (typeof buttonConfig.callback === 'function') {
                                const iframe = document.getElementById(iframeId);
                                buttonConfig.callback(iframe, iframe?.contentWindow);
                            }
                        });
                    });
                }
            },
            willClose: () => {
                // 모달이 닫히기 전 처리
                if (typeof finalConfig.onClose === 'function') {
                    const iframe = document.getElementById(iframeId);
                    let returnValue = null;

                    // iframe의 returnValue 가져오기 시도
                    try {
                        returnValue = iframe?.contentWindow?.returnValue;
                    } catch (e) {
                        console.error('iframe returnValue 가져오기 오류:', e);
                    }

                    finalConfig.onClose(returnValue);
                }
            }
        }).then(result => {
            resolve(result);
        }).catch(error => {
            reject(error);
        });
    });
};

// 외부 페이지 모달에 필요한 스타일 추가
modalManager._addExternalPageStyles = function() {
    if (document.getElementById('modal-external-page-styles')) {
        return;
    }

    const styleEl = document.createElement('style');
    styleEl.id = 'modal-external-page-styles';
    styleEl.innerHTML = `
        .modal-content-wrapper {
            display: flex !important;
            flex-direction: column !important;
            padding: 0 !important;
            overflow: hidden !important;
        }

        .iframe-loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(255, 255, 255, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10;
        }

        .spinner-container {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            animation: spin 2s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .modal-footer-buttons {
            display: flex;
            justify-content: flex-end;
            padding: 10px;
            background-color: #f5f5f5;
            border-top: 1px solid #ddd;
        }

        .modal-footer-buttons button {
            margin-left: 10px;
        }

        /* 모달 콘텐츠 래퍼가 화면 높이의 90%까지 차지하도록 허용 */
        #custom-modal-container > div {
            max-height: 90vh !important;
        }
    `;

    document.head.appendChild(styleEl);
};