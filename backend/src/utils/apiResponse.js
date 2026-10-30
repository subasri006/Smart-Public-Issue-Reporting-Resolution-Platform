/**
 * Standard CivicFix API Response Wrappers
 * Maintains 1:1 compatibility with Spring Boot ApiResponse<T> and PagedResponse<T>
 */

class ApiResponse {
  static ok(messageOrData, data) {
    if (data !== undefined) {
      return {
        success: true,
        message: messageOrData,
        data: data,
        timestamp: new Date().toISOString(),
      };
    }
    return {
      success: true,
      message: 'Operation successful',
      data: messageOrData,
      timestamp: new Date().toISOString(),
    };
  }

  static error(message, data = null) {
    return {
      success: false,
      message: message || 'An unexpected error occurred',
      data: data,
      timestamp: new Date().toISOString(),
    };
  }
}

class PagedResponse {
  static create(content, pageNumber, pageSize, totalElements) {
    const totalPages = pageSize > 0 ? Math.ceil(totalElements / pageSize) : 0;
    const last = pageNumber >= totalPages - 1 || totalPages === 0;

    return {
      content: content || [],
      pageNumber: Number(pageNumber),
      pageSize: Number(pageSize),
      totalElements: Number(totalElements),
      totalPages: Number(totalPages),
      last: Boolean(last),
    };
  }
}

module.exports = {
  ApiResponse,
  PagedResponse,
};
