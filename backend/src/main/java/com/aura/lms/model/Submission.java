package com.aura.lms.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
}
