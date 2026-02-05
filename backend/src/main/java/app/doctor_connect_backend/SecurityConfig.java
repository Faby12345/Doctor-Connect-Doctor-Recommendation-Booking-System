package app.doctor_connect_backend;

import app.doctor_connect_backend.auth.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. Disable CSRF (Not needed for stateless JWT)
                .csrf(csrf -> csrf.disable())

                // 2. Enable CORS (Critical for React on port 5173)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 3. Stateless Session (Don't save user in server RAM)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. Define URL Rules
                .authorizeHttpRequests(auth -> auth
                        // Allow Pre-flight checks (React sends these before POST/PUT)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Public Endpoints
                        .requestMatchers("/api/auth/**").permitAll()  // Login, Register
                        .requestMatchers("/api/doctor/all", "/api/doctor/{id}").permitAll() // View Doctors
                        .requestMatchers("/error").permitAll() // <-- FIX: Allow Spring to show error messages

                        // Secured Endpoints (Everything else requires Login)
                        // We changed this from permitAll() to authenticated() for safety
                        .requestMatchers("/api/appointments/**").authenticated()
                        .requestMatchers("/api/review/**").authenticated() // Assuming reviews need login

                        // Catch-all
                        .anyRequest().authenticated()
                )

                // 5. Add your JWT Filter before the standard Spring login filter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // --- CORS CONFIGURATION (Crucial for React) ---
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow your frontend URL
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));

        // Allow standard HTTP methods
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Allow the Authorization header (where the Token lives)
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));

        // Allow credentials if you ever decide to use cookies again (optional but safe to keep)
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // Explicitly expose AuthenticationManager (Standard for Spring Security 6+)
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}