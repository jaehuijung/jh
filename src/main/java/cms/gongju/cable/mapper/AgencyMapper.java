package cms.gongju.cable.mapper;

import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface AgencyMapper {

    // 1) requestId -> tb_cable_work_detail (multiple)
    List<Map<String,Object>> selectWorkDetailList(Long requestId);

    // 2) insert cable_install
    int insertCableInstall(Map<String,Object> param);

    // 3) QR Label 일련번호 취득
    int generateLabelId();
    String generateCableManageId(Map<String, Object> paramMap);
    
    // 4) QR Label 정보 저장
    void saveLabelInfo(Map<String, Object> paramMap);

    /**
     * tb_cable_install 과 tb_cable_work_detail를 JOIN하여
     * tb_cable_install.is_deleted='Y' 로 업데이트
     * - WHERE request_id in (...)
     */
    int updateCableRemove(Map<String,Object> param);

    // 설치(선번장) 목록
    List<Map<String,Object>> selectInstallList(Map<String,Object> paramMap);

    // 설치(선번장) 목록 개수
    int selectInstallCount(Map<String, Object> paramMap);

    // 선택된 설치(선번장) 제거
    void deleteCableInfo(Map<String, Object> paramMap);

    // 선택된 설치(선번장) 정보
    Map<String, Object> selectInstallPopupList(Map<String, Object> paramMap);

    // 선택된 설치(선번장)의 패치 정보
    List<Map<String, Object>> selectInstallPatchPopupList(Map<String, Object> paramMap);

    // 선택된 설치(선번장) 정보 저장
    void saveCableInfo(Map<String, Object> paramMap);

    // 선택된 설치(선번장) 구성 정보 저장
    // 2025.02.14. tb_eqp_temp에 저장하는거 아닌듯? 안쓸것같으니 일단 물어보기
    void saveCableConfigInfo(Map<String, Object> paramMap);

    // 선택된 설치(선번장) 패치정보 저장
    void saveCablePatchInfo(Map<String, Object> paramMap);

    // 선택된 설치(선번장)의 자산정보
    List<Map<String, Object>> selectCableInfoAssetList(Map<String, Object> paramMap);

    // 라벨출력 팝업에서 사용할 라벨 데이터 생성
    List<Map<String, Object>> getLabelList(Map<String, Object> paramMap);

    // 기관회선관리 > 이력조회 목록
    List<Map<String, Object>> getHistoryList(Map<String, Object> paramMap);
    // 기관회선관리 > 이력조회 목록 개수
    int getHistoryListCount(Map<String, Object> paramMap);

    // 기관회선 케이블 엑셀 다운로드 목록
    List<Map<String, Object>> getExcelCableInfoTotalList(Map<String, Object> paramMap);
}