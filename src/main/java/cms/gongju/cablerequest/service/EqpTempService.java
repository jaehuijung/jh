package cms.gongju.cablerequest.service;

import cms.gongju.cablerequest.mapper.EqpTempMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EqpTempService {
    private final EqpTempMapper eqpTempMapper;

    public List<Map<String,Object>> searchEqpTemp(Map<String,Object> param){
        return eqpTempMapper.searchEqpTemp(param);
    }
}