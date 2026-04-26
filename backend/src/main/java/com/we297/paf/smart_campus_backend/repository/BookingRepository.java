package com.we297.paf.smart_campus_backend.repository;

import com.we297.paf.smart_campus_backend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByRequestedByUserIdOrderByRequestedAtDesc(Long requestedByUserId);
    List<Booking> findByResourceIdAndBookingDate(Long resourceId, LocalDate bookingDate);
}