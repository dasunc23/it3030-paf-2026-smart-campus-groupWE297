package com.we297.paf.smart_campus_backend.controller;

import com.we297.paf.smart_campus_backend.entity.Comment;
import com.we297.paf.smart_campus_backend.service.CommentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/comments")
@CrossOrigin
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    public Comment createComment(@RequestBody Comment comment) {
        return commentService.createComment(comment);
    }

    @GetMapping("/ticket/{ticketId}")
    public List<Comment> getCommentsByTicketId(@PathVariable Long ticketId) {
        return commentService.getCommentsByTicketId(ticketId);
    }

    @DeleteMapping("/{id}")
    public void deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
    }
}
