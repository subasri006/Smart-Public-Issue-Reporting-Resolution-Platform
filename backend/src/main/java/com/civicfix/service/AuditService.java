package com.civicfix.service;

import com.civicfix.dto.AuditLogResponse;
import com.civicfix.dto.PagedResponse;
import com.civicfix.entity.AuditLog;
import com.civicfix.entity.User;
import com.civicfix.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void log(String action, String entityName, Long entityId, User performedBy, String details) {
        String ip = getClientIp();
        AuditLog auditLog = new AuditLog(action, entityName, entityId, performedBy, details, ip);
        auditLogRepository.save(auditLog);
    }

    @Transactional(readOnly = true)
    public PagedResponse<AuditLogResponse> getLogs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<AuditLog> logPage = auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);

        List<AuditLogResponse> content = logPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                logPage.getNumber(),
                logPage.getSize(),
                logPage.getTotalElements(),
                logPage.getTotalPages(),
                logPage.isLast()
        );
    }

    private AuditLogResponse mapToResponse(AuditLog log) {
        return new AuditLogResponse(
                log.getId(),
                log.getAction(),
                log.getEntityName(),
                log.getEntityId(),
                log.getPerformedBy() != null ? log.getPerformedBy().getFullName() : "System",
                log.getDetails(),
                log.getIpAddress(),
                log.getCreatedAt()
        );
    }

    private String getClientIp() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String xForwarded = request.getHeader("X-Forwarded-For");
                if (xForwarded != null && !xForwarded.isEmpty()) {
                    return xForwarded.split(",")[0].trim();
                }
                return request.getRemoteAddr();
            }
        } catch (Exception ignored) {
        }
        return "127.0.0.1";
    }
}
