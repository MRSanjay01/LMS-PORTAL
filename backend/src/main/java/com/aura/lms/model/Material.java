package com.aura.lms.model;

import jakarta.persistence.*;

@Entity
@Table(name = "materials")
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

    // Constructors
    public Material() {}

    public Material(Long id, Unit unit, String title, String type, String url, String size, String uploadedAt, String uploadedBy) {
        this.id = id;
        this.unit = unit;
        this.title = title;
        this.type = type;
        this.url = url;
        this.size = size;
        this.uploadedAt = uploadedAt;
        this.uploadedBy = uploadedBy;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Unit getUnit() { return unit; }
    public void setUnit(Unit unit) { this.unit = unit; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(String uploadedAt) { this.uploadedAt = uploadedAt; }

    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }

    // Builder
    public static MaterialBuilder builder() {
        return new MaterialBuilder();
    }

    public static class MaterialBuilder {
        private Long id;
        private Unit unit;
        private String title;
        private String type;
        private String url;
        private String size;
        private String uploadedAt;
        private String uploadedBy;

        public MaterialBuilder id(Long id) { this.id = id; return this; }
        public MaterialBuilder unit(Unit unit) { this.unit = unit; return this; }
        public MaterialBuilder title(String title) { this.title = title; return this; }
        public MaterialBuilder type(String type) { this.type = type; return this; }
        public MaterialBuilder url(String url) { this.url = url; return this; }
        public MaterialBuilder size(String size) { this.size = size; return this; }
        public MaterialBuilder uploadedAt(String uploadedAt) { this.uploadedAt = uploadedAt; return this; }
        public MaterialBuilder uploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; return this; }

        public Material build() {
            return new Material(id, unit, title, type, url, size, uploadedAt, uploadedBy);
        }
    }
}
