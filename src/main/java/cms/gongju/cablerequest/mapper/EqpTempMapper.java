package cms.gongju.cablerequest.mapper;

import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface EqpTempMapper {
    List<Map<String,Object>> searchEqpTemp(Map<String,Object> param);
}