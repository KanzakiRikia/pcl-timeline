#!/usr/bin/env node
'use strict';

/**
 * 抓取 2026-10-20 之后所有与「PCL 下载功能异常 / 修复 / 恢复」相关的 B 站投稿，
 * 拉到详情后按规则打标，输出 UTF-8 BOM 的 CSV（Excel 可直接双击打开）。
 *
 * 用法：
 *   node tools/fetch_candidates.js
 *   或在同目录放一个 .tmp_cookie.txt（已被 .gitignore 排除），
 *   或用环境变量 BILI_COOKIE 传入从浏览器复制的整段 Cookie。
 *
 * Cookie 不硬编码、不落盘到仓库内。
 * 没有 cookie 也能跑，只是搜索结果可能偏窄。
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ============================ 配置 ============================

// Cookie 从环境变量或同目录的 .tmp_cookie.txt 读，不硬编码、不入库。
let COOKIE = process.env.BILI_COOKIE || '';
if (!COOKIE) {
  const f = path.join(__dirname, '..', '.tmp_cookie.txt');
  if (fs.existsSync(f)) COOKIE = fs.readFileSync(f, 'utf8').trim();
}

const PAGES_PER_KEYWORD = 3;
const REQ_GAP = 800;          // 每次请求间隔 ms
const MAX_DETAIL = 300;       // 最多抓多少条详情，防止跑太久

// 只保留 2026-10-20 00:00 (UTC+8) 之后发布的
const SINCE = Math.floor(Date.parse('2026-10-19T16:00:00Z') / 1000);

const KEYWORDS = [
  'PCL 恢复下载',
  'PCL 修复',
  'PCL 下载功能',
  'PCL 无法下载',
  'PCL 插件 修复',
  'PCL 解除限制',
  'PCL 旧版 下载',
  'PCL 下载限制',
  'PCL 恢复功能',
  'PCL 修复工具',
  'PCL 下载 解决',
  'PCL 不能下载'
];

// 标题必须命中其一
const INCLUDE_KW = ['PCL', '启动器', '我的世界', 'MC', 'Minecraft'];
// 命中即排除（PCL 也是点云库的缩写）
const EXCLUDE_KW = ['点云', 'PointCloud', 'PCL库'];

// 用来标记「声称修复」的关键词
const RESTORE_KW = ['恢复', '修复', '复活', '解除', '一键', '插件', '工具', '破解', '绕过', '解决'];

// 简介里出现这些域名，认为「给出了可直接获取的文件」
const DL_DOMAINS = [
  'pan.quark.cn', 'pan.baidu.com', 'lanzou', '123pan', 'aliyundrive', 'alipan',
  'github.com', 'pan.xunlei.com', 'cowtransfer', 'weiyun', 'ctfile',
  'share.weiyun', 'drive.google', 'mega.nz', 'onedrive'
];

// ============================ 工具 ============================

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function req(url, tries) {
  tries = tries || 3;
  return new Promise(resolve => {
    const attempt = n => {
      const headers = {
        'User-Agent': UA,
        'Referer': 'https://www.bilibili.com/'
      };
      if (COOKIE) headers['Cookie'] = COOKIE;

      const r = https.get(url, { headers }, res => {
        let d = '';
        res.setEncoding('utf8');
        res.on('data', c => d += c);
        res.on('end', () => resolve(d));
      });
      r.on('error', () => {
        if (n > 1) setTimeout(() => attempt(n - 1), 1200);
        else resolve('{"code":-1,"message":"neterr"}');
      });
      r.setTimeout(25000, () => r.destroy());
    };
    attempt(tries);
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

const fmtBJ = s => new Date((s + 8 * 3600) * 1000).toISOString().replace('T', ' ').slice(0, 19);

function csvCell(v) {
  const s = String(v == null ? '' : v);
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function stripTags(s) {
  return String(s || '').replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
}

function hitAny(text, list) {
  return list.some(k => text.indexOf(k) !== -1);
}

function dlDomainsIn(desc) {
  const found = [];
  const low = String(desc || '').toLowerCase();
  for (const d of DL_DOMAINS) {
    if (low.indexOf(d) !== -1) found.push(d);
  }
  return found;
}

// ============================ 主流程 ============================

(async () => {
  console.log('[step 1] 搜索关键词 ' + KEYWORDS.length + ' 组 x ' + PAGES_PER_KEYWORD + ' 页\n');

  const cand = new Map(); // bvid -> { bvid, pubdate, title, author, mid, play }

  for (const kw of KEYWORDS) {
    let oldest = Infinity;
    for (let page = 1; page <= PAGES_PER_KEYWORD; page++) {
      const u = 'https://api.bilibili.com/x/web-interface/search/type?search_type=video'
        + '&keyword=' + encodeURIComponent(kw) + '&page=' + page + '&order=pubdate';

      let j;
      try {
        j = JSON.parse(await req(u));
      } catch (e) {
        console.log('  [kw] ' + kw + ' p' + page + ' parse err');
        break;
      }

      if (j.code !== 0 || !j.data || !j.data.result) {
        console.log('  [kw] ' + kw + ' p' + page + ' code=' + j.code + ' ' + (j.message || ''));
        break;
      }

      const list = j.data.result;
      if (!list.length) break;

      for (const v of list) {
        const title = stripTags(v.title);
        if (v.pubdate && v.pubdate < oldest) oldest = v.pubdate;
        if (!v.pubdate || v.pubdate < SINCE) continue;
        if (!hitAny(title, INCLUDE_KW)) continue;
        if (hitAny(title, EXCLUDE_KW)) continue;
        if (cand.has(v.bvid)) continue;
        cand.set(v.bvid, {
          bvid: v.bvid,
          pubdate: v.pubdate,
          title: title,
          author: v.author,
          mid: v.mid,
          play: v.play
        });
      }

      // 这一页最老的都早于起始时间了，后面不会再有了
      if (oldest < SINCE) break;

      await sleep(REQ_GAP);
    }
    console.log('  ' + kw + '  -> 累计 ' + cand.size);
    await sleep(REQ_GAP);
  }

  const rows = Array.from(cand.values()).sort((a, b) => a.pubdate - b.pubdate);
  console.log('\n[step 1] 去重后候选 ' + rows.length + ' 条\n');

  // 统计每个 UP 主在本批里出现几次
  const authorCount = {};
  for (const r of rows) authorCount[r.author] = (authorCount[r.author] || 0) + 1;

  console.log('[step 2] 抓详情，上限 ' + MAX_DETAIL + ' 条\n');

  const out = [];
  const limit = Math.min(rows.length, MAX_DETAIL);

  for (let i = 0; i < limit; i++) {
    const r = rows[i];
    const u = 'https://api.bilibili.com/x/web-interface/view?bvid=' + r.bvid;
    let d = null;

    try {
      const j = JSON.parse(await req(u));
      if (j.code === 0) d = j.data;
    } catch (e) { /* ignore */ }

    if (!d) {
      out.push({
        bvid: r.bvid,
        pubdate_bj: fmtBJ(r.pubdate),
        author: r.author,
        mid: r.mid,
        mid_digits: String(r.mid).length,
        play: r.play,
        duration_sec: '',
        up_videos_in_this_csv: authorCount[r.author],
        title_flag_restore: hitAny(r.title, RESTORE_KW) ? 1 : 0,
        desc_has_download_link: '',
        download_domains: '',
        title: r.title,
        desc_head: ''
      });
      console.log('  [' + (i + 1) + '/' + limit + '] ' + r.bvid + '  (detail failed)');
      await sleep(REQ_GAP);
      continue;
    }

    const desc = d.desc || '';
    const doms = dlDomainsIn(desc);
    const titleFlag = hitAny(d.title, RESTORE_KW) ? 1 : 0;

    out.push({
      bvid: d.bvid,
      pubdate_bj: fmtBJ(d.pubdate),
      author: d.owner.name,
      mid: d.owner.mid,
      mid_digits: String(d.owner.mid).length,
      play: d.stat.view,
      duration_sec: d.duration,
      up_videos_in_this_csv: authorCount[d.owner.name],
      title_flag_restore: titleFlag,
      desc_has_download_link: doms.length ? 1 : 0,
      download_domains: doms.join('|'),
      title: d.title,
      desc_head: desc.replace(/\s+/g, ' ').slice(0, 150)
    });

    if ((i + 1) % 10 === 0 || i === limit - 1) {
      console.log('  [' + (i + 1) + '/' + limit + '] ... ' + d.bvid + '  ' + d.owner.name);
    }

    await sleep(REQ_GAP);
  }

  // ============================ 输出 ============================

  const HEAD = [
    'bvid', 'pubdate_bj', 'author', 'mid', 'mid_digits', 'play', 'duration_sec',
    'up_videos_in_this_csv', 'title_flag_restore', 'desc_has_download_link',
    'download_domains', 'title', 'desc_head'
  ];

  const lines = [HEAD.join(',')];
  for (const o of out) {
    lines.push(HEAD.map(k => csvCell(o[k])).join(','));
  }

  const outDir = path.join(__dirname, '..', 'snapshots');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'candidates.csv');
  fs.writeFileSync(outFile, '\uFEFF' + lines.join('\r\n'), 'utf8');

  // ============================ 汇总 ============================

  const restore = out.filter(o => o.title_flag_restore === 1).length;
  const withLink = out.filter(o => o.desc_has_download_link === 1).length;
  const both = out.filter(o => o.title_flag_restore === 1 && o.desc_has_download_link === 1).length;
  const soloUploader = out.filter(o => o.up_videos_in_this_csv === 1).length;
  const newMid = out.filter(o => o.mid_digits >= 12).length;

  console.log('\n================ 汇总 ================');
  console.log('写入条目              ' + out.length);
  console.log('标题含「修复/恢复」   ' + restore);
  console.log('简介含下载链接        ' + withLink);
  console.log('两者都有              ' + both);
  console.log('本批只出现 1 次的号   ' + soloUploader);
  console.log('16 位新 UID           ' + newMid);
  console.log('CSV: ' + outFile);

  console.log('\n---- 两者都有（标题声称修复 + 简介给链接）----');
  for (const o of out.filter(x => x.title_flag_restore === 1 && x.desc_has_download_link === 1)) {
    console.log('  ' + o.bvid + '  ' + o.pubdate_bj + '  ' + o.play + ' 播放  ' + o.author);
    console.log('      ' + o.title.slice(0, 70));
    console.log('      ' + o.download_domains);
  }
})();
