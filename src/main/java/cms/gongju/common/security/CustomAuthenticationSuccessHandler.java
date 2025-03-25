package cms.gongju.common.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.util.matcher.IpAddressMatcher;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Arrays;
import java.util.List;

@Component
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    public configService configService;

    @Override
    @SuppressWarnings("unchecked")
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {

        CustomUser customUser = (CustomUser) authentication.getPrincipal();

        List<String> allowedIps = Arrays.stream(customUser.getMember().getAllowedIps().split(","))
                .map(String::trim) // 불필요한 공백 제거
                .toList();

        // 접속 허용 아이피가 모든 아이피 허용일 때
        if (allowedIps.contains("*") || allowedIps.contains("*.*") || allowedIps.contains("0.0.0.0") || allowedIps.contains("0/0")) {
            handleAuthenticatedUser(customUser, response);
            return;
        }

        boolean hasInvalidIps = hasInvalidIps(allowedIps);

        // 접속 허용 아이피 중 잘못된 IP가 있을 경우
        if (hasInvalidIps) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write(
                    "{\"message\": \"접속하려는 계정의 접속 허용 IP가 잘못되었습니다. 관리자에게 문의하세요.\"}"
            );
            return;
        }

        String clientIp = getClientIp(request);

        boolean isIpAllowed = allowedIps.stream()
                .anyMatch(allowedIp -> new IpAddressMatcher(allowedIp).matches(clientIp));

        // 현재 접속한 아이피가 계정의 접속 허용 아이피와 다를 때
        if (!isIpAllowed) {
            new SecurityContextLogoutHandler().logout(request, response, authentication);

            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write(
                    "{\"message\": \"현재 접속하신 컴퓨터의 IP가 로그인하려는 계정의 접속 허용 설정된 IP와 다릅니다.\"}"
            );
            return;
        }

        handleAuthenticatedUser(customUser, response);
    }

    // 사용자 인증 성공 후 처리
    private void handleAuthenticatedUser(CustomUser customUser, HttpServletResponse response) throws IOException {
        String userId = customUser.getMember().getUserId();

        configService.updateUserLogin(userId);

        String firstPage = customUser.getMember().getFirstPage();
        String redirectUrl = configService.getFirstPageUrl(firstPage);

        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"redirectUrl\": \"" + redirectUrl + "\"}");
    }

    // 클라이언트 IP를 가져오는 메서드
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }

    public boolean hasInvalidIps(List<String> allowedIps) {
        return allowedIps.stream().anyMatch(ip -> {
            try {
                InetAddress.getByName(ip);
                return false;
            } catch (UnknownHostException e) {
                return !ip.matches("^\\d{1,3}(\\.\\d{1,3}){3}/\\d{1,2}$");
            }
        });
    }
}

