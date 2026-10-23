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
    BV1yonw6eEwC.json
    ...
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

**合计 48 个快照。全部为匿名拓取（不依赖登录、不带 Cookie）。**

---

## 已知限制

- 匿名状态下只能取到公开字段；评论内容接口仅返回 3 条热评，未纳入快照。
- 播放数在 B 站侧有缓存，接口读数可能滞后于页面显示。
- 快照只证明「在 `fetched_at` 时刻，该接口返回了这些值」，
  **不证明该视频此后未被修改、删除或隐藏**。
- 未包含腾讯云后台、EdgeOne 通知、账单流水（仅截图，见主文件说明）。
