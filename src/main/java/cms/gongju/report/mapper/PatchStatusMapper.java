package cms.gongju.report.mapper;

import org.apache.ibatis.annotations.Mapper;
import java.util.List;
import java.util.Map;

@Mapper
public interface PatchStatusMapper {

    List<Map<String,Object>> selectPatchStatusList(Map<String,Object> param);

}