package com.we297.paf.smart_campus_backend.repository;

import com.we297.paf.smart_campus_backend.entity.DamageClaim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DamageClaimRepository extends JpaRepository<DamageClaim, Long> {
    Optional<DamageClaim> findByTicketId(String ticketId);
}