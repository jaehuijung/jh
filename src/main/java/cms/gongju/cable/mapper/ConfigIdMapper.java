package cms.gongju.cable.mapper;

import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface ConfigIdMapper {

    // 구성ID갱신 리스트
    List<Map<String, Object>> getConfigLineList(Map<String, Object> paramMap);
    // 구성ID갱신 리스트 개수
    int getConfigLineListCount(Map<String, Object> paramMap);

    // 갱실할 구성ID 조회
    List<Map<String, Object>> selectUpdateConfigId(Map<String, Object> paramMap);
    // 구성ID 갱신
    void updateConfigId(Map<String, Object> paramMap);

    // 구성ID갱신 케이블 엑셀 다운로드 목록
    List<Map<String, Object>> getExcelCableInfoTotalList();
}
