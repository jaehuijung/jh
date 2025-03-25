package cms.gongju.cablerequest.controller;

import cms.gongju.cablerequest.service.CableRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * 케이블 "제거신청" 전용 Controller.
 * 실제 저장로직은 CableRequestService 재활용
 */
@Slf4j
@Controller
@RequestMapping("/cable/remove")
@RequiredArgsConstructor
public class RemoveRequestController {

    private final CableRequestService cableRequestService;

    @Value("${cms.cable.types}")
    private String cableTypeString;

    @Value("${cms.cable.colors}")
    private String cableColorString;

    @Value("${cms.cable.org_name}")
    private String orgNameSrting;


    /**
     * 제거신청 화면
     */
    @GetMapping("/form")
    public String removeRequestForm(Model model){

        List<String> orgNames = Arrays.asList(orgNameSrting.split(","));
        // 1) 케이블 타입
        List<String> cableTypes = Arrays.asList(cableTypeString.split(","));
        // 2) 케이블 색상
        List<String> cableColors = Arrays.asList(cableColorString.split(","));

        model.addAttribute("cableTypes", cableTypes);
        model.addAttribute("cableColors", cableColors);
        model.addAttribute("orgNames", orgNames);

        // 필요 시 model.addAttribute("...", ...);
        return "views/cablerequest/removeRequest";
    }

    /**
     * 제거신청 저장
     * -> requestType='REMOVE' 로 param 설정 후 cableRequestService.saveCableRequest() 재활용
     */
    @ResponseBody
    @PostMapping("/save")
    public Map<String,Object> saveRemoveRequest(@RequestBody Map<String,Object> param){
        log.info("[RemoveRequestController] saveRemoveRequest param: {}", param);
        // param 구조:
        // {
        //   "requestInfo": { ..., "requestType"?: ... },  // 혹은 없을 수도
        //   "workerList": [...],
        //   "detailList": [...]
        // }

        // 1) requestInfo 추출
        Map<String,Object> requestInfo = (Map<String,Object>) param.get("requestInfo");
        if(requestInfo == null){
            // 만약 비어있다면 새로 생성
            requestInfo = new java.util.HashMap<>();
            param.put("requestInfo", requestInfo);
        }
        // 2) requestType='REMOVE' 강제 설정
        requestInfo.put("requestType", "REMOVE");

        // 3) cableRequestService 재활용
        Map<String,Object> result = cableRequestService.saveCableRequest(param);
        return result;
    }
}
