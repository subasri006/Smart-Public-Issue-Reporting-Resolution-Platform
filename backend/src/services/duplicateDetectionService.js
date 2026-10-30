const { Complaint } = require('../models');
const env = require('../config/env');

const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'a', 'an', 'in', 'and', 'or', 'of', 'to',
  'for', 'with', 'near', 'there', 'this', 'that', 'it', 'my', 'our', 'area',
  'road', 'street', 'issue', 'problem', 'broken', 'very', 'please', 'help',
]);

class DuplicateDetectionService {
  constructor(options = {}) {
    this.windowDays = options.windowDays ?? env.DUPLICATE_WINDOW_DAYS ?? 30;
    this.thresholdPercentage = options.thresholdPercentage ?? env.DUPLICATE_THRESHOLD_PERCENTAGE ?? 45.0;
  }

  static calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const toRad = (deg) => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  tokenize(text) {
    if (!text || typeof text !== 'string') return new Set();
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
    return new Set(words);
  }

  calculateJaccardSimilarity(text1, text2) {
    const tokens1 = this.tokenize(text1);
    const tokens2 = this.tokenize(text2);

    if (tokens1.size === 0 || tokens2.size === 0) {
      return 0.0;
    }

    let intersectionCount = 0;
    for (const token of tokens1) {
      if (tokens2.has(token)) {
        intersectionCount++;
      }
    }

    const unionCount = new Set([...tokens1, ...tokens2]).size;
    return unionCount > 0 ? intersectionCount / unionCount : 0.0;
  }

  calculateGeoProximityScore(distanceMeters) {
    if (distanceMeters <= 50.0) return 1.0;
    if (distanceMeters <= 150.0) return 0.85;
    if (distanceMeters <= 300.0) return 0.60;
    if (distanceMeters <= 600.0) return 0.30;
    return 0.0;
  }

  calculateSimilarity(request, existing) {
    const reqText = `${request.title || ''} ${request.description || ''}`;
    const existText = `${existing.title || ''} ${existing.description || ''}`;

    const textSim = this.calculateJaccardSimilarity(reqText, existText);

    let categoryMatch = 0.0;
    const reqCatId = request.categoryId ? request.categoryId.toString() : null;
    const existCatId = existing.category
      ? (existing.category._id || existing.category.id || existing.category).toString()
      : null;

    if (reqCatId && existCatId && reqCatId === existCatId) {
      categoryMatch = 1.0;
    }

    const hasCoords =
      request.latitude != null &&
      request.longitude != null &&
      existing.latitude != null &&
      existing.longitude != null;

    if (hasCoords) {
      const distance = DuplicateDetectionService.calculateHaversineDistance(
        Number(request.latitude),
        Number(request.longitude),
        Number(existing.latitude),
        Number(existing.longitude)
      );
      const geoScore = this.calculateGeoProximityScore(distance);

      // 50% text, 30% geo, 20% category
      return (textSim * 0.50 + geoScore * 0.30 + categoryMatch * 0.20) * 100.0;
    } else {
      // 70% text, 30% category
      return (textSim * 0.70 + categoryMatch * 0.30) * 100.0;
    }
  }

  async checkDuplicate(request) {
    if (!request.title || !request.title.trim()) {
      return {
        isPotentialDuplicate: false,
        highestScore: 0.0,
        explanation: 'No title provided for comparison',
        matches: [],
      };
    }

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - this.windowDays);

    const candidates = await Complaint.find({
      createdAt: { $gte: sinceDate },
    })
      .populate('category', 'name code')
      .lean();

    const matches = [];
    let highestScore = 0.0;

    for (const existing of candidates) {
      const similarity = this.calculateSimilarity(request, existing);

      if (similarity >= this.thresholdPercentage) {
        let distance = null;
        if (
          request.latitude != null &&
          request.longitude != null &&
          existing.latitude != null &&
          existing.longitude != null
        ) {
          distance = DuplicateDetectionService.calculateHaversineDistance(
            Number(request.latitude),
            Number(request.longitude),
            Number(existing.latitude),
            Number(existing.longitude)
          );
        }

        const match = {
          id: existing._id.toString(),
          referenceId: existing.referenceId,
          title: existing.title,
          categoryName: existing.category ? existing.category.name : 'Unknown',
          severity: existing.severity,
          status: existing.status,
          similarityScore: Math.round(similarity * 10) / 10,
          distanceMeters: distance != null ? Math.round(distance * 10) / 10 : null,
          address: existing.address,
          createdAt: existing.createdAt,
        };

        matches.push(match);

        if (similarity > highestScore) {
          highestScore = similarity;
        }
      }
    }

    matches.sort((a, b) => b.similarityScore - a.similarityScore);

    const isPotentialDuplicate = matches.length > 0;
    const explanation = isPotentialDuplicate
      ? `Warning: ${matches.length} potentially related issue(s) found with similar description or location within the last ${this.windowDays} days. Review existing reports to avoid duplicates, or proceed submitting if this is a distinct issue.`
      : 'No matching duplicates detected within the recent reporting window.';

    return {
      isPotentialDuplicate,
      highestScore: Math.round(highestScore * 10) / 10,
      explanation,
      matches,
    };
  }
}

module.exports = new DuplicateDetectionService();
module.exports.DuplicateDetectionService = DuplicateDetectionService;
module.exports.calculateHaversineDistance = DuplicateDetectionService.calculateHaversineDistance;
