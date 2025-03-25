package cms.gongju.patch.mapper;

import org.apache.ibatis.annotations.Mapper;
import java.util.List;
import java.util.Map;

@Mapper
public interface PatchManageMapper {

    /**
     * 패치 목록 조회 (START: 메인패치, END: 로컬패치)
     */
    List<Map<String, Object>> selectPatchList(Map<String, Object> param);

    /** total count */
    int selectPatchListCount(Map<String, Object> paramMap);

    /**
     * 패치 상세 조회
     */
    Map<String, Object> selectPatchDetail(Map<String, Object> param);

    /**
     * 패치 정보 업데이트
     */
    int updatePatchInfo(Map<String, Object> param);
    List<Map<String, Object>> excelPatchList(Map<String, Object> param);
}