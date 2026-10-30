const { ComplaintSequence, Complaint } = require('../models');

class ReferenceIdGeneratorService {
  /**
   * Generates the next concurrency-safe, unique reference ID for a given date or today.
   * Format: CF-YYYY-MM-XXXX (e.g. CF-2026-10-0001)
   *
   * @param {Date} [date] Optional date for deterministic generation or testing
   * @returns {Promise<string>} Unique complaint reference ID
   */
  async generateNextReferenceId(date = new Date()) {
    const targetDate = date instanceof Date ? date : new Date(date);
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const sequenceKey = `CF-${year}-${month}`;

    let nextVal = await this.getNextValueForSequenceKey(sequenceKey);
    let candidateRefId = this.formatReferenceId(sequenceKey, nextVal);

    // Defensive loop against any out-of-band collision
    let attempts = 0;
    const maxAttempts = 1000;
    while ((await Complaint.exists({ referenceId: candidateRefId })) && attempts++ < maxAttempts) {
      nextVal = await this.getNextValueForSequenceKey(sequenceKey);
      candidateRefId = this.formatReferenceId(sequenceKey, nextVal);
    }

    return candidateRefId;
  }

  formatReferenceId(prefix, sequenceNumber) {
    const padded = String(sequenceNumber).padStart(4, '0');
    return `${prefix}-${padded}`;
  }

  async getNextValueForSequenceKey(sequenceKey) {
    // Atomic upsert with $inc guarantees thread-safety and cluster-safety
    let seq = await ComplaintSequence.findOneAndUpdate(
      { sequenceKey },
      { $inc: { currentValue: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // If this sequence was newly created (currentValue is 1), verify whether existing complaints
    // already exist with this prefix so we don't collide with historical seed data
    if (seq.currentValue === 1) {
      const maxExisting = await this.findMaxExistingSequenceNumber(sequenceKey);
      if (maxExisting >= 1) {
        seq = await ComplaintSequence.findOneAndUpdate(
          { sequenceKey },
          { $set: { currentValue: maxExisting + 1 } },
          { new: true }
        );
      }
    }

    return seq.currentValue;
  }

  async findMaxExistingSequenceNumber(prefix) {
    const regex = new RegExp(`^${prefix}-\\d+$`);
    const complaints = await Complaint.find({ referenceId: { $regex: regex } })
      .select('referenceId')
      .lean();

    let max = 0;
    for (const c of complaints) {
      if (!c.referenceId) continue;
      const parts = c.referenceId.split('-');
      const numStr = parts[parts.length - 1];
      const val = parseInt(numStr, 10);
      if (!isNaN(val) && val > max) {
        max = val;
      }
    }
    return max;
  }
}

module.exports = new ReferenceIdGeneratorService();
module.exports.ReferenceIdGeneratorService = ReferenceIdGeneratorService;
