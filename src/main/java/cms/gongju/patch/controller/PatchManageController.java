package cms.gongju.patch.controller;

import cms.gongju.patch.service.PatchManageService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Slf4j
@Controller
@RequestMapping("/patch")
public class PatchManageController {

    @Autowired
    private PatchManageService patchManageService;

    @GetMapping("/{patchCategory}/list")
    public String patchListView(@PathVariable("patchCategory") String patchCategory, Model model) {
        String viewName;
        if ("vertical".equals(patchCategory)) {
            viewName = "views/patch/vertical/view"; // 수직 패치 뷰
        } else if ("horizontal".equals(patchCategory)) {
            viewName = "views/patch/horizontal/view"; // 수평 패치 뷰
        } else {
            return "error/404"; // 또는 적절한 에러 처리
        }
        return viewName;
    }
    @ResponseBody
    @PostMapping("/getlist")
    public Map<String, Object> vpatchListAjax(@RequestBody Map<String, Object> param) {
        List<Map<String, Object>> list = patchManageService.getPatchList(param);
        int total = patchManageService.selectPatchListCount(param);
        return Map.of("rows", list, "total", total);
    }

    @GetMapping("/editPop")
    public String patchEditPop(@RequestParam("install_id") String installId, Model model) {
        Map<String, Object> detail = patchManageService.getPatchDetail(Map.of("install_id", installId));
        model.addAttribute("detail", detail);
        return "views/patch/patchEditPop";
    }

    @ResponseBody
    @PostMapping("/update")
    public String updatePatch(@RequestBody Map<String, Object> param) {
        param.put("upd_id", "adminUser");
        int cnt = patchManageService.updatePatchInfo(param);
        return (cnt > 0) ? "SUCCESS" : "FAIL";
    }

    @PostMapping("/exportExcel")
    public void exportExcel(@RequestBody Map<String, Object> param,HttpServletResponse response) throws IOException {
        Workbook workbook = patchManageService.exportPatchListToExcel(param);
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=patchListTemplate.xlsx");
        workbook.write(response.getOutputStream());
        workbook.close();
    }

}