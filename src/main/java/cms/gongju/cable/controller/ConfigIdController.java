package cms.gongju.cable.controller;

import cms.gongju.cable.service.ConfigIdService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

/**
 * 선번장관리 > 구성ID갱신
 */
@Slf4j
@CrossOrigin(origins = "*", allowedHeaders = "*") /* CORS 어노테이션 */
@RequiredArgsConstructor
@Controller
@RequestMapping("/cable/configId")
public class ConfigIdController {

    private final ConfigIdService configIdService;

    /**
     * 선번장관리 > 구성ID갱신 > 조회 > 뷰 페이지
     *
     * @return 구성ID갱신 뷰 페이지
     */
    @GetMapping("/view")
    public String view() {
        return "views/cable/configLine/view";
    }

    /**
     * 구성ID갱신 목록 조회
     */
    @ResponseBody
    @PostMapping("/list")
    public Map<String,Object> list(@RequestBody Map<String,Object> paramMap){
        return configIdService.getConfigLineList(paramMap);
    }

    /**
     * 구성ID갱신 목록 갱신
     */
    @ResponseBody
    @PostMapping("/updateConfigId")
    public Map<String,Object> updateConfigId(@RequestBody Map<String,Object> paramMap){
        return configIdService.updateConfigId(paramMap);
    }

    /**
     * 선번장관리 > 구성ID갱신 > 엑셀 다운로드
     */
    @ResponseBody
    @PostMapping("/excelDownload")
    public void excelDownload(HttpServletResponse response) throws IOException {
        Workbook wb = configIdService.downloadCableInfo();
        response.setContentType("ms-vnd/excel");
        response.setHeader("Content-Disposition", "attachment;filename=equipmentListTemplate.xlsx");

        wb.write(response.getOutputStream());
        wb.close();
    }
}
