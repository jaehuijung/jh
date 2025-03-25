package cms.gongju.cablerequest.controller;

import cms.gongju.cablerequest.service.CableRequestService;
import cms.gongju.common.security.CustomUser;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * 케이블 포설 신청/관리 화면 컨트롤러
 */
@Controller
@RequiredArgsConstructor
@RequestMapping("/cable/request")
public class CableRequestController {

    private final CableRequestService cableRequestService;


    @Value("${cms.cable.types}")
    private String cableTypeString;

    @Value("${cms.cable.colors}")
    private String cableColorString;

    @Value("${cms.cable.org_name}")
    private String orgNameSrting;

    /**
     * 포설 신청 작성/수정 화면
     * @param requestId (수정 시) 신청 ID
     * @param model
     * @return 신청 작성/수정 폼 화면
     */
    @GetMapping("/form")
    public String requestForm(@RequestParam(value = "requestId", required = false) Long requestId,
                              Model model) {

        List<String> orgNames = Arrays.asList(orgNameSrting.split(","));
        // 1) 케이블 타입
        List<String> cableTypes = Arrays.asList(cableTypeString.split(","));
        // 2) 케이블 색상
        List<String> cableColors = Arrays.asList(cableColorString.split(","));


        model.addAttribute("cableTypes", cableTypes);
        model.addAttribute("cableColors", cableColors);
        model.addAttribute("orgNames", orgNames);

        //model.addAttribute("cableRequestVO", new CableRequestVO());

        return "views/cablerequest/requestForm";
    }

    /**
     * 포설 신청 저장 (AJAX)
     * @param paramMap 화면에서 넘어오는 신청정보(상단 요청자/기관, 작업목적, 작업내역 등)
     * @return 처리결과
     */
    @ResponseBody
    @PostMapping("/save")
    public Map<String,Object> saveRequest(
            @RequestBody Map<String,Object> param,
            @AuthenticationPrincipal CustomUser customUser // ★ 추가
    ){
        // (A) 사용자 정보에서 userId 추출
        String userId = "admin";
        if(customUser != null && customUser.getMember() != null) {
            userId = customUser.getMember().getUserId();
        }

        // (B) param 맵에 regId로 담아서 서비스로 전달
        param.put("regId", userId);

        // (C) 서비스 호출
        return cableRequestService.saveCableRequest(param);
    }

    /**
     * 작업자 선택 팝업 페이지
     */
    @GetMapping("/workerPopup")
    public String workerPopup() {
        return "views/cablerequest/workerPopup";
    }

    /**
     * 작업자 목록 조회 (팝업) - AJAX
     * @param paramMap 검색조건(회사명, 성명 등)
     * @return 작업자 목록
     */
    /*@ResponseBody
    @PostMapping("/getWorkerList")
    public List<Map<String, Object>> getWorkerList(@RequestBody Map<String, Object> paramMap) {
        return cableRequestService.selectWorkerList(paramMap);
    }*/


    /// 임시저장 목록 조회
    @GetMapping("/getTempList")
    @ResponseBody
    public List<Map<String,Object>> getTempList() {
        // 임시저장 목록만 (approval_status='임시저장')
        return cableRequestService.selectTempSaveList();
    }

    // 임시저장 데이터 1건 불러오기
    @GetMapping("/getRequestData")
    @ResponseBody
    public Map<String,Object> getRequestData(@RequestParam("requestId") Long requestId) {
        // requestInfo + workerList + detailList
        return cableRequestService.selectRequestFullData(requestId);
    }

}

