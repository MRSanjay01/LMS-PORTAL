package com.aura.lms.model;

import jakarta.persistence.*;

@Entity
@Table(name = "units", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"subject_id", "unit_number"})
})
public class Unit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(name = "unit_number", nullable = false)
    private Integer unitNumber;

    @Column(nullable = false)
    private String name;

    // Constructors
    public Unit() {}

    public Unit(Long id, Subject subject, Integer unitNumber, String name) {
        this.id = id;
        this.subject = subject;
        this.unitNumber = unitNumber;
        this.name = name;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }

    public Integer getUnitNumber() { return unitNumber; }
    public void setUnitNumber(Integer unitNumber) { this.unitNumber = unitNumber; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    // Builder
    public static UnitBuilder builder() {
        return new UnitBuilder();
    }

    public static class UnitBuilder {
        private Long id;
        private Subject subject;
        private Integer unitNumber;
        private String name;

        public UnitBuilder id(Long id) { this.id = id; return this; }
        public UnitBuilder subject(Subject subject) { this.subject = subject; return this; }
        public UnitBuilder unitNumber(Integer unitNumber) { this.unitNumber = unitNumber; return this; }
        public UnitBuilder name(String name) { this.name = name; return this; }

        public Unit build() {
            return new Unit(id, subject, unitNumber, name);
        }
    }
}
