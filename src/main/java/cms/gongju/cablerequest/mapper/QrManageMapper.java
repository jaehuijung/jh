package cms.gongju.cablerequest.mapper;

import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface QrManageMapper {

    /**
     * QR 코드로 케이블(포설) 정보 조회
     * - qrCode를 기반으로 tb_cable_install + (eqp_temp join) + etc.를 JOIN하여
     *   START/END 자산ID, 구성ID, 포트, 업무명, 타입, 색상, 길이, 비고 등을 추출
     */
    List<Map<String,Object>> selectCableByQrCode(Map<String,Object> param);

}
