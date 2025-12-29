import { add, multiply, isCreateLevel, isCommunityLevel } from '../utils/testHelpers';

describe('Basic Math Functions', () => {
  test('should add two numbers correctly', () => {
    expect(add(2, 3)).toBe(5);
    expect(add(-1, 1)).toBe(0);
    expect(add(0, 0)).toBe(0);
  });

  test('should multiply two numbers correctly', () => {
    expect(multiply(2, 3)).toBe(6);
    expect(multiply(-2, 3)).toBe(-6);
    expect(multiply(0, 5)).toBe(0);
  });
});

describe('Level Helper Functions', () => {
  test('should correctly identify create level', () => {
    expect(isCreateLevel('level_storyteller_0create')).toBe(true);
    expect(isCreateLevel('level_storyteller_1')).toBe(false);
    expect(isCreateLevel('community_create_1')).toBe(false);
  });

  test('should correctly identify community levels', () => {
    expect(isCommunityLevel('community_create_1')).toBe(true);
    expect(isCommunityLevel('user_create_123')).toBe(true);
    expect(isCommunityLevel('level_storyteller_0create')).toBe(false);
    expect(isCommunityLevel('level_storyteller_1')).toBe(false);
  });
});
