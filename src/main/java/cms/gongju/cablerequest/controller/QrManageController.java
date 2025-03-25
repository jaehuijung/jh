package cms.gongju.cablerequest.controller;

import cms.gongju.cablerequest.service.QrManageService;
import cms.gongju.cablerequest.vo.CableRequestVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/cable/qr")
public class QrManageController {

    private final QrManageService qrManageService;

    /**
     * [화면] QR 관리 페이지
     *  - DS5A 스캐너가 웹페이지 포커스에 커서가 있으면, 스캔한 값이 input box에 들어올 수 있음(키보드 에뮬레이션)
     */
    @GetMapping("/view")
    public String qrManageView(Model model){
        return "views/cablerequest/qrManageList";
        // 예: Thymeleaf "qrManageList.html"
    }

    /**
     * [AJAX] QR 코드로 케이블(포설) 조회
     * - param.qrCode : 스캐너에서 읽은 문자열
     */
    @ResponseBody
    @PostMapping("/getCable")
    public Map<String, Object> getCableByQr(@RequestBody Map<String,Object> param){
        // param 구조: { qrCode: "..." }
        //return qrManageService.getCableListByQr(param);
        List<Map<String,Object>> list = qrManageService.getCableListByQr(param);
        int total =  list.size(); // 또는 별도 countQuery
        return Map.of("rows", list, "total", total);
    }
}
