package cms.gongju.operation.controller;

import cms.gongju.operation.service.CodeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 운영관리 > 코드그룹
 */
@Slf4j
@CrossOrigin(origins = "*", allowedHeaders = "*") /* CORS 어노테이션 */
@RequiredArgsConstructor
@Controller
@RequestMapping("/operation/code")
public class CodeController {

    private final CodeService codeService;

    /**
     * 운영관리 > 코드그룹 > 조회 > 뷰 페이지
     *
     * @return 코드그룹 뷰 페이지
     */
    @GetMapping("/view")
    public String view() {
        return "views/operation/code/view";
    }

    /**
     * 코드그룹 목록 조회
     *
     * @return 코드그룹 목록
     */
    @PostMapping("/list")
    @ResponseBody
    public Map<String, Object> getCodeList(@RequestBody Map<String, Object> paramMap) {
        return codeService.findAllCodes(paramMap);
    }

    /**
     * 코드 등록 시 중복 체크
     *
     * @return 중복 여부
     */
    @PostMapping("/duplicate")
    @ResponseBody
    public Map<String, Object> checkGroupId(@RequestBody Map<String, Object> paramMap) {
        return codeService.checkDuplicateId(paramMap);
    }

    /**
     * 코드그룹 등록
     *
     * @param paramMap 코드그룹 등록 데이터
     * @return 결과 메시지
     */
    @PostMapping("/create")
    @ResponseBody
    public Map<String, Object> createCode(@RequestBody Map<String, Object> paramMap) {
        return codeService.createCodeInfo(paramMap);
    }

    /**
     * 코드그룹 수정
     *
     * @param paramMap 코드그룹 수정 데이터
     * @return 결과 메시지
     */
    @PostMapping("/update")
    @ResponseBody
    public Map<String, Object> updateCode(@RequestBody Map<String, Object> paramMap) {
        return codeService.updateCodeInfo(paramMap);
    }

    /**
     * 코드그룹 삭제
     *
     * @param paramMap 삭제할 코드그룹 ID
     * @return 결과 메시지
     */
    @PostMapping("/delete")
    @ResponseBody
    public Map<String, Object> deleteCode(@RequestBody Map<String, Object> paramMap) {
        return codeService.deleteCodeInfo(paramMap);
    }

}
