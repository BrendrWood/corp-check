package com.corpcheck.check.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.RememberMeServices;
import org.springframework.security.web.authentication.rememberme.TokenBasedRememberMeServices;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final String REMEMBER_ME_KEY = "corp-check-secret-key-2026";
    private static final int REMEMBER_ME_VALIDITY_SECONDS = 365 * 24 * 60 * 60;

    @Value("${user.kholmikangas.password:kMsfGe}")
    private String kholmikangasPassword;

    @Value("${user.bystryukov.password:ZSWRUN}")
    private String bystryukovPassword;

    @Value("${user.tebin.password:UqdnEL}")
    private String tebinPassword;

    @Value("${user.guest.password:pUGmjU}")
    private String guestPassword;

    @Value("${user.balakin.password:XznwwG}")
    private String balakinPassword;

    @Bean
    public UserDetailsService userDetailsService() {
        return new InMemoryUserDetailsManager(
                createUser("kholmikangas", kholmikangasPassword, "ENGINEER"),
                createUser("bystryukov", bystryukovPassword, "ENGINEER"),
                createUser("tebin", tebinPassword, "ENGINEER"),
                createUser("guest", guestPassword, "ENGINEER"),
                createUser("balakin", balakinPassword, "BOSS")
        );
    }

    private UserDetails createUser(String username, String password, String role) {
        return User.builder()
                .username(username)
                .password(passwordEncoder().encode(password))
                .roles(role)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public RememberMeServices rememberMeServices(UserDetailsService userDetailsService) {
        TokenBasedRememberMeServices rememberMeServices =
                new TokenBasedRememberMeServices(REMEMBER_ME_KEY, userDetailsService);
        rememberMeServices.setTokenValiditySeconds(REMEMBER_ME_VALIDITY_SECONDS);
        rememberMeServices.setAlwaysRemember(true);
        return rememberMeServices;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(auth -> auth
                        // Публичные ресурсы - используем AntPathRequestMatcher для явного указания
                        .requestMatchers(new AntPathRequestMatcher("/")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/login")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/css/**")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/js/**")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/images/**")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/h2-console/**")).permitAll()

                        // WebSocket эндпоинты
                        .requestMatchers(new AntPathRequestMatcher("/ws/**")).authenticated()
                        .requestMatchers(new AntPathRequestMatcher("/ws-direct/**")).authenticated()

                        // API требует аутентификации
                        .requestMatchers(new AntPathRequestMatcher("/api/**")).authenticated()

                        // Все остальное требует аутентификации
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        .loginPage("/")
                        .loginProcessingUrl("/login")
                        .defaultSuccessUrl("/corporate", true)
                        .failureUrl("/?error=true")
                        .permitAll()
                )
                .rememberMe(remember -> remember
                        .rememberMeServices(rememberMeServices(userDetailsService()))
                        .key(REMEMBER_ME_KEY)
                        .rememberMeParameter("remember-me")
                )
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/?logout=true")
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID", "remember-me")
                        .permitAll()
                )
                .csrf(csrf -> csrf
                        .ignoringRequestMatchers(
                                new AntPathRequestMatcher("/h2-console/**"),
                                new AntPathRequestMatcher("/ws/**"),
                                new AntPathRequestMatcher("/ws-direct/**"),
                                new AntPathRequestMatcher("/api/**")
                        )
                )
                .headers(headers -> headers
                        .frameOptions(frame -> frame.sameOrigin())
                );

        return http.build();
    }
}