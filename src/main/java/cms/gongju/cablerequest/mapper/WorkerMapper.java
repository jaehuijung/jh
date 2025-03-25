package cms.gongju.cablerequest.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface WorkerMapper {

    /**
     * 전체 작업자 목록
     * - Map 형태로 resultType="map"
     */
    List<Map<String, Object>> selectAll();

    List<Map<String,Object>> search(Map<String,Object> param);

    List<Map<String,Object>> selectWorkerList(Map<String,Object> param);

    int insertWorker(Map<String,Object> param);

    // ========== [신규] 특정 REQUEST_ID 에 대한 작업자 목록 (JOIN) ==========
    /**
     * tb_request_worker rw
     * JOIN tb_worker w
     * WHERE rw.REQUEST_ID = #{requestId}
     */
    List<Map<String,Object>> selectWorkersByRequestId(@Param("requestId") Long requestId);

    int deleteWorkers(@Param("workerIds") List<Long> workerIds);
}
