package com.we297.paf.smart_campus_backend.service;

import com.we297.paf.smart_campus_backend.entity.Comment;
import com.we297.paf.smart_campus_backend.repository.CommentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;

    public CommentService(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    public Comment createComment(Comment comment) {
        return commentRepository.save(comment);
    }

    public List<Comment> getCommentsByTicketId(Long ticketId) {
        return commentRepository.findByTicketId(ticketId);
    }

    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }
}
