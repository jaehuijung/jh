package cms.gongju.operation.mapper;

import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface CodeMapper {

    /**
     * 모든 코드그룹 정보를 Map 형태로 조회
     * @return 코드그룹 정보
     */
    List<Map<String, Object>> findAllCodes(Map<String, Object> paramMap);

    /**
     * 모든 코드그룹 정보 개수
     * @return 코드 그룹 정보 개수
     */
    int findAllCodesCount(Map<String, Object> paramMap);

    /**
     * 코드 등록 시 중복 체크
     */
    int checkDuplicateId(Map<String, Object> paramMap);

    /**
     * 코드그룹 등록
     * @param paramMap 코드그룹 등록 데이터
     */
    void createCodeInfo(Map<String, Object> paramMap);

    /**
     * 코드그룹 수정
     * @param paramMap 코드그룹 수정 데이터
     */
    void updateCodeInfo(Map<String, Object> paramMap);

    /**
     * 코드그룹 삭제
     * @param paramMap 코드그룹 삭제 데이터
     */
    void deleteCodeInfo(Map<String, Object> paramMap);


}
