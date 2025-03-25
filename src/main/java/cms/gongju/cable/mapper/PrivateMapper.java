package cms.gongju.cable.mapper;

import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface PrivateMapper {

    // 전용회선관리 목록 조회
    List<Map<String, Object>> getPrivateLineList(Map<String, Object> paramMap);
    // 전용회선관리 목록 개수 조회
    int getPrivateLineListCount(Map<String, Object> paramMap);

    // 전용회선관리 > 케이블 등록/수정 팝업 리스트 조회
    Map<String, Object> getPrivateLineDetailList(Map<String, Object> paramMap);

    // 전용회선관리 > 케이블 정보 등록
    void insertCableInfo(Map<String, Object> paramMap);

    // 전용회선관리 > 케이블 정보 수정
    void updateCableInfo(Map<String, Object> paramMap);

    // 전용회선관리 > 케이블 정보 삭제
    void deleteCableInfo(Map<String, Object> paramMap);

    // 전용회선 케이블 엑셀 다운로드 목록
    List<Map<String, Object>> getExcelCableInfoTotalList();
}
