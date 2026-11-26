# Health Hub · 健康基准站

这是一个遵循 [Open Agentic Web](https://worldwideagenticweb.org/) 协议的**极简对等智能体（peer agent）示例站点**。它对外发布一个智能体定义——`who_benchmark_advisor`（WHO 基准顾问），任何兼容的浏览器智能体运行时都可以从**第二个 origin** 发现它，并在本机委派执行。

[English README（主文档）](README.md) · [MIT 开源协议](LICENSE)

## 它到底是什么

- **只有三个静态文件**：站点清单、智能体定义、介绍页。
- **没有后端、没有大模型、没有数据库**。智能体本体就是一份 JSON（指令 + 参数 schema），由调用方的浏览器运行时使用**用户自己的 Key** 在本机执行。
- **不收集任何数据**：委派请求中的统计数据仅用于当次回答，不会被存储。

仓库里的 `server.js` 只是**本机开发用**的微型静态服务器（带 CORS 头）。部署到 GitHub Pages 后可以直接丢弃——Pages 原生提供 HTTPS 和 `Access-Control-Allow-Origin: *`。

## 智能体：`who_benchmark_advisor`

接收其他站点数据分析师算出的统计值，对照权威健康基准给出评估。

| 入参 | 类型 | 说明 |
|---|---|---|
| `metric` | 枚举 | `sleep` / `steps` / `energy` / `walking_speed` / `headphone_db` |
| `summary` | 字符串 | 分析师结论原句，须含数据起止范围和单位 |
| `stats` | 对象 | `{ "avg": 7.2, "max": 8.5, "min": 5.1 }`（英文键是跨站契约） |

| 维度 | 基准 |
|---|---|
| 睡眠 | 成人每晚 7–9 小时 |
| 耳机音量 | 长期暴露不超过 80dB（WHO） |
| 步数 | 每日约 7000–10000 步 |
| 活动热量 | 每日 150–300 kcal（每周 ≥150 分钟中等强度活动的粗略折算，因个体差异大仅供参考） |
| 步行速度 | 健康成人约 1.2–1.4 m/s，长期低于 1.0 m/s 提示活动能力偏弱 |

输出为单个 JSON 对象：`{"verdict":"达标|需注意|超标","advice":"2-3 句具体建议"}`。

指令中明确要求：把 `stats` 当作**统计窗口汇总值**（不是单日值）；单位与默认值冲突时以 `summary` 描述为准；遇到无法评估的 metric 如实说明，不套用其他基准、不编造数值。

## 协议文件

| 路径 | 作用 |
|---|---|
| `.well-known/agent-manifest.json` | 站点入口：名称、入口 agent、相对路径的 `hocon` 指针 |
| `.well-known/agents.network.json` | 智能体定义（参数 schema + 指令） |
| `index.html` | 人类可读的介绍页 |

两个 JSON 均为公开 GET 且带 CORS 头。`hocon` 特意写成相对路径，这样站点挂在任意子路径下（如 `https://<用户名>.github.io/health-hub/.well-known/...`）都能解析。

## 部署

任何提供 HTTPS 的静态托管都可以，最简单的是 GitHub Pages：

1. 新建仓库（如 `health-hub`），把本目录内容推到 `main`——**包括隐藏的 `.well-known/` 目录**。
2. 仓库页面 → **Settings → Pages → Build and deployment → Source → Deploy from a branch → main / root**。
3. 验证两个 JSON 都返回 200 且带 `Access-Control-Allow-Origin: *`。
4. 在兼容的运行时（如 [LifeLens](https://github.com/heminhua-pro/LifeLens)）中把 `https://<用户名>.github.io/health-hub/.well-known/agent-manifest.json` 添加为对等站点并批准，基准顾问即可被委派。

无需构建、无需环境变量、无需任何密钥。

## 本地开发

```bash
node server.js          # http://localhost:5188，带 CORS 头
# 或者
python -m http.server 5188
```

把 peer link 指向 `http://localhost:5188/.well-known/agent-manifest.json` 即可本机测试委派。浏览器把 localhost 视为安全上下文，本地不需要 HTTPS。

## 开源协议

MIT——见 [LICENSE](LICENSE)。
