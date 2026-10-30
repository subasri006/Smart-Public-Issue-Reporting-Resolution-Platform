const { ALLOWED_TRANSITIONS } = require('../src/services/complaintService');

const canTransition = (current, next) => {
  if (current === next) return false;
  const allowed = ALLOWED_TRANSITIONS[current] || [];
  return allowed.includes(next);
};

describe('WorkflowTransition Tests', () => {
  test('SUBMITTED can only transition to ASSIGNED', () => {
    expect(canTransition('SUBMITTED', 'ASSIGNED')).toBe(true);
    expect(canTransition('SUBMITTED', 'IN_PROGRESS')).toBe(false);
    expect(canTransition('SUBMITTED', 'RESOLVED')).toBe(false);
    expect(canTransition('SUBMITTED', 'REOPENED')).toBe(false);
    expect(canTransition('SUBMITTED', 'SUBMITTED')).toBe(false);
  });

  test('ASSIGNED can transition to IN_PROGRESS or reassigned', () => {
    expect(canTransition('ASSIGNED', 'IN_PROGRESS')).toBe(true);
    expect(canTransition('ASSIGNED', 'RESOLVED')).toBe(false);
  });

  test('IN_PROGRESS can transition to RESOLVED', () => {
    expect(canTransition('IN_PROGRESS', 'RESOLVED')).toBe(true);
    expect(canTransition('IN_PROGRESS', 'SUBMITTED')).toBe(false);
    expect(canTransition('IN_PROGRESS', 'REOPENED')).toBe(false);
  });

  test('RESOLVED can only transition to REOPENED', () => {
    expect(canTransition('RESOLVED', 'REOPENED')).toBe(true);
    expect(canTransition('RESOLVED', 'IN_PROGRESS')).toBe(false);
    expect(canTransition('RESOLVED', 'SUBMITTED')).toBe(false);
  });

  test('REOPENED can transition to ASSIGNED or IN_PROGRESS', () => {
    expect(canTransition('REOPENED', 'ASSIGNED')).toBe(true);
    expect(canTransition('REOPENED', 'IN_PROGRESS')).toBe(true);
    expect(canTransition('REOPENED', 'RESOLVED')).toBe(false);
  });
});
