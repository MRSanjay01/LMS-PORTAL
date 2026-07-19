package com.aura.lms.model;

import jakarta.persistence.*;

@Entity
@Table(name = "subjects")
public class Subject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer credits;

    @Column(name = "teacher_name", nullable = false)
    private String teacherName;

    // Constructors
    public Subject() {}

    public Subject(Long id, String code, String name, Integer credits, String teacherName) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.credits = credits;
        this.teacherName = teacherName;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getCredits() { return credits; }
    public void setCredits(Integer credits) { this.credits = credits; }

    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }

    // Builder
    public static SubjectBuilder builder() {
        return new SubjectBuilder();
    }

    public static class SubjectBuilder {
        private Long id;
        private String code;
        private String name;
        private Integer credits;
        private String teacherName;

        public SubjectBuilder id(Long id) { this.id = id; return this; }
        public SubjectBuilder code(String code) { this.code = code; return this; }
        public SubjectBuilder name(String name) { this.name = name; return this; }
        public SubjectBuilder credits(Integer credits) { this.credits = credits; return this; }
        public SubjectBuilder teacherName(String teacherName) { this.teacherName = teacherName; return this; }

        public Subject build() {
            return new Subject(id, code, name, credits, teacherName);
        }
    }
}
