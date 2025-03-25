package cms.gongju.cable.service;

import cms.gongju.cable.mapper.ConfigIdMapper;
import cms.gongju.common.service.ExcelUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConfigIdService {

    private final ConfigIdMapper configIdMapper;

    // 구성ID갱신 목록조회
    public Map<String, Object> getConfigLineList(Map<String, Object> paramMap){
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode", false);

        try {
            List<Map<String, Object>> rows = configIdMapper.getConfigLineList(paramMap);
            int total = configIdMapper.getConfigLineListCount(paramMap);

            returnMap.put("rows", rows);
            returnMap.put("total", total);
            returnMap.put("errorCode", true);
        }
        catch (Exception e){
            log.error(e.getMessage());
            throw e;
        }

        return returnMap;
    }

    // 구성ID 갱신
    @SuppressWarnings("unchecked")
    @Transactional
    public Map<String, Object> updateConfigId(Map<String, Object> paramMap) {
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode", false);

        try {
            /*
            paramMap = {LinkedHashMap@11709}  size = 3
             "regId" -> "a"
             "asset_id" -> {ArrayList@11728}  size = 4
              key = "asset_id"
              value = {ArrayList@11728}  size = 4
               0 = "A2026BK20210010"
               1 = "A2026NK20210008"
               2 = "A2026NW20210001"
               3 = "A2026SE20210003"
             */
            paramMap.put("asset_id", paramMap.get("start_asset_id"));
            List<Map<String, Object>> startRows = configIdMapper.selectUpdateConfigId(paramMap);

            for(Map<String, Object> row : startRows){
                row.put("type", "start");
                configIdMapper.updateConfigId(row);
            }

            paramMap.put("asset_id", paramMap.get("end_asset_id"));
            List<Map<String, Object>> endRows   = configIdMapper.selectUpdateConfigId(paramMap);

            for(Map<String, Object> row : endRows){
                row.put("type", "end");
                configIdMapper.updateConfigId(row);
            }

            returnMap.put("errorCode", true);
        }
        catch (Exception e){
            log.error(e.getMessage());
            throw e;
        }

        return returnMap;
    }

    /**
     * 구성ID갱신 목록 엑셀 다운로드
     *
     * @return 결과 메시지
     */
    @Transactional
    public Workbook downloadCableInfo() throws IOException {
        Workbook wb = ExcelUtil.getWorkbookFromTemplate("cableListTemplate.xlsx");

        try {
            // 케이블 목록 데이터 가져오기
            List<Map<String, Object>> cableInfoTotalList = configIdMapper.getExcelCableInfoTotalList();

            // 특정 컬럼 순서 강제로 정렬
            List<String> columnOrder = List.of(
                    "No",
                    "START_자산ID", "START_구성ID", "START_좌표", "START_업무명", "START_포트",
                    "END_자산ID", "END_구성ID", "END_업무명", "END_좌표", "END_포트",
                    "케이블 타입", "케이블 색상", "케이블 길이", "포설일자"
            );

            List<Map<String, Object>> orderedList = cableInfoTotalList.stream()
                    .map(originalMap -> {
                        Map<String, Object> sortedMap = new LinkedHashMap<>();
                        columnOrder.forEach(key -> sortedMap.put(key, originalMap.get(key)));
                        return sortedMap;
                    })
                    .collect(Collectors.toList());

            // 데이터를 엑셀 시트에 작성
            ExcelUtil.writeDataToSheet(wb, "케이블 목록", orderedList);

        } catch (Exception e){
            log.error(e.getMessage());
            throw e;
        }

        return wb;
    }
}
