// Basic utility functions to test Jest setup
export function add(a: number, b: number): number {
  return a + b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

export function isCreateLevel(levelId: string): boolean {
  return levelId === 'level_storyteller_0create';
}

export function isCommunityLevel(levelId: string): boolean {
  return levelId.includes('create') && levelId !== 'level_storyteller_0create';
}
