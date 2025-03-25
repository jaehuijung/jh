package cms.gongju.common.security;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;
import java.util.stream.Collectors;

@Getter
public class CustomUser extends User {
    private MemberDao member;

    public CustomUser(String username, String password, Collection<? extends GrantedAuthority> authorities){
        super(username, password, authorities);
    }

    public CustomUser(MemberDao member){
        super(member.getUserId(),
                member.getUserPwd(),
                member.getAuthList().stream()
                        .flatMap(auth -> auth.keySet().stream()) // Map의 key set을 스트림으로 펼침
                        .map(SimpleGrantedAuthority::new) // key를 SimpleGrantedAuthority 생성자로 사용
                        .collect(Collectors.toList())
        );

        this.member = member;
    }

}
