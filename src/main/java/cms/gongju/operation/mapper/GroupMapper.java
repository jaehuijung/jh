package cms.gongju.operation.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface GroupMapper {
    /**
     * 모든 계정그룹 정보를 Map 형태로 조회
     * @return 계정그룹 정보
     */
    List<Map<String, Object>> findAllGroups(Map<String, Object> paramMap);

    /**
     * 모든 계정그룹 정보 개수
     * @return 계정그룹 정보 개수
     */
    int findAllGroupsCount(Map<String, Object> paramMap);

    /**
     * 중복 계정그룹ID 체크
     * @param group_id 중복 체크할 계정그룹 ID
     */
    int checkDuplicateId(String group_id);

    /**
     * 계정그룹 등록
     * @param paramMap 계정그룹 등록 데이터
     */
    void createGroupInfo(Map<String, Object> paramMap);

    /**
     * 계정그룹 메뉴권한 등록
     */
    void createGroupMenuInfo(Map<String, Object> paramMap);

    /**
     * 계정그룹이 등록된 계정 개수 확인
     */
    int getGroupConnectUser(@Param("ids") List<Integer> ids);

    /**
     * 계정그룹 제거
     * @param groupId 삭제할 계정그룹 ID
     */
    // void deleteGroupInfo(String groupId);
    void deleteGroupInfo(@Param("ids") List<Integer> ids);

    /**
     * 계정그룹 메뉴권한 제거
     */
    void deleteGroupMenuInfo(String groupId);

    /**
     * 계정그룹 메뉴설정 리스트
     * @param paramMap 메뉴설정할 계정그룹 ID
     */
    List<Map<String, Object>> getMenuSettingList(Map<String, Object> paramMap);

    /**
     * 변경된 계정그룹 메뉴설정 리스트 저장
     * @param paramMap 변경된 계정그룹 메뉴설정 리스트
     */
    void saveMenuSetting(Map<String, Object> paramMap);
}
