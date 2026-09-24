// ============================================
// Migrate Tumblr → Eleventy markdown
// Reads RSS feed, downloads images, generates
// markdown files with frontmatter
// ============================================

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const UPLOADS_DIR = path.join(ROOT, 'src', 'assets', 'uploads', 'tumblr');
const CONTENT_DIR = path.join(ROOT, 'src', 'content');

const RSS_URL = 'https://senjadisoreitu.tumblr.com/rss';

// ============================================
// Helpers
// ============================================

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    fs.mkdir(path.dirname(dest), { recursive: true }, (err) => {
      if (err) return reject(err);
      const file = fs.createWriteStream(dest);
      https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0)' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          return downloadFile(res.headers.location, dest).then(resolve, reject);
        }
        if (res.statusCode !== 200) {
          file.close();
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
      }).on('error', (err) => {
        try { fs.unlinkSync(dest); } catch (_) {}
        reject(err);
      });
    });
  });
}

function decodeEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&hellip;/g, '…')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&ldquo;/g, '\u201c')
    .replace(/&rdquo;/g, '\u201d')
    .replace(/&copy;/g, '©')
    .replace(/&amp;hellip;/g, '…');
}

function htmlToMarkdown(html) {
  if (!html) return '';
  let text = html;

  // Remove figure/image tags but keep alt text? Actually keep them as markdown images
  // First, extract image src from <img> tags
  const imgUrls = [];
  text = text.replace(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi, (m, src) => {
    imgUrls.push(src);
    return '';
  });

  // Extract <figure> wrappers — they just contain <img>
  text = text.replace(/<\/?figure[^>]*>/gi, '');
  text = text.replace(/<\/?hr\s*\/?>/gi, '\n\n---\n\n');

  // Convert <p>...</p>
  text = text.replace(/<p[^>]*>/gi, '\n\n');
  text = text.replace(/<\/p>/gi, '\n\n');

  // Convert <br>
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // Convert <strong>/<b>
  text = text.replace(/<(strong|b)[^>]*>(.*?)<\/\1>/gi, '**$2**');

  // Convert <em>/<i>
  text = text.replace(/<(em|i)[^>]*>(.*?)<\/\1>/gi, '*$2*');

  // Convert <strike>/<s>
  text = text.replace(/<(strike|s|del)[^>]*>(.*?)<\/\1>/gi, '~~$2~~');

  // Convert <blockquote>
  text = text.replace(/<blockquote[^>]*>/gi, '\n\n> ');
  text = text.replace(/<\/blockquote>/gi, '\n\n');
  text = text.replace(/(^|\n)> /g, '\n> ');

  // Convert headings (h3 from MsoNormal etc.)
  text = text.replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n\n### $1\n\n');

  // Strip remaining tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode entities
  text = decodeEntities(text);

  // Collapse multiple blank lines
  text = text.replace(/\n{3,}/g, '\n\n').trim();

  // Re-insert images as markdown at the start
  if (imgUrls.length) {
    const imgMd = imgUrls.map((u, i) => {
      // Use the URL as-is; later we'll replace with local path
      return `![Gambar ${i + 1}](${u})`;
    }).join('\n\n');
    text = imgMd + '\n\n' + text;
  }

  return text;
}

function parseRss(xml) {
  const items = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRe.exec(xml)) !== null) {
    const block = match[1];

    const get = (tag) => {
      const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
      const m = block.match(re);
      return m ? decodeEntities(m[1].trim()) : '';
    };

    items.push({
      title: get('title').replace(/&#x27;/g, "'").replace(/&amp;/g, '&'),
      description: get('description'),
      link: get('link'),
      pubDate: get('pubDate'),
      category: get('category'),
    });
  }
  return items;
}

function parseDate(str) {
  // Example: "Fri, 05 Apr 2019 02:50:02 -0400"
  const d = new Date(str);
  if (isNaN(d)) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

// Heuristic categorization based on content keywords
function categorize(title, content) {
  const text = (title + ' ' + content).toLowerCase();
  // Travel keywords
  const travelWords = ['perjalanan', 'negeri', 'bumi sunda', 'tanah', 'merantau', 'kota', 'kampung', 'desa', 'pantai', 'gunung', 'laut', 'stasiun', 'kereta', 'kota seberang', 'merindu', 'labuhan', 'pesisir', 'dermaga'];
  // Life keywords (family, love, loss, time)
  const lifeWords = ['ibu', 'ayah', 'rumah', 'keluarga', 'cinta', 'hati', 'rindu', 'pilu', 'waktu', 'kisah', 'kenangan', 'pertemuan', 'perpisahan', 'kehilangan', 'mama', 'bapak', 'istri', 'suami', 'kekasih', 'pacar'];
  // Personal writing keywords (poetry, reflection, abstract)
  const personalWords = ['sajak', 'puisi', 'cahya', 'jiwa', 'labuhan', 'warna', 'rindu', 'hembusan', 'langit', 'bumi', 'mentari', 'senja', 'pelangi', 'ombak', 'samudra', 'bintang', 'bulan'];

  let travelScore = 0, lifeScore = 0, personalScore = 0;
  travelWords.forEach((w) => { if (text.includes(w)) travelScore++; });
  lifeWords.forEach((w) => { if (text.includes(w)) lifeScore++; });
  personalWords.forEach((w) => { if (text.includes(w)) personalScore++; });

  // Specific overrides
  if (text.includes('perjalanan') && text.includes('kehidupan')) travelScore += 2;
  if (text.includes('tanah karo')) travelScore += 3;
  if (text.includes('bumi sunda')) travelScore += 2;
  if (text.includes('kampung') || text.includes('pulang kampung') || text.includes('kota seberang')) travelScore += 2;
  if (text.includes('ibuk') || text.includes('ayah') || text.includes('ibu')) lifeScore += 3;
  if (text.includes('cinta') || text.includes('kekasih') || text.includes('pacar')) lifeScore += 2;
  if (text.includes('tuhan') || text.includes('doa')) lifeScore += 1;
  if (text.includes('sajak') || text.includes('puisi')) personalScore += 2;

  if (travelScore >= lifeScore && travelScore >= personalScore) return 'perjalanan';
  if (lifeScore >= personalScore) return 'kehidupan';
  return 'pribadi';
}

function subcategorize(category, title, content) {
  const text = (title + ' ' + content).toLowerCase();
  if (category === 'perjalanan') {
    if (text.includes('laut') || text.includes('pantai') || text.includes('pulau') || text.includes('samudra')) return 'travel-pulau';
    if (text.includes('kota') || text.includes('jakarta') || text.includes('sunda')) return 'travel-kota';
    if (text.includes('negeri') || text.includes('tanah karo') || text.includes('merantau')) return 'travel-dalam';
    return 'travel-dalam';
  }
  if (category === 'kehidupan') {
    if (text.includes('ibu') || text.includes('ayah') || text.includes('keluarga') || text.includes('rumah')) return 'life-keluarga';
    if (text.includes('cinta') || text.includes('kekasih') || text.includes('pacar') || text.includes('samudra')) return 'life-cinta';
    if (text.includes('karier') || text.includes('kerja') || text.includes('belajar')) return 'life-karier';
    return 'life-refleksi';
  }
  // pribadi
  if (text.includes('surat')) return 'write-surat';
  if (text.includes('esai') || text.includes('pemikiran')) return 'write-esai';
  if (text.includes('puisi') || text.includes('sajak')) return 'write-puisi';
  return 'write-catatan';
}

function extractExcerpt(content, max = 200) {
  const cleaned = content
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // remove images
    .replace(/[*_~`>]+/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (cleaned.length <= max) return cleaned;
  return cleaned.slice(0, max).replace(/\s+\S*$/, '') + '...';
}

function extractCoverQuote(content) {
  const lines = content
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .split('\n')
    .map((l) => l.trim().replace(/^> /, '').replace(/[*_~`]+/g, ''))
    .filter((l) => l.length > 20 && l.length < 200);
  if (lines.length === 0) return 'Sebuah catatan dari masa lalu.';
  return lines[0].slice(0, 180);
}

// ============================================
// Main migration
// ============================================

async function main() {
  console.log('📥 Fetching RSS feed...');
  const xml = await fetchUrl(RSS_URL);
  const rssXml = xml.toString('utf-8');
  console.log(`✓ RSS fetched (${rssXml.length} bytes)`);

  const items = parseRss(rssXml);
  console.log(`✓ Parsed ${items.length} items`);

  // Setup dirs
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  ['perjalanan', 'kehidupan', 'pribadi'].forEach((c) => {
    fs.mkdirSync(path.join(CONTENT_DIR, c), { recursive: true });
  });

  const imageMap = {}; // remote URL -> local path
  let downloaded = 0;
  let failed = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    console.log(`\n[${i + 1}/${items.length}] ${item.title}`);

    // Convert HTML to markdown
    const content = htmlToMarkdown(item.description);

    // Extract image URLs and download them
    const imgRegex = /https?:\/\/[^)\s]+\.(?:jpg|jpeg|png|gif|webp)/gi;
    const imgUrls = [...new Set(content.match(imgRegex) || [])];

    let localContent = content;
    for (const url of imgUrls) {
      let localPath = imageMap[url];
      if (!localPath) {
        const ext = path.extname(url).split('?')[0] || '.jpg';
        const filename = `tumblr-${i + 1}-${downloaded + 1}${ext}`;
        const dest = path.join(UPLOADS_DIR, filename);
        try {
          await downloadFile(url, dest);
          localPath = `/assets/uploads/tumblr/${filename}`;
          imageMap[url] = localPath;
          downloaded++;
          console.log(`  ✓ Downloaded ${filename}`);
        } catch (err) {
          failed++;
          console.log(`  ✗ Failed to download ${url}: ${err.message}`);
          continue;
        }
      }
      // Replace remote URL with local path in content
      localContent = localContent.split(url).join(localPath);
    }

    // Categorize
    const category = categorize(item.title, content);
    const subcat = subcategorize(category, item.title, content);
    const date = parseDate(item.pubDate);
    const excerpt = extractExcerpt(content);
    const coverQuote = extractCoverQuote(content);
    const slug = slugify(item.title) || `post-${i + 1}`;

    // Build frontmatter
    // First image URL for cover (if any)
    const firstImageMatch = localContent.match(/!\[[^\]]*\]\(([^)]+)\)/);
    const coverImage = firstImageMatch ? firstImageMatch[1] : '';

    const fm = `---
layout: layouts/article.njk
title: "${item.title.replace(/"/g, '\\"')}"
date: ${date}
category: ${category}
subcategory: ${subcat}
excerpt: ${excerpt.replace(/"/g, '\\"')}
coverLabel: "${category === 'perjalanan' ? 'Tulisan Lama' : (category === 'kehidupan' ? 'Refleksi' : 'Puisi')}"
coverImage: "${coverImage}"
coverQuote: "${coverQuote.replace(/"/g, '\\"')}"
coverHeroQuote: "${coverQuote.replace(/"/g, '\\"')}"
readingTime: ${Math.max(2, Math.round(content.split(/\s+/).length / 200))}
tags: [Tumblr, ${category === 'perjalanan' ? 'Perjalanan' : (category === 'kehidupan' ? 'Kehidupan' : 'Tulisan')}, Arsip]
tumblrUrl: "${item.link}"
---

> **Catatan:** Tulisan ini dipindahkan dari blog Tumblr lama [@senjadisoreitu](https://senjadisoreitu.tumblr.com/) — ditulis ${date}.

${localContent}
`;

    const dest = path.join(CONTENT_DIR, category, `${slug}.md`);
    fs.writeFileSync(dest, fm, 'utf-8');
    console.log(`  ✓ Saved to ${category}/${slug}.md`);
  }

  console.log('\n══════════════════════════════════════');
  console.log(`✅ Migration complete!`);
  console.log(`   Posts migrated: ${items.length}`);
  console.log(`   Images downloaded: ${downloaded}`);
  console.log(`   Images failed: ${failed}`);
  console.log(`   Output: ${CONTENT_DIR}`);
  console.log('══════════════════════════════════════');
}

main().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
