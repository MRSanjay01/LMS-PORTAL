package com.aura.lms.controller;

import com.aura.lms.model.Announcement;
import com.aura.lms.repository.AnnouncementRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    private final AnnouncementRepository announcementRepository;

    public AnnouncementController(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    @GetMapping
    public ResponseEntity<List<Announcement>> getAnnouncements() {
        return ResponseEntity.ok(announcementRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Announcement> createAnnouncement(@RequestBody Announcement announcement) {
        Announcement savedAnn = announcementRepository.save(announcement);
        return ResponseEntity.ok(savedAnn);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable Long id) {
        if (announcementRepository.existsById(id)) {
            announcementRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
