import { writeFileSync } from 'node:fs';
import { computeCurves } from '../src/engine/curves';

const out = new URL('../src/data/curves.json', import.meta.url);
writeFileSync(out, JSON.stringify(computeCurves()) + '\n');
console.log('wrote', out.pathname);
