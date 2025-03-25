package cms.gongju.operation.service;

import cms.gongju.operation.mapper.CodeMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CodeService {

    private final CodeMapper codeMapper;

    /**
     * 코드그룹 목록 조회
     *
     * @return 코드그룹 목록
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> findAllCodes(Map<String, Object> paramMap) {
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode", false);

        try {
            if (paramMap.get("data") != null && !paramMap.get("data").toString().isEmpty()) {
                paramMap.putAll((Map<String, Object>) paramMap.get("data"));
            }

            List<Map<String, Object>> rows = codeMapper.findAllCodes(paramMap);
            int total = codeMapper.findAllCodesCount(paramMap);

            returnMap.put("rows", rows);
            returnMap.put("total", total);
            returnMap.put("errorCode", true);
        } catch (Exception e) {
            log.error(e.getMessage());
        }

        return returnMap;
    }

    /**
     * 코드 등록 시 중복 체크
     *
     * @return 중복 여부
     */
    public Map<String, Object> checkDuplicateId(Map<String, Object> paramMap) {
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode", false);

        try {
            int isDuplicate = codeMapper.checkDuplicateId(paramMap);

            returnMap.put("isDuplicate", isDuplicate);
            returnMap.put("errorCode", true);

        } catch (Exception e) {
            log.error(e.getMessage());
        }

        return returnMap;
    }

    /**
     * 코드그룹 등록
     *
     * @param paramMap 코드그룹 등록 데이터
     * @return 결과 메시지
     */
    public Map<String, Object> createCodeInfo(Map<String, Object> paramMap) {
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode", false);

        try {
            codeMapper.createCodeInfo(paramMap);
            returnMap.put("errorCode", true);
        } catch (Exception e) {
            log.error(e.getMessage());
        }

        return returnMap;
    }

    /**
     * 코드그룹 수정
     *
     * @param paramMap 코드그룹 수정 데이터
     * @return 결과 메시지
     */
    public Map<String, Object> updateCodeInfo(Map<String, Object> paramMap) {
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode", false);

        try {
            codeMapper.updateCodeInfo(paramMap);
            returnMap.put("errorCode", true);
        } catch (Exception e) {
            log.error(e.getMessage());
        }

        return returnMap;
    }


    /**
     * 코드그룹 삭제
     *
     * @param paramMap 코드그룹 식제 데이터
     * @return 결과 메시지
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> deleteCodeInfo(Map<String, Object> paramMap) {
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode", false);

        try {
            List<Map<String, Object>> rows = (List<Map<String, Object>>) paramMap.get("selectedRow");
            for (Map<String, Object> row : rows) {
                row.put("userId", paramMap.get("userId"));
                codeMapper.deleteCodeInfo(row);
            }


            returnMap.put("errorCode", true);
        } catch (Exception e) {
            log.error(e.getMessage());
        }

        return returnMap;
    }




}