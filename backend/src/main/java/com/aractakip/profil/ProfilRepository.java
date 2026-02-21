package com.aractakip.profil;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProfilRepository extends JpaRepository<Profil, UUID> {
}
