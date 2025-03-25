package cms.gongju.application.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * 신청관리 > QR 코드
 */
@Slf4j
@CrossOrigin(origins = "*", allowedHeaders = "*") /* CORS 어노테이션 */
@Controller
@RequestMapping("/application/qrcode")
public class qrcodeController {

    /**
     * 신청관리 > QR 코드 > 조회 > 뷰 페이지
     *
     * @return QR 코드 뷰 페이지
     */
    @GetMapping("/view")
    public String view() {
        return "views/application/qrcode/view";
    }
}
