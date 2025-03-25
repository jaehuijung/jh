package cms.gongju.cable.controller;

import cms.gongju.cable.service.AgencyService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.io.*;
import java.util.List;
import java.util.Map;

/**
 * 선번장관리 > 기관회선관리
 */
@Slf4j
@CrossOrigin(origins = "*", allowedHeaders = "*") /* CORS 어노테이션 */
@Controller
@RequiredArgsConstructor
@RequestMapping("/cable/agency")
public class AgencyController {

    /**
     * 선번장관리 > 기관회선관리 > 조회 > 뷰 페이지
     *
     * @return 기관회선관리 뷰 페이지
     */

    private final AgencyService agencyService;

    @GetMapping("/view")
    public String view(Authentication authentication) {
        return "views/cable/agencyLine/view";
    }

    @ResponseBody
    @PostMapping("/doInstall")
    public Map<String, Object> doInstall(@RequestBody Map<String,Object> param) throws Exception{
        // param => {"requestIdList":[123,456], ... }
        log.info("[AgencyController] doInstall param={}", param);

        return agencyService.doInstallForRequests(param);
    }


    /**
     * 케이블 제거(REMOVE)
     * - requestIdList로 tb_cable_work_detail + tb_cable_install JOIN → is_deleted='Y' 업데이트
     */
    @ResponseBody
    @PostMapping("/doRemove")
    public Map<String,Object> doRemove(@RequestBody Map<String,Object> param){
        // param => { requestIdList: [...], etc. }
        try {
            List<Long> requestIdList = (List<Long>) param.get("requestIdList");
            if(requestIdList == null || requestIdList.isEmpty()){
                return Map.of("result","FAIL","message","requestIdList is empty");
            }

            int count = agencyService.removeCables(requestIdList);

            return Map.of("result","SUCCESS","count", count);

        } catch(Exception e){
            e.printStackTrace();
            return Map.of("result","FAIL","message", e.getMessage());
        }
    }

    /**
     * [POST] 설치정보 목록조회 AJAX
     * - 파라미터: 검색조건(타입, 포설일자, 등)
     * - 리턴: List<Map<String,Object>>
     */
    @ResponseBody
    @PostMapping("/getList")
    public Map<String,Object> getInstallList(@RequestBody Map<String,Object> param){
        log.info("[AgencyController] getInstallList param={}", param);

        return agencyService.selectInstallList(param);
    }

    @ResponseBody
    @PostMapping("/hgetList")
    public Map<String,Object> hgetInstallList(@RequestBody Map<String,Object> param){
        log.info("[AgencyController] getInstallList param={}", param);

        return agencyService.selectInstallList(param);
    }

    /**
     * 기관회선관리 케이블 삭제
     */
    @ResponseBody
    @PostMapping("/delete")
    public Map<String, Object> delete(@RequestBody Map<String, Object> paramMap) {
        return agencyService.deleteCableInfo(paramMap);
    }


    /**
     * 기관회선관리 케이블 수정 팝업
     */
    @GetMapping("/cableInfoView")
    public String cableInfoView(Model model, @RequestParam("install_id") String installId) {
        model.addAttribute("installId", installId);

        Map<String, Object> cableInfo = agencyService.getCableInfoList(Map.of("installId", installId));
        if((boolean) cableInfo.get("errorCode")){
            model.addAttribute("cableInfo", cableInfo.get("rows"));
        }

        return "views/cable/agencyLine/agencyLineInfoView";
    }

    /**
     * 기관회선관리 케이블 정보 수정
     */
    @ResponseBody
    @PostMapping("/saveCableInfo")
    public Map<String,Object> saveCableInfo(@RequestBody Map<String,Object> paramMap){
        return agencyService.saveCableInfo (paramMap);
    }


    /**
     * 기관회선관리 케이블 수정 팝업 > 자산ID 검색 팝업
     */
    @GetMapping("/cableInfoAssetView")
    public String cableInfoAssetView(Model model, @RequestParam("asset_id") String assetId) {
        model.addAttribute("assetId", assetId);
        return "views/cable/agencyLine/agencyLineAssetView";
    }

    /**
     * 기관회선관리 케이블 수정 팝업 > 자산ID 검색 리스트
     */
    @ResponseBody
    @PostMapping("/cableInfoAssetList")
    public Map<String, Object> cableInfoAssetList(@RequestBody Map<String, Object> paramMap) {
        return agencyService.cableInfoAssetList(paramMap);
    }

    /**
     * 기관회선관리 케이블 수정 패치 검색
     */
    @GetMapping("/cableInfoPatchView")
    public String cableInfoPatchView(Model model, @RequestParam("category") String category) {
        if(category.equals("horizontal")){
            return "views/cable/agencyLine/agencyLinePatchHView";
        }
        else if(category.equals("vertical") || category.equals("vertical-tps")){
            return "views/cable/agencyLine/agencyLinePatchVView";
        }
        else {
            return "views/cable/agencyLine/agencyLinePatchHView";
        }
    }

    /**
     * 기관회선관리 케이블 수정 패치 검색 > 패치 리스트
     */
    @ResponseBody
    @PostMapping("/cableInfoPatchList")
    public Map<String, Object> cableInfoPatchList(@RequestBody Map<String, Object> paramMap) {
        return agencyService.cableInfoPatchList(paramMap);
    }


    /**
     * 기관회선관리 케이블 라벨출력
     */
    @GetMapping("/cableInfoLabelView")
    public String cableInfoLabelView(Model model, @RequestParam("data") List<String> paramList) {
        model.addAttribute("data", paramList);
        return "views/cable/agencyLine/agencyLineLabelView";
    }

    /**
     * 라벨출력 팝업에서 사용할 라벨 데이터 생성
     */
    @ResponseBody
    @PostMapping("/getLabelList")
    public Map<String, Object> getLabelList(@RequestBody Map<String, Object> paramMap) {
        return agencyService.getLabelList(paramMap);
    }

    /**
     * 선번장관리 > 기관회선관리 > 이력조회 팝업
     */
    @GetMapping("/cableInfoHistoryView")
    public String cableInfoHistoryView() {
        return "views/cable/agencyLine/agencyLineHistoryView";
    }

    /**
     * 선번장관리 > 기관회선관리 > 이력조회 데이터
     */
    @ResponseBody
    @PostMapping("/getHistoryList")
    public Map<String, Object> getHistoryList(@RequestBody Map<String, Object> paramMap) {
        return agencyService.getHistoryList(paramMap);
    }

    /**
     * 선번장관리 > 기관회선관리 > 엑셀 다운로드
     */
    @ResponseBody
    @PostMapping("/excelDownload")
    public void excelDownload(@RequestBody Map<String, Object> paramMap, HttpServletResponse response) throws IOException {
        Workbook wb = agencyService.downloadCableInfo(paramMap);
        response.setContentType("ms-vnd/excel");
        response.setHeader("Content-Disposition", "attachment;filename=equipmentListTemplate.xlsx");

        wb.write(response.getOutputStream());
        wb.close();
    }

    /**
     * 라벨프린터 파일 다운로드
     *
     * @param response HTTP 응답 객체
     */
    @PostMapping("/setupDownload")
    @ResponseBody
    public void downloadExeFile(HttpServletResponse response) throws IOException {
        // 서버에 있는 EXE 파일의 경로
        String filePath = System.getProperty("user.dir")
                + File.separator + "src" + File.separator + "main" + File.separator + "resources"
                + File.separator + "static" + File.separator + "setup" + File.separator + "LE_V2201_Setup_KR.zip";
        File file = new File(filePath);

        // 파일이 존재하는지 확인
        if (!file.exists()) {
            throw new FileNotFoundException("파일이 존재하지 않습니다: " + filePath);
        }

        // Content-Type 및 헤더 설정
        response.setContentType("application/octet-stream");
        response.setHeader("Content-Disposition", "attachment;filename=" + file.getName());
        response.setContentLength((int) file.length());

        // 파일을 응답 스트림에 작성
        try (FileInputStream fis = new FileInputStream(file);
             OutputStream os = response.getOutputStream()) {
            byte[] buffer = new byte[4096];
            int bytesRead;

            while ((bytesRead = fis.read(buffer)) != -1) {
                os.write(buffer, 0, bytesRead);
            }

            os.flush();
        }
    }
}
