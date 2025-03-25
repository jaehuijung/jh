package cms.gongju.report.controller;

import cms.gongju.report.service.ReportStatisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 보고서 > 회선통계
 *  - /report/statistics/agencyLine
 *  - /report/statistics/cableType
 *  - /report/statistics/workList
 */
@Slf4j
@Controller
@RequestMapping("/report/statistics")
@RequiredArgsConstructor
public class reportStatisticsController {

    private final ReportStatisticsService reportStatisticsService;

    /**
     * 1) 기관회선 현황
     * JS에서 url: "/report/statistics/agencyLine"
     */

    /**
     * 보고서 > 회선통계 > 조회 > 뷰 페이지
     *
     * @return 회선통계 뷰 페이지
     */
    @GetMapping("/view")
    public String view() {
        return "views/report/reportStatistics/view";
    }

    @ResponseBody
    @PostMapping("/agencyLine")
    public Map<String, Object> getAgencyLine(@RequestBody Map<String,Object> param) {
        log.info("getAgencyLine param={}", param);
        List<Map<String,Object>> list = reportStatisticsService.getAgencyLine(param);
        int total = list.size();
        return Map.of("rows", list, "total", total);
    }

    /**
     * 2) 케이블 타입별 현황
     * JS에서 url: "/report/statistics/cableType"
     */
    @ResponseBody
    @PostMapping("/cableType")
    public Map<String, Object> getCableType(@RequestBody Map<String,Object> param) {
        log.info("getCableType param={}", param);
        List<Map<String,Object>> list = reportStatisticsService.getCableType(param);
        int total = list.size();
        return Map.of("rows", list, "total", total);
    }

    /**
     * 3) 작업리스트
     * JS에서 url: "/report/statistics/workList"
     */
    @ResponseBody
    @PostMapping("/workList")
    public Map<String, Object> getWorkList(@RequestBody Map<String,Object> param) {
        log.info("getWorkList param={}", param);
        List<Map<String,Object>> list = reportStatisticsService.getWorkList(param);
        int total = list.size();
        return Map.of("rows", list, "total", total);
    }
}
