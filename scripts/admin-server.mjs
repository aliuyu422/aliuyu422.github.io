import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { access, readFile, writeFile } from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import process from 'node:process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const root = path.resolve(import.meta.dirname, '..')
const port = 4173
const host = '127.0.0.1'
const adminToken = randomUUID()
let publishing = false

const sections = [
  { name: '技术总结', path: '技术分享/技术总结', icon: '💻' },
  { name: '疑难困惑', path: '技术分享/疑难困惑', icon: '🧩' },
  { name: '日常随笔', path: '生活分享/日常随笔', icon: '✍️' },
  { name: '旅行日记', path: '生活分享/旅行日记', icon: '🧳' },
  { name: '育儿分享', path: '生活分享/育儿分享', icon: '🌱' },
  { name: '观海听涛', path: '观读感受/观海听涛', icon: '🎬' },
  { name: '书读万卷', path: '观读感受/书读万卷', icon: '📚' }
]

function safeFileName(value) {
  return value
    .replace(/[\\/:*?"<>|[\]]/g, '-')
    .replace(/[\u0000-\u001f]/g, '')
    .replace(/[. ]+$/g, '')
    .trim()
}

function escapeSingleQuotes(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function currentDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date())
}

async function exists(filePath) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

async function command(commandName, args, options = {}) {
  return execFileAsync(commandName, args, {
    cwd: root,
    windowsHide: true,
    maxBuffer: 10 * 1024 * 1024,
    ...options
  })
}

async function gitStatus() {
  const { stdout } = await command('git', ['status', '--short'])
  return stdout.trim()
}

async function githubStatus() {
  const candidates = ['gh', 'C:\\Program Files\\GitHub CLI\\gh.exe']
  for (const candidate of candidates) {
    try {
      await command(candidate, ['auth', 'status'])
      return { loggedIn: true }
    } catch (error) {
      if (candidate === candidates.at(-1)) {
        return { loggedIn: false, detail: error.stderr || error.message }
      }
    }
  }
}

async function saveArticle({ section: sectionName, title: rawTitle, content = '' }) {
  const section = sections.find((item) => item.name === sectionName || item.path === sectionName)
  if (!section) throw new Error('请选择有效栏目。')

  const title = String(rawTitle || '').trim()
  const fileName = safeFileName(title)
  if (!title || !fileName) throw new Error('文章标题不能为空。')

  const articlePath = path.join(root, 'docs', ...section.path.split('/'), `${fileName}.md`)
  const oldArticle = await exists(articlePath) ? await readFile(articlePath, 'utf8') : ''
  const oldDate = oldArticle.match(/^date:\s*(.+)$/m)?.[1]?.trim()
  const body = String(content).trim() || '在这里开始写作。'
  const article = `---\ntitle: ${JSON.stringify(title)}\ndate: ${oldDate || currentDate()}\n---\n\n# ${title}\n\n${body}\n`
  await writeFile(articlePath, article, 'utf8')

  const sidebarPath = path.join(root, '.vitepress', 'sidebar.mts')
  const sidebar = await readFile(sidebarPath, 'utf8')
  const link = `/${section.path}/${fileName}`
  if (!sidebar.includes(`link:'${escapeSingleQuotes(link)}'`)) {
    const eol = sidebar.includes('\r\n') ? '\r\n' : '\n'
    const groupStart = sidebar.indexOf(`    '/${section.path}/':[{`)
    const itemsStart = sidebar.indexOf('items:', groupStart)
    const itemsEnd = sidebar.indexOf(`${eol}      ]`, itemsStart)
    if (groupStart < 0 || itemsStart < 0 || itemsEnd < 0) throw new Error('无法识别侧边栏栏目。')
    const entry = `${eol}        {text:'${escapeSingleQuotes(title)}',link:'${escapeSingleQuotes(link)}'},`
    await writeFile(sidebarPath, sidebar.slice(0, itemsEnd) + entry + sidebar.slice(itemsEnd), 'utf8')
  }

  return {
    file: path.relative(root, articlePath),
    page: `https://aliuyu422.github.io${encodeURI(link)}.html`
  }
}

async function publish(message) {
  if (publishing) throw new Error('已有发布任务正在运行。')
  publishing = true
  try {
    const shell = process.platform === 'win32' ? 'powershell.exe' : 'pwsh'
    const script = path.join(root, 'scripts', 'publish.ps1')
    const args = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script, '-Yes']
    if (message?.trim()) args.push('-Message', message.trim())
    const result = await command(shell, args, { timeout: 10 * 60 * 1000 })
    return result.stdout
  } finally {
    publishing = false
  }
}

function sendJson(response, status, data) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  })
  response.end(JSON.stringify(data))
}

async function readJson(request) {
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > 2 * 1024 * 1024) throw new Error('请求内容过大。')
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
}

function isAuthorized(request) {
  return request.headers['x-admin-token'] === adminToken
}

const page = String.raw`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>博客写作后台</title>
  <style>
    :root { color-scheme: light; font-family: Inter, "Microsoft YaHei", sans-serif; color: #172033; background: #f4f6fb; }
    * { box-sizing: border-box; }
    body { margin: 0; }
    button, input, textarea { font: inherit; }
    .shell { max-width: 1180px; margin: auto; padding: 36px 24px 60px; }
    header { display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-bottom: 28px; }
    h1 { margin: 0 0 6px; font-size: clamp(26px, 4vw, 40px); }
    .subtitle { margin: 0; color: #687087; }
    .status { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 999px; background: #fff; box-shadow: 0 8px 24px #1e2b5210; }
    .dot { width: 9px; height: 9px; border-radius: 50%; background: #f5a524; }
    .dot.ok { background: #17a673; }
    .panel { background: #fff; border: 1px solid #e8ebf2; border-radius: 20px; padding: 24px; box-shadow: 0 18px 48px #1e2b520d; }
    .panel h2 { margin: 0 0 18px; font-size: 20px; }
    .categories { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px; }
    .category { border: 1px solid #e5e8f0; border-radius: 16px; padding: 18px; background: linear-gradient(145deg, #fff, #fafbff); }
    .category-icon { font-size: 26px; }
    .category h3 { margin: 12px 0 4px; }
    .category p { margin: 0 0 16px; color: #7a8296; font-size: 13px; }
    .btn { border: 0; border-radius: 10px; padding: 10px 15px; cursor: pointer; font-weight: 650; transition: .18s ease; }
    .btn:hover { transform: translateY(-1px); }
    .btn-primary { color: #fff; background: #4f46e5; }
    .btn-secondary { color: #3f485c; background: #eef1f7; }
    .btn-publish { color: #fff; background: #0f9d75; }
    .editor { display: none; margin-top: 22px; }
    .editor.visible { display: block; }
    .editor-head { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 18px; }
    .selected { color: #4f46e5; font-weight: 700; }
    label { display: block; margin-bottom: 8px; color: #434b5e; font-weight: 650; }
    input, textarea { width: 100%; border: 1px solid #dce1ec; border-radius: 12px; padding: 12px 14px; outline: none; background: #fbfcff; }
    input:focus, textarea:focus { border-color: #7169ec; box-shadow: 0 0 0 3px #7169ec18; }
    textarea { min-height: 360px; resize: vertical; line-height: 1.7; font-family: Consolas, "Microsoft YaHei", monospace; }
    .field { margin-bottom: 16px; }
    .actions { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
    .message { flex: 1; min-width: 240px; }
    .output { display: none; margin-top: 18px; padding: 16px; border-radius: 12px; background: #121827; color: #d7e1ff; white-space: pre-wrap; max-height: 320px; overflow: auto; font-size: 13px; }
    .output.visible { display: block; }
    @media (max-width: 640px) { header, .editor-head { align-items: flex-start; flex-direction: column; } .shell { padding: 24px 14px 40px; } .panel { padding: 18px; } }
  </style>
</head>
<body>
  <main class="shell">
    <header>
      <div><h1>博客写作后台</h1><p class="subtitle">选择栏目，写完文章后一键发布到 GitHub Pages。</p></div>
      <div class="status"><span id="statusDot" class="dot"></span><span id="statusText">正在检查 GitHub...</span></div>
    </header>
    <section class="panel">
      <h2>选择栏目</h2>
      <div id="categories" class="categories"></div>
      <div id="editor" class="editor">
        <div class="editor-head"><div>正在写入：<span id="selectedSection" class="selected"></span></div><button id="closeEditor" class="btn btn-secondary">关闭编辑器</button></div>
        <div class="field"><label for="title">文章标题</label><input id="title" placeholder="请输入文章标题"></div>
        <div class="field"><label for="content">正文（支持 Markdown）</label><textarea id="content" placeholder="从这里开始写作……"></textarea></div>
        <div class="actions">
          <button id="save" class="btn btn-secondary">保存草稿</button>
          <input id="commitMessage" class="message" placeholder="发布说明（可选）">
          <button id="publish" class="btn btn-publish">保存并发布</button>
        </div>
        <pre id="output" class="output"></pre>
      </div>
    </section>
  </main>
  <script>
    const token = '__ADMIN_TOKEN__'
    const sections = __SECTIONS__
    let selectedSection = ''
    const $ = (id) => document.getElementById(id)
    const output = $('output')

    function showOutput(text, isError = false) {
      output.classList.add('visible')
      output.style.color = isError ? '#ffb4b4' : '#d7e1ff'
      output.textContent = text
      output.scrollTop = output.scrollHeight
    }

    async function api(path, options = {}) {
      const response = await fetch(path, {
        ...options,
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token, ...(options.headers || {}) }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '请求失败')
      return data
    }

    sections.forEach((section) => {
      const card = document.createElement('article')
      card.className = 'category'
      card.innerHTML = '<div class="category-icon">' + section.icon + '</div><h3>' + section.name + '</h3><p>' + section.path + '</p><button class="btn btn-primary">新增文章</button>'
      card.querySelector('button').addEventListener('click', () => {
        selectedSection = section.name
        $('selectedSection').textContent = section.name
        $('editor').classList.add('visible')
        $('title').focus()
        $('editor').scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
      $('categories').appendChild(card)
    })

    $('closeEditor').addEventListener('click', () => $('editor').classList.remove('visible'))

    async function saveArticle() {
      if (!selectedSection) throw new Error('请先选择栏目。')
      const title = $('title').value.trim()
      if (!title) throw new Error('请输入文章标题。')
      return api('/api/save', { method: 'POST', body: JSON.stringify({ section: selectedSection, title, content: $('content').value }) })
    }

    $('save').addEventListener('click', async () => {
      try {
        showOutput('正在保存...')
        const result = await saveArticle()
        showOutput('草稿已保存：' + result.file)
      } catch (error) { showOutput(error.message, true) }
    })

    $('publish').addEventListener('click', async () => {
      if (!confirm('将保存文章并发布当前项目中的全部变更，是否继续？')) return
      const button = $('publish')
      button.disabled = true
      try {
        showOutput('正在保存文章...')
        const saved = await saveArticle()
        showOutput('已保存：' + saved.file + '\n正在构建并部署，请稍候...')
        const result = await api('/api/publish', { method: 'POST', body: JSON.stringify({ message: $('commitMessage').value }) })
        showOutput(result.output + '\n\n发布完成：' + saved.page)
      } catch (error) { showOutput(error.message, true) }
      finally { button.disabled = false }
    })

    api('/api/status').then((data) => {
      $('statusDot').classList.toggle('ok', data.github.loggedIn)
      $('statusText').textContent = data.github.loggedIn ? 'GitHub 已登录' : 'GitHub 未登录，请运行 gh auth login'
      if (data.changes) showOutput('当前未发布变更：\n' + data.changes)
    }).catch((error) => { $('statusText').textContent = error.message })
  </script>
</body>
</html>`

const html = page
  .replace('__ADMIN_TOKEN__', adminToken)
  .replace('__SECTIONS__', JSON.stringify(sections))

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${host}:${port}`)
    if (request.method === 'GET' && url.pathname === '/') {
      response.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'Content-Security-Policy': "default-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; img-src 'self' data:"
      })
      response.end(html)
      return
    }

    if (!isAuthorized(request)) {
      sendJson(response, 403, { error: '无权访问本机写作接口。' })
      return
    }

    if (request.method === 'GET' && url.pathname === '/api/status') {
      sendJson(response, 200, { github: await githubStatus(), changes: await gitStatus(), publishing })
      return
    }

    if (request.method === 'POST' && url.pathname === '/api/save') {
      sendJson(response, 200, await saveArticle(await readJson(request)))
      return
    }

    if (request.method === 'POST' && url.pathname === '/api/publish') {
      const body = await readJson(request)
      sendJson(response, 200, { output: await publish(body.message) })
      return
    }

    sendJson(response, 404, { error: '页面不存在。' })
  } catch (error) {
    sendJson(response, 500, { error: error.stderr || error.message })
  }
})

server.listen(port, host, () => {
  const url = `http://${host}:${port}`
  console.log(`写作后台已启动：${url}`)
  console.log('请保持此窗口开启；关闭窗口即停止后台。')
  if (process.platform === 'win32') {
    execFile('cmd.exe', ['/c', 'start', '', url], { windowsHide: true })
  }
})

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`端口 ${port} 已被占用，写作后台可能已经启动。`)
  } else {
    console.error(error)
  }
  process.exitCode = 1
})
