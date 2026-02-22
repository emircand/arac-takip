package com.aractakip.auth;

import com.aractakip.auth.dto.LoginRequest;
import com.aractakip.auth.dto.LoginResponse;
import com.aractakip.profil.Profil;
import com.aractakip.profil.ProfilRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final JwtUtil jwtUtil;
    private final ProfilRepository profilRepository;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest req) {
        Profil profil = profilRepository.findByEmail(req.email())
                .orElseThrow(() -> new IllegalArgumentException("E-posta veya şifre hatalı."));

        if (!passwordEncoder.matches(req.password(), profil.getSifreHash())) {
            throw new IllegalArgumentException("E-posta veya şifre hatalı.");
        }

        String token = jwtUtil.generate(profil.getId(), profil.getRol(), profil.getAdSoyad());
        return new LoginResponse(token, profil.getRol(), profil.getAdSoyad());
    }
}
