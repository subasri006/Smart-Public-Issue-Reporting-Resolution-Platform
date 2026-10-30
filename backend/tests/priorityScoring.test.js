const { PriorityScoringService } = require('../src/services/priorityScoringService');

describe('PriorityScoringService Tests', () => {
  let priorityService;

  beforeEach(() => {
    priorityService = new PriorityScoringService({
      ageWeightPerDay: 2.0,
      maxAgeWeight: 30.0,
    });
  });

  test('Critical severity should immediately receive CRITICAL priority level', () => {
    const category = { id: '1', name: 'Public Safety', code: 'SAFETY', weight: 30 };
    const now = new Date();

    const result = priorityService.calculatePriority('CRITICAL', category, now);

    // Critical weight (80) + Category weight (30) + Age (0) = 110.0
    expect(result.score).toBeCloseTo(110.0, 1);
    expect(result.level).toBe('CRITICAL');
    expect(result.explanation).toContain('CRITICAL');
  });

  test('Low severity fresh issue should receive LOW priority level', () => {
    const category = { id: '2', name: 'Other', code: 'OTHER', weight: 5 };
    const now = new Date();

    const result = priorityService.calculatePriority('LOW', category, now);

    // Low weight (10) + Category weight (5) + Age (0) = 15.0
    expect(result.score).toBeCloseTo(15.0, 1);
    expect(result.level).toBe('LOW');
  });

  test('Age weight increases priority score as days pass and caps at maxAgeWeight', () => {
    const category = { id: '3', name: 'Garbage', code: 'GARBAGE', weight: 15 };

    // 5 days old: 5 * 2 = 10 pts
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    const result5Days = priorityService.calculatePriority('MEDIUM', category, fiveDaysAgo);
    // Medium (25) + Category (15) + Age (10) = 50.0
    expect(result5Days.score).toBeCloseTo(50.0, 1);

    // 25 days old: 25 * 2 = 50 pts, but capped at 30.0
    const twentyFiveDaysAgo = new Date(Date.now() - 25 * 24 * 60 * 60 * 1000);
    const resultCapped = priorityService.calculatePriority('MEDIUM', category, twentyFiveDaysAgo);
    // Medium (25) + Category (15) + Capped Age (30) = 70.0
    expect(resultCapped.score).toBeCloseTo(70.0, 1);
    expect(resultCapped.level).toBe('HIGH');
  });
});
