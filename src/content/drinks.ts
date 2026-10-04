import type { Container, DrinkType } from '@/domain/types';

export const DEFAULT_DRINK_TYPES: DrinkType[] = [
  { id: 'water', name: 'Water', icon: '💧', hydrationFactor: 1, caffeinated: false },
  { id: 'tea', name: 'Tea', icon: '🍵', hydrationFactor: 0.95, caffeinated: true },
  { id: 'coffee', name: 'Coffee', icon: '☕', hydrationFactor: 0.9, caffeinated: true },
  { id: 'juice', name: 'Juice', icon: '🧃', hydrationFactor: 0.9, caffeinated: false },
  { id: 'milk', name: 'Milk', icon: '🥛', hydrationFactor: 1, caffeinated: false },
  { id: 'sports', name: 'Sports drink', icon: '🥤', hydrationFactor: 1, caffeinated: false },
  { id: 'soda', name: 'Soda', icon: '🫧', hydrationFactor: 0.85, caffeinated: true },
  { id: 'other', name: 'Other', icon: '✨', hydrationFactor: 0.9, caffeinated: false },
];

export const DEFAULT_CONTAINERS: Container[] = [
  { id: 'glass', name: 'Glass', volumeMl: 250, favorite: true },
  { id: 'mug', name: 'Mug', volumeMl: 350, favorite: true },
  { id: 'bottle', name: 'Bottle', volumeMl: 500, favorite: true },
  { id: 'large-bottle', name: 'Large bottle', volumeMl: 750, favorite: false },
  { id: 'litre', name: 'Litre', volumeMl: 1000, favorite: false },
];

export const MAX_FREE_CUSTOM_DRINKS = 2; // reserved for the premium tier (Phase 3)
