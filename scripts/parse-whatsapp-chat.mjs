import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const INPUT = join(ROOT, 'src/data/whatsapp counting _chat.txt');
const OUTPUT = join(ROOT, 'src/data/cigarettes.json');
const SOURCE_LABEL = 'src/data/whatsapp counting _chat.txt';

const OWN_SENDER = '‘';
const SUSPICIOUS_THRESHOLD = 10;

const HEADER_RE =
  /^‎?\[(\d{1,2})\/(\d{1,2})\/(\d{2,4}),\s+(\d{1,2}):(\d{2}):(\d{2})\s+(AM|PM)\]\s+([^:]+?):\s?(.*)$/i;

const NUM_BEFORE_RE = /(\d+(?:\.\d+)?|\.\d+)[ \t]*cig\w*/i;
const NUM_AFTER_RE = /cig\w*[ \t]+(\d+(?:\.\d+)?|\.\d+)/i;

function pad(n) {
  return String(n).padStart(2, '0');
}

function to24h(hour, ampm) {
  const h = Number(hour);
  const upper = ampm.toUpperCase();
  if (upper === 'AM') return h === 12 ? 0 : h;
  return h === 12 ? 12 : h + 12;
}

function parseMessages(text) {
  const lines = text.split(/\r?\n/);
  const messages = [];
  let cur = null;
  for (const line of lines) {
    const m = HEADER_RE.exec(line);
    if (m) {
      if (cur) messages.push(cur);
      const [, dd, mm, yy, hh, mi, ss, ampm, sender, body] = m;
      const year = 2000 + Number(yy);
      const hour24 = to24h(hh, ampm);
      cur = {
        date: `${year}-${pad(mm)}-${pad(dd)}`,
        time: `${pad(hour24)}:${pad(mi)}:${pad(ss)}`,
        sender: sender.trim(),
        body,
      };
    } else if (cur) {
      cur.body += '\n' + line;
    }
  }
  if (cur) messages.push(cur);
  return messages;
}

function extractCount(body) {
  const before = NUM_BEFORE_RE.exec(body);
  const after = NUM_AFTER_RE.exec(body);
  if (before && after) {
    return before.index <= after.index ? Number(before[1]) : Number(after[1]);
  }
  if (before) return Number(before[1]);
  if (after) return Number(after[1]);
  return null;
}

async function main() {
  const text = await readFile(INPUT, 'utf8');
  const messages = parseMessages(text);

  const entries = [];
  let totalClean = 0;
  let suspiciousCount = 0;

  for (const msg of messages) {
    if (msg.sender !== OWN_SENDER) continue;
    if (!/cig/i.test(msg.body)) continue;
    const count = extractCount(msg.body);
    if (count === null) continue;

    const suspicious = count > SUSPICIOUS_THRESHOLD;
    if (suspicious) suspiciousCount += 1;
    else totalClean += count;

    entries.push({
      datetime: `${msg.date}T${msg.time}`,
      date: msg.date,
      time: msg.time,
      count,
      raw: msg.body.trim(),
      suspicious,
    });
  }

  const output = {
    generated_at: new Date().toISOString(),
    source: SOURCE_LABEL,
    total_entries: entries.length,
    total_cigs_clean: Math.round(totalClean * 100) / 100,
    suspicious_entries: suspiciousCount,
    entries,
  };

  await writeFile(OUTPUT, JSON.stringify(output, null, 2), 'utf8');
  console.log(
    `Wrote ${entries.length} entries (${suspiciousCount} suspicious, ${output.total_cigs_clean} clean total) to ${OUTPUT}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
