package com.aura.lms.model;

import jakarta.persistence.*;

@Entity
@Table(name = "submissions")
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "assignment_id", nullable = false)
    private Long assignmentId;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(name = "student_roll", nullable = false)
    private String studentRoll;

    @Column(name = "subject_code", nullable = false)
    private String subjectCode;

    @Column(name = "file_url", nullable = false, length = 500)
    private String fileUrl;

    @Column(name = "submitted_at", nullable = false)
    private String submittedAt;

    private Integer marks;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    private Boolean graded = false;

    // Constructors
    public Submission() {}

    public Submission(Long id, Long assignmentId, String studentName, String studentRoll, String subjectCode, String fileUrl, String submittedAt, Integer marks, String feedback, Boolean graded) {
        this.id = id;
        this.assignmentId = assignmentId;
        this.studentName = studentName;
        this.studentRoll = studentRoll;
        this.subjectCode = subjectCode;
        this.fileUrl = fileUrl;
        this.submittedAt = submittedAt;
        this.marks = marks;
        this.feedback = feedback;
        this.graded = graded;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getAssignmentId() { return assignmentId; }
    public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentRoll() { return studentRoll; }
    public void setStudentRoll(String studentRoll) { this.studentRoll = studentRoll; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(String submittedAt) { this.submittedAt = submittedAt; }

    public Integer getMarks() { return marks; }
    public void setMarks(Integer marks) { this.marks = marks; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public Boolean getGraded() { return graded; }
    public void setGraded(Boolean graded) { this.graded = graded; }

    // Builder
    public static SubmissionBuilder builder() {
        return new SubmissionBuilder();
    }

    public static class SubmissionBuilder {
        private Long id;
        private Long assignmentId;
        private String studentName;
        private String studentRoll;
        private String subjectCode;
        private String fileUrl;
        private String submittedAt;
        private Integer marks;
        private String feedback;
        private Boolean graded = false;

        public SubmissionBuilder id(Long id) { this.id = id; return this; }
        public SubmissionBuilder assignmentId(Long assignmentId) { this.assignmentId = assignmentId; return this; }
        public SubmissionBuilder studentName(String studentName) { this.studentName = studentName; return this; }
        public SubmissionBuilder studentRoll(String studentRoll) { this.studentRoll = studentRoll; return this; }
        public SubmissionBuilder subjectCode(String subjectCode) { this.subjectCode = subjectCode; return this; }
        public SubmissionBuilder fileUrl(String fileUrl) { this.fileUrl = fileUrl; return this; }
        public SubmissionBuilder submittedAt(String submittedAt) { this.submittedAt = submittedAt; return this; }
        public SubmissionBuilder marks(Integer marks) { this.marks = marks; return this; }
        public SubmissionBuilder feedback(String feedback) { this.feedback = feedback; return this; }
        public SubmissionBuilder graded(Boolean graded) { this.graded = graded; return this; }

        public Submission build() {
            return new Submission(id, assignmentId, studentName, studentRoll, subjectCode, fileUrl, submittedAt, marks, feedback, graded);
        }
    }
}
