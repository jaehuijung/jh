
/**
 * sweetAlert2를 사용해서 알림 표시 ... 중복으로 사용되는 부분이 많아 함수 작성
 *
 * @param {string} title - 알림 제목
 * @param {string} html - 알림 내용
 * @param {string} icon - 알림 아이콘 종류 (info, error, success 등)
 * @param {string} confirmButtonText - 확인 버튼 텍스트
 * @param {function|Promise<any>} callback - 확인 버튼 클릭 시 호출될 콜백 함수 또는 Promise
 */
function alert2(title, html, icon, confirmButtonText, callback = []) {
    Swal.fire({
        title: title,
        html: html,
        icon: icon,
        confirmButtonText: confirmButtonText,
        heightAuto: false,
    }).then((result) => {
        if (result.isConfirmed) {
            if (callback instanceof Promise) {
                callback.then(() => {
                    console.log("Promise 완료");
                }).catch((err) => {
                    console.error("Promise 실패:", err);
                });
            } else if (typeof callback === 'function') {
                callback();
            }
        }
    });
}



/**
 * sweetAlert2를 사용해서 알림 표시
 */
function alert3(type) {
    let title = "";
    let html = "";

    if (type === "load"){
        title = "loading ...";
        html = `<img src="/images/loading.gif" alt="Loading" />`
    }
    else if(type === "delete"){
        title = "deleting ...";
        html = `<img src="/images/loading.gif" alt="Loading" />`
    }
    else if(type === "save"){
        title = "saving ...";
        html = `<img src="/images/upload.gif" alt="Loading" />`
    }
    else if(type === "download"){
        title = "downloading ...";
        html = `<img src="/images/download.gif" alt="Loading" />`
    }

    Swal.fire({
        title: title,
        html: html,
        allowOutsideClick: false,
        showConfirmButton: false,
        heightAuto: false
    });
}

/**
* alert3 알림 종료
*/
function alert3Close() {
    Swal.close();
}