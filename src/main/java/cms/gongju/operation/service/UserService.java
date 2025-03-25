package cms.gongju.operation.service;

import cms.gongju.operation.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import cms.gongju.common.service.ExcelUtil;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    /**
     * 사용자 목록 조회
     *
     * @return 사용자 목록
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> findAllUsers(Map<String, Object> paramMap) {
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode",false);

        try {
            if (paramMap.get("data") != null && !paramMap.get("data").toString().isEmpty()) {
                paramMap.putAll((Map<String, Object>) paramMap.get("data"));
            }

            List<Map<String, Object>> rows = userMapper.findAllUsers(paramMap);
            int total = userMapper.findAllUsersCount(paramMap);

            returnMap.put("rows", rows);
            returnMap.put("total", total);
            returnMap.put("errorCode",true);

        } catch (Exception e) {
            log.error(e.getMessage());
        }

        return returnMap;
    }

    /**
     * 중복 사용자 체크
     *
     * @return 중복 사용자 여부
     */
    public Map<String, Object> checkDuplicateId(Map<String, Object> paramMap) {
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode",false);

        try {
            String id = (String) paramMap.get("userId");
            int isDuplicate = userMapper.checkDuplicateId(id);

            returnMap.put("isDuplicate", isDuplicate);
            returnMap.put("errorCode",true);

        } catch (Exception e) {
            log.error(e.getMessage());
        }

        return returnMap;
    }

    /**
     * 사용자 등록
     *
     * @param paramMap 사용자 등록 데이터
     * @return 결과 메시지
     */
    public Map<String, Object> createUserInfo(Map<String, Object> paramMap){
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode",false);

        try {
            String rawPassword = (String) paramMap.get("password");
            String encodedPassword = passwordEncoder.encode(rawPassword);
            paramMap.put("password", encodedPassword);

            userMapper.createUserInfo(paramMap);
            returnMap.put("errorCode",true);
        }
        catch (Exception e){
            log.error(e.getMessage());
        }

        return returnMap;
    }

    /**
     * 사용자 수정
     *
     * @return 결과 메시지
     */
    public Map<String, Object> updateUserInfo(Map<String, Object> paramMap){
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode",false);

        try {
            String password = (String) paramMap.get("password");
            if (!password.isEmpty()) {
                String rawPassword = (String) paramMap.get("password");
                String encodedPassword = passwordEncoder.encode(rawPassword);
                paramMap.put("password", encodedPassword);
            }

            userMapper.updateUserInfo(paramMap);
            returnMap.put("errorCode",true);
        }
        catch (Exception e){
            log.error(e.getMessage());
        }

        return returnMap;
    }

    /**
     * 사용자 등록/수정 시 필요한 선택박스(사용자권한) 항목
     *
     * @return 선택박스 항목
     */
    public Map<String, Object> getSelectAuthList() {
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode",false);

        try{
            List<Map<String, Object>> rows = userMapper.getSelectAuthList();

            returnMap.put("rows", rows);
            returnMap.put("errorCode",true);
        }
        catch (Exception e){
            log.error(e.getMessage());
        }

        return returnMap;
    }

    /**
     * 사용자 등록/수정 시 필요한 선택박스(첫 페이지) 항목
     *
     * @return 선택박스 항목
     */
    public Map<String, Object> getSelectPageList(Map<String, Object> paramMap) {
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode",false);

        try{
            // String groupId = (String) paramMap.get("group_id");
            Object groupIdObj = paramMap.get("group_id");

            int groupId = 0;
            if (groupIdObj != null) {
                if (groupIdObj instanceof Integer) {
                    groupId = (int) groupIdObj;
                } else if (groupIdObj instanceof String) {
                    groupId = Integer.parseInt((String) groupIdObj);
                }
            }

            if (groupId != 0) {
                List<Map<String, Object>> rows = userMapper.getSelectPageList(groupId);

                returnMap.put("rows", rows);
                returnMap.put("errorCode", true);
            }
        }
        catch (Exception e){
            log.error(e.getMessage());
        }

        return returnMap;
    }

    /**
     * 선택된 사용자 정보 조회
     *
     * @return 선택된 사용자 정보
     */
    public Map<String, Object> getSelectUser(Map<String, Object> paramMap) {
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode",false);

        try {
            String userId = (String) paramMap.get("user_id");
            Map<String, Object> row = userMapper.getSelectUser(userId);

            returnMap.put("rows", row);
            returnMap.put("errorCode", true);
        }
        catch (Exception e){
            log.error(e.getMessage());
        }
        return returnMap;
    }

    /**
     * 선택된 사용자 정보 삭제
     *
     * @return 선택된 사용자 정보
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> deleteUserInfo(Map<String, Object> paramMap) {
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode",false);

        try {
            List<String> userIds = (List<String>) paramMap.get("userId");
            for (String userId : userIds) {
                userMapper.deleteUserInfo(userId);
            }

            returnMap.put("errorCode", true);
        }
        catch (Exception e){
            log.error(e.getMessage());
        }

        return returnMap;
    }


    /**
     * 사용자 목록 엑셀 다운로드
     *
     * @return 결과 메시지
     */
    @SuppressWarnings("unchecked")
    @Transactional
    public Workbook downloadUserInfo(Map<String, Object> paramMap) throws IOException {
        Workbook wb = ExcelUtil.getWorkbookFromTemplate("userListTemplate.xlsx");

        try {
            if (paramMap.get("data") != null && !paramMap.get("data").toString().isEmpty()) {
                paramMap.putAll((Map<String, Object>) paramMap.get("data"));
            }

            // 사용자 목록 데이터 가져오기
            List<Map<String, Object>> userInfoTotalList = userMapper.getExcelUserInfoTotalList(paramMap);

            // 데이터를 엑셀 시트에 작성
            ExcelUtil.writeDataToSheet(wb, "사용자 목록", userInfoTotalList);

        } catch (Exception e){
            log.error(e.getMessage());
        }

        return wb;
    }

}
