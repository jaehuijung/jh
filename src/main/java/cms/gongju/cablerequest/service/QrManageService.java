package cms.gongju.cablerequest.service;

import cms.gongju.cablerequest.mapper.QrManageMapper;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Map;

@Service
public class QrManageService {

    @Autowired
    private QrManageMapper qrManageMapper;

    /**
     * QR 스캔으로 케이블(포설) 목록 조회
     * - qrCode 로 DB 조회
     */
    public List<Map<String,Object>> getCableListByQr(Map<String,Object> param) {
        if (param.get("data") != null && !param.get("data").toString().isEmpty()) {
            param.putAll((Map<String, Object>) param.get("data"));
        }
        return qrManageMapper.selectCableByQrCode(param);
    }

}
