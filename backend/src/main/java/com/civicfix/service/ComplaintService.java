package com.civicfix.service;

import com.civicfix.dto.*;
import com.civicfix.entity.*;
import com.civicfix.enums.ComplaintStatus;
import com.civicfix.enums.Role;
import com.civicfix.enums.Severity;
import com.civicfix.exception.BadRequestException;
import com.civicfix.exception.ForbiddenException;
import com.civicfix.exception.ResourceNotFoundException;
import com.civicfix.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintCategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ComplaintStatusHistoryRepository historyRepository;
    private final ComplaintAssignmentRepository assignmentRepository;
    private final ComplaintCommentRepository commentRepository;
    private final ComplaintAttachmentRepository attachmentRepository;
    private final PriorityScoringService priorityScoringService;
    private final FileStorageService fileStorageService;
    private final AuthService authService;
    private final AuditService auditService;
    private final ReferenceIdGeneratorService referenceIdGeneratorService;

    public ComplaintService(ComplaintRepository complaintRepository,
                            ComplaintCategoryRepository categoryRepository,
                            UserRepository userRepository,
                            ComplaintStatusHistoryRepository historyRepository,
                            ComplaintAssignmentRepository assignmentRepository,
                            ComplaintCommentRepository commentRepository,
                            ComplaintAttachmentRepository attachmentRepository,
                            PriorityScoringService priorityScoringService,
                            FileStorageService fileStorageService,
                            AuthService authService,
                            AuditService auditService,
                            ReferenceIdGeneratorService referenceIdGeneratorService) {
        this.complaintRepository = complaintRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.historyRepository = historyRepository;
        this.assignmentRepository = assignmentRepository;
        this.commentRepository = commentRepository;
        this.attachmentRepository = attachmentRepository;
        this.priorityScoringService = priorityScoringService;
        this.fileStorageService = fileStorageService;
        this.authService = authService;
        this.auditService = auditService;
        this.referenceIdGeneratorService = referenceIdGeneratorService;
    }

    @Transactional
    public ComplaintDetailResponse createComplaint(CreateComplaintRequest request, MultipartFile photo) {
        User citizen = authService.getCurrentUser();

        ComplaintCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Complaint complaint = new Complaint();
        complaint.setReferenceId(generateReferenceId());
        complaint.setTitle(request.getTitle().trim());
        complaint.setDescription(request.getDescription().trim());
        complaint.setCategory(category);
        complaint.setSeverity(request.getSeverity());
        complaint.setStatus(ComplaintStatus.SUBMITTED);
        complaint.setLatitude(request.getLatitude());
        complaint.setLongitude(request.getLongitude());
        complaint.setAddress(request.getAddress());
        complaint.setLandmark(request.getLandmark());
        complaint.setCitizen(citizen);

        // Priority calculation
        PriorityScoringService.PriorityResult priority = priorityScoringService.calculatePriority(
                request.getSeverity(), category, LocalDateTime.now()
        );
        complaint.setPriorityScore(priority.getScore());

        Complaint saved = complaintRepository.save(complaint);

        // Status history
        ComplaintStatusHistory initialHistory = new ComplaintStatusHistory(
                saved, null, ComplaintStatus.SUBMITTED, citizen, "Issue reported by citizen"
        );
        historyRepository.save(initialHistory);

        // Save photo if uploaded
        if (photo != null && !photo.isEmpty()) {
            FileStorageService.StoredFile stored = fileStorageService.storeFile(photo);
            ComplaintAttachment attachment = new ComplaintAttachment(
                    saved,
                    stored.getFileName(),
                    stored.getOriginalName(),
                    stored.getContentType(),
                    stored.getSize(),
                    stored.getFullPath(),
                    false,
                    citizen
            );
            attachmentRepository.save(attachment);
            saved.getAttachments().add(attachment);
        }

        auditService.log("COMPLAINT_SUBMITTED", "Complaint", saved.getId(), citizen,
                "Reported issue: " + saved.getReferenceId() + " - " + saved.getTitle());

        return getComplaintDetails(saved.getId());
    }

    @Transactional
    public ComplaintDetailResponse updateComplaint(Long id, UpdateComplaintRequest request) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        User currentUser = authService.getCurrentUser();
        boolean isAdmin = currentUser.getRole() == Role.ROLE_ADMIN;
        boolean isOwner = complaint.getCitizen().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new ForbiddenException("You do not have permission to update this complaint");
        }

        // Citizens can only edit if still SUBMITTED and unassigned
        if (isOwner && !isAdmin) {
            if (complaint.getStatus() != ComplaintStatus.SUBMITTED || complaint.getAssignedStaff() != null) {
                throw new BadRequestException("Complaints can only be edited before they are assigned or processed");
            }
        }

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            complaint.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null && !request.getDescription().trim().isEmpty()) {
            complaint.setDescription(request.getDescription().trim());
        }
        if (request.getCategoryId() != null) {
            ComplaintCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
            complaint.setCategory(category);
        }
        if (request.getSeverity() != null) {
            complaint.setSeverity(request.getSeverity());
        }
        if (request.getLatitude() != null) {
            complaint.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            complaint.setLongitude(request.getLongitude());
        }
        if (request.getAddress() != null) {
            complaint.setAddress(request.getAddress());
        }
        if (request.getLandmark() != null) {
            complaint.setLandmark(request.getLandmark());
        }

        // Recalculate priority
        PriorityScoringService.PriorityResult priority = priorityScoringService.calculatePriority(
                complaint.getSeverity(), complaint.getCategory(), complaint.getCreatedAt()
        );
        complaint.setPriorityScore(priority.getScore());

        complaintRepository.save(complaint);
        auditService.log("COMPLAINT_UPDATED", "Complaint", complaint.getId(), currentUser, "Updated complaint " + complaint.getReferenceId());

        return getComplaintDetails(id);
    }

    @Transactional
    public void withdrawComplaint(Long id, String reason) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        User currentUser = authService.getCurrentUser();
        boolean isAdmin = currentUser.getRole() == Role.ROLE_ADMIN;
        boolean isOwner = complaint.getCitizen().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new ForbiddenException("You do not have permission to withdraw this complaint");
        }

        if (isOwner && !isAdmin) {
            if (complaint.getStatus() != ComplaintStatus.SUBMITTED || complaint.getAssignedStaff() != null) {
                throw new BadRequestException("Complaints can only be withdrawn while in SUBMITTED status before assignment");
            }
        }

        auditService.log("COMPLAINT_WITHDRAWN", "Complaint", complaint.getId(), currentUser,
                "Withdrawn complaint " + complaint.getReferenceId() + ". Reason: " + reason);

        complaintRepository.delete(complaint);
    }

    @Transactional
    public ComplaintDetailResponse assignComplaint(Long id, AssignComplaintRequest request) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() == Role.ROLE_CITIZEN) {
            throw new ForbiddenException("Citizens cannot assign complaints");
        }

        User staff = userRepository.findById(request.getStaffId())
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found with id: " + request.getStaffId()));

        if (staff.getRole() == Role.ROLE_CITIZEN) {
            throw new BadRequestException("Cannot assign complaint to a citizen account");
        }

        User previousStaff = complaint.getAssignedStaff();
        complaint.setAssignedStaff(staff);

        ComplaintStatus previousStatus = complaint.getStatus();
        if (complaint.getStatus() == ComplaintStatus.SUBMITTED) {
            complaint.setStatus(ComplaintStatus.ASSIGNED);
        }

        Complaint saved = complaintRepository.save(complaint);

        // Assignment record
        ComplaintAssignment assignment = new ComplaintAssignment(saved, staff, currentUser, request.getNotes());
        assignmentRepository.save(assignment);

        // Status history
        String historyComment = "Assigned to " + staff.getFullName() + (request.getNotes() != null ? " (" + request.getNotes() + ")" : "");
        ComplaintStatusHistory history = new ComplaintStatusHistory(saved, previousStatus, saved.getStatus(), currentUser, historyComment);
        historyRepository.save(history);

        auditService.log("COMPLAINT_ASSIGNED", "Complaint", saved.getId(), currentUser,
                "Assigned " + saved.getReferenceId() + " to " + staff.getUsername());

        return getComplaintDetails(saved.getId());
    }

    @Transactional
    public ComplaintDetailResponse updateStatus(Long id, UpdateStatusRequest request, MultipartFile resolutionEvidence) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() == Role.ROLE_CITIZEN) {
            throw new ForbiddenException("Citizens cannot modify operational status directly");
        }

        ComplaintStatus currentStatus = complaint.getStatus();
        ComplaintStatus newStatus = request.getStatus();

        if (!currentStatus.canTransitionTo(newStatus)) {
            throw new BadRequestException(String.format("Invalid status transition from %s to %s. Allowed: %s",
                    currentStatus, newStatus, currentStatus.getAllowedNextStatuses()));
        }

        complaint.setStatus(newStatus);

        if (newStatus == ComplaintStatus.RESOLVED) {
            if (request.getResolutionNotes() == null || request.getResolutionNotes().trim().isEmpty()) {
                throw new BadRequestException("Resolution notes are required when resolving a complaint");
            }
            complaint.setResolutionNotes(request.getResolutionNotes().trim());
            complaint.setResolvedAt(LocalDateTime.now());
        }

        Complaint saved = complaintRepository.save(complaint);

        // If resolution evidence attached
        if (resolutionEvidence != null && !resolutionEvidence.isEmpty()) {
            FileStorageService.StoredFile stored = fileStorageService.storeFile(resolutionEvidence);
            ComplaintAttachment attachment = new ComplaintAttachment(
                    saved,
                    stored.getFileName(),
                    stored.getOriginalName(),
                    stored.getContentType(),
                    stored.getSize(),
                    stored.getFullPath(),
                    true,
                    currentUser
            );
            attachmentRepository.save(attachment);
        }

        ComplaintStatusHistory history = new ComplaintStatusHistory(
                saved, currentStatus, newStatus, currentUser, request.getComment()
        );
        historyRepository.save(history);

        auditService.log("STATUS_UPDATED", "Complaint", saved.getId(), currentUser,
                "Status changed to " + newStatus + " for " + saved.getReferenceId());

        return getComplaintDetails(saved.getId());
    }

    @Transactional
    public ComplaintDetailResponse reopenComplaint(Long id, String reason) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        User currentUser = authService.getCurrentUser();
        boolean isOwner = complaint.getCitizen().getId().equals(currentUser.getId());
        boolean isStaffOrAdmin = currentUser.getRole() == Role.ROLE_STAFF || currentUser.getRole() == Role.ROLE_ADMIN;

        if (!isOwner && !isStaffOrAdmin) {
            throw new ForbiddenException("You do not have permission to reopen this complaint");
        }

        if (complaint.getStatus() != ComplaintStatus.RESOLVED) {
            throw new BadRequestException("Only RESOLVED complaints can be reopened");
        }

        if (reason == null || reason.trim().isEmpty()) {
            throw new BadRequestException("Reason is required to reopen a complaint");
        }

        ComplaintStatus previousStatus = complaint.getStatus();
        complaint.setStatus(ComplaintStatus.REOPENED);
        complaint.setResolvedAt(null);

        // Recalculate priority
        PriorityScoringService.PriorityResult priority = priorityScoringService.calculatePriority(
                complaint.getSeverity(), complaint.getCategory(), complaint.getCreatedAt()
        );
        complaint.setPriorityScore(priority.getScore());

        Complaint saved = complaintRepository.save(complaint);

        ComplaintStatusHistory history = new ComplaintStatusHistory(
                saved, previousStatus, ComplaintStatus.REOPENED, currentUser, "Reopened: " + reason
        );
        historyRepository.save(history);

        auditService.log("COMPLAINT_REOPENED", "Complaint", saved.getId(), currentUser,
                "Reopened complaint " + saved.getReferenceId() + ". Reason: " + reason);

        return getComplaintDetails(saved.getId());
    }

    @Transactional
    public CommentResponse addComment(Long id, AddCommentRequest request) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        User currentUser = authService.getCurrentUser();

        // Citizens can only make public comments
        boolean isInternal = Boolean.TRUE.equals(request.getIsInternal());
        if (currentUser.getRole() == Role.ROLE_CITIZEN) {
            isInternal = false;
        }

        ComplaintComment comment = new ComplaintComment(complaint, currentUser, request.getComment().trim(), isInternal);
        ComplaintComment saved = commentRepository.save(comment);

        auditService.log("COMMENT_ADDED", "Complaint", complaint.getId(), currentUser,
                "Added " + (isInternal ? "internal" : "public") + " comment on " + complaint.getReferenceId());

        return new CommentResponse(
                saved.getId(),
                currentUser.getFullName(),
                currentUser.getRole().name().replace("ROLE_", ""),
                saved.getComment(),
                saved.getIsInternal(),
                saved.getCreatedAt()
        );
    }

    @Transactional
    public AttachmentResponse uploadAttachment(Long id, MultipartFile file, boolean isResolutionEvidence) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        User currentUser = authService.getCurrentUser();
        FileStorageService.StoredFile stored = fileStorageService.storeFile(file);

        ComplaintAttachment attachment = new ComplaintAttachment(
                complaint,
                stored.getFileName(),
                stored.getOriginalName(),
                stored.getContentType(),
                stored.getSize(),
                stored.getFullPath(),
                isResolutionEvidence,
                currentUser
        );
        ComplaintAttachment saved = attachmentRepository.save(attachment);

        auditService.log("ATTACHMENT_UPLOADED", "Complaint", complaint.getId(), currentUser,
                "Uploaded attachment for " + complaint.getReferenceId());

        return mapToAttachmentResponse(saved);
    }

    @Transactional(readOnly = true)
    public ComplaintDetailResponse getComplaintDetails(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        User currentUser = authService.getCurrentUser();
        boolean isCitizen = currentUser.getRole() == Role.ROLE_CITIZEN;
        boolean isOwner = complaint.getCitizen().getId().equals(currentUser.getId());

        // Authorization check: citizen can only view their own complaint in full details
        if (isCitizen && !isOwner) {
            throw new ForbiddenException("You do not have access to view this complaint's private details");
        }

        ComplaintDetailResponse response = new ComplaintDetailResponse();
        response.setId(complaint.getId());
        response.setReferenceId(complaint.getReferenceId());
        response.setTitle(complaint.getTitle());
        response.setDescription(complaint.getDescription());
        response.setCategoryId(complaint.getCategory().getId());
        response.setCategoryName(complaint.getCategory().getName());
        response.setCategoryIcon(complaint.getCategory().getIcon());
        response.setCategoryWeight(complaint.getCategory().getWeight());
        response.setSeverity(complaint.getSeverity());
        response.setStatus(complaint.getStatus());
        response.setLatitude(complaint.getLatitude());
        response.setLongitude(complaint.getLongitude());
        response.setAddress(complaint.getAddress());
        response.setLandmark(complaint.getLandmark());
        response.setCitizenId(complaint.getCitizen().getId());
        response.setCitizenName(complaint.getCitizen().getFullName());
        response.setCitizenEmail(complaint.getCitizen().getEmail());
        response.setCitizenPhone(complaint.getCitizen().getPhone());

        if (complaint.getAssignedStaff() != null) {
            response.setAssignedStaffId(complaint.getAssignedStaff().getId());
            response.setAssignedStaffName(complaint.getAssignedStaff().getFullName());
            response.setAssignedStaffEmail(complaint.getAssignedStaff().getEmail());
        }

        response.setResolutionNotes(complaint.getResolutionNotes());
        response.setResolvedAt(complaint.getResolvedAt());
        response.setCreatedAt(complaint.getCreatedAt());
        response.setUpdatedAt(complaint.getUpdatedAt());

        // Dynamic priority calculation & explanation
        PriorityScoringService.PriorityResult priority = priorityScoringService.calculatePriority(
                complaint.getSeverity(), complaint.getCategory(), complaint.getCreatedAt()
        );
        response.setPriorityScore(priority.getScore());
        response.setPriorityLevel(priority.getLevel());
        response.setPriorityExplanation(priority.getExplanation());

        // Citizen editing permissions
        response.setCanEditOrWithdraw(isOwner && complaint.getStatus() == ComplaintStatus.SUBMITTED && complaint.getAssignedStaff() == null);
        response.setAllowedNextStatuses(complaint.getStatus().getAllowedNextStatuses());

        // Attachments
        List<AttachmentResponse> attachments = complaint.getAttachments().stream()
                .map(this::mapToAttachmentResponse)
                .collect(Collectors.toList());
        response.setAttachments(attachments);

        // Status history
        List<StatusHistoryResponse> history = historyRepository.findByComplaintOrderByCreatedAtAsc(complaint).stream()
                .map(this::mapToHistoryResponse)
                .collect(Collectors.toList());
        response.setStatusHistory(history);

        // Comments (filter internal notes for citizens)
        List<ComplaintComment> rawComments = isCitizen
                ? commentRepository.findByComplaintAndIsInternalFalseOrderByCreatedAtAsc(complaint)
                : commentRepository.findByComplaintOrderByCreatedAtAsc(complaint);

        List<CommentResponse> comments = rawComments.stream()
                .map(this::mapToCommentResponse)
                .collect(Collectors.toList());
        response.setComments(comments);

        return response;
    }

    @Transactional(readOnly = true)
    public PagedResponse<ComplaintResponse> getComplaints(
            Long categoryId,
            ComplaintStatus status,
            Severity severity,
            String search,
            Boolean onlyAssignedToMe,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        User currentUser = authService.getCurrentUser();
        Long citizenId = null;
        Long assignedStaffId = null;

        if (currentUser.getRole() == Role.ROLE_CITIZEN) {
            // Citizens only view their own complaints
            citizenId = currentUser.getId();
        } else if (Boolean.TRUE.equals(onlyAssignedToMe)) {
            assignedStaffId = currentUser.getId();
        }

        Sort sort = Sort.by(Sort.Direction.fromString(sortDir != null ? sortDir : "DESC"),
                (sortBy != null && !sortBy.isEmpty()) ? sortBy : "createdAt");
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Complaint> complaintPage = complaintRepository.filterComplaints(
                citizenId, assignedStaffId, categoryId, status, severity,
                (search != null && !search.trim().isEmpty()) ? search.trim() : null,
                pageable
        );

        List<ComplaintResponse> content = complaintPage.getContent().stream()
                .map(this::mapToComplaintResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                complaintPage.getNumber(),
                complaintPage.getSize(),
                complaintPage.getTotalElements(),
                complaintPage.getTotalPages(),
                complaintPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getPublicMapComplaints() {
        return complaintRepository.findAllWithCoordinates().stream()
                .map(this::mapToComplaintResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getPublicRecentComplaints(int limit) {
        int pageSize = (limit > 0 && limit <= 20) ? limit : 4;
        Pageable pageable = PageRequest.of(0, pageSize, Sort.by("createdAt").descending());
        return complaintRepository.findAll(pageable).getContent().stream()
                .map(this::mapToComplaintResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getMyComplaintSummary() {
        User currentUser = authService.getCurrentUser();
        Map<String, Long> summary = new HashMap<>();
        summary.put("total", complaintRepository.countByCitizen(currentUser));
        summary.put("submitted", complaintRepository.countByCitizenAndStatus(currentUser, ComplaintStatus.SUBMITTED));
        summary.put("assigned", complaintRepository.countByCitizenAndStatus(currentUser, ComplaintStatus.ASSIGNED));
        summary.put("inProgress", complaintRepository.countByCitizenAndStatus(currentUser, ComplaintStatus.IN_PROGRESS));
        summary.put("resolved", complaintRepository.countByCitizenAndStatus(currentUser, ComplaintStatus.RESOLVED));
        summary.put("reopened", complaintRepository.countByCitizenAndStatus(currentUser, ComplaintStatus.REOPENED));
        summary.put("activeUnderRepair", summary.get("assigned") + summary.get("inProgress"));
        return summary;
    }

    public String generateReferenceId() {
        return referenceIdGeneratorService.generateNextReferenceId();
    }

    public ComplaintResponse mapToComplaintResponse(Complaint c) {
        ComplaintResponse dto = new ComplaintResponse();
        dto.setId(c.getId());
        dto.setReferenceId(c.getReferenceId());
        dto.setTitle(c.getTitle());
        dto.setDescription(c.getDescription());
        dto.setCategoryId(c.getCategory().getId());
        dto.setCategoryName(c.getCategory().getName());
        dto.setCategoryIcon(c.getCategory().getIcon());
        dto.setSeverity(c.getSeverity());
        dto.setStatus(c.getStatus());
        dto.setLatitude(c.getLatitude());
        dto.setLongitude(c.getLongitude());
        dto.setAddress(c.getAddress());
        dto.setLandmark(c.getLandmark());
        dto.setCitizenId(c.getCitizen().getId());
        dto.setCitizenName(c.getCitizen().getFullName());

        if (c.getAssignedStaff() != null) {
            dto.setAssignedStaffId(c.getAssignedStaff().getId());
            dto.setAssignedStaffName(c.getAssignedStaff().getFullName());
        }

        dto.setCreatedAt(c.getCreatedAt());
        dto.setUpdatedAt(c.getUpdatedAt());
        dto.setResolvedAt(c.getResolvedAt());

        // Dynamic priority
        PriorityScoringService.PriorityResult priority = priorityScoringService.calculatePriority(
                c.getSeverity(), c.getCategory(), c.getCreatedAt()
        );
        dto.setPriorityScore(priority.getScore());
        dto.setPriorityLevel(priority.getLevel());

        // Primary photo if available
        if (c.getAttachments() != null && !c.getAttachments().isEmpty()) {
            dto.setPrimaryPhotoUrl("/api/uploads/" + c.getAttachments().get(0).getFileName());
        }

        return dto;
    }

    private AttachmentResponse mapToAttachmentResponse(ComplaintAttachment a) {
        return new AttachmentResponse(
                a.getId(),
                a.getFileName(),
                a.getFileOriginalName(),
                a.getFileType(),
                a.getFileSize(),
                "/api/uploads/" + a.getFileName(),
                a.getIsResolutionEvidence(),
                a.getUploadedBy() != null ? a.getUploadedBy().getFullName() : "Anonymous",
                a.getCreatedAt()
        );
    }

    private StatusHistoryResponse mapToHistoryResponse(ComplaintStatusHistory h) {
        return new StatusHistoryResponse(
                h.getId(),
                h.getPreviousStatus(),
                h.getNewStatus(),
                h.getChangedBy() != null ? h.getChangedBy().getFullName() : "System",
                h.getChangedBy() != null ? h.getChangedBy().getRole().name().replace("ROLE_", "") : "SYSTEM",
                h.getComment(),
                h.getCreatedAt()
        );
    }

    private CommentResponse mapToCommentResponse(ComplaintComment c) {
        return new CommentResponse(
                c.getId(),
                c.getAuthor().getFullName(),
                c.getAuthor().getRole().name().replace("ROLE_", ""),
                c.getComment(),
                c.getIsInternal(),
                c.getCreatedAt()
        );
    }
}
