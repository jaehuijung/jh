package cms.gongju.cable.service;

import cms.gongju.cable.mapper.PrivateMapper;
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
public class PrivateService {

    private final PrivateMapper privateMapper;

    // 전용회선관리 목록 조회
    public Map<String, Object> getPrivateLineList(Map<String, Object> paramMap){
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode", false);

        try{
            List<Map<String, Object>> rows = privateMapper.getPrivateLineList(paramMap);
            int total = privateMapper.getPrivateLineListCount(paramMap);

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

    // 전용회선 등록/수정 팝업 > 수정 리스트 조회
    public Map<String, Object> getPrivateLineDetailList(Map<String, Object> paramMap){
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode", false);

        try {
            Map<String, Object> rows = privateMapper.getPrivateLineDetailList(paramMap);
            returnMap.put("rows", rows);
            returnMap.put("errorCode", true);
        }
        catch (Exception e){
            log.error(e.getMessage());
            throw e;
        }

        return returnMap;
    }

    // 입력한 전용회선 등록 / 선택된 전용회선 수정
    @Transactional
    public Map<String, Object> saveCableInfo(Map<String, Object> paramMap){
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode", false);

        try {
            String line_id = (String) paramMap.get("line_id");
            if(line_id.isEmpty()){
                privateMapper.insertCableInfo(paramMap);
            }
            else {
                privateMapper.updateCableInfo(paramMap);
            }

            returnMap.put("errorCode", true);
        }
        catch (Exception e){
            log.error(e.getMessage());
            throw e;
        }

        return returnMap;
    }

    // 선택된 전용회선 제거
    @SuppressWarnings("unchecked")
    @Transactional
    public Map<String, Object> deleteCableInfo(Map<String, Object> paramMap){
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode", false);

        try {
            List<Map<String, Object>> rows = (List<Map<String, Object>>) paramMap.get("rows");
            for(Map<String, Object> row : rows){
                row.put("reg_id", paramMap.get("user_id"));
                privateMapper.deleteCableInfo(row);
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
     * 전용회선 케이블 목록 엑셀 다운로드
     *
     * @return 결과 메시지
     */
    @Transactional
    public Workbook downloadCableInfo() throws IOException {
        Workbook wb = ExcelUtil.getWorkbookFromTemplate("cableListTemplate.xlsx");

        try {
            // 케이블 목록 데이터 가져오기
            List<Map<String, Object>> cableInfoTotalList = privateMapper.getExcelCableInfoTotalList();

            // 특정 컬럼 순서 강제로 정렬
            List<String> columnOrder = List.of(
                    "No", "회선사용기관명", "회선사업자", "회선용도", "회선번호",
                    "상위(기관명)", "하위(기관명)",
                    "전송장비#1(좌표)", "전송장비#1(장비명)", "전송장비#1(포트)",
                    "종단장비(좌표)", "종단장비(장비명)", "종단장비(포트)", "개통일"
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
