package com.aractakip.yakit;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface YakitRepository extends JpaRepository<Yakit, UUID> {

    List<Yakit> findByAracIdOrderByTarihDesc(UUID aracId);

    List<Yakit> findAllByOrderByTarihDesc();

    /** Verilen UTTS numaralarından hangisi DB'de zaten var? */
    @Query("SELECT y.uttsNo FROM Yakit y WHERE y.uttsNo IN :uttsNos")
    Set<String> findExistingUttsNos(@Param("uttsNos") Collection<String> uttsNos);
}
