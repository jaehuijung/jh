package cms.gongju.common.security;

import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class CustomAuthenticationProvider implements AuthenticationProvider {

    public CustomUserDetailsService customUserDetailsService;
    public PasswordEncoder passwordEncoder;

    public CustomAuthenticationProvider(CustomUserDetailsService customUserDetailsService) {
        this.customUserDetailsService = customUserDetailsService;
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String username = authentication.getName();
        String password = authentication.getCredentials().toString();

        CustomUser customUser = (CustomUser) customUserDetailsService.loadUserByUsername(username);
        if(customUser == null) {
            throw new BadCredentialsException(username);
        }

        MemberDao member = customUser.getMember();

        if(!passwordEncoder.matches(password, member.getUserPwd())) {
            throw new BadCredentialsException(username);
        }

        return new UsernamePasswordAuthenticationToken(
                customUser,
                customUser.getPassword(),
                member.getAuthList().stream()
                        .flatMap(auth -> auth.keySet().stream()) // Map의 key set을 스트림으로 펼침
                        .map(SimpleGrantedAuthority::new) // key를 SimpleGrantedAuthority 생성자로 사용
                        .collect(Collectors.toList())
        );
    }


    @Override
    public boolean supports(Class<?> authentication){
        return authentication.equals(UsernamePasswordAuthenticationToken.class);
    }
}
