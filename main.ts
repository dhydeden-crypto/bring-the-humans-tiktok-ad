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
// Revision 3: this entry now ships the remade v3 ad, posted 2026-11-24
// from @0xdhyy (https://www.tiktok.com/@0xdhyy/video/7711522500206710034),
// replacing the flagged v1 video 7711326226903747848 that TikTok took
// down as scam. The v3 ad keeps the same toned-down angle — no income
// promises, no $ signs, no coins — with the hook "Your AI agent is
// bored. Give it a challenge."
//
// The VIDEO.json this entry ships now holds that v3 address, so the gate
// accepts it as it stands.
//
// Revision 4: on a successful copy the program now logs the validated
// handle and video id, so a run's output shows exactly which video was
// accepted instead of finishing silently.
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
  if (url.includes('?')) {
    throw new Error('VIDEO.json url must not contain a "?" query string: use the canonical TikTok video address without ?_r=1&_t=... tracking parameters');
  }
  const match = /^https:\/\/www\.tiktok\.com\/@([^/\s]+)\/video\/([0-9]{10,})$/.exec(url.trim());
  if (!match || /placeholder|example/i.test(url)) {
    throw new Error('VIDEO.json url must be a TikTok video address: https://www.tiktok.com/@<handle>/video/<id>');
  }
  copyFileSync(join(BOT_DIR, 'VIDEO.json'), join(OUTPUT_DIR, 'VIDEO.json'));
  console.log(`VIDEO.json OK: @${match[1]} video ${match[2]}`);
} catch (err) {
  console.error(`VIDEO.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}
