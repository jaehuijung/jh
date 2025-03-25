package cms.gongju.common.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import cms.gongju.common.service.menuService;
import cms.gongju.common.security.CustomUser;
import cms.gongju.common.security.MemberDao;

import java.util.Map;

@Slf4j
@RequestMapping("/common")
@RestController
public class menuController {

    private final menuService menuService;

    public menuController(menuService menuService){
        this.menuService = menuService;
    }

    /**
     * 상단 메뉴와 왼쪽 사이드 메뉴 그릴때 필요한 리스트
     *
     * @return 메뉴 리스트
     */
    @GetMapping("/menuList")
    public Map<String, Object> getMenuList(Authentication authentication){
        CustomUser customUser = (CustomUser) authentication.getPrincipal();
        MemberDao member = customUser.getMember();

        if(member != null) {
            String groupId = member.getGroupId();
            return menuService.getMenuList(groupId);
        }

        return null;
    }

}
