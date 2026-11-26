/**
 * Health Hub —— 对等智能体示例站点
 * 静态托管 .well-known/ 下的 agent 定义，并开启 CORS（允许 LifeLens 站点跨域 fetch）。
 * 运行：node server.js （端口 5188）
 */
const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = 5188
const MIME = { '.json': 'application/json; charset=utf-8', '.html': 'text/html; charset=utf-8' }

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }

  let urlPath = decodeURIComponent(req.url.split('?')[0])
  if (urlPath === '/') urlPath = '/index.html'
  const file = path.join(__dirname, urlPath)
  if (!file.startsWith(__dirname)) { res.writeHead(403); res.end(); return }

  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, MIME['.json']); res.end(JSON.stringify({ error: 'not found', path: urlPath })); return }
    res.writeHead(200, MIME[path.extname(file)] || 'text/plain; charset=utf-8')
    res.end(data)
  })
})

server.listen(PORT, () => console.log(`Health Hub peer site: http://localhost:${PORT}/.well-known/agent-manifest.json`))
