package com.aura.lms.model;

import jakarta.persistence.*;

@Entity
@Table(name = "announcements")
public class Announcement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "subject_code")
    private String subjectCode;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(name = "posted_by", nullable = false)
    private String postedBy;

    @Column(name = "posted_at", nullable = false)
    private String postedAt;

    // Constructors
    public Announcement() {}

    public Announcement(Long id, String subjectCode, String title, String body, String postedBy, String postedAt) {
        this.id = id;
        this.subjectCode = subjectCode;
        this.title = title;
        this.body = body;
        this.postedBy = postedBy;
        this.postedAt = postedAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public String getPostedBy() { return postedBy; }
    public void setPostedBy(String postedBy) { this.postedBy = postedBy; }

    public String getPostedAt() { return postedAt; }
    public void setPostedAt(String postedAt) { this.postedAt = postedAt; }

    // Builder
    public static AnnouncementBuilder builder() {
        return new AnnouncementBuilder();
    }

    public static class AnnouncementBuilder {
        private Long id;
        private String subjectCode;
        private String title;
        private String body;
        private String postedBy;
        private String postedAt;

        public AnnouncementBuilder id(Long id) { this.id = id; return this; }
        public AnnouncementBuilder subjectCode(String subjectCode) { this.subjectCode = subjectCode; return this; }
        public AnnouncementBuilder title(String title) { this.title = title; return this; }
        public AnnouncementBuilder body(String body) { this.body = body; return this; }
        public AnnouncementBuilder postedBy(String postedBy) { this.postedBy = postedBy; return this; }
        public AnnouncementBuilder postedAt(String postedAt) { this.postedAt = postedAt; return this; }

        public Announcement build() {
            return new Announcement(id, subjectCode, title, body, postedBy, postedAt);
        }
    }
}
