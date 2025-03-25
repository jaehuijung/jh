package cms.gongju.operation.service;

import cms.gongju.operation.mapper.GroupMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupMapper groupMapper;

    /**
     * 계정그룹 목록 조회
     * 
     * @return 계정그룹 목록
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> findAllGroups(Map<String, Object> paramMap) {
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode", false);

        try {
            if (paramMap.get("data") != null && !paramMap.get("data").toString().isEmpty()) {
                paramMap.putAll((Map<String, Object>) paramMap.get("data"));
            }

            List<Map<String, Object>> rows = groupMapper.findAllGroups(paramMap);
            int total = groupMapper.findAllGroupsCount(paramMap);

            returnMap.put("rows", rows);
            returnMap.put("total", total);
            returnMap.put("errorCode", true);
        } catch (Exception e) {
            log.error(e.getMessage());
        }

        return returnMap;
    }

    /**
     * 중복 계정그룹ID 체크
     *
     * @return 중복 계정그룹ID 여부
     */
    public Map<String, Object> checkDuplicateId(Map<String, Object> paramMap) {
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode", false);

        try {
            String id = (String) paramMap.get("groupId");
            int isDuplicate = groupMapper.checkDuplicateId(id);

            returnMap.put("isDuplicate", isDuplicate);
            returnMap.put("errorCode", true);

        } catch (Exception e) {
            log.error(e.getMessage());
        }

        return returnMap;
    }

    /**
     * 계정그룹 등록
     *
     * @param paramMap 계정그룹 등록 데이터
     * @return 결과 메시지
     */
    @Transactional
    public Map<String, Object> createGroupInfo(Map<String, Object> paramMap) {
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode", false);

        try {
            groupMapper.createGroupInfo(paramMap); // 계정그룹 등록
            groupMapper.createGroupMenuInfo(paramMap); // 계정그룹 메뉴권한 등록
            returnMap.put("errorCode", true);
        } catch (Exception e) {
            log.error(e.getMessage());
            throw e;
        }

        return returnMap;
    }

    /**
     * 계정그룹 삭제
     *
     * @param paramMap 삭제할 계정그룹 ID
     * @return 결과 메시지
     */
    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String, Object> deleteGroupInfo(Map<String, Object> paramMap) {
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode", false);

        try {
            List<Integer> ids = (List<Integer>) paramMap.get("id");
            int userCnt = groupMapper.getGroupConnectUser(ids);

            if (userCnt > 0){
                returnMap.put("errorCode", true);
                returnMap.put("errorMsg", "삭제하려는 계정그룹에 등록된 사용자가 "+ Integer.toString(userCnt) +"명 존재합니다.");
                return returnMap;
            }

            groupMapper.deleteGroupInfo(ids); // 계정그룹 제거

            returnMap.put("errorCode", true);
        } catch (Exception e) {
            log.error(e.getMessage());
            throw e;
        }

        return returnMap;
    }

    /**
     * 계정그룹 메뉴설정 리스트
     *
     * @return 결과 메시지
     */
    public Map<String, Object> getMenuSettingList(Map<String, Object> paramMap) {
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode", false);

        try {
            List<Map<String, Object>> rows = groupMapper.getMenuSettingList(paramMap);
            returnMap.put("rows", rows);
            returnMap.put("errorCode", true);
        } catch (Exception e) {
            log.error(e.getMessage());
        }

        return returnMap;
    }

    /**
     * 변경된 계정그룹 메뉴설정 리스트 저장
     *
     * @return 결과 메시지
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> saveMenuSetting(Map<String, Object> paramMap) {
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode", false);

        try {
            String userId = (String) paramMap.get("userId");
            String groupId = (String) paramMap.get("groupId");

            List<Map<String, Object>> updateRows = (List<Map<String, Object>>) paramMap.get("updateRows");
            for(Map<String, Object> row : updateRows){
                row.put("user_id", userId);
                row.put("group_id", groupId);

                String menu_auth = (String) row.get("menu_auth");
                if(menu_auth.equals("RU")){
                    row.put("R", "Y");
                    row.put("U", "Y");
                }
                else if(menu_auth.equals("R")){
                    row.put("R", "Y");
                    row.put("U", "N");
                }
                else if(menu_auth.equals("D")){
                    row.put("R", "N");
                    row.put("U", "N");
                }

                groupMapper.saveMenuSetting(row);
            }
            returnMap.put("errorCode", true);
        } catch (Exception e) {
            log.error(e.getMessage());
        }

        return returnMap;
    }

}