package com.aura.lms.model;

import jakarta.persistence.*;

@Entity
@Table(name = "departments")
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "head_id")
    private User head;

    // Constructors
    public Department() {}

    public Department(Long id, String name, String code, User head) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.head = head;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public User getHead() { return head; }
    public void setHead(User head) { this.head = head; }

    // Builder
    public static DepartmentBuilder builder() {
        return new DepartmentBuilder();
    }

    public static class DepartmentBuilder {
        private Long id;
        private String name;
        private String code;
        private User head;

        public DepartmentBuilder id(Long id) { this.id = id; return this; }
        public DepartmentBuilder name(String name) { this.name = name; return this; }
        public DepartmentBuilder code(String code) { this.code = code; return this; }
        public DepartmentBuilder head(User head) { this.head = head; return this; }

        public Department build() {
            return new Department(id, name, code, head);
        }
    }
}
