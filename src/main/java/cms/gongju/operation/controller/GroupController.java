package cms.gongju.operation.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import cms.gongju.operation.service.GroupService;

import java.util.Map;

/**
 * 운영관리 > 계정그룹
 */
@Slf4j
@CrossOrigin(origins = "*", allowedHeaders = "*") /* CORS 어노테이션 */
@RequiredArgsConstructor
@Controller
@RequestMapping("/operation/group")
public class GroupController {

    private final GroupService groupService;

    /**
     * 운영관리 > 계정그룹 > 조회 > 뷰 페이지
     *
     * @return 계정그룹 뷰 페이지
     */
    @GetMapping("/view")
    public String view() {
        return "views/operation/group/view";
    }

    /**
     * 계정그룹 목록 조회
     *
     * @return 계정그룹 목록
     */
    @PostMapping("/list")
    @ResponseBody
    public Map<String, Object> getGroupList(@RequestBody Map<String, Object> paramMap) {
        return groupService.findAllGroups(paramMap);
    }

    /**
     * 중복 계정그룹ID 체크
     *
     * @return 중복 계정그룹ID 여부
     */
    @PostMapping("/duplicate")
    @ResponseBody
    public Map<String, Object> checkGroupId(@RequestBody Map<String, Object> paramMap) {
        return groupService.checkDuplicateId(paramMap);
    }

    /**
     * 계정그룹 등록
     *
     * @param paramMap 계정그룹 등록 데이터
     * @return 결과 메시지
     */
    @PostMapping("/create")
    @ResponseBody
    public Map<String, Object> createGroup(@RequestBody Map<String, Object> paramMap) {
        return groupService.createGroupInfo(paramMap);
    }

    /**
     * 계정그룹 삭제
     *
     * @param paramMap 삭제할 계정그룹 ID
     * @return 결과 메시지
     */
    @PostMapping("/delete")
    @ResponseBody
    public Map<String, Object> deleteGroup(@RequestBody Map<String, Object> paramMap) {
        return groupService.deleteGroupInfo(paramMap);
    }

    /**
     * 운영관리 > 계정그룹 > 조회 > 계정그룹 메뉴설정 팝업 페이지
     *
     * @return 계정그룹 메뉴설정 팝업 뷰 페이지
     */
    @GetMapping("/menuSettingView")
    public String menuSettingView(Model model, @RequestParam("group_id") String groupId, @RequestParam("user_id") String userId) {
        model.addAttribute("groupId", groupId);
        model.addAttribute("userId", userId);

        return "views/operation/group/menuSettingView";
    }


    /**
     * 계정그룹 메뉴설정 리스트
     *
     * @param paramMap 선택한 메뉴설정 계정그룹 ID
     * @return 결과 메시지
     */
    @PostMapping("/menuSettingList")
    @ResponseBody
    public Map<String, Object> getMenuSettingList(Authentication authentication, @RequestBody Map<String, Object> paramMap) {
        return groupService.getMenuSettingList(paramMap);
    }

    /**
     * 변경된 계정그룹 메뉴설정 리스트 저장
     *
     * @param paramMap 변경된 메뉴설정 권한
     * @return 결과 메시지
     */
    @PostMapping("/saveMenuSetting")
    @ResponseBody
    public Map<String, Object> saveMenuSetting(@RequestBody Map<String, Object> paramMap){
        return groupService.saveMenuSetting(paramMap);
    }

}
