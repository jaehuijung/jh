package cms.gongju.cablerequest.controller;

import cms.gongju.cablerequest.service.WorkerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 작업자 검색/추가 팝업 전용 Controller
 */
@Controller
@RequiredArgsConstructor
@RequestMapping("/worker")
public class WorkerController {

    private final WorkerService workerService;

    /**
     * 작업자 검색 팝업창
     */
    @GetMapping("/searchPopup")
    public String workerSearchPopup() {
        return "views/cablerequest/workerSearchPopup";
    }

    /**
     * 작업자 등록 팝업창
     */
    @GetMapping("/addPopup")
    public String workerAddPopup() {
        return "views/cablerequest/workerAddPopup";
    }

    /**
     * 전체 작업자 목록 조회
     * - 결과를 List<Map<String,Object>> 형태로 반환
     */
    @GetMapping("/getListAll")
    @ResponseBody
    public List<Map<String, Object>> getListAll() {
        return workerService.selectAllWorkers();
    }

    /**
     * 작업자 목록 조회 (검색)
     * - 파라미터: 회사명, 직책, 성명, 연락처 등
     */
    @ResponseBody
    @PostMapping("/getList")
    public List<Map<String,Object>> getWorkerList(@RequestBody Map<String,Object> param) {
        // DB 조회
        return workerService.selectWorkerList(param);
    }

    // [2] 조건 검색
    @ResponseBody
    @PostMapping("/search")
    public List<Map<String,Object>> searchWorker(@RequestBody Map<String,Object> param){
        // param: {companyName, jobTitle, workerName, contact}
        return workerService.searchWorkers(param);
    }

    /**
     * 신규 작업자 등록
     */
    @ResponseBody
    @PostMapping("/create")
    public Map<String,Object> createWorker(@RequestBody Map<String, Object> param) {
        return workerService.insertWorker(param);
    }

    @GetMapping("/getWorkerListByRequest")
    @ResponseBody
    public List<Map<String,Object>> getWorkerListByRequest(@RequestParam("requestId") Long requestId) {
        return workerService.selectWorkersByRequestId(requestId);
    }

    /**
     * 선택된 작업자(DB) 삭제
     * - body: [1,2,3,...] 형태의 workerId 리스트
     */
    @ResponseBody
    @PostMapping("/delete")
    public Map<String,Object> deleteWorkers(@RequestBody List<Long> workerIdList) {
        return workerService.deleteWorkers(workerIdList);
    }

}
