package cms.gongju.common.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SessionInvalidationFilter extends OncePerRequestFilter {

    private static final String TARGET_URL = "https://127.0.0.1/";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        HttpSession session = request.getSession(false);

        // 현재 URL 확인
        String currentUrl = request.getRequestURL().toString();

        // URL이 기본 URL(TARGET_URL)과 일치하면 세션 무효화
        if (currentUrl.equals(TARGET_URL) && session != null) {
            response.sendRedirect("/login?sessionExpired=true"); // 로그아웃된 상태로 로그인 페이지로 리다이렉트
            return; // 이후 필터 체인 실행을 중지
        }

        // 다음 필터 실행
        filterChain.doFilter(request, response);
    }
}
