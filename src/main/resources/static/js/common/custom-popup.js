const popupManager = {
    /**
    * Prompt 메서드: 팝업 호출 설정
    * @param {Object} config - 사용자 설정 (URL, Title, Size 등)
    * @returns {Promise<any>} - 팝업 결과를 Promise로 반환
    */
    Prompt: function (config) {
        return new Promise((resolve, reject) => {
            const defaultConfig = {
                url: "",
                title: "Default Popup",
                width: 600,
                height: 400,
                resizable: true,
                scrollbars: true,
                centered: true, // 화면 중앙 여부 옵션 추가
            };
            const finalConfig = { ...defaultConfig, ...config };

            let left = 0;
            let top = 0;
            if (finalConfig.centered) {
                left = window.screenX + (window.outerWidth - finalConfig.width) / 2;
                top = window.screenY + (window.outerHeight - finalConfig.height) / 2;
            }

            const features = `
                width=${finalConfig.width},
                height=${finalConfig.height},
                resizable=${finalConfig.resizable ? "yes" : "no"},
                scrollbars=${finalConfig.scrollbars ? "yes" : "no"},
                left=${left},
                top=${top}
            `.trim();

            // 팝업 열기
            const popup = window.open(finalConfig.url, finalConfig.title, features);
            if (!popup) {
                reject("Popup blocked by browser or failed to open.");
                return;
            }

            // 팝업 닫힘
            const timer = setInterval(() => {
                if (popup.closed) {
                    clearInterval(timer);

                    try {
                        if (popup.returnValue) {
                            resolve(popup.returnValue);
                        } else {
                            resolve("Popup closed without a return value.");
                        }
                    } catch (e) {
                        reject("Error occurred while closing the popup.");
                    }
                }
            }, 500);

        });
    },
};