package com.aractakip.auth;

import com.aractakip.auth.dto.LoginRequest;
import com.aractakip.auth.dto.LoginResponse;
import com.aractakip.profil.Profil;
import com.aractakip.profil.ProfilRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final JwtUtil jwtUtil;
    private final ProfilRepository profilRepository;

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.anon-key}")
    private String supabaseAnonKey;

    @SuppressWarnings("unchecked")
    public LoginResponse login(LoginRequest req) {
        // Supabase Auth ile kimlik doğrulama
        RestClient restClient = RestClient.create();
        Map<String, Object> supabaseResponse;
        try {
            supabaseResponse = restClient.post()
                    .uri(supabaseUrl + "/auth/v1/token?grant_type=password")
                    .header("apikey", supabaseAnonKey)
                    .header("Content-Type", "application/json")
                    .body(Map.of("email", req.email(), "password", req.password()))
                    .retrieve()
                    .body(Map.class);
        } catch (HttpClientErrorException e) {
            throw new IllegalArgumentException("E-posta veya şifre hatalı.");
        }

        if (supabaseResponse == null) {
            throw new IllegalArgumentException("Giriş başarısız.");
        }

        Map<String, Object> user = (Map<String, Object>) supabaseResponse.get("user");
        String userId = (String) user.get("id");

        Profil profil = profilRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new IllegalArgumentException("Profil bulunamadı."));

        String token = jwtUtil.generate(profil.getId(), profil.getRol(), profil.getAdSoyad());
        return new LoginResponse(token, profil.getRol(), profil.getAdSoyad());
    }
}
