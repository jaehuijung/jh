package cms.gongju.report.mapper;

import org.apache.ibatis.annotations.Mapper;
import java.util.List;
import java.util.Map;

@Mapper
public interface ReportStatisticsMapper {

    List<Map<String,Object>> selectAgencyLine(Map<String,Object> param);

    List<Map<String,Object>> selectCableType(Map<String,Object> param);

    List<Map<String,Object>> selectWorkList(Map<String,Object> param);
}
