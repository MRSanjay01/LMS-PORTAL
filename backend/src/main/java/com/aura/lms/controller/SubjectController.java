package com.aura.lms.controller;

import com.aura.lms.model.Subject;
import com.aura.lms.model.Unit;
import com.aura.lms.repository.SubjectRepository;
import com.aura.lms.repository.UnitRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final SubjectRepository subjectRepository;
    private final UnitRepository unitRepository;

    public SubjectController(SubjectRepository subjectRepository, UnitRepository unitRepository) {
        this.subjectRepository = subjectRepository;
        this.unitRepository = unitRepository;
    }

    @GetMapping
    public ResponseEntity<List<Subject>> getSubjects(@RequestParam(required = false) String teacherName) {
        if (teacherName != null) {
            return ResponseEntity.ok(subjectRepository.findByTeacherName(teacherName));
        }
        return ResponseEntity.ok(subjectRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Subject> createSubject(@RequestBody Subject subject) {
        Subject savedSubject = subjectRepository.save(subject);
        
        // Auto-generation of exactly 5 Units for the new subject
        String[] unitNames = {
            "Introduction & Fundamentals",
            "Core Concepts",
            "Advanced Topics",
            "Applications",
            "Revision & Assessment"
        };
        for (int i = 1; i <= 5; i++) {
            Unit unit = Unit.builder()
                    .subject(savedSubject)
                    .unitNumber(i)
                    .name(unitNames[i - 1])
                    .build();
            unitRepository.save(unit);
        }
        
        return ResponseEntity.ok(savedSubject);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubject(@PathVariable Long id) {
        if (subjectRepository.existsById(id)) {
            subjectRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
