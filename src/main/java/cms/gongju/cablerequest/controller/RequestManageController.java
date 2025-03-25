package cms.gongju.cablerequest.controller;

import cms.gongju.cablerequest.service.RequestManageService;
import cms.gongju.cablerequest.vo.CableRequestVO;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Controller
@RequiredArgsConstructor
@RequestMapping("/cable/manage")
public class RequestManageController {

    private final RequestManageService requestManageService;

    // 목록 화면
    @GetMapping("/list")
    public String requestManageList(Model model){
        return "views/cablerequest/requestManageList";
    }

    // 목록 조회
    @ResponseBody
    @PostMapping("/getList")
    public Map<String, Object> getRequestList(@RequestBody Map<String,Object> paramMap){
        List<CableRequestVO> list = requestManageService.selectRequestList(paramMap);
        int total =  requestManageService.selectRequestListCount(paramMap);
        return Map.of("rows", list, "total", total);
    }

    // 승인
    @ResponseBody
    @PostMapping("/approve")
    public Map<String, Object> approveRequests(@RequestBody Map<String, Object> paramMap) throws Exception {
        // requestBody 내부에:
        //  requestBody.get("requestList") -> List<Map<String,Object>>
        //  requestBody.get("loginUserId") -> "admin"
        return requestManageService.approveRequests(paramMap);
    }

/*    // 승인
    @ResponseBody
    @PostMapping("/approve")
    public Map<String,Object> approveRequests(
            @RequestParam("requestList") String requestListJson,
            @RequestParam("loginUserId") String loginUserId,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) throws Exception {
        Map<String, Object> paramMap = new HashMap<>();
        paramMap.put("requestList", requestListJson);
        paramMap.put("loginUserId", loginUserId);
        paramMap.put("files", files);

        return requestManageService.approveRequests(paramMap);
    }*/
/*
    @ResponseBody
    @PostMapping("/approve")
    public Map<String,Object> approveRequests(MultipartHttpServletRequest request) throws Exception {
        return requestManageService.approveRequests(request);
    }
*/


    // 반려
    @ResponseBody
    @PostMapping("/reject")
    public Map<String,Object> rejectRequests(@RequestBody Map<String,Object> paramMap){
        return requestManageService.rejectRequests(paramMap);
    }

    // 삭제
    @ResponseBody
    @PostMapping("/delete")
    public Map<String,Object> deleteRequests(@RequestBody Map<String,Object> paramMap){
        return requestManageService.deleteRequests(paramMap);
    }

    @ResponseBody
    @GetMapping("/getWorkDetailList")
    public List<Map<String,Object>> getWorkDetailList(@RequestParam("requestId") Long requestId){
        // 예: requestManageService.selectWorkDetailList(requestId);
        return requestManageService.selectWorkDetailList(requestId);
    }

    /**
     * 신청내역관리 리스트를 엑셀 파일로 변환하여 다운로드
     */
    @PostMapping("/exportExcel")
    public void exportExcel(HttpServletResponse response) throws IOException {
        Workbook workbook = requestManageService.exportRequestListToExcel();
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=cableManageListTemplate.xlsx");
        workbook.write(response.getOutputStream());
        workbook.close();
    }
}
