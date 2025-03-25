package cms.gongju.cable.service;

import cms.gongju.cable.mapper.AgencyMapper;
import cms.gongju.common.service.ExcelUtil;
import cms.gongju.common.service.qrMakeService;
import cms.gongju.patch.service.PatchManageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * tb_cable_install 생성 (단일)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AgencyService {

    private final AgencyMapper agencyMapper;
    private final PatchManageService patchManageService;
    private final qrMakeService qrMakeService;

    /**
     * requestId -> 단일 tb_cable_work_detail 조회 -> tb_cable_install insert


        private final AgencyMapper agencyMapper;

        /**
         * requestIdList -> 각 requestId에 대해 work_detail 조회 -> install insert
         */
    @Transactional
    public Map<String,Object> doInstallForRequests(Map<String,Object> param) throws Exception {
        Map<String,Object> result = new HashMap<>();

        try {
            // ex) param => { "requestIdList": [101,102, ...], ... }
            List<?> idList = (List<?>) param.get("requestIdList");
            if (idList == null || idList.isEmpty()) {
                result.put("result", "FAIL");
                result.put("message", "requestIdList is empty or null");
                return result;
            }

            int totalInsertCount = 0;
            int labelId = agencyMapper.generateLabelId();

            String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

            // loop each requestId
            for (Object o : idList) {
                Long requestId = ((Number) o).longValue();
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



                    // qr 생성 로직

                    // START 일련번호 생성
                    installParam.put("startLabelId", labelId);
                    installParam.put("labelId", labelId++);
                    installParam.put("cableLabelId", today);

                    String cableManageId = agencyMapper.generateCableManageId(installParam);
                    String filePath = qrMakeService.QRMake(cableManageId); // START qr 이미지 저장
                    installParam.put("qrPath", filePath);
                    installParam.put("qrInfo", cableManageId); // 정재희 이사님 요청 : qrInfo (cableManageId) 사용

                    String labelContent = d.get("start_location") + "-" + d.get("start_eqp_name") + "-" + d.get("start_port") ;
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

                    labelContent = d.get("end_location") + "-" + d.get("end_eqp_name") + "-" + d.get("end_port") ;
                    installParam.put("labelContent", labelContent);
                    agencyMapper.saveLabelInfo(installParam); // END LABEL 정보 등록

                    agencyMapper.insertCableInstall(installParam); // 기관회선 등록
                    totalInsertCount++;
                }

                result.put("result", "SUCCESS");
                result.put("count", totalInsertCount);
            }
        }
        catch (Exception e) {
            log.error(e.getMessage());
            result.put("result", "FAIL");
            result.put("message", e.getMessage());
            throw e;
        }

        return result;
    }


    /**
            * REMOVE 건 처리
     * - tb_cable_work_detail + tb_cable_install JOIN
     * - is_deleted='Y' 업데이트
     */
    public int removeCables(List<Long> requestIdList){
        if(requestIdList==null || requestIdList.isEmpty()){
            return 0;
        }
        // MyBatis에 넘길 파라미터
        Map<String,Object> param = Map.of("requestIdList", requestIdList);

        // Update
        int updatedCount = agencyMapper.updateCableRemove(param);

        return updatedCount;
    }

    /**
     * tb_cable_install 목록조회
     */
    @SuppressWarnings("unchecked")
    public Map<String,Object> selectInstallList(Map<String,Object> paramMap){
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode", "false");

        try {
            if (paramMap.get("data") != null && !paramMap.get("data").toString().isEmpty()) {
                paramMap.putAll((Map<String, Object>) paramMap.get("data"));
            }

            List<Map<String, Object>> rows = agencyMapper.selectInstallList(paramMap);
            int total = agencyMapper.selectInstallCount(paramMap);
            returnMap.put("rows", rows);
            returnMap.put("total", total);
            returnMap.put("errorCode", true);
        }
        catch (Exception e) {
            log.error(e.getMessage());
            throw e;
        }

        return returnMap;
    }

    // 기관회선 삭제
    @SuppressWarnings("unchecked")
    public Map<String, Object> deleteCableInfo(Map<String, Object> paramMap){
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode", false);

        try {
            List<Integer> installIds = (List<Integer>) paramMap.get("installId");
            for (Integer installId : installIds) {
                paramMap.put("installId", installId);
                agencyMapper.deleteCableInfo(paramMap);
            }

            returnMap.put("errorCode", true);

        }
        catch (Exception e) {
            log.error(e.getMessage());
            throw e;
        }

        return returnMap;
    }

    /**
     * 선택된 기관회선관리 케이블 정보
     */
    public Map<String, Object> getCableInfoList(Map<String, Object> paramMap){
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode", false);

        try {
            Map<String, Object> rows = agencyMapper.selectInstallPopupList(paramMap);

            List<Map<String, Object>> patchRows = agencyMapper.selectInstallPatchPopupList(rows);
            for (Map<String, Object> patchRow : patchRows){
                String category = (String) patchRow.get("patch_category");

                Long connection_id   = (Long) patchRow.get("connection_id");
                String main_patch    = (String) patchRow.get("main_patch_port_concat");
                String sub_patch     = (String) patchRow.get("sub_patch_port_concat");

                if(category.equals("수평")){
                    rows.put("horizontal_1_id", connection_id);
                    rows.put("horizontal_1_1",  main_patch);
                    rows.put("horizontal_1_2",  sub_patch);
                }
                else if(category.equals("수직")){
                    rows.put("vertical_1_id", connection_id);
                    rows.put("vertical_1_1",  main_patch);
                    rows.put("vertical_1_2",  sub_patch);
                }
            }

            returnMap.put("rows", rows);
            returnMap.put("errorCode", true);
        }
        catch (Exception e) {
            log.error(e.getMessage());
            throw e;
        }

        return returnMap;
    }

    /**
     * 선택된 기관회선관리 케이블 정보 수정
     */
    @Transactional
    public Map<String, Object> saveCableInfo(Map<String, Object> paramMap){
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode", false);

        try {
            agencyMapper.saveCableInfo(paramMap); // 케이블 설치 정보
            

            String start_asset_id = (String) paramMap.get("start_asset_id");
            String old_start_asset_id = (String) paramMap.get("old_start_asset_id");
            String end_asset_id = (String) paramMap.get("end_asset_id");
            String old_end_asset_id = (String) paramMap.get("old_end_asset_id");

            if(!start_asset_id.equals(old_start_asset_id)){
                paramMap.put("start_asset_id", old_start_asset_id);
                paramMap.put("new_start_asset_id", start_asset_id);
            }
            else {
                paramMap.put("start_asset_id", paramMap.get("start_asset_id"));
            }

            if(!end_asset_id.equals(old_end_asset_id)){
                paramMap.put("end_asset_id", old_end_asset_id);
                paramMap.put("new_end_asset_id", end_asset_id);
            }
            else{
                paramMap.put("end_asset_id", paramMap.get("end_asset_id"));
            }

            agencyMapper.saveCableConfigInfo(paramMap); // 케이블 구성정보



            Map<String, Object> cablePatchInfo = new HashMap<>();

            // 수평
            String horizontal_1_id = (String) paramMap.get("horizontal_1_id");
            if(horizontal_1_id != null && !horizontal_1_id.isEmpty()){

                String horizontal_1_1 = (String) paramMap.get("horizontal_1_1");
                String horizontal_1_2 = (String) paramMap.get("horizontal_1_2");

                String main_asset_id = "";
                String sub_asset_id  = "";
                if(horizontal_1_1.isEmpty() && horizontal_1_2.isEmpty()){
                    main_asset_id = horizontal_1_1;
                    sub_asset_id  = horizontal_1_2;
                }
                else {
                    main_asset_id = (String) paramMap.get("start_asset_id");
                    sub_asset_id = (String) paramMap.get("end_asset_id");
                }

                cablePatchInfo.put("connection_id", horizontal_1_id);
                cablePatchInfo.put("main_asset_id", main_asset_id);
                cablePatchInfo.put("sub_asset_id",  sub_asset_id);

                agencyMapper.saveCablePatchInfo(cablePatchInfo);
            }

            // 수직_1
            String vertical_1_id   = (String) paramMap.get("vertical_1_id");
            if(vertical_1_id != null && !vertical_1_id.isEmpty()){

                String vertical_1_1 = (String) paramMap.get("vertical_1_1");
                String vertical_1_2 = (String) paramMap.get("vertical_1_2");

                String main_asset_id = "";
                String sub_asset_id  = "";
                if(vertical_1_1.isEmpty() && vertical_1_2.isEmpty()){
                    main_asset_id = vertical_1_1;
                    sub_asset_id  = vertical_1_2;
                }
                else {
                    main_asset_id = (String) paramMap.get("start_asset_id");
                    sub_asset_id = (String) paramMap.get("end_asset_id");
                }

                cablePatchInfo.put("connection_id", vertical_1_id);
                cablePatchInfo.put("main_asset_id", main_asset_id);
                cablePatchInfo.put("sub_asset_id",  sub_asset_id);

                agencyMapper.saveCablePatchInfo(cablePatchInfo); // 케이블 패치정보
            }

            // dstp_1
            /*
            String dstp_1_id       = (String) paramMap.get("dstp_1_id");
            if(dstp_1_id != null && !dstp_1_id.isEmpty()){
                String dstp_1_1        = (String) paramMap.get("start_asset_id");
                String dstp_1_2        = (String) paramMap.get("end_asset_id");

                cablePatchInfo.put("connection_id", dstp_1_id);
                cablePatchInfo.put("main_asset_id", dstp_1_1);
                cablePatchInfo.put("sub_asset_id",  dstp_1_2);

                agencyMapper.saveCablePatchInfo(cablePatchInfo);
            }
             */

            /*
            // 수직_2
            String vertical_2_id   = (String) paramMap.get("vertical_2_id");
            if(vertical_2_id != null && !vertical_2_id.isEmpty()){
                String vertical_2_1    = (String) paramMap.get("start_asset_id");
                String vertical_2_2    = (String) paramMap.get("end_asset_id");

                cablePatchInfo.put("connection_id", vertical_2_id);
                cablePatchInfo.put("main_asset_id", vertical_2_1);
                cablePatchInfo.put("sub_asset_id",  vertical_2_2);

                agencyMapper.saveCablePatchInfo(cablePatchInfo);
            }

            // dr1
            String dr1_id          = (String) paramMap.get("dr1_id");
            if(dr1_id != null && !dr1_id.isEmpty()){
                String dr1_1           = (String) paramMap.get("start_asset_id");
                String dr1_2           = (String) paramMap.get("end_asset_id");

                cablePatchInfo.put("connection_id", dr1_id);
                cablePatchInfo.put("main_asset_id", dr1_1);
                cablePatchInfo.put("sub_asset_id",  dr1_2);

                agencyMapper.saveCablePatchInfo(cablePatchInfo);
            }

            // dr2
            String dr2_id          = (String) paramMap.get("dr2_id");
            if(dr2_id != null && !dr2_id.isEmpty()){
                String dr2_1           = (String) paramMap.get("start_asset_id");
                String dr2_2           = (String) paramMap.get("end_asset_id");

                cablePatchInfo.put("connection_id", dr2_id);
                cablePatchInfo.put("main_asset_id", dr2_1);
                cablePatchInfo.put("sub_asset_id",  dr2_2);

                agencyMapper.saveCablePatchInfo(cablePatchInfo);
            }
             */

            returnMap.put("errorCode", true);
        }
        catch (Exception e) {
            log.error(e.getMessage());
            throw e;
        }

        return returnMap;
    }

    // 검색된 자산ID의 정보 조회
    @SuppressWarnings("unchecked")
    public Map<String, Object> cableInfoAssetList(Map<String, Object> paramMap){
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode", false);

        try {
            if (paramMap.get("data") != null && !paramMap.get("data").toString().isEmpty()) {
                paramMap.putAll((Map<String, Object>) paramMap.get("data"));
            }

            List<Map<String, Object>> rows = agencyMapper.selectCableInfoAssetList(paramMap);
            returnMap.put("rows", rows);
            returnMap.put("errorCode", true);
        }
        catch (Exception e) {
            log.error(e.getMessage());
            throw e;
        }

        return returnMap;
    }

    // 기관회선관리 케이블 수정 패치 검색 > 패치 리스트
    @SuppressWarnings("unchecked")
    public Map<String, Object> cableInfoPatchList(Map<String, Object> paramMap){
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode", false);

        try{
            if (paramMap.get("data") != null && !paramMap.get("data").toString().isEmpty()) {
                paramMap.putAll((Map<String, Object>) paramMap.get("data"));
            }
            
            List<Map<String, Object>> rows = patchManageService.getPatchList(paramMap);
            int total = patchManageService.selectPatchListCount(paramMap);

            returnMap.put("rows", rows);
            returnMap.put("total", total);
            returnMap.put("errorCode", true);                
        }
        catch(Exception e){
            log.error(e.getMessage());
            throw e;
        }

        return returnMap;
    }

    // 라벨출력 팝업에서 사용할 라벨 데이터 생성
    public Map<String, Object> getLabelList(Map<String, Object> paramMap){
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode", false);

        try{
            List<Map<String, Object>> rows = agencyMapper.getLabelList(paramMap);
            returnMap.put("rows", rows);
            returnMap.put("errorCode", true);
        }
        catch(Exception e){
            log.error(e.getMessage());
            throw e;
        }

        return returnMap;
    }

    // 기관회선관리 > 이력조회 데이터
    @SuppressWarnings("unchecked")
    public Map<String, Object> getHistoryList(Map<String, Object> paramMap){
        Map<String, Object> returnMap = new HashMap<>();
        returnMap.put("errorCode", false);

        try {
            if (paramMap.get("data") != null && !paramMap.get("data").toString().isEmpty()) {
                paramMap.putAll((Map<String, Object>) paramMap.get("data"));
            }

            List<Map<String, Object>> rows = agencyMapper.getHistoryList(paramMap);
            int total = agencyMapper.getHistoryListCount(paramMap);

            returnMap.put("rows", rows);
            returnMap.put("total", total);
            returnMap.put("errorCode", true);
        }
        catch (Exception e) {
            log.error(e.getMessage());
            throw e;
        }

        return returnMap;
    }

    /**
     * 기관회선 케이블 목록 엑셀 다운로드
     *
     * @return 결과 메시지
     */
    @Transactional
    public Workbook downloadCableInfo(Map<String, Object> paramMap) throws IOException {
        Workbook wb = ExcelUtil.getWorkbookFromTemplate("cableListTemplate.xlsx");

        try {
            // 케이블 목록 데이터 가져오기
            List<Map<String, Object>> cableInfoTotalList = agencyMapper.getExcelCableInfoTotalList(paramMap);

            // 특정 컬럼 순서 강제로 정렬
            List<String> columnOrder = List.of(
                    "No", "START_자산ID", "START_구성ID", "START_업무명", "START_좌표", "START_포트",
                    "END_자산ID", "END_구성ID", "END_업무명", "END_좌표", "END_포트",
                    "케이블 타입", "케이블 색상", "케이블 길이", "포설일자"
            );

            List<Map<String, Object>> orderedList = cableInfoTotalList.stream()
                    .map(originalMap -> {
                        Map<String, Object> sortedMap = new LinkedHashMap<>();
                        columnOrder.forEach(key -> sortedMap.put(key, originalMap.get(key)));
                        return sortedMap;
                    })
                    .collect(Collectors.toList());

            // 데이터를 엑셀 시트에 작성
            ExcelUtil.writeDataToSheet(wb, "케이블 목록", orderedList);

        } catch (Exception e){
            log.error(e.getMessage());
            throw e;
        }

        return wb;
    }
}
