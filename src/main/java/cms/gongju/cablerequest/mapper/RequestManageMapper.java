package cms.gongju.cablerequest.mapper;

import cms.gongju.cablerequest.vo.CableRequestVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 포설/제거 신청 통합 목록 및 승인/반려/삭제 담당 Mapper
 */
@Mapper
public interface RequestManageMapper {

    // 목록 조회
    List<CableRequestVO> selectRequestList(Map<String, Object> paramMap);
   int selectRequestListCount(Map<String, Object> paramMap);

    // 승인/반려 처리 (APPROVAL_STATUS 수정)
    // int updateApprovalStatus(@Param("requestIdList") List<Long> requestIdList, @Param("approvalStatus") String approvalStatus, @Param("loginUserId") String loginUserId);
    void updateApprovalStatus(Map<String, Object> paramMap);

    // 논리삭제(DEL_YN='Y')
    int updateDelYn(@Param("requestIdList") List<Long> requestIdList,
                    @Param("loginUserId") String loginUserId);

    List<Map<String,Object>> selectWorkDetailList(@Param("requestId") Long requestId);

    /**
     * 신청내역관리 엑셀다운로드 조회
     */
    List<Map<String, Object>> excelcabelManageList();
}
