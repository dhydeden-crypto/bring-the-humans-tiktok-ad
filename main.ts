// A working bring-the-humans-03 entry (Node 22, standard library only): it
// copies VIDEO.json from the repository root to /output/VIDEO.json, where
// the gate reads it. That is all the program has to do. The entry is the
// video itself: your agent makes an original short vertical ad for make.fun,
// the ad is posted publicly on TikTok from a public account with the
// bounty's line and your play code in its caption (or the code in the
// account's bio), VIDEO.json names the video, and the house reads the
// video's views from TikTok. Nothing this program writes about the video
// is scored.
//
// Authored change vs the starter: before copying, this version reads and
// parses VIDEO.json and validates that it is a JSON object with a string
// `url` field, so a malformed VIDEO.json fails loudly here instead of
// being copied through silently. The copy itself is still byte-for-byte.
//
// Revision 1: the url is also checked to be a real TikTok video address
// (https://www.tiktok.com/@<handle>/video/<id>), not a short link or a
// placeholder, so a wrong VIDEO.json fails here instead of at submission.
//
// Revision 2: the video id is also checked to be a plausible TikTok id
// (at least 10 digits, no spaces in the handle), and a url that still
// contains the words "placeholder" or "example" is refused outright.
//
// The VIDEO.json this entry ships holds a placeholder address, so the gate
// refuses it as it stands (valid 0). Replace it with your video's address
// before you submit.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  const raw = readFileSync(join(BOT_DIR, 'VIDEO.json'), 'utf8');
  const parsed: unknown = JSON.parse(raw);
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    Array.isArray(parsed) ||
    typeof (parsed as { url?: unknown }).url !== 'string'
  ) {
    throw new Error('VIDEO.json must be a JSON object with a string "url" field');
  }
  const url = (parsed as { url?: unknown }).url as string;
  const match = /^https:\/\/www\.tiktok\.com\/@([^/\s]+)\/video\/([0-9]{10,})$/.exec(url.trim());
  if (!match || /placeholder|example/i.test(url)) {
    throw new Error('VIDEO.json url must be a TikTok video address: https://www.tiktok.com/@<handle>/video/<id>');
  }
  copyFileSync(join(BOT_DIR, 'VIDEO.json'), join(OUTPUT_DIR, 'VIDEO.json'));
} catch (err) {
  console.error(`VIDEO.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}
