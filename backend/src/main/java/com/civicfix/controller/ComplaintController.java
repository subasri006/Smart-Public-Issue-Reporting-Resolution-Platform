package com.civicfix.controller;

import com.civicfix.dto.*;
import com.civicfix.enums.ComplaintStatus;
import com.civicfix.enums.Severity;
import com.civicfix.service.ComplaintService;
import com.civicfix.service.DuplicateDetectionService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;
    private final DuplicateDetectionService duplicateDetectionService;

    public ComplaintController(ComplaintService complaintService,
                               DuplicateDetectionService duplicateDetectionService) {
        this.complaintService = complaintService;
        this.duplicateDetectionService = duplicateDetectionService;
    }

    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<ApiResponse<ComplaintDetailResponse>> createComplaintWithFile(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam("severity") Severity severity,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "landmark", required = false) String landmark,
            @RequestPart(value = "photo", required = false) MultipartFile photo
    ) {
        CreateComplaintRequest request = new CreateComplaintRequest(
                title, description, categoryId, severity, latitude, longitude, address, landmark
        );
        ComplaintDetailResponse response = complaintService.createComplaint(request, photo);
        return ResponseEntity.ok(ApiResponse.ok("Complaint registered successfully", response));
    }

    @PostMapping(consumes = {MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<ApiResponse<ComplaintDetailResponse>> createComplaintJson(
            @Valid @RequestBody CreateComplaintRequest request
    ) {
        ComplaintDetailResponse response = complaintService.createComplaint(request, null);
        return ResponseEntity.ok(ApiResponse.ok("Complaint registered successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ComplaintResponse>>> getComplaints(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(required = false) Severity severity,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean onlyAssignedToMe,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        PagedResponse<ComplaintResponse> response = complaintService.getComplaints(
                categoryId, status, severity, search, onlyAssignedToMe, page, size, sortBy, sortDir
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ComplaintDetailResponse>> getComplaintById(@PathVariable Long id) {
        ComplaintDetailResponse response = complaintService.getComplaintDetails(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ComplaintDetailResponse>> updateComplaint(
            @PathVariable Long id,
            @Valid @RequestBody UpdateComplaintRequest request
    ) {
        ComplaintDetailResponse response = complaintService.updateComplaint(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Complaint updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> withdrawComplaint(
            @PathVariable Long id,
            @RequestParam(defaultValue = "Cancelled by reporter") String reason
    ) {
        complaintService.withdrawComplaint(id, reason);
        return ResponseEntity.ok(ApiResponse.ok("Complaint withdrawn successfully", null));
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<ComplaintDetailResponse>> assignComplaint(
            @PathVariable Long id,
            @Valid @RequestBody AssignComplaintRequest request
    ) {
        ComplaintDetailResponse response = complaintService.assignComplaint(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Complaint assigned successfully", response));
    }

    @PatchMapping(value = "/{id}/status", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<ComplaintDetailResponse>> updateStatusMultipart(
            @PathVariable Long id,
            @RequestParam("status") ComplaintStatus status,
            @RequestParam(value = "comment", required = false) String comment,
            @RequestParam(value = "resolutionNotes", required = false) String resolutionNotes,
            @RequestPart(value = "resolutionEvidence", required = false) MultipartFile resolutionEvidence
    ) {
        UpdateStatusRequest request = new UpdateStatusRequest(status, comment, resolutionNotes);
        ComplaintDetailResponse response = complaintService.updateStatus(id, request, resolutionEvidence);
        return ResponseEntity.ok(ApiResponse.ok("Status updated successfully", response));
    }

    @PatchMapping(value = "/{id}/status", consumes = {MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<ComplaintDetailResponse>> updateStatusJson(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request
    ) {
        ComplaintDetailResponse response = complaintService.updateStatus(id, request, null);
        return ResponseEntity.ok(ApiResponse.ok("Status updated successfully", response));
    }

    @PostMapping("/{id}/reopen")
    public ResponseEntity<ApiResponse<ComplaintDetailResponse>> reopenComplaint(
            @PathVariable Long id,
            @RequestParam(value = "reason", required = true) String reason
    ) {
        ComplaintDetailResponse response = complaintService.reopenComplaint(id, reason);
        return ResponseEntity.ok(ApiResponse.ok("Complaint reopened successfully", response));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @PathVariable Long id,
            @Valid @RequestBody AddCommentRequest request
    ) {
        CommentResponse response = complaintService.addComment(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Comment added successfully", response));
    }

    @PostMapping(value = "/{id}/attachments", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<ApiResponse<AttachmentResponse>> uploadAttachment(
            @PathVariable Long id,
            @RequestPart("file") MultipartFile file,
            @RequestParam(defaultValue = "false") boolean isResolutionEvidence
    ) {
        AttachmentResponse response = complaintService.uploadAttachment(id, file, isResolutionEvidence);
        return ResponseEntity.ok(ApiResponse.ok("Attachment uploaded successfully", response));
    }

    @PostMapping("/check-duplicate")
    public ResponseEntity<ApiResponse<DuplicateCheckResponse>> checkDuplicate(
            @Valid @RequestBody DuplicateCheckRequest request
    ) {
        DuplicateCheckResponse response = duplicateDetectionService.checkDuplicate(request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/public-map")
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> getPublicMapComplaints() {
        List<ComplaintResponse> list = complaintService.getPublicMapComplaints();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/public-recent")
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> getPublicRecentComplaints(
            @RequestParam(defaultValue = "4") int limit
    ) {
        List<ComplaintResponse> list = complaintService.getPublicRecentComplaints(limit);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/my-summary")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getMyComplaintSummary() {
        Map<String, Long> summary = complaintService.getMyComplaintSummary();
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }
}
