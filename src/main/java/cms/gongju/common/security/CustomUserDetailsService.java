package cms.gongju.common.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class CustomUserDetailsService implements UserDetailsService {

    public configService configService;

    public  CustomUserDetailsService(configService configService){
        this.configService = configService;
    }

    @Override
    public UserDetails loadUserByUsername(String id) throws UsernameNotFoundException {

        MemberDao member = configService.getSecurityUserInfoList(id);

        String groupId = member.getGroupId();
        if(groupId != null && !groupId.isEmpty()){
            member.setAuthList(getAuthList(groupId));
        }

        return member == null ? null : new CustomUser(member);
    }

    public List<Map<String,String>> getAuthList(String groupId) {
        List<Map<String, String>> getUserAuthList  = new ArrayList<>();

        Map<String, Object> authMap = new HashMap<>();
        authMap.put("groupId", groupId);

        List<Map<String, Object>> authList = configService.getSecurityUserAuthList(authMap);

        for(Map<String, Object> auth : authList){
            String read = auth.get("R").toString();
            String update = auth.get("U").toString();
            String menuAuth = auth.get("MENU_AUTH").toString();
            String menuRole = auth.get("MENU_ROLE").toString();

            getUserAuthList.addAll(setMenuAuth(read, update, menuRole, menuAuth));
        }

        return getUserAuthList;
    }

    public List<Map<String,String>> setMenuAuth(String r, String u, String role, String auth) {
        List<Map<String, String>> authList = new ArrayList<>();
        Map<String, String> authMap = new HashMap<>();

        if("Y".equals(r)){
            authMap.put("ROLE_" + auth + "_R", role + "/R/**");  // 권한
            authList.add(authMap);
        }

        if("Y".equals(u)){
            authMap.put("ROLE_" + auth + "_U", role + "/U/**");  // 권한
            authList.add(authMap);
        }

        return authList;
    }

}
