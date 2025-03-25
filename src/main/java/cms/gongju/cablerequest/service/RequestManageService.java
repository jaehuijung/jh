package cms.gongju.cablerequest.service;

import cms.gongju.cable.mapper.AgencyMapper;
import cms.gongju.cablerequest.mapper.RequestManageMapper;
import cms.gongju.cablerequest.vo.CableRequestVO;
import cms.gongju.common.service.ExcelUtil;
import cms.gongju.common.service.qrMakeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 포설/제거 신청 목록 및 승인/반려/삭제를 처리하는 Service
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RequestManageService {

    private final RequestManageMapper requestManageMapper;
    private final AgencyMapper agencyMapper;
    private final qrMakeService qrMakeService;
   // private final FileUpload fileUpload;
  //  private final MultipartRequestUtil multipartRequestUtil;

    /**
     * 목록 조회: requestType(선택), orgName(선택), approvalStatus(선택) 등
     */
    public List<CableRequestVO> selectRequestList(Map<String, Object> param) {
        if (param.get("data") != null && !param.get("data").toString().isEmpty()) {
            param.putAll((Map<String, Object>) param.get("data"));
        }
        return requestManageMapper.selectRequestList(param);
    }

    public int selectRequestListCount(Map<String, Object> param) {
        if (param.get("data") != null && !param.get("data").toString().isEmpty()) {
            param.putAll((Map<String, Object>) param.get("data"));
        }
        return requestManageMapper.selectRequestListCount(param);
    }

    /**
     * 승인 처리 (APPROVAL_STATUS='승인')
     */
    /*
    public Map<String, Object> approveRequests(Map<String, Object> paramMap) {
        Map<String, Object> result = new HashMap<>();

        // requestIdList (List<Long> 또는 List<Integer>)
        List<Long> requestIdList = (List<Long>) paramMap.get("requestIdList");
        // 승인자 ID
        String loginUserId = (String) paramMap.get("loginUserId");

        if(requestIdList != null && !requestIdList.isEmpty()) {
            requestManageMapper.updateApprovalStatus(requestIdList, "승인", loginUserId);
            result.put("result", "SUCCESS");
            result.put("count", requestIdList.size());
        } else {
            result.put("result", "FAIL");
            result.put("message", "No requestIds");
        }

        return result;
    }
    */

    /**
     * 반려 처리 (APPROVAL_STATUS='반려')
     */
    /*
    public Map<String, Object> rejectRequests(Map<String, Object> paramMap) {
        Map<String, Object> result = new HashMap<>();
        List<Long> requestIdList = (List<Long>) paramMap.get("requestIdList");
        String loginUserId = (String) paramMap.get("loginUserId");
        // 반려사유 (필요 시)
        String rejectReason = (String) paramMap.get("rejectReason");

        if(requestIdList != null && !requestIdList.isEmpty()) {
            requestManageMapper.updateApprovalStatus(requestIdList, "반려", loginUserId);
            // 반려사유를 TB_CABLE_REQUEST.approval_remarks 등에 저장할 수도 있음
            // ex) requestManageMapper.updateRejectReason(...)
            result.put("result", "SUCCESS");
            result.put("count", requestIdList.size());
        } else {
            result.put("result", "FAIL");
            result.put("message", "No requestIds");
        }

        return result;
    }    
     */

    /**
     * 승인 처리 로직 통합 (APPROVAL_STATUS='승인')
     */
    @SuppressWarnings("unchecked")
    @Transactional
    public Map<String, Object> approveRequests(Map<String, Object> paramMap) throws Exception {
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode", false);

        try {

            List<Map<String, Object>> approveRequestList
                    = (List<Map<String, Object>>) paramMap.get("requestList");

            if(approveRequestList == null || approveRequestList.isEmpty()) {
                throw new IllegalArgumentException("requestList 데이터가 없습니다.");
            }


            paramMap.put("approvalStatus", "승인");

            // requestIdList 추출
            List<Integer> requestIdList = new ArrayList<>();
            for(Map<String, Object> arl : approveRequestList) {
                // 예: { requestId: 123, requestType: "INSTALL", ... }
                Integer reqId = ((Number) arl.get("requestId")).intValue();
                requestIdList.add(reqId);
            }
            paramMap.put("requestIdList", requestIdList);

            // 승인 상태 update
            requestManageMapper.updateApprovalStatus(paramMap);

            // 3) 기관회선 등록을 위해 INSTALL / REMOVE 분류
            List<Long> installIDs = new ArrayList<>();
            List<Long> removeIDs = new ArrayList<>();

            for (Map<String, Object> row : approveRequestList) {
                String requestType = (String) row.get("requestType");
                Long requestId     = ((Number) row.get("requestId")).longValue();

                if ("INSTALL".equals(requestType)) {
                    installIDs.add(requestId);
                } else if ("REMOVE".equals(requestType)) {
                    removeIDs.add(requestId);
                }
            }

            // 4) INSTALL 처리
            if (!installIDs.isEmpty()) {
                int labelId = agencyMapper.generateLabelId();
                String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

                for (Long requestId : installIDs) {
                    log.info("Processing requestId={}", requestId);

                    // 4-1) work_detail 조회
                    List<Map<String, Object>> detailList = agencyMapper.selectWorkDetailList(requestId);
                    if (detailList == null || detailList.isEmpty()) {
                        log.warn("No work_detail found for requestId={}", requestId);
                        continue;
                    }

                    // 4-2) tb_cable_install 등록
                    for (Map<String, Object> d : detailList) {
                        Map<String, Object> installParam = new HashMap<>();
                        installParam.put("requestId", requestId);
                        installParam.put("workDetailId", d.get("WORK_DETAIL_ID"));
                        installParam.put("startLocation", d.get("START_LOCATION"));
                        installParam.put("endLocation", d.get("END_LOCATION"));
                        installParam.put("startAssetId", d.get("START_ASSET_ID"));
                        installParam.put("startPort", d.get("START_PORT"));
                        installParam.put("endAssetId", d.get("END_ASSET_ID"));
                        installParam.put("endPort", d.get("END_PORT"));

                        installParam.put("cableType", d.get("CABLE_TYPE"));
                        installParam.put("cableColor", d.get("CABLE_COLOR"));
                        installParam.put("cableLength", d.get("CABLE_LENGTH"));

                        installParam.put("installDate", today);
                        installParam.put("lineStatus", "활성");
                        installParam.put("remarks", d.get("REMARKS"));
                        installParam.put("reg_id", "admin");

                        // START 일련번호 생성
                        installParam.put("startLabelId", labelId);
                        installParam.put("labelId", labelId++);
                        installParam.put("cableLabelId", today);

                        String cableManageId = agencyMapper.generateCableManageId(installParam);
                        String filePath      = qrMakeService.QRMake(cableManageId);

                        installParam.put("qrPath", filePath);
                        installParam.put("qrInfo", cableManageId);

                        String labelContent = d.get("start_location") + "-"
                                + d.get("start_eqp_name") + "-"
                                + d.get("start_port");
                        installParam.put("labelContent", labelContent);
                        agencyMapper.saveLabelInfo(installParam);

                        // END 일련번호 생성
                        installParam.put("endLabelId", labelId);
                        installParam.put("labelId", labelId++);
                        String prefix = cableManageId.substring(0, cableManageId.lastIndexOf('_'));
                        String serialNumber = cableManageId.substring(cableManageId.lastIndexOf('_') + 1);
                        int nextSerialNumber = Integer.parseInt(serialNumber) + 1;
                        String formattedSerialNumber = String.format("%05d", nextSerialNumber);
                        cableManageId = prefix + "_" + formattedSerialNumber;

                        filePath = qrMakeService.QRMake(cableManageId);
                        installParam.put("qrPath", filePath);
                        installParam.put("qrInfo", cableManageId);

                        labelContent = d.get("end_location") + "-"
                                + d.get("end_eqp_name") + "-"
                                + d.get("end_port");
                        installParam.put("labelContent", labelContent);
                        agencyMapper.saveLabelInfo(installParam);

                        agencyMapper.insertCableInstall(installParam); // 기관회선 등록
                    }
                }
            }

            // 5) REMOVE 처리
            if (!removeIDs.isEmpty()) {
                paramMap.put("requestIdList", removeIDs);
                agencyMapper.updateCableRemove(paramMap);
            }

            // 6) 결과
            returnMap.put("result", "SUCCESS");
            returnMap.put("count", approveRequestList.size());
            returnMap.put("errorCode", true);
        }
        catch (Exception e) {
            log.error(e.getMessage(), e);
            throw e;
        }

        return returnMap;
    }


    /**
     * 승인 처리 로직 통합 (APPROVAL_STATUS='승인')
     */
    @SuppressWarnings("unchecked")
   /* @Transactional
    public Map<String, Object> approveRequests(MultipartHttpServletRequest request) throws Exception {
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode", false);

        try {
            Map<String, Object> paramMap = multipartRequestUtil.convert(request);

            ObjectMapper objectMapper = new ObjectMapper();
            String requestListJson = (String) paramMap.get("requestList");
            List<Map<String, Object>> approveRequestList = objectMapper.readValue(requestListJson, new TypeReference<>() {});

            // 승인처리
            paramMap.put("approvalStatus", "승인");
            List<Integer> requestIdList = new ArrayList<>();
            for(Map<String, Object> arl : approveRequestList) {
                requestIdList.add((Integer) arl.get("requestId"));
            }
            paramMap.put("requestIdList", requestIdList);

            requestManageMapper.updateApprovalStatus(paramMap);

            // 기관회선 등록
            List<Long> installIDs = new ArrayList<>();
            List<Long> removeIDs = new ArrayList<>();

            // INSTALL / REMOVE 분류
            for (Map<String, Object> row : approveRequestList) {
                String requestType = (String) row.get("requestType");
                Long requestId = ((Number) row.get("requestId")).longValue();

                if ("INSTALL".equals(requestType)) {
                    installIDs.add(requestId);
                } else if ("REMOVE".equals(requestType)) {
                    removeIDs.add(requestId);
                }
            }

            // INSTALL 건 처리
            if (!installIDs.isEmpty()) {
                int labelId = agencyMapper.generateLabelId();

                String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

                // loop each requestId
                for (Long requestId : installIDs) {
                    log.info("Processing requestId={}", requestId);

                    // 1) select multiple work_detail
                    List<Map<String, Object>> detailList = agencyMapper.selectWorkDetailList(requestId);
                    if (detailList == null || detailList.isEmpty()) {
                        log.warn("No work_detail found for requestId={}", requestId);
                        continue; // skip
                    }

                    // 2) Insert tb_cable_install for each detail
                    for (Map<String, Object> d : detailList) {
                        Map<String, Object> installParam = new HashMap<>();
                        installParam.put("requestId", requestId);
                        installParam.put("workDetailId", d.get("WORK_DETAIL_ID"));
                        installParam.put("startLocation", d.get("START_LOCATION"));
                        installParam.put("endLocation", d.get("END_LOCATION"));
                        installParam.put("startAssetId", d.get("START_ASSET_ID"));
                        installParam.put("startPort", d.get("START_PORT"));
                        installParam.put("endAssetId", d.get("END_ASSET_ID"));
                        installParam.put("endPort", d.get("END_PORT"));

                        installParam.put("cableType", d.get("CABLE_TYPE"));
                        installParam.put("cableColor", d.get("CABLE_COLOR"));
                        installParam.put("cableLength", d.get("CABLE_LENGTH"));

                        installParam.put("installDate", today); // or now
                        installParam.put("lineStatus", "활성");
                        installParam.put("remarks", d.get("REMARKS"));
                        installParam.put("reg_id", "admin");


                        // 등록한 기관회선 QR 이미지 생성
                        // START 일련번호 생성
                        installParam.put("startLabelId", labelId);
                        installParam.put("labelId", labelId++);
                        installParam.put("cableLabelId", today);

                        String cableManageId = agencyMapper.generateCableManageId(installParam);
                        String filePath = qrMakeService.QRMake(cableManageId); // START qr 이미지 저장
                        installParam.put("qrPath", filePath);
                        installParam.put("qrInfo", cableManageId); // 정재희 이사님 요청 : qrInfo (cableManageId) 사용

                        String labelContent = d.get("start_location") + "-" + d.get("start_eqp_name") + "-" + d.get("start_port");
                        installParam.put("labelContent", labelContent);
                        agencyMapper.saveLabelInfo(installParam); // START LABEL 정보 등록


                        // END 일련번호 생성
                        installParam.put("endLabelId", labelId);
                        installParam.put("labelId", labelId++);
                        String prefix = cableManageId.substring(0, cableManageId.lastIndexOf('_'));
                        String serialNumber = cableManageId.substring(cableManageId.lastIndexOf('_') + 1);
                        int nextSerialNumber = Integer.parseInt(serialNumber) + 1;
                        String formattedSerialNumber = String.format("%05d", nextSerialNumber);
                        cableManageId = prefix + "_" + formattedSerialNumber;

                        filePath = qrMakeService.QRMake(cableManageId); // END qr 이미지 저장
                        installParam.put("qrPath", filePath);
                        installParam.put("qrInfo", cableManageId); // 정재희 이사님 요청 : qrInfo (cableManageId) 사용

                        labelContent = d.get("end_location") + "-" + d.get("end_eqp_name") + "-" + d.get("end_port");
                        installParam.put("labelContent", labelContent);
                        agencyMapper.saveLabelInfo(installParam); // END LABEL 정보 등록

                        agencyMapper.insertCableInstall(installParam); // 기관회선 등록

                        // 첨부파일 업로드
                        // 1. 파일 정보를 tb_cable_install의 INSTALL_ID를 참조키로 사용하는 tb_cable_guarantee에 등록
                        // 2. 파일 서버에 저장

                        // 파일 다운로드 관련
                        List<MultipartFile> files = request.getFiles("files"); // files 추출

                        if (files != null && !files.isEmpty()) {
                            for (MultipartFile file : files) {
                                fileUpload.saveFile(file);
                            }
                        }
                    }

                    returnMap.put("errorCode", true);
                }
            }

            // REMOVE 건 처리
            if (!removeIDs.isEmpty()) {
                paramMap.put("requestIdList", removeIDs);
                agencyMapper.updateCableRemove(paramMap);
            }

            returnMap.put("count", approveRequestList.size());
            returnMap.put("errorCode", true);


        }
        catch (Exception e) {
            log.error(e.getMessage());
            throw e;
        }

        return returnMap;
    }*/


    /**
     * 반려 처리 (APPROVAL_STATUS='반려')
     */
    //@SuppressWarnings("unchecked")
    @Transactional
    public Map<String, Object> rejectRequests(Map<String, Object> paramMap) {
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode", false);
        
        try{            
            // requestManageMapper.updateApprovalStatus(requestIdList, "반려", loginUserId);
            // 반려사유를 TB_CABLE_REQUEST.approval_remarks 등에 저장할 수도 있음
            // ex) requestManageMapper.updateRejectReason(...)

            paramMap.put("approvalStatus", "반려");
            requestManageMapper.updateApprovalStatus(paramMap);
            returnMap.put("errorCode", true);            
        }
        catch (Exception e) {
            log.error(e.getMessage());
            throw e;
        }
        
        return returnMap;
    }    

    /**
     * 삭제 처리 (DEL_YN='Y')
     */
    public Map<String, Object> deleteRequests(Map<String, Object> paramMap) {
        Map<String, Object> result = new HashMap<>();
        List<Long> requestIdList = (List<Long>) paramMap.get("requestIdList");
        String loginUserId = (String) paramMap.get("loginUserId");

        if(requestIdList != null && !requestIdList.isEmpty()) {
            requestManageMapper.updateDelYn(requestIdList, loginUserId);
            result.put("result", "SUCCESS");
            result.put("count", requestIdList.size());
        } else {
            result.put("result", "FAIL");
            result.put("message", "No requestIds");
        }

        return result;
    }

    public List<Map<String,Object>> selectWorkDetailList(Long requestId) {
        return requestManageMapper.selectWorkDetailList(requestId);
    }

    /**
     * 신청내역관리 리스트를 엑셀 파일로 변환
     */
    public Workbook exportRequestListToExcel() throws IOException {
        // DB에서 조회한 데이터 가져오기
        // 엑셀 템플릿 불러오기
        Workbook workbook = ExcelUtil.getWorkbookFromTemplate("cableManageListTemplate.xlsx");
        List<Map<String, Object>> excelcmList = requestManageMapper.excelcabelManageList();

        // 컬럼 순서를 엑셀 템플릿에 맞게 재정렬
        List<Map<String, Object>> reorderedList = excelcmList.stream()
                .map(row -> {
                    Map<String, Object> reorderedRow = new LinkedHashMap<>();
                    reorderedRow.put("NO", row.get("NO"));
                    reorderedRow.put("기관명", row.get("기관명"));
                    //reorderedRow.put("구분", row.get("구분"));
                    // "구분" 값 변경 로직 추가
                    String requestType = (String) row.get("구분");
                   if (requestType != null) {
                        if (requestType.contains("INSTALL")) {
                            reorderedRow.put("구분", "포설");
                        } else if (requestType.contains("REMOVE")) {
                            reorderedRow.put("구분", "제거");
                        } else {
                            reorderedRow.put("구분", ""); // 변경 사항이 없을 경우 기존 값 유지
                        }
                    } else {
                        reorderedRow.put("구분", ""); // null 값일 경우 빈 문자열로 처리
                    }
                    reorderedRow.put("시작일", row.get("시작일"));
                    reorderedRow.put("종료일", row.get("종료일"));
                    reorderedRow.put("목적", row.get("목적"));
                    reorderedRow.put("주무관", row.get("주무관"));
                    reorderedRow.put("연락처", row.get("연락처"));
                    reorderedRow.put("직급", row.get("직급"));
                    reorderedRow.put("부서명", row.get("부서명"));
                    reorderedRow.put("승인상태", row.get("승인상태"));
                    return reorderedRow;
                })
                .collect(Collectors.toList());



        // 재정렬된 데이터를 엑셀 시트에 작성
        ExcelUtil.writeDataToSheet(workbook, "작업목록", reorderedList);

        return workbook;
    }
}
