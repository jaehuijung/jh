package cms.gongju.patch.service;

import cms.gongju.common.service.ExcelUtil;
import cms.gongju.patch.mapper.PatchManageMapper;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PatchManageService {

    @Autowired
    private PatchManageMapper patchManageMapper;

    public List<Map<String, Object>> getPatchList(Map<String, Object> param) {
        if (param.get("data") != null && !param.get("data").toString().isEmpty()) {
            param.putAll((Map<String, Object>) param.get("data"));
        }
        return patchManageMapper.selectPatchList(param);
    }

    public Map<String, Object> getPatchDetail(Map<String, Object> param) {
        return patchManageMapper.selectPatchDetail(param);
    }

    public int updatePatchInfo(Map<String, Object> param) {
        return patchManageMapper.updatePatchInfo(param);
    }

    public int selectPatchListCount(Map<String, Object> param) {
        if (param.get("data") != null && !param.get("data").toString().isEmpty()) {
            param.putAll((Map<String, Object>) param.get("data"));
        }
        return patchManageMapper.selectPatchListCount(param);
    }

    /**
     * 신청내역관리 리스트를 엑셀 파일로 변환
     */
    public Workbook exportPatchListToExcel(Map<String, Object> param) throws IOException {
        // DB에서 조회한 데이터 가져오기
        // 엑셀 템플릿 불러오기
        Workbook workbook = ExcelUtil.getWorkbookFromTemplate("patchListTemplate.xlsx");
        List<Map<String, Object>> excelpatchList = patchManageMapper.excelPatchList(param);

        // 컬럼 순서를 엑셀 템플릿에 맞게 재정렬
        List<Map<String, Object>> reorderedList =  excelpatchList.stream()
                .map(row -> {
                    Map<String, Object> reorderedRow = new LinkedHashMap<>();
                    reorderedRow.put("NO", row.get("NO"));
                    reorderedRow.put("START_좌표", row.get("START_좌표"));
                    reorderedRow.put("START_업무명", row.get("START_업무명"));
                    reorderedRow.put("START_patch_port", row.get("START_patch_port"));
                    reorderedRow.put("END_patch_port", row.get("END_patch_port"));
                    reorderedRow.put("END_좌표", row.get("END_좌표"));
                    reorderedRow.put("END_업무명", row.get("END_업무명"));
                    reorderedRow.put("END_포트번호", row.get("END_포트번호"));
                    reorderedRow.put("포설일자", row.get("포설일자"));
                    reorderedRow.put("비고", row.get("비고"));
                    return reorderedRow;
                })
                .collect(Collectors.toList());



        ExcelUtil.writeDataToSheet(workbook, "패치목록", reorderedList);

        return workbook;
    }
}