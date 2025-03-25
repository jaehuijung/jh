package cms.gongju.cable.controller;

import cms.gongju.cable.service.PrivateService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * 선번장관리 > 전용회선관리
 */
@Slf4j
@CrossOrigin(origins = "*", allowedHeaders = "*") /* CORS 어노테이션 */
@RequiredArgsConstructor
@Controller
@RequestMapping("/cable/private")
public class PrivateController {

    private final PrivateService privateService;

    /**
     * 선번장관리 > 전용회선관리 > 조회 > 뷰 페이지
     *
     * @return 전용회선관리 뷰 페이지
     */
    @GetMapping("/view")
    public String view() {
        return "views/cable/privateLine/view";
    }

    /**
     * 전용회선관리 목록 조회
     */
    @ResponseBody
    @PostMapping("/list")
    public Map<String,Object> list(@RequestBody Map<String,Object> paramMap){

        return privateService.getPrivateLineList(paramMap);
    }

    /**
     * 전용회선 등록/수정 팝업
     */
    @GetMapping("/cableInfoView")
    public String cableInfoView(Model model, @RequestParam("line_id") String line_id) {

        model.addAttribute("line_id", line_id);
        model.addAttribute("cableInfo", new HashMap<>());

        if (!line_id.equals("create")) {
            Map<String, Object> cableInfo = privateService.getPrivateLineDetailList(Map.of("line_id", line_id));
            model.addAttribute("cableInfo", cableInfo.get("rows"));
        }

        return "views/cable/privateLine/privateLineInfoView";
    }

    /**
     * 입력한 전용회선 등록 / 선택된 전용회선 수정
     */
    @ResponseBody
    @PostMapping("/save")
    public Map<String,Object> saveCableInfo(@RequestBody Map<String,Object> paramMap){
        return privateService.saveCableInfo(paramMap);
    }

    /**
     * 선택된 전용회선 제거
     */
    @ResponseBody
    @PostMapping("/delete")
    public Map<String,Object> deleteCableInfo(@RequestBody Map<String,Object> paramMap){
        return privateService.deleteCableInfo(paramMap);
    }

    /**
     * 선번장관리 > 전용회선관리 > 엑셀 다운로드
     */
    @ResponseBody
    @PostMapping("/excelDownload")
    public void excelDownload(HttpServletResponse response) throws IOException {
        Workbook wb = privateService.downloadCableInfo();
        response.setContentType("ms-vnd/excel");
        response.setHeader("Content-Disposition", "attachment;filename=equipmentListTemplate.xlsx");

        wb.write(response.getOutputStream());
        wb.close();
    }
}
