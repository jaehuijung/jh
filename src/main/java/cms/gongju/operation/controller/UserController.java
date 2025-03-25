package cms.gongju.operation.controller;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import cms.gongju.operation.service.UserService;

import java.io.IOException;
import java.util.Map;

/**
 * 운영관리 > 사용자
 */
@Slf4j
@CrossOrigin(origins = "*", allowedHeaders = "*") /* CORS 어노테이션 */
@RequiredArgsConstructor
@Controller
@RequestMapping("/operation/user")
public class UserController {

    private final UserService userService;

    /**
     * 운영관리 > 사용자 > 조회 > 뷰 페이지
     *
     * @return 사용자 뷰 페이지
     */
    @GetMapping("/view")
    public String view() {
        return "views/operation/user/view";
    }

    /**
     * 사용자 목록 조회
     *
     * @return 사용자 목록
     */
    @PostMapping("/list")
    @ResponseBody
    public Map<String, Object> getUserList(@RequestBody Map<String, Object> paramMap) {
        return userService.findAllUsers(paramMap);
    }

    /**
     * 중복 사용자 체크
     *
     * @return 중복 사용자 여부
     */
    @PostMapping("/duplicate")
    @ResponseBody
    public Map<String, Object> checkUserId(@RequestBody Map<String, Object> paramMap) {
        return userService.checkDuplicateId(paramMap);
    }

    /**
     * 사용자 등록
     *
     * @param paramMap 사용자 등록 데이터
     * @return 결과 메시지
     */
    @PostMapping("/create")
    @ResponseBody
    public Map<String, Object> createUser(@RequestBody Map<String, Object> paramMap) {
        return userService.createUserInfo(paramMap);
    }

    /**
     * 사용자 수정
     *
     * @param paramMap 수정할 사용자 데이터
     * @return 결과 메시지
     */
    @PostMapping("/update")
    @ResponseBody
    public Map<String, Object> updateUser(@RequestBody Map<String, Object> paramMap, Authentication authentication) {
        paramMap.put("updId", authentication.getName());
        return userService.updateUserInfo(paramMap);
    }

    /**
     * 사용자 등록/수정 시 필요한 선택박스(사용자권한) 항목 조회
     *
     * @return 선택박스 항목
     */
    @PostMapping("/selectAuthList")
    @ResponseBody
    public Map<String, Object> getSelectAuthList() {
        return userService.getSelectAuthList();
    }

    /**
     * 사용자 등록/수정 시 필요한 선택박스(첫 페이지) 항목 조회
     *
     * @return 선택박스 항목
     */
    @PostMapping("/selectPageList")
    @ResponseBody
    public Map<String, Object> getSelectPageList(@RequestBody Map<String, Object> paramMap) {
        return userService.getSelectPageList(paramMap);
    }

    /**
     * 선택된 사용자 정보 조회
     *
     * @return 선택된 사용자 정보
     */
    @PostMapping("/selectUser")
    @ResponseBody
    public Map<String, Object> getSelectUser(@RequestBody Map<String, Object> paramMap) {
        return userService.getSelectUser(paramMap);
    }

    /**
     * 사용자 삭제
     *
     * @param paramMap 삭제할 사용자 ID
     * @return 결과 메시지
     */
    @PostMapping("/delete")
    @ResponseBody
    public Map<String, Object> deleteUser(@RequestBody Map<String, Object> paramMap) {
        return userService.deleteUserInfo(paramMap);
    }

    /**
     * 전체 사용자 목록 엑셀 다운로드
     *
     * @return 결과 메시지
     */
    @PostMapping("/excelDownload")
    @ResponseBody
    public void downloadUserInfo(@RequestBody Map<String, Object> paramMap, HttpServletResponse response) throws IOException {
        Workbook wb = userService.downloadUserInfo(paramMap);
        response.setContentType("ms-vnd/excel");
        response.setHeader("Content-Disposition", "attachment;filename=equipmentListTemplate.xlsx");

        wb.write(response.getOutputStream());
        wb.close();
    }
}
