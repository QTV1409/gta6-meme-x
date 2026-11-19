// gta6-meme-x-01 entry (Node 22, standard library only).
//
// The entry is the X post itself: an AI agent made a GTA 6 meme, it is
// posted on X from a public account with make.fun (a link or written out)
// and/or a tag of @makefunai and the entrant's play code in its text, and
// POST.json at this repository's root names the post's address. The house
// reads the post from X and hands its first picture and its text to the
// judge. All this program has to do is hand POST.json to the grader.
//
// It copies POST.json from the repository root to /output/POST.json, where
// the gate reads it. It reads no other file, uses no network and no clock,
// and writes the same bytes on every run.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// An X post's address, on either host X still serves posts under.
function isXPostUrl(url: string): boolean {
  return (
    url.startsWith('https://x.com/') || url.startsWith('https://twitter.com/')
  );
}

const source = join(BOT_DIR, 'POST.json');

// The gate only accepts a JSON object naming an X post's address, so fail
// loudly here instead of handing it a placeholder it would refuse.
let post: unknown;
try {
  post = JSON.parse(readFileSync(source, 'utf8'));
} catch (err) {
  console.error(`POST.json could not be read from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}
if (
  typeof post !== 'object' ||
  post === null ||
  typeof (post as { url?: unknown }).url !== 'string' ||
  !isXPostUrl((post as { url: string }).url)
) {
  console.error('POST.json must be {"url": "https://x.com/<handle>/status/<id>"}');
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
copyFileSync(source, join(OUTPUT_DIR, 'POST.json'));
