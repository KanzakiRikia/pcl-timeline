# Minecraft 启动器社区事件记录

一份**只记录可验证事实**的时间线。

**站点（无需代理、无需登录）**：<https://KanzakiRikia.github.io/pcl-timeline/>

- 记录范围：**2026-10-20 起**（第一、二章为背景，非本次事件证据）
- 不含推断、不含归因、不评价任何个人或组织
- 无法确认的部分单独列在末尾，保留「待补」「待核准」标注，不做模糊化处理

**全部内容以 [CC0 1.0](LICENSE) 释出。可任意复制、改写、商用、二次发布，无需署名、无需告知。**

## 文件

| 文件 | 内容 |
|---|---|
| [`pcl-timeline.md`](pcl-timeline.md) | 主文件，8 章。每条记录标注来源 |
| [`cite.md`](cite.md) | 引用卡：15 条核心事实，一行一条，复制即用 |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | 收录规则：什么能收，什么不能收 |
| [`snapshots/`](snapshots/README.md) | 接口快照：播放数、发布时间、简介原文等原始读数 |
| [`snapshots/candidates.csv`](snapshots/candidates.csv) | 232 条「声称恢复下载」投稿的完整清单（Excel 可直接打开） |
| [`tools/fetch_candidates.js`](tools/fetch_candidates.js) | 上面那份 CSV 的生成脚本，可重跑 |

## 可复现

主文件第七章逐条列出了数据来源的接口地址，任何人可自行查询核对。

`snapshots/api/` 下保存的是 B 站公开接口的原始返回，未经修改。
`snapshots/github/` 下是两次提交的完整 diff。
`snapshots/opus/` 下是作者回应动态的原始 JSON 与附图。

## 数据来源

- B 站公开 API `x/web-interface/view`（无需登录、无需签名）
- 腾讯云 CDN 控制台读数（截图）
- EdgeOne 告警邮件、账单流水（截图）
- 平台公告、第三方媒体报道
- PCL 公开仓库的 commit（完整 diff）

## 收录

欢迎提交新材料与纠错。

作者本人的回应与第三方材料**同等收录、原文照录、不删不改**。
标准见 [`CONTRIBUTING.md`](CONTRIBUTING.md)。

## 关于本记录

本记录按事件整理归档，不是长期日志。

之所以保留了大量「待核准」标注，是因为**写不出来的东西就不写**——
能被别人独立验证的，才放进正文。
