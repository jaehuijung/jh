package cms.gongju.common.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.firewall.DefaultHttpFirewall;
import org.springframework.security.web.firewall.HttpFirewall;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;


/*
1. 로그인 폼 제출: login.html에서 사용자가 아이디와 비밀번호를 입력 후 "/perform_login"로 POST 요청을 보냄
2. SecurityConfig 설정 확인: SecurityConfig 클래스의 filterChain 메서드에서 formLogin().loginProcessingUrl("/perform_login") 설정에 따라 스프링 시큐리티의 로그인 처리 필터가 "/perform_login" 요청을 가로챔
3. 인증 요청 처리:  로그인 요청이 들어오면 UsernamePasswordAuthenticationFilter가 실행되어 사용자 입력 값을 추출함
    3.1 UsernamePasswordAuthenticationFilter.attemptAuthentication 메서드가 실행됨
    3.2 아이디와 비밀번호를 포함한 UsernamePasswordAuthenticationToken 객체를 생성하여 AuthenticationManager에게 인증을 위임
    3.3 SecurityConfig에서 설정된 AuthenticationManager는 authenticationProvider()를 통해 CustomAuthenticationProvider를 사용하도록 설정됨
4. 사용자 정보 조회:
    4.1 CustomAuthenticationProvider의 authenticate 메서드가 실행됨
        4.1.1 CustomAuthenticationProvider.authenticate 메서드 내부에서 customUserDetailsService.loadUserByUsername(username)를 호출
    4.2 CustomUserDetailsService 클래스의 loadUserByUsername 메서드가 실행됨
        4.2.1 데이터베이스에서 사용자 정보를 조회하여 MemberDao 객체를 생성함
        4.2.2 설정된 사용자 권한을 포함한 CustomUser 객체를 반환함
5. 비밀번호 검증: CustomAuthenticationProvider의 authenticate 메서드에서 조회한 사용자 객체와 입력된 비밀번호를 비교함
    5.1 PasswordEncoder 인터페이스의 구현체인 BCryptPasswordEncoder를 사용하여 입력된 비밀번호를 암호화하고 DB에 저장된 암호화된 비밀번호와 비교함
    5.2 비밀번호가 일치하지 않으면 BadCredentialsException 예외를 발생시킴
6. 인증 토큰 생성: 비밀번호가 일치하면 UsernamePasswordAuthenticationToken을 생성함
    6.1 생성된 인증 토큰은 인증된 사용자 정보를 포함함
    6.2 생성된 Authentication 객체가 SecurityContextHolder에 저장되어 인증이 완료됨
7. 로그인 성공/실패 처리:
    7.1 인증 과정이 성공하면 SecurityConfig 클래스에서 정의된 defaultSuccessUrl("/rack/line/view", true)에 따라 "/rack/line/view"로 리다이렉트됨
    7.2 인증 과정이 실패하면 failureUrl("/login?error=true")에 따라 로그인 페이지로 이동되면서 실패 메시지가 표시됨
*/
@Slf4j
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    public CustomUserDetailsService customUserDetailsService;

    public SecurityConfig(CustomUserDetailsService customUserDetailsService){
        this.customUserDetailsService = customUserDetailsService;
    }

    /* BCrypt */
    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /*
     CSRF protection은 spring security에서 default로 설정
     requiresChannel().anyRequest().requiresSecure() 부분은 http를 https로 redirect 하게끔 강제 해준다.
     */
    @Bean
    public HttpFirewall defaultHttpFirewall() {
        return new DefaultHttpFirewall();
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf().disable()  // CSRF 보호 기능 비활성화
                .requiresChannel(channel -> channel.anyRequest().requiresSecure())  // 모든 요청을 HTTPS로 강제 전환
                // iframe 허용 설정 추가
                .headers(headers -> headers
                        .frameOptions().sameOrigin()  // 같은 출처의 iframe만 허용
                )
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/css/**", "/js/**", "/images/**", "/assets/**").permitAll()  // 정적 자원 허용
                        .requestMatchers("/setupDownload").permitAll()
                        .anyRequest().authenticated())
                .addFilterBefore(new SessionInvalidationFilter(), UsernamePasswordAuthenticationFilter.class)
                .formLogin(form -> form
                        .loginPage("/login")  // 사용자 정의 로그인 페이지 경로
                        .loginProcessingUrl("/perform_login")  // 로그인 폼 액션 URL
                        .successHandler(customAuthenticationSuccessHandler())
                        .failureHandler(customAuthenticationFailureHandler())
                        .permitAll())  // 로그인 페이지는 누구나 접근 가능
                .logout(logout -> logout
                        .logoutUrl("/logout")  // 로그아웃 URL
                        .logoutSuccessUrl("/login?logout=true")  // 로그아웃 성공 시 이동할 URL
                        .invalidateHttpSession(true)  // 로그아웃 시 세션 무효화
                        .deleteCookies("JSESSIONID")  // 로그아웃 시 쿠키 삭제
                        .permitAll())  // 로그아웃 URL은 누구나 접근 가능
                .build();
    }

    @Bean
    AuthenticationProvider authenticationProvider() {
        return new CustomAuthenticationProvider(customUserDetailsService);
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        return http.getSharedObject(AuthenticationManagerBuilder.class)
                .authenticationProvider(authenticationProvider())
                .build();
    }

    /**
     * 로그인 성공 시
     */
    @Bean
    public CustomAuthenticationSuccessHandler customAuthenticationSuccessHandler() {
        return new CustomAuthenticationSuccessHandler();
    }

    /**
     * 로그인 실패 시
     */
    @Bean
    public CustomAuthenticationFailureHandler customAuthenticationFailureHandler() {
        return new CustomAuthenticationFailureHandler();
    }

}