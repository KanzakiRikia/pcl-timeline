---
layout: default
---

# 快照目录

本目录保存本文引用的公开数据在**特定时刻**的原始读数。

目的只有一个：**固定某个时间点的数值**。播放数、评论数、点赞数每天都在变，不做快照，
任何引用都会在几天后变成「无法核对」。

---

## 目录结构

```
snapshots/
  api/
    BV1fuCQBJEYA.json    ← B 站视频详情接口原始返回
    ...
  github/
    e4b0489a22cf.json    ← PCL 2.99.0.0 源码提交（10 文件，+79 −302）
    6b9a50df911c.json    ← PCL 2.99.0.0 打包提交（15 个 patch，无源码变动）
    e3d1cffed50d.patch   ← PCL 2.99.0.1 源码提交（16 文件，+940 −27），patch 格式
  opus/
    1262353478882164752.json            ← 作者回应动态的接口原始返回（46,281 字节）
    1262353478882164752_p1.png          ← 动态附图 1（904×292）
    1262353478882164752_p2_redacted.png ← 动态附图 2（691×1136），已打码
  README.md              ← 本文件
```

每个 JSON 的结构：

```json
{
  "_snapshot_meta": {
    "source":     "https://api.bilibili.com/x/web-interface/view?bvid=...",
    "fetched_at": "2026-10-23 HH:mm:ss",
    "note":       "Bilibili public API raw response, unmodified"
  },
  "response": { ... }     ← 接口原始返回，未做任何修改
}
```

**`response` 字段是原样保存的，没有删减、没有重排。**

---

## 抓取方法（任何人可复现）

```powershell
$hdr = @{
  "User-Agent" = "Mozilla/5.0"
  "Referer"    = "https://www.bilibili.com/"
}
Invoke-RestMethod `
  -Uri "https://api.bilibili.com/x/web-interface/view?bvid=BV1fuCQBJEYA" `
  -Headers $hdr
```

- 无需登录
- 无需 WBI 签名
- 返回 `data.pubdate`（发布时间，Unix 秒）、`data.stat.view`（播放）、`data.stat.reply`（评论数）、`data.stat.like`（点赞）、`data.desc`（简介原文）

---

## 两次抓取对比（2026-10-23）

同一天内相隔数小时抓取两次，读数已发生变化：

| BV | 标题简写 | 播放（早） | 播放（晚） | 增量 |
|---|---|---|---|---|
| BV1fuCQBJEYA | 请立刻停止为PCL贡献节点 | 878,917 | **879,369** | +452 |
| BV1hQUkBtEUQ | 节点2之龙腾猫跃 | 76,460 | **76,487** | +27 |
| BV1yonw6eEwC | PCL被举报是骗局 | 13,887 | **14,262** | +375 |
| BV1fYnB6dEAM | 预留后门展示 | 9,718 | **11,046** | **+1,328（+13.7%）** |
| BV1LZnz6bEXb | PCL2曝远程shell后门 | 3,468 | **3,926** | +458 |

**可观察的事实**：在整理本文的这一天，上述视频的播放数仍在增长；
其中《预留后门展示》一条的增速最快。

**本文不对该现象作任何解释。**

---

## 第二组快照（同日补充，2026-10-23 晚）

第一组 24 条为事件中的指控与背景视频。
第二组 24 条为 10-20 政策调整的第三方记录、伪造版本分发样本，以及攻击后的评论性内容。

| 类别 | BV |
|---|---|
| **10-20 政策调整**（其他启动器同日关闭） | BV1jmnc6QEM9、BV1DAnP6JEDS、BV18xnA6yEnU、BV1qgnA6REXg、BV1LZnN6hEMU、BV1pwnq6FEyw、BV1wbn66MEZE |
| **伪造版本预警** | BV1Jrnc6dEnJ（霖翟，16:30:25）、BV1Snnc6gEZH |
| **声称「修复」的分发** | BV1a7nc6GEkz、BV1wsnP6NEhF、BV1p6nA6NEAb、BV13cnP6DEua、BV15LnA6pEvc、BV1Stnq63EfE、BV1s9n16xEU1、BV1t5n46gEFo |
| **指控主体** | BV1VFnK6FEXt（SEDET，23:53:25） |
| **技术反驳 / 辟谣** | BV1Y5ny6PE8w、BV1FPnq6ZEFP、BV1K5ni6wEcd |
| **攻击事件报道** | BV1UPns6uEvK、BV1XHnx61EMA |
| **商业机构投稿** | BV1nCnA6AEYB（外星仔加速器，1,248,043 播放） |

**合计 48 个快照。全部为匿名抓取（不依赖登录、不带 Cookie）。**

---

## GitHub 快照

`snapshots/github/` 保存的是 PCL 仓库三次提交的原始返回。

| 文件 | 提交 | 时间（UTC） | 内容 |
|---|---|---|---|
| `e4b0489a22cf.json` | `e4b0489a22cf` | 2026-10-20 06:33:23 | **源码改动**，10 个文件，+79 −302 |
| `6b9a50df911c.json` | `6b9a50df911c` | 2026-10-20 06:51:42 | 打包发布，15 个 patch 文件，无源码变动 |
| `e3d1cffed50d.patch` | `e3d1cffed50d` | 2026-10-24 16:27:41 | **源码改动**，16 个文件，+940 −27 |

**这些快照是全文唯一可以直接核对代码的部分。**

前两个是 API 返回的 JSON，`files[].patch` 字段包含完整 diff，未被删减。
第三个是 `github.com/{owner}/{repo}/commit/{SHA}.patch` 的直接输出（纯文本 diff），未做任何修改。
之所以换格式，是因为抓取时该提交的 API 返回被限流，改用 `.patch` 端点可避开速率限制，内容等价。

抓取方式：

```
https://api.github.com/repos/Meloong-Git/PCL/commits/{SHA}
```

注：`api.github.com` 在中国大陆可能因 SNI 阻断无法直连。
本快照是通过服务端抓取获取的，与直连结果一致。

---

## 第三方分发清单（`candidates.csv`）

| 项 | 值 |
|---|---|
| 文件 | `snapshots/candidates.csv` |
| 条目 | **232** |
| 时间范围 | 2026-10-20 15:35:57 至 2026-10-23 12:48:15（北京时间） |
| 编码 | UTF-8 BOM（Excel 双击可开） |
| 生成脚本 | `tools/fetch_candidates.js` |

**抓取方法**：12 组关键词 × 3 页，`order=pubdate` 按发布时间倒序，
翻到发布早于 2026-10-20 00:00 即停止，按 BV 号去重，
再逐条请求 `x/web-interface/view` 补全简介、时长、投稿人 UID。

**字段说明**

| 字段 | 含义 |
|---|---|
| `bvid` | 视频 BV 号 |
| `pubdate_bj` | 发布时间（已换算为 UTC+8） |
| `author` / `mid` | UP 主昵称 / UID |
| `mid_digits` | UID 位数（16 位为近年新号段） |
| `play` | 播放数（抓取时刻） |
| `duration_sec` | 时长（秒） |
| `up_videos_in_this_csv` | 该 UP 主在本批 232 条中出现几次 |
| `title_flag_restore` | 标题是否含「恢复／修复／复活／解除／一键／插件／工具／破解／绕过／解决」 |
| `desc_has_download_link` | 简介是否含下列域名之一 |
| `download_domains` | 命中的域名，多个用 `\|` 分隔 |
| `title` | 标题（已去 HTML 标签） |
| `desc_head` | 简介前 150 字（空白已折叠） |

**链接域名白名单**：`pan.quark.cn`、`pan.baidu.com`、`lanzou`、`123pan`、
`aliyundrive`、`alipan`、`github.com`、`pan.xunlei.com`、`cowtransfer`、
`weiyun`、`ctfile`、`share.weiyun`、`drive.google`、`mega.nz`、`onedrive`。

**这是字符串匹配，不是人工判定。**
`title_flag_restore=1` 只说明标题里出现了这些词，
`desc_has_download_link=1` 只说明简介里出现了这些域名。
**两项都为 1 不代表该文件有害，也不代表任何主观意图。**

**复现**：

```powershell
node tools/fetch_candidates.js
```

Cookie 从环境变量 `BILI_COOKIE` 读，没有则匿名运行，脚本内不含任何凭据。

---

## 作者回应动态（`opus/`）

2026-10-23 18:56:13，作者在 B 站发布《有关 PCL 存在所谓“后门”／漏洞”的说明》。
对应主文件 3.6 节。

| 文件 | 大小 | 内容 |
|---|---|---|
| `1262353478882164752.json` | 46,281 字节 | 动态详情接口原始返回，未做任何修改 |
| `1262353478882164752_p1.png` | 92,175 字节 | 附图 1，904×292，QQ 群截图 |
| `1262353478882164752_p2_redacted.png` | 578,220 字节 | 附图 2，691×1136，**已打码** |

**与 `api/` 的格式差异**：`opus/1262353478882164752.json` **没有** `_snapshot_meta` 包装，
是接口返回的字节流原样落盘。这是有意为之——动态正文是本次唯一的一手材料，
加包装会让「未修改」这句话本身变得无法验证。其余元数据（抓取时刻、请求头）见下。

**抓取方式**（匿名，需先取 buvid3，否则接口返回 `{"code":-352}`）：

```
GET https://api.bilibili.com/x/frontend/finger/spi
    → data.b_3 即匿名 buvid3

GET https://api.bilibili.com/x/polymer/web-dynamic/v1/opus/detail?timezone_offset=-480&id=1262353478882164752
    Cookie:  buvid3={b_3}
    Referer: https://www.bilibili.com/opus/1262353478882164752
```

抓取时刻：2026-10-24。正文解析路径：
`data.item.modules[]` → `MODULE_TYPE_CONTENT` → `module_content.paragraphs[]`。

**关于附图 2**：原图有一处包含部分真实姓名。
本仓库**只收录打码版**，遮挡矩形为 `x=95 y=786 w=82 h=36`，填充色取该处气泡底色 `RGB(24,38,51)`，
其余像素未作任何改动。

原图亦被 B 站平台标注「未知来源图片，谨慎观看」——该标注由平台添加，本仓库仅记录这一事实。

---

## 已知限制

- 匿名状态下只能取到公开字段；评论内容接口仅返回 3 条热评，未纳入快照。
- 播放数在 B 站侧有缓存，接口读数可能滞后于页面显示。
- 快照只证明「在 `fetched_at` 时刻，该接口返回了这些值」，
  **不证明该视频此后未被修改、删除或隐藏**。
- 未包含腾讯云后台、EdgeOne 通知、账单流水（仅截图，见主文件说明）。
