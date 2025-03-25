package cms.gongju.patch.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * 패치현황관리 > DR전용패치
 */
@Slf4j
@CrossOrigin(origins = "*", allowedHeaders = "*") /* CORS 어노테이션 */
@Controller
@RequestMapping("/patch/dr")
public class drController {

    /**
     * 패치현황관리 > DR전용패치 > 조회 > 뷰 페이지
     *
     * @return DR전용패치 뷰 페이지
     */
    @GetMapping("/view")
    public String view() {
        return "views/patch/dr/view";
    }
}
