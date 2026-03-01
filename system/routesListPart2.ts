//  Route list part 2: report, outlook, content/instruction, assessment, governance.

import { ROUTES_PART2A } from './routesListPart2A.ts';
import { ROUTES_PART2B1 } from './routesListPart2B1.ts';
import { ROUTES_PART2B2 } from './routesListPart2B2.ts';

export const ROUTES_PART2: {
  method: string;
  path: string;
}[] = [
  ...ROUTES_PART2A,
  ...ROUTES_PART2B1,
  ...ROUTES_PART2B2,
];
