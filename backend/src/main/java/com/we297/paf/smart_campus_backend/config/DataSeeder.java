package com.we297.paf.smart_campus_backend.config;

import com.we297.paf.smart_campus_backend.entity.Booking;
import com.we297.paf.smart_campus_backend.entity.Ticket;
import com.we297.paf.smart_campus_backend.entity.User;
import com.we297.paf.smart_campus_backend.entity.enums.BookingStatus;
import com.we297.paf.smart_campus_backend.entity.enums.Role;
import com.we297.paf.smart_campus_backend.entity.enums.TicketStatus;
import com.we297.paf.smart_campus_backend.repository.BookingRepository;
import com.we297.paf.smart_campus_backend.repository.TicketRepository;
import com.we297.paf.smart_campus_backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            TicketRepository ticketRepository,
            BookingRepository bookingRepository) {

        return args -> {

            // ─── USERS ──────────────────────────────────────────────────────────
            User admin = null;
            if (userRepository.findByEmail("admin@gmail.com").isEmpty()) {
                admin = new User("System Admin", "admin@gmail.com",
                        passwordEncoder.encode("Admin#123"), Role.ROLE_ADMIN);
                userRepository.save(admin);
                System.out.println("✅ Admin created: admin@gmail.com / Admin#123");
            } else {
                admin = userRepository.findByEmail("admin@gmail.com").get();
            }

            User student = null;
            if (userRepository.findByEmail("nethmi@gmail.com").isEmpty()) {
                student = new User("Nethmi Perera", "nethmi@gmail.com",
                        passwordEncoder.encode("Nethmi#123"), Role.ROLE_USER);
                userRepository.save(student);
                System.out.println("✅ Student created: nethmi@gmail.com / Nethmi#123");
            } else {
                student = userRepository.findByEmail("nethmi@gmail.com").get();
            }

            User technician = null;
            if (userRepository.findByEmail("tech@smartcampus.com").isEmpty()) {
                technician = new User("Kamal Silva", "tech@smartcampus.com",
                        passwordEncoder.encode("tech123"), Role.ROLE_TECHNICIAN);
                userRepository.save(technician);
                System.out.println("✅ Technician created: tech@smartcampus.com / tech123");
            } else {
                technician = userRepository.findByEmail("tech@smartcampus.com").get();
            }

            // ─── TICKETS ─────────────────────────────────────────────────────────
            if (ticketRepository.count() == 0) {
                Long studentId = student.getId();
                Long adminId = admin.getId();
                Long techId = technician.getId();

                // Ticket 1 - Open
                Ticket t1 = new Ticket();
                t1.setTitle("AC Unit Not Working in Lab A204");
                t1.setDescription("The air conditioning unit in Lab A204 has completely stopped working. Room temperature is extremely high and affecting students during practical sessions. Multiple complaints received from students.");
                t1.setCategory("ELECTRICAL");
                t1.setPriority("HIGH");
                t1.setStatus(TicketStatus.OPEN);
                t1.setCreatedByUserId(studentId);
                t1.setPreferredContact("nethmi@gmail.com");
                ticketRepository.save(t1);

                // Ticket 2 - In Progress, assigned to technician
                Ticket t2 = new Ticket();
                t2.setTitle("Projector Lamp Burned Out – Lecture Hall B101");
                t2.setDescription("The projector in Lecture Hall B101 shows a 'Lamp Error' message and will not display any image. This is affecting all lectures scheduled in this hall. Replacement lamp is required urgently.");
                t2.setCategory("IT_EQUIPMENT");
                t2.setPriority("HIGH");
                t2.setStatus(TicketStatus.IN_PROGRESS);
                t2.setCreatedByUserId(studentId);
                t2.setAssignedToUserId(techId);
                t2.setPreferredContact("nethmi@gmail.com");
                ticketRepository.save(t2);

                // Ticket 3 - Resolved
                Ticket t3 = new Ticket();
                t3.setTitle("Water Leakage Near Men's Restroom – Floor 3");
                t3.setDescription("There is a significant water leakage near the men's restroom on the 3rd floor of the main building. Water is pooling in the corridor, creating a slip hazard for students and staff.");
                t3.setCategory("PLUMBING");
                t3.setPriority("CRITICAL");
                t3.setStatus(TicketStatus.RESOLVED);
                t3.setCreatedByUserId(studentId);
                t3.setAssignedToUserId(techId);
                t3.setResolutionNotes("Pipe joint was repaired and sealed. Area has been cleaned and dried. No further leakage detected as of inspection.");
                t3.setPreferredContact("nethmi@gmail.com");
                ticketRepository.save(t3);

                // Ticket 4 - Open, Medium priority
                Ticket t4 = new Ticket();
                t4.setTitle("Broken Chair in Computer Lab C305");
                t4.setDescription("One of the chairs in Computer Lab C305 has a broken backrest and is a safety hazard. Please arrange for repair or replacement as soon as possible.");
                t4.setCategory("FURNITURE");
                t4.setPriority("MEDIUM");
                t4.setStatus(TicketStatus.OPEN);
                t4.setCreatedByUserId(studentId);
                t4.setPreferredContact("nethmi@gmail.com");
                ticketRepository.save(t4);

                // Ticket 5 - Closed
                Ticket t5 = new Ticket();
                t5.setTitle("WiFi Connectivity Issues – Library 2nd Floor");
                t5.setDescription("Students on the 2nd floor of the library are experiencing intermittent WiFi dropouts. Connection drops every 10-15 minutes and requires reconnection. Issue has been ongoing for 3 days.");
                t5.setCategory("IT_EQUIPMENT");
                t5.setPriority("MEDIUM");
                t5.setStatus(TicketStatus.CLOSED);
                t5.setCreatedByUserId(studentId);
                t5.setAssignedToUserId(techId);
                t5.setResolutionNotes("Access point on 2nd floor was reconfigured and firmware updated. WiFi connectivity has been stable for 48 hours. Ticket closed.");
                t5.setPreferredContact("nethmi@gmail.com");
                ticketRepository.save(t5);

                // Ticket 6 - Open, Low priority
                Ticket t6 = new Ticket();
                t6.setTitle("Notice Board Lighting Flickering – Main Corridor");
                t6.setDescription("The fluorescent light above the main notice board in the ground floor corridor is flickering constantly. It is distracting and may indicate a faulty ballast or starter.");
                t6.setCategory("ELECTRICAL");
                t6.setPriority("LOW");
                t6.setStatus(TicketStatus.OPEN);
                t6.setCreatedByUserId(adminId);
                t6.setPreferredContact("admin@gmail.com");
                ticketRepository.save(t6);

                System.out.println("✅ 6 dummy tickets created successfully!");
            }

            // ─── BOOKINGS ────────────────────────────────────────────────────────
            if (bookingRepository.count() == 0) {
                Long studentId = student.getId();
                Long adminId = admin.getId();
                LocalDateTime now = LocalDateTime.now();

                // Booking 1 - Approved
                Booking b1 = new Booking();
                b1.setResourceId(1L);
                b1.setBookingDate(LocalDate.now().plusDays(2));
                b1.setStartTime(LocalTime.of(9, 0));
                b1.setEndTime(LocalTime.of(11, 0));
                b1.setPurpose("Final Year Project Group Presentation Practice");
                b1.setExpectedAttendees(8);
                b1.setStatus(BookingStatus.APPROVED);
                b1.setRequestedByUserId(studentId);
                b1.setRequestedByEmail("nethmi@gmail.com");
                b1.setRequestedAt(now.minusDays(3));
                b1.setReviewedBy("admin@gmail.com");
                b1.setReviewedAt(now.minusDays(2));
                bookingRepository.save(b1);

                // Booking 2 - Pending
                Booking b2 = new Booking();
                b2.setResourceId(2L);
                b2.setBookingDate(LocalDate.now().plusDays(5));
                b2.setStartTime(LocalTime.of(14, 0));
                b2.setEndTime(LocalTime.of(16, 0));
                b2.setPurpose("IT3030 PAF Module Assignment Demo Session");
                b2.setExpectedAttendees(15);
                b2.setStatus(BookingStatus.PENDING);
                b2.setRequestedByUserId(studentId);
                b2.setRequestedByEmail("nethmi@gmail.com");
                b2.setRequestedAt(now.minusDays(1));
                bookingRepository.save(b2);

                // Booking 3 - Pending
                Booking b3 = new Booking();
                b3.setResourceId(1L);
                b3.setBookingDate(LocalDate.now().plusDays(7));
                b3.setStartTime(LocalTime.of(10, 0));
                b3.setEndTime(LocalTime.of(12, 0));
                b3.setPurpose("Student Research Society Monthly Meeting");
                b3.setExpectedAttendees(20);
                b3.setStatus(BookingStatus.PENDING);
                b3.setRequestedByUserId(adminId);
                b3.setRequestedByEmail("admin@gmail.com");
                b3.setRequestedAt(now.minusHours(5));
                bookingRepository.save(b3);

                // Booking 4 - Rejected
                Booking b4 = new Booking();
                b4.setResourceId(3L);
                b4.setBookingDate(LocalDate.now().minusDays(2));
                b4.setStartTime(LocalTime.of(8, 0));
                b4.setEndTime(LocalTime.of(10, 0));
                b4.setPurpose("Dance Rehearsal for Annual Concert");
                b4.setExpectedAttendees(30);
                b4.setStatus(BookingStatus.REJECTED);
                b4.setRequestedByUserId(studentId);
                b4.setRequestedByEmail("nethmi@gmail.com");
                b4.setRequestedAt(now.minusDays(5));
                b4.setReviewedBy("admin@gmail.com");
                b4.setReviewedAt(now.minusDays(4));
                b4.setReviewReason("Venue is under maintenance on the requested date. Please rebook for a later date.");
                bookingRepository.save(b4);

                // Booking 5 - Approved
                Booking b5 = new Booking();
                b5.setResourceId(2L);
                b5.setBookingDate(LocalDate.now().plusDays(1));
                b5.setStartTime(LocalTime.of(13, 0));
                b5.setEndTime(LocalTime.of(15, 0));
                b5.setPurpose("Guest Lecture: Cloud Computing Trends 2026");
                b5.setExpectedAttendees(50);
                b5.setStatus(BookingStatus.APPROVED);
                b5.setRequestedByUserId(adminId);
                b5.setRequestedByEmail("admin@gmail.com");
                b5.setRequestedAt(now.minusDays(4));
                b5.setReviewedBy("admin@gmail.com");
                b5.setReviewedAt(now.minusDays(3));
                bookingRepository.save(b5);

                System.out.println("✅ 5 dummy bookings created successfully!");
            }
        };
    }
}
