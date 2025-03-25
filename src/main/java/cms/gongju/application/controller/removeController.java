package cms.gongju.application.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * 신청관리 > 제거신청
 */
@Slf4j
@CrossOrigin(origins = "*", allowedHeaders = "*") /* CORS 어노테이션 */
@Controller
@RequestMapping("/application/remove")
public class removeController {

    /**
     * 신청관리 > 제거신청 > 조회 > 뷰 페이지
     *
     * @return 제거신청 뷰 페이지
     */
    @GetMapping("/view")
    public String view() {
        return "views/application/remove/view";
    }
}
