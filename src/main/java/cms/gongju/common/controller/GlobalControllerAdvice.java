package cms.gongju.common.controller;

import org.springframework.security.core.Authentication;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;
import cms.gongju.common.security.CustomUser;

/**
 * GlobalControllerAdvice 클래스는 모든 컨트롤러에서 공통적으로 사용될 수 있는
 * 모델 속성을 정의하는 역할을 합니다.
 */
@ControllerAdvice
public class GlobalControllerAdvice {

    /**
     * 모든 컨트롤러에서 `Model` 객체에 `accountData` 속성을 설정합니다.
     *
     * @param model `Model` 객체로, 뷰에 데이터를 전달하기 위해 사용됩니다.
     * @param authentication `Authentication` 객체로, 현재 인증된 사용자 정보를 포함합니다.
     */
    @ModelAttribute
    public void setAttribute(Model model, Authentication authentication) {

        // 인증 정보가 없는 경우, accountData 속성을 null로 설정합니다.
        if(authentication == null) {
            model.addAttribute("accountData", null);
        } else {
            // 인증 정보가 있는 경우, CustomUser 객체에서 member 정보를 가져와 accountData 속성으로 설정합니다.
            CustomUser customUser = (CustomUser) authentication.getPrincipal();
            model.addAttribute("accountData", customUser.getMember());
        }
    }
}