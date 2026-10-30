const env = require('../config/env');

const SEVERITY_WEIGHTS = {
  LOW: 10,
  MEDIUM: 25,
  HIGH: 50,
  CRITICAL: 80,
};

class PriorityScoringService {
  constructor(options = {}) {
    this.ageWeightPerDay = options.ageWeightPerDay ?? env.PRIORITY_AGE_WEIGHT_PER_DAY ?? 2.0;
    this.maxAgeWeight = options.maxAgeWeight ?? env.PRIORITY_MAX_AGE_WEIGHT ?? 30.0;
  }

  calculatePriority(severity, category, createdAt) {
    const normSeverity = severity ? severity.toUpperCase() : 'LOW';
    const severityWeight = SEVERITY_WEIGHTS[normSeverity] || SEVERITY_WEIGHTS.LOW;

    const categoryWeight = category && typeof category.weight === 'number' ? category.weight : 15;
    const categoryName = category && category.name ? category.name : 'General';

    let ageWeight = 0.0;
    let daysOld = 0;

    if (createdAt) {
      const createdTime = new Date(createdAt).getTime();
      const nowTime = Date.now();
      const diffHours = (nowTime - createdTime) / (1000 * 60 * 60);
      daysOld = Math.max(0, Math.floor(diffHours / 24));
      ageWeight = Math.min(this.maxAgeWeight, daysOld * this.ageWeightPerDay);
    }

    const totalScore = severityWeight + categoryWeight + ageWeight;

    let level;
    if (normSeverity === 'CRITICAL' || totalScore >= 90.0) {
      level = 'CRITICAL';
    } else if (normSeverity === 'HIGH' || totalScore >= 65.0) {
      level = 'HIGH';
    } else if (normSeverity === 'MEDIUM' || totalScore >= 40.0) {
      level = 'MEDIUM';
    } else {
      level = 'LOW';
    }

    const roundedScore = Math.round(totalScore * 10) / 10;
    const explanation = `Score: ${roundedScore.toFixed(1)} [Severity (${normSeverity}): ${severityWeight} pts + Category (${categoryName}): ${categoryWeight} pts + Age (${daysOld} days): ${ageWeight.toFixed(1)} pts]`;

    return {
      score: roundedScore,
      level,
      explanation,
    };
  }
}

module.exports = new PriorityScoringService();
module.exports.PriorityScoringService = PriorityScoringService;
