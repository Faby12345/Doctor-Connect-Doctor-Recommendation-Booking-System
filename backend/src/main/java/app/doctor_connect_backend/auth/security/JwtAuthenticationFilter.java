package app.doctor_connect_backend.auth.security;

import app.doctor_connect_backend.user.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String jwt = getJwtFromRequest(request);

            if (jwt != null) {
                // LOG 1: We found a token
                logger.debug("Token found in request. Validating...");

                if (jwtUtil.validateToken(jwt)) {
                    UUID userId = jwtUtil.getUserIdFromToken(jwt);
                    String email = jwtUtil.getEmailFromToken(jwt);
                    String rawRole = jwtUtil.getRoleFromToken(jwt); // e.g., "DOCTOR"

                    // 1. For Spring Security (Needs "ROLE_" prefix to work nicely)
                    String formattedRole = rawRole.startsWith("ROLE_") ? rawRole : "ROLE_" + rawRole;
                    var authorities = List.of(new SimpleGrantedAuthority(formattedRole));

                    var principalUser = new UserPrincipal(
                            userId,
                            email,
                            rawRole,
                            authorities
                    );

                    var authentication = new UsernamePasswordAuthenticationToken(
                            principalUser,
                            null,
                            authorities
                    );

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }else {
                    logger.warn("Token validation returned FALSE. Check Secret Key or Expiration.");
                }
            } else {
                logger.trace("No Bearer token found in request headers.");
            }
        } catch (Exception ex) {
            // LOG 4: The Crash Site
            logger.error("CRITICAL: Authentication crashed inside the filter!", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        // Check Cookies (Optional backup)
        if (request.getCookies() != null) {
            for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
                if ("jwt".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}