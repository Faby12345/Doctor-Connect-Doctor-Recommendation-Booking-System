package app.doctor_connect_backend.auth.security;

import app.doctor_connect_backend.user.Roles;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;
import java.util.UUID;

/**
* Authorities are the actuual user roles for spring annotations !! */
public record UserPrincipal (UUID id,
                             String email,
                             String role,
                             Collection<? extends GrantedAuthority> authorities){ }
