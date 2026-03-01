//  Route list for main.ts registration. Todo-check validates against openapi.yaml.

import { ROUTES_PART1 } from './routesListPart1.ts';
import { ROUTES_PART2 } from './routesListPart2.ts';

export const ROUTES: { method: string; path: string }[] = [
  ...ROUTES_PART1,
  ...ROUTES_PART2,
];
