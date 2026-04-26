package com.we297.paf.smart_campus_backend.repository;

import com.we297.paf.smart_campus_backend.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTicketId(Long ticketId);
}
