package com.aura.lms.config;

import com.aura.lms.model.*;
import com.aura.lms.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final SubjectRepository subjectRepository;
    private final UnitRepository unitRepository;
    private final MaterialRepository materialRepository;
    private final SubmissionRepository submissionRepository;
    private final AnnouncementRepository announcementRepository;

    public DataInitializer(UserRepository userRepository,
                           DepartmentRepository departmentRepository,
                           SubjectRepository subjectRepository,
                           UnitRepository unitRepository,
                           MaterialRepository materialRepository,
                           SubmissionRepository submissionRepository,
                           AnnouncementRepository announcementRepository) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.subjectRepository = subjectRepository;
        this.unitRepository = unitRepository;
        this.materialRepository = materialRepository;
        this.submissionRepository = submissionRepository;
        this.announcementRepository = announcementRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return; // DB already seeded
        }

        // 1. Seed Users
        User admin = User.builder()
                .name("Dean Aura")
                .email("admin")
                .passwordHash("AdminPassword123")
                .role("ADMIN")
                .status("ACTIVE")
                .build();

        User teacher1 = User.builder()
                .name("Dr. Helen Vance")
                .email("teacher@aura.edu")
                .passwordHash("Password123")
                .role("TEACHER")
                .status("ACTIVE")
                .build();

        User teacher2 = User.builder()
                .name("Prof. James Miller")
                .email("j.miller@aura.edu")
                .passwordHash("Password123")
                .role("TEACHER")
                .status("ACTIVE")
                .build();

        User student = User.builder()
                .name("Jane Doe")
                .email("student@aura.edu")
                .passwordHash("Password123")
                .role("STUDENT")
                .status("ACTIVE")
                .build();

        userRepository.saveAll(List.of(admin, teacher1, teacher2, student));

        // 2. Seed Departments
        Department cs = Department.builder().name("Computer Science").code("CS").head(teacher1).build();
        Department ee = Department.builder().name("Electrical Engineering").code("EE").head(teacher2).build();
        departmentRepository.saveAll(List.of(cs, ee));

        // 3. Seed Subjects
        Subject ph201 = Subject.builder().code("PH-201").name("Physics II: Electromagnetism").credits(4).teacherName("Dr. Helen Vance").build();
        Subject cs302 = Subject.builder().code("CS-302").name("Algorithms & Complexity").credits(4).teacherName("Prof. James Miller").build();
        Subject cs401 = Subject.builder().code("CS-401").name("AI Introduction").credits(4).teacherName("Dr. Emily Taylor").build();
        subjectRepository.saveAll(List.of(ph201, cs302, cs401));

        // 4. Seed Units (Exactly 5 units per subject, auto-seeded)
        String[] unitNames = {
            "Introduction & Fundamentals",
            "Core Concepts",
            "Advanced Topics",
            "Applications",
            "Revision & Assessment"
        };

        for (Subject subject : List.of(ph201, cs302, cs401)) {
            for (int i = 1; i <= 5; i++) {
                Unit unit = Unit.builder()
                        .subject(subject)
                        .unitNumber(i)
                        .name(unitNames[i - 1])
                        .build();
                unitRepository.save(unit);
            }
        }

        // Fetch seeded units for seeding materials
        List<Unit> ph201Units = unitRepository.findBySubjectId(ph201.getId());
        List<Unit> cs302Units = unitRepository.findBySubjectId(cs302.getId());

        // 5. Seed Materials
        if (!ph201Units.isEmpty()) {
            Material m1 = Material.builder()
                    .unit(ph201Units.get(0))
                    .title("Coulombs Law & Electric Fields")
                    .type("pdf")
                    .url("#")
                    .size("2.4 MB")
                    .uploadedAt("Jul 10, 2026")
                    .uploadedBy("Dr. Helen Vance")
                    .build();

            Material m2 = Material.builder()
                    .unit(ph201Units.get(0))
                    .title("Gauss Law Lecture Slides")
                    .type("ppt")
                    .url("#")
                    .size("5.1 MB")
                    .uploadedAt("Jul 11, 2026")
                    .uploadedBy("Dr. Helen Vance")
                    .build();

            Material m3 = Material.builder()
                    .unit(ph201Units.get(1))
                    .title("Electromagnetic Induction Notes")
                    .type("pdf")
                    .url("#")
                    .size("1.8 MB")
                    .uploadedAt("Jul 12, 2026")
                    .uploadedBy("Dr. Helen Vance")
                    .build();

            materialRepository.saveAll(List.of(m1, m2, m3));
        }

        if (!cs302Units.isEmpty()) {
            Material m4 = Material.builder()
                    .unit(cs302Units.get(0))
                    .title("Big-O Notation & Complexity")
                    .type("pdf")
                    .url("#")
                    .size("1.2 MB")
                    .uploadedAt("Jul 8, 2026")
                    .uploadedBy("Prof. James Miller")
                    .build();

            materialRepository.save(m4);
        }

        // 6. Seed Submissions
        Submission sub1 = Submission.builder()
                .assignmentId(2L)
                .studentName("Jane Doe")
                .studentRoll("student123")
                .subjectCode("PH-201")
                .fileUrl("#")
                .submittedAt("Jul 5, 2026")
                .marks(92)
                .feedback("Excellent work. Minor calculation error in Q3.")
                .graded(true)
                .build();

        Submission sub2 = Submission.builder()
                .assignmentId(4L)
                .studentName("Jane Doe")
                .studentRoll("student123")
                .subjectCode("CS-401")
                .fileUrl("#")
                .submittedAt("Jul 10, 2026")
                .marks(null)
                .feedback(null)
                .graded(false)
                .build();

        submissionRepository.saveAll(List.of(sub1, sub2));

        // 7. Seed Announcements
        Announcement ann1 = Announcement.builder()
                .subjectCode("PH-201")
                .title("Midterm Exam Rescheduled")
                .body("The Physics II midterm has been moved to July 25, 2026. Please revise Units 1-3.")
                .postedBy("Dr. Helen Vance")
                .postedAt("Jul 14, 2026")
                .build();

        Announcement ann2 = Announcement.builder()
                .subjectCode(null)
                .title("LMS Maintenance Window")
                .body("System will be offline for maintenance on July 20, 2026 from 2:00 AM - 4:00 AM IST.")
                .postedBy("Admin")
                .postedAt("Jul 12, 2026")
                .build();

        announcementRepository.saveAll(List.of(ann1, ann2));
    }
}
