package cms.gongju.report.service;

import cms.gongju.report.mapper.ReportStatisticsMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportStatisticsService {

    private final ReportStatisticsMapper reportStatisticsMapper;

    /**
     * 1) 기관회선 현황
     */
    public List<Map<String,Object>> getAgencyLine(Map<String,Object> param){
        // param 에서 orgName, dataCenter 등 검색조건을 꺼내 필요시 mapper에 전달
        return reportStatisticsMapper.selectAgencyLine(param);
    }

    /**
     * 2) 케이블 타입별 현황
     */
    public List<Map<String,Object>> getCableType(Map<String,Object> param){
        return reportStatisticsMapper.selectCableType(param);
    }

    /**
     * 3) 작업리스트
     */
    public List<Map<String,Object>> getWorkList(Map<String,Object> param){
        return reportStatisticsMapper.selectWorkList(param);
    }
}
