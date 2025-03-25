package cms.gongju.cablerequest.mapper;

import cms.gongju.cablerequest.vo.CableRequestVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 케이블 포설 신청 관련 MyBatis 매퍼 인터페이스
 */
@Mapper
public interface CableRequestMapper {

    // 포설 신청 목록
    List<Map<String, Object>> selectCableRequestList(Map<String, Object> paramMap);

    // 단일 신청 조회
    Map<String,Object> selectCableRequest(Long requestId);

    // 신청 Insert
//    int insertCableRequest(Map<String, Object> paramMap);
    //Long insertCableRequest(Map<String,Object> reqInfo);
//    int insertRequestWorker(Map<String,Object> workerMap);
 //   int insertWorkDetail(Map<String,Object> detailMap);

    // 신청 Update
    int updateCableRequest(Map<String, Object> paramMap);

    // 작업자 목록 조회
    //List<Map<String, Object>> selectWorkerList(Map<String, Object> paramMap);

    // 장비정보 Insert (예시)
    //int insertEquipmentInfo(Map<String, Object> paramMap);

    void insertCableRequest(@Param("requestInfo") Map<String, Object> requestInfo,
                            @Param("approvalStatus") String approvalStatus);

    // 그 외 updateCableRequest, deleteRequestWorker, etc...

    void updateCableRequest(@Param("requestInfo") Map<String,Object> requestInfo,
                            @Param("approvalStatus") String approvalStatus);

    // ...

    // 임시저장 테이블 upsert
    void upsertTempSave(Map<String,Object> param);

    // Worker, Detail 관련
    void deleteRequestWorker(Long requestId);
    void insertRequestWorker(@Param("requestId") Long requestId,
                             @Param("workerId") Long workerId,
                             @Param("regId") String regId);

    void deleteWorkDetail(Long requestId);
    void insertWorkDetail(Map<String,Object> detailMap);
    /**
     * tb_cable_install 테이블에서
     * (startAssetId, startPort, endAssetId, endPort)에 해당하는 설치건이 존재하는지 확인
     */
    int checkInstallExists(@Param("startAssetId") String startAssetId,
                           @Param("startPort")    String startPort,
                           @Param("endAssetId")   String endAssetId,
                           @Param("endPort")      String endPort);
    List<Map<String,Object>> selectTempSaveList();
    //List<Map<String,Object>> selectTempRequests();
    Map<String,Object> selectRequestFullData(Long requestId);
}
