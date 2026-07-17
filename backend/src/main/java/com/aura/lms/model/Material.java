package com.aura.lms.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "materials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Material {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String type; // pdf, ppt, doc, zip, video, img

    @Column(nullable = false, length = 500)
    private String url;

    @Column(nullable = false)
    private String size;

    @Column(name = "uploaded_at", nullable = false)
    private String uploadedAt;

    @Column(name = "uploaded_by", nullable = false)
    private String uploadedBy;
}
