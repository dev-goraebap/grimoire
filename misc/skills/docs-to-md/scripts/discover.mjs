#!/usr/bin/env node
// discover.mjs — 공식 문서 사이트의 페이지 URL 목록을 수집한다.
//
// Usage:
//   node discover.mjs <url> [--max=20]
//
// Output (stdout, JSON):
//   { "source": "llms-full.txt" | "llms.txt" | "sitemap" | "nav" | "single",
//     "pages": [ { "url": "...", "title": "..." } ] }
//
// 의존성: 없음 (Node 24 내장 fetch만 사용).

const args = process.argv.slice(2);
const urlArg = args.find((a) => !a.startsWith("--"));
if (!urlArg) {
  console.error("usage: discover.mjs <url> [--max=20]");
  process.exit(2);
}

const maxFlag = args.find((a) => a.startsWith("--max="));
const MAX = maxFlag ? parseInt(maxFlag.split("=")[1], 10) : 20;

let input;
try {
  input = new URL(urlArg);
} catch {
  console.error(`invalid URL: ${urlArg}`);
  process.exit(2);
}

const origin = input.origin;
// pathPrefix: 입력 URL의 마지막 세그먼트를 제거한 디렉토리 경로
//  /guide/intro -> /guide/
//  /guide/      -> /guide/
//  /            -> /
const pathPrefix = input.pathname.endsWith("/")
  ? input.pathname
  : input.pathname.replace(/\/[^/]*$/, "/") || "/";

const UA = { "user-agent": "docs-to-md/1.0 (+https://agentskills.io)" };

async function tryText(url) {
  try {
    const r = await fetch(url, { redirect: "follow", headers: UA });
    if (!r.ok) return null;
    return await r.text();
  } catch {
    return null;
  }
}

function emit(source, pages) {
  process.stdout.write(JSON.stringify({ source, pages }, null, 2) + "\n");
  process.exit(0);
}

// ---------- 1. llms-full.txt (이상적. 풀텍스트 제공) ----------
{
  const fullUrl = origin + "/llms-full.txt";
  const txt = await tryText(fullUrl);
  if (txt && txt.trim().length > 0) {
    emit("llms-full.txt", [{ url: fullUrl, title: "llms-full.txt" }]);
  }
}

// ---------- 2. llms.txt (문서 링크 목록) ----------
{
  const listUrl = origin + "/llms.txt";
  const txt = await tryText(listUrl);
  if (txt && txt.trim().length > 0) {
    const linkRe = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    const pages = [];
    let m;
    while ((m = linkRe.exec(txt)) !== null) {
      pages.push({ url: m[2], title: m[1] });
      if (pages.length >= MAX) break;
    }
    if (pages.length > 0) emit("llms.txt", pages);
  }
}

// ---------- 3. sitemap.xml (pathPrefix로 필터) ----------
{
  const sitemapUrl = origin + "/sitemap.xml";
  const xml = await tryText(sitemapUrl);
  if (xml) {
    const locs = [];
    const locRe = /<loc>([^<]+)<\/loc>/g;
    let m;
    while ((m = locRe.exec(xml)) !== null) {
      locs.push(m[1].trim());
    }

    // sitemap-index 형태면 중첩된 sitemap들 펼치기
    const nestedSitemaps = locs.filter((u) => /sitemap.*\.xml/i.test(u));
    const pageUrls = [];
    if (nestedSitemaps.length > 0 && nestedSitemaps.length === locs.length) {
      for (const nested of nestedSitemaps.slice(0, 10)) {
        const nestedXml = await tryText(nested);
        if (!nestedXml) continue;
        const re = /<loc>([^<]+)<\/loc>/g;
        let nm;
        while ((nm = re.exec(nestedXml)) !== null) pageUrls.push(nm[1].trim());
      }
    } else {
      pageUrls.push(...locs);
    }

    const inOrigin = pageUrls.filter((u) => {
      try {
        return new URL(u).origin === origin;
      } catch {
        return false;
      }
    });
    const filtered = inOrigin.filter((u) => {
      try {
        return new URL(u).pathname.startsWith(pathPrefix);
      } catch {
        return false;
      }
    });
    const pool = filtered.length > 0 ? filtered : inOrigin;
    const pages = pool.slice(0, MAX).map((u) => ({ url: u }));
    if (pages.length > 0) emit("sitemap", pages);
  }
}

// ---------- 4. 입력 페이지 HTML의 nav 링크 ----------
{
  const html = await tryText(urlArg);
  if (html) {
    const hrefRe = /href=["']([^"']+)["']/g;
    const hrefs = new Set();
    let m;
    while ((m = hrefRe.exec(html)) !== null) {
      try {
        const abs = new URL(m[1], urlArg).href.split("#")[0];
        const u = new URL(abs);
        if (u.origin === origin && u.pathname.startsWith(pathPrefix)) {
          hrefs.add(abs);
        }
      } catch {}
    }
    const pages = [...hrefs].slice(0, MAX).map((u) => ({ url: u }));
    if (pages.length > 1) emit("nav", pages);
  }
}

// ---------- 5. 단일 페이지 폴백 ----------
emit("single", [{ url: urlArg }]);
