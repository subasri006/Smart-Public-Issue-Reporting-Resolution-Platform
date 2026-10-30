const {
  DuplicateDetectionService,
  calculateHaversineDistance,
} = require('../src/services/duplicateDetectionService');

describe('DuplicateDetectionService Tests', () => {
  let duplicateService;

  beforeEach(() => {
    duplicateService = new DuplicateDetectionService();
  });

  test('Haversine distance calculation is accurate between known coordinates', () => {
    // Two points ~550 meters apart in Bangalore
    const lat1 = 12.9716;
    const lon1 = 77.5946;
    const lat2 = 12.975;
    const lon2 = 77.597;

    const distance = calculateHaversineDistance(lat1, lon1, lat2, lon2);
    expect(distance).toBeGreaterThan(400);
    expect(distance).toBeLessThan(650);
  });

  test('Similar title and category yields high similarity score', () => {
    const category = { id: '1', name: 'Road Damage' };

    const existing = {
      id: '10',
      referenceId: 'CF-2026-10-0002',
      title: 'Dangerous deep potholes near Sony World Signal',
      description: 'Huge crater causing accidents on main avenue',
      category: { _id: '1', name: 'Road Damage' },
      latitude: 12.9352,
      longitude: 77.6245,
    };

    const request = {
      title: 'Deep potholes near Sony World Signal intersection',
      description: 'Huge crater causing accidents on main avenue road',
      categoryId: '1',
      latitude: 12.9353,
      longitude: 77.6246, // ~15 meters apart
    };

    const similarity = duplicateService.calculateSimilarity(request, existing);
    expect(similarity).toBeGreaterThanOrEqual(60.0);
  });

  test('Completely unrelated issue yields low similarity score', () => {
    const catRoad = { _id: '1', name: 'Road Damage' };

    const existing = {
      id: '10',
      title: 'Dangerous deep potholes near Sony World Signal',
      description: 'Asphalt broken',
      category: catRoad,
      latitude: 12.9352,
      longitude: 77.6245,
    };

    const request = {
      title: 'Contaminated brown drinking water pipeline leak',
      description: 'No clean drinking water since morning in apartment',
      categoryId: '2',
      latitude: 13.05,
      longitude: 77.5, // miles away
    };

    const similarity = duplicateService.calculateSimilarity(request, existing);
    expect(similarity).toBeLessThan(20.0);
  });
});
