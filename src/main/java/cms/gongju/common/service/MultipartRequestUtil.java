package cms.gongju.common.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

@Slf4j
@Service
public class MultipartRequestUtil {
    public Map<String, Object> convert(HttpServletRequest request){
        Map<String, Object> map = new HashMap<>();
        try{
            Map<String, String[]> parameterMap = request.getParameterMap();
            Iterator<String> iterator = parameterMap.keySet().iterator();
            String key;
            String[] value;
            while(iterator.hasNext()){
                key = (String) iterator.next();
                value = (String[]) parameterMap.get(key);

                if(value.length > 1) {
                    String[] val = new String[value.length];
                    for(int i = 0; i < value.length; i++){
                        String v = value[i];
                        if((value == null) || (value[i].equals("")) || (value[i].equals("null"))){
                            val[i] = "";
                        }
                        val[i] = v;
                    }
                    map.put(key, val);
                }
                else {
                    String v = value[0];
                    if((value == null) || (value[0].equals("")) || (value[0].equals("null"))){
                        v = "";
                    }
                    map.put(key, v);
                }
            }
        }
        catch (Exception e){
            log.error(e.getMessage());
        }

        return map;
    }
}
