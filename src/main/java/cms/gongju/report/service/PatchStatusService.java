package cms.gongju.report.service;

import cms.gongju.report.mapper.PatchStatusMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PatchStatusService {

    private final PatchStatusMapper patchStatusMapper;

    public List<Map<String,Object>> getPatchStatusList(Map<String,Object> param){
        // 실제 DB 쿼리 시 Mapper 호출
        // 여기서는 param을 그대로 전달
        return patchStatusMapper.selectPatchStatusList(param);
    }
}
