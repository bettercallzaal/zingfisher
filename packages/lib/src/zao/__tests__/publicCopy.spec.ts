import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

// The ZAO pages are public. Decisions are recorded in a private log and cited by item number in
// code comments; those citations must not reach copy a visitor reads (the live join page showed
// "Grill 2026-09-22, item 23" and "Item 31" on 2026-10-13).
const repoRoot = resolve(__dirname, '../../../../..');

const citation = /\bgrill\b|\bitem\s*\d+|\bruling\s+Q\d+/i;

function stripComments(source: string) {
  return source
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '') // JSX comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // block comments
    .replace(/(^|[^:'"`])\/\/.*$/gm, '$1'); // line comments, leaving URLs alone
}

function publicCopyFiles() {
  const zaoComponents = join(repoRoot, 'apps/webapp/components/zao');
  const memberPages = join(repoRoot, 'apps/webapp/pages/member');
  return [
    join(repoRoot, 'packages/config/src/zao.ts'),
    join(repoRoot, 'apps/webapp/pages/learn.tsx'),
    join(repoRoot, 'apps/webapp/pages/join.tsx'),
    ...readdirSync(zaoComponents)
      .filter((f) => f.endsWith('.tsx'))
      .map((f) => join(zaoComponents, f)),
    ...readdirSync(memberPages)
      .filter((f) => f.endsWith('.tsx'))
      .map((f) => join(memberPages, f))
  ];
}

describe('ZAO public copy', () => {
  it('should find the pages it guards', () => {
    const files = publicCopyFiles();
    expect(files.length).toBeGreaterThanOrEqual(6);
    for (const file of files) {
      expect(readFileSync(file, 'utf8').length).toBeGreaterThan(0);
    }
  });

  it('should recognise a citation, and ignore one inside a comment', () => {
    expect(citation.test(stripComments("label='Item 31'"))).toBe(true);
    expect(citation.test(stripComments("quoteBy: 'Zaal (Grill 2026-09-22, item 23)'"))).toBe(true);
    expect(citation.test(stripComments('const a = 1; // item 29: knowable community'))).toBe(false);
    expect(citation.test(stripComments('/** decided in grill 2026-09-22 item 6 */ const a = 1;'))).toBe(false);
  });

  it('should carry no private decision-log citations outside comments', () => {
    const offenders: string[] = [];
    for (const file of publicCopyFiles()) {
      stripComments(readFileSync(file, 'utf8'))
        .split('\n')
        .forEach((line) => {
          if (citation.test(line)) {
            offenders.push(`${file.replace(`${repoRoot}/`, '')}: ${line.trim()}`);
          }
        });
    }
    expect(offenders).toEqual([]);
  });
});
