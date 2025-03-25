package cms.gongju.operation.mapper;

import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface UserMapper {
    /**
     * 모든 사용자 정보를 Map 형태로 조회
     *
     * @return 사용자 목록
     */
    List<Map<String, Object>> findAllUsers(Map<String, Object> paramMap);

    /**
     * 모든 사용자 정보 개수
     *
     * @return 사용자 정보 개수
     */
    int findAllUsersCount(Map<String, Object> paramMap);

    /**
     * 중복 사용자 체크
     *
     * @return 중복 사용자 여부
     */
    int checkDuplicateId(String user_id);

    /**
     * 사용자 등록
     *
     * @param paramMap 사용자 등록 데이터
     */
    void createUserInfo(Map<String, Object> paramMap);

    /**
     * 사용자 수정
     *
     * @param paramMap 사용자 수정 데이터
     */
    void updateUserInfo(Map<String, Object> paramMap);

    /**
     * 사용자 등록/수정 시 필요한 선택박스(사용자권한) 항목
     *
     * @return 선택박스 항목
     */
    public List<Map<String, Object>> getSelectAuthList();

    /**
     * 사용자 등록/수정 시 필요한 선택박스(첫 페이지) 항목
     *
     * @return 선택박스 항목
     */
    public List<Map<String, Object>> getSelectPageList(int groupId);

    /**
     * 선택된 사용자 정보 조회
     *
     * @return 선택된 사용자 정보
     */
    public Map<String, Object> getSelectUser(String groupId);

    /**
     * 선택된 사용자 정보 삭제
     *
     * @param paramMap 삭제할 사용자 아이디
     */
    void deleteUserInfo(String paramMap);

    /**
     * 사용자 목록 엑셀 다운로드
     *
     * @return 사용자 목록
     */
    List<Map<String, Object>> getExcelUserInfoTotalList(Map<String, Object> paramMap);
}
