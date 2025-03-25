

$(function(){
    loadMenu();
});


function loadMenu() {
    $.ajax({
        url: '/common/menuList',
        type: 'GET',
        contentType: 'application/json',
        success: function(data) {
            if (data.errorCode) {
                buildMenus(data.menuList);
            } else {

            }
        },
        error: function(error) {

        }
    });
}

function buildMenus(menuData) {
    const currentUrl = window.location.pathname;

    buildSideMenu(menuData, currentUrl);
    buildPageNavigation(menuData, currentUrl);
}

// 왼쪽 사이드메뉴 구성
function buildSideMenu(menuData, currentUrl) {
    const currentMenu = getParentMenuId(menuData, currentUrl);
    if (!currentMenu) {
        alert2("알림", "메뉴를 찾을 수 없는 오류가 발생했습니다. <br> 새로고침 후 문제가 지속되면 관리자에게 문의하세요.", "info", "확인");
        return;
    }

    // 필터링: 최상위 메뉴 (parent_menu_id가 00000000)
    const sideMenuContainer = $('#menu-items');
    const topLevelMenus = menuData.filter(menu => menu.parent_menu_id === 0);
    const sideMenuHtml =
        topLevelMenus.map(menu => {
            const isActive = menu.menu_id === currentMenu.menu_id ? ' active' : '';
            const subMenus = menuData.filter(subMenu => subMenu.parent_menu_id === menu.menu_id);
            const subMenuHtml = subMenus.length > 0
                ? `
                    <ul class="dropdown-menu" data-bs-display="static" data-menu-id="${menu.menu_id}">
                        ${subMenus
                            .map(subMenu => {
                                const subActive = subMenu.menu_id === currentMenu.menu_id ? ' active' : '';
                                return `
                                <li data-menu-id="${subMenu.menu_id}">
                                    <a href="${subMenu.url}" class="dropdown-item${subActive}">
                                        <img src="${subMenu.icon}" alt="icon" class="menu-icon" />
                                        ${subMenu.menu_name}
                                    </a>
                                </li>
                                `;
                            })
                            .join('')}
                    </ul>
                `: '';

            // 부모 메뉴 및 하위 메뉴 HTML 생성
            return `
                <div class="menu-item dropdown" data-menu-id="${menu.menu_id}">
                    <a href="${subMenus.length > 0 ? '#' : menu.url}"
                       class="side-menu-item dropdown-toggle ${isActive}"
                       ${subMenus.length > 0 ? 'data-bs-toggle="dropdown" aria-expanded="false"' : ''}>
                        <img src="${menu.icon}" alt="icon" class="menu-icon" />
                        ${menu.menu_name}
                    </a>
                    ${subMenuHtml}
                </div>`;
        }).join('');

    if (sideMenuContainer.length > 0) {
        sideMenuContainer.html(sideMenuHtml);
    }

    openActiveDropdowns(currentMenu.menu_id, menuData); // 페이지 렌더링 후 활성화된 메뉴의 부모 드롭다운 열기
}

function openActiveDropdowns(menuId, menuData) {
    let parentId = menuId;

    while (parentId && parentId !== 0) {
        const parentMenu = menuData.find(menu => menu.menu_id === parentId);

        if (parentMenu) {
            const parentElement = $(`[data-menu-id="${parentMenu.menu_id}"]`);
            const dropdownMenu = parentElement.closest('.menu-item').find('.dropdown-menu');
            const dropdownToggle = parentElement.closest('.side-menu-item').find('.dropdown-toggle');

            dropdownMenu.addClass('show');
            parentElement.addClass('active');
            dropdownToggle.attr('aria-expanded', 'true');

            parentId = parentMenu.parent_menu_id;
        } else {
            break;
        }
    }
}

// 페이지 네비게이션 구성
function buildPageNavigation(menuData, currentUrl) {
    // 중메뉴 찾기
    const currentMenu = getParentMenuId(menuData, currentUrl);
    if (!currentMenu) {
        alert2("알림","메뉴를 찾을 수 없는 오류가 발생했습니다. <br> 새로고침 후 문제가 지속되면 관리자에게 문의하세요.", "info", "확인");
        return;
    }

    // 대메뉴 찾기
    const parentMenu = menuData.find(menu => menu.menu_id === currentMenu.parent_menu_id);
    if (!parentMenu) {
        alert2("알림","메뉴를 찾을 수 없는 오류가 발생했습니다. <br> 새로고침 후 문제가 지속되면 관리자에게 문의하세요.", "info", "확인");
        return;
    }

    // 페이지 구성
    const h1Element = document.querySelector('#page-title');
    if (h1Element) {
        let subTitle = "";
        if(currentUrl.includes("create")){
            subTitle = " (추가)"
        }
        else if(currentUrl.includes("update")){
            subTitle = " (수정)"
        }
        else if(currentUrl.includes("detail")){
            subTitle = " (상세)"
        }

        h1Element.textContent = "➖ " + currentMenu.menu_name + subTitle;
    }

    const breadcrumbElement = document.querySelector('.breadcrumb');

    // home 링크는 만약 대시보드 만들면 거기로 이동하도록 수정!
    if (breadcrumbElement) {
        breadcrumbElement.innerHTML = `
            <li class="breadcrumb-item"><a href="/eqp/hw/view">Home</a></li>
            <li class="breadcrumb-item"><a href="${parentMenu.url}">${parentMenu.menu_name}</a></li>
            <li class="breadcrumb-item active"><a href="${currentMenu.url}">${currentMenu.menu_name}</a></li>
        `;
    }
}

// 사용자가 접근한 상위 메뉴 id 찾기
function getParentMenuId(menuData, currentUrl) {
    const currentMenu = menuData.find(menu => (menu.menu_order ==2 && currentUrl.includes(menu.menu_role)));

    return currentMenu ? currentMenu : null;
}


