package com.corpcheck.check.controller;

import com.corpcheck.check.dto.ApplicationDetailDto;
import com.corpcheck.check.dto.ApplicationSummaryDto;
import com.corpcheck.check.service.CorporateApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/corp/applications")
public class CorporateApplicationController {

    @Autowired
    private CorporateApplicationService applicationService;

    @GetMapping("/recent")
    public List<ApplicationSummaryDto> getRecentApplications(
            @RequestParam(defaultValue = "100") int limit) {
        return applicationService.findRecent(limit);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationDetailDto> getApplication(@PathVariable Long id) {
        try {
            ApplicationDetailDto dto = applicationService.findById(id);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<ApplicationDetailDto> createApplication(
            @RequestBody ApplicationDetailDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            String username = userDetails != null ? userDetails.getUsername() : "system";
            ApplicationDetailDto created = applicationService.createApplication(dto, username);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApplicationDetailDto> updateApplication(
            @PathVariable Long id,
            @RequestBody ApplicationDetailDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            String username = userDetails != null ? userDetails.getUsername() : "system";
            ApplicationDetailDto updated = applicationService.updateApplication(id, dto, username);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id,
                                                  @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String username = userDetails != null ? userDetails.getUsername() : "system";
            applicationService.deleteApplication(id, username);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/archive")
    public List<ApplicationSummaryDto> getArchive(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        return applicationService.searchArchive(search, page, size);
    }
}