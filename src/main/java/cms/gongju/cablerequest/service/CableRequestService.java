package cms.gongju.cablerequest.service;

import cms.gongju.cablerequest.mapper.CableRequestMapper;
import cms.gongju.cablerequest.mapper.RequestManageMapper;
import cms.gongju.cablerequest.mapper.WorkerMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 케이블 포설 신청/관리 비즈니스 로직
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CableRequestService {

    private final CableRequestMapper cableRequestMapper;
    private final WorkerMapper workerMapper;
    private final RequestManageMapper requestManageMapper;

    /**
     * 포설 신청 목록을 조회
     * @param paramMap 검색 조건
     * @return
     */
    public List<Map<String, Object>> selectRequestList(Map<String, Object> paramMap) {
        return cableRequestMapper.selectCableRequestList(paramMap);
    }

    /**
     * 특정 신청 ID로 케이블 신청 정보를 조회 (기본정보 + 필요시 세부정보)
     * @param requestId
     * @return
     */
    public Map<String,Object> selectCableRequest(Long requestId) {
        return cableRequestMapper.selectCableRequest(requestId);
    }


    /**
     * 임시저장/정식등록 등 공통 save 로직
     */
    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String,Object> saveCableRequest(Map<String,Object> param) {
        Map<String,Object> result = new HashMap<>();
        try {
            // 1) requestInfo 추출
            Map<String,Object> requestInfo = (Map<String,Object>) param.get("requestInfo");
            if(requestInfo == null) {
                throw new RuntimeException("requestInfo is null");
            }

            // (A) 컨트롤러에서 넘겨준 userId
            String regId = (String) param.get("regId");
            // 혹은 값이 없으면 "anonymous" 등 기본값
            if(regId == null || regId.isEmpty()) {
                regId = "admin";
            }

            // 2) requestType
            String requestType = (String) requestInfo.get("requestType");
            if(requestType == null || requestType.trim().isEmpty()){
                requestType = "INSTALL";
            }

            // 3) approvalStatus
            String approvalStatus = (String) requestInfo.get("approvalStatus");
            if(approvalStatus==null || approvalStatus.isEmpty()) {
                approvalStatus = "임시저장";
            }

            // 4) requestId
            Long requestId = null;
            if(requestInfo.get("requestId")!=null) {
                requestId = Long.valueOf(String.valueOf(requestInfo.get("requestId")));
            }

            // 5) Insert or Update tb_cable_request
            if(requestId == null || requestId==0) {
                // 신규 Insert
                cableRequestMapper.insertCableRequest(requestInfo, approvalStatus);
                requestId = (Long) requestInfo.get("requestId");
            } else {
                // 기존 Update
                cableRequestMapper.updateCableRequest(requestInfo, approvalStatus);
            }

            // ============ (추가) 임시저장 테이블 upsert ============

            String tempTitle = (String) param.get("tempTitle");
            if (tempTitle != null && !tempTitle.isEmpty()) {
                Map<String, Object> tempMap = new HashMap<>();
                tempMap.put("requestId", requestId);
                tempMap.put("userId",    regId);  // ★ 여기서도 regId 사용 가능
                tempMap.put("title",     tempTitle);
                cableRequestMapper.upsertTempSave(tempMap);
            }
            // ====================================================

            // 6) workerList
            List<Map<String,Object>> workerList = (List<Map<String,Object>>) param.get("workerList");
            if(workerList != null) {
                // 선삭제 → 재Insert
                cableRequestMapper.deleteRequestWorker(requestId);
                for(Map<String,Object> w : workerList) {
                    Long workerId = w.get("workerId")==null
                            ? null
                            : Long.valueOf(String.valueOf(w.get("workerId")));

                    if(workerId!=null) {
                        // ★ regId를 파라미터로 전달
                        cableRequestMapper.insertRequestWorker(requestId, workerId, regId);
                    }
                }
            }

            // 7) detailList
            List<Map<String,Object>> detailList = (List<Map<String,Object>>) param.get("detailList");
            if(detailList != null) {
                cableRequestMapper.deleteWorkDetail(requestId);

                for(Map<String,Object> d : detailList) {
                    String startAssetId = (String) d.get("startAssetId");
                    String startPort    = (String) d.get("startPort");
                    String endAssetId   = (String) d.get("endAssetId");
                    String endPort      = (String) d.get("endPort");

                    if(startAssetId==null) startAssetId="";
                    if(startPort==null)    startPort="";
                    if(endAssetId==null)  endAssetId="";
                    if(endPort==null)     endPort="";

                    if ("REMOVE".equalsIgnoreCase(requestType)) {
                        int installCount = cableRequestMapper.checkInstallExists(
                                startAssetId, startPort, endAssetId, endPort
                        );
                        if (installCount == 0) {
                            throw new RuntimeException("설치 케이블 정보가 없습니다: ("
                                    + startAssetId + "/" + startPort + " ~ "
                                    + endAssetId + "/" + endPort + ")");
                        }
                    }

                    // (B) detail insert 시에도 regId 활용
                    d.put("requestId", requestId);
                    d.put("regId",     regId); // ★ 컨트롤러에서 받은 userId 사용
                    cableRequestMapper.insertWorkDetail(d);
                }
            }

            result.put("result", "SUCCESS");
            result.put("requestId", requestId);

        } catch(Exception e) {
            log.error(e.getMessage());
            result.put("result", "FAIL");
            result.put("message", e.getMessage());
            throw e;
        }

        return result;
    }



    public List<Map<String,Object>> selectTempSaveList(){
        // Mapper: select * from tb_request_temp_save ...
        return cableRequestMapper.selectTempSaveList();
    }

    public Map<String,Object> selectRequestFullData(Long requestId){
        Map<String,Object> result = new HashMap<>();
        // 1) requestInfo
        Map<String,Object> reqInfo = cableRequestMapper.selectCableRequest(requestId);
        result.put("requestInfo", reqInfo);

        // 2) workerList
        List<Map<String,Object>> workerList = workerMapper.selectWorkersByRequestId(requestId);
        result.put("workerList", workerList);

        // 3) detailList
        List<Map<String,Object>> detailList = requestManageMapper.selectWorkDetailList(requestId);
        result.put("detailList", detailList);

        return result;
    }

}
