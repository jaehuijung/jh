package cms.gongju.cablerequest.service;

import cms.gongju.cablerequest.mapper.WorkerMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class WorkerService {

    private final WorkerMapper workerMapper;

    /**
     * 전체 작업자 목록 (Map 형태)
     */
    public List<Map<String,Object>> selectAllWorkers() {
        return workerMapper.selectAll();
    }

    public List<Map<String,Object>> searchWorkers(Map<String,Object> param){
        return workerMapper.search(param);
    }

    /**
     * 작업자 목록 조회 (검색)
     */
    public List<Map<String,Object>> selectWorkerList(Map<String,Object> param) {
        return workerMapper.selectWorkerList(param);
    }

    /**
     * 신규 작업자 등록
     */
    public Map<String,Object> insertWorker(Map<String,Object> param) {
        Map<String,Object> result = new HashMap<>();
        int cnt = workerMapper.insertWorker(param);
        if(cnt>0) {
            result.put("result","SUCCESS");
        } else {
            result.put("result","FAIL");
        }
        return result;
    }

    // ========== [신규] 특정 REQUEST_ID에 대한 작업자 목록 ==========
    public List<Map<String,Object>> selectWorkersByRequestId(Long requestId) {
        return workerMapper.selectWorkersByRequestId(requestId);
    }

    /**
     * [신규] 선택된 작업자(DB) 삭제
     */
    public Map<String,Object> deleteWorkers(List<Long> workerIds) {
        Map<String,Object> result = new HashMap<>();
        int cnt = workerMapper.deleteWorkers(workerIds);
        if(cnt > 0) {
            result.put("result", "SUCCESS");
        } else {
            result.put("result", "FAIL");
        }
        return result;
    }
}
