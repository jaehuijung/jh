package cms.gongju.cablerequest.controller;

import cms.gongju.cablerequest.service.EqpTempService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/eqp")
@RequiredArgsConstructor
public class EqpTempController {

    private final EqpTempService eqpTempService;

    /**
     * tb_eqp_temp 검색
     * param = { "assetId":"...", "configId":"...", "eqpName":"..." }
     */
    @PostMapping("/searchTemp")
    public List<Map<String,Object>> searchTemp(@RequestBody Map<String,Object> param) {
        // DB에서 LIKE 검색
        return eqpTempService.searchEqpTemp(param);
    }
}