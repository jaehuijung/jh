package cms.gongju.report.controller;

import cms.gongju.report.service.PatchStatusService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 보고서 > 통신패치현황 API
 *  - JS에서 /report/patchstatus/getList 로 POST 호출
 */
@Slf4j
@Controller
@RequestMapping("/report/patchstatus")
@RequiredArgsConstructor
public class patchStatusController {

    private final PatchStatusService patchStatusService;

    /**
     * POST /report/patchStatus/getList
     * -> JS: loadPatchStatusData(param)
     */

    @GetMapping("/view")
    public String view() {
        return "views/report/patchStatus/view";
    }

    @ResponseBody
    @PostMapping("/getList")
    public Map<String,Object> getList(@RequestBody Map<String,Object> param){
        log.info("PatchStatus getList param={}", param);

        // Service에서 가상(또는 실제) 데이터 조회
        List<Map<String,Object>> list = patchStatusService.getPatchStatusList(param);
        int total = list.size();

        // JS expects e.g. { rows: [...], total: N }
        return Map.of("rows", list, "total", total);
    }
}
