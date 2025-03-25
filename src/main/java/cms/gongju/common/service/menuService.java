package cms.gongju.common.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class menuService {

    private final menuMapper menuMapper;

    public menuService(menuMapper menuMapper){
        this.menuMapper = menuMapper;
    }

    public Map<String ,Object> getMenuList(String groupId){
        Map<String,Object> returnMap = new HashMap<>();
        returnMap.put("errorCode", false);

        try{
            returnMap.put("menuList", menuMapper.getMenuList(groupId));
            returnMap.put("errorCode", true);
        }catch (Exception e){
            log.error(e.getMessage());
        }

        return returnMap;
    }

}
