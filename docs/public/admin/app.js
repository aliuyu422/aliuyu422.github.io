const OWNER = 'aliuyu422'
const REPO = 'aliuyu422.github.io'
const BRANCH = 'master'
const API = 'https://api.github.com'
const STORAGE_KEY = 'vitepress-admin-token-v1'

const sections = [
  { name: '技术总结', path: '技术分享/技术总结', icon: '💻' },
  { name: '疑难困惑', path: '技术分享/疑难困惑', icon: '🧩' },
  { name: '日常随笔', path: '生活分享/日常随笔', icon: '✍️' },
  { name: '旅行日记', path: '生活分享/旅行日记', icon: '🧳' },
  { name: '育儿分享', path: '生活分享/育儿分享', icon: '🌱' },
  { name: '观海听涛', path: '观读感受/观海听涛', icon: '🎬' },
  { name: '书读万卷', path: '观读感受/书读万卷', icon: '📚' }
]

let githubToken = ''
let allArticles = []
let selectedSection = null
let editingSlug = ''
let editingSource = ''
let publishing = false

const $ = (id) => document.getElementById(id)

function bytesToBase64(bytes) {
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000))
  }
  return btoa(binary)
}

function base64ToBytes(value) {
  const binary = atob(value)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

function textToBase64(value) {
  return bytesToBase64(new TextEncoder().encode(value))
}

function base64ToText(value) {
  return new TextDecoder().decode(base64ToBytes(value.replace(/\s/g, '')))
}

async function deriveKey(password, salt, usages) {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 250000 },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    usages
  )
}

async function encryptToken(token, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(password, salt, ['encrypt'])
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(token)
  )
  return JSON.stringify({
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(encrypted))
  })
}

async function decryptToken(payload, password) {
  const stored = JSON.parse(payload)
  const salt = base64ToBytes(stored.salt)
  const iv = base64ToBytes(stored.iv)
  const key = await deriveKey(password, salt, ['decrypt'])
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    base64ToBytes(stored.data)
  )
  return new TextDecoder().decode(decrypted)
}

async function github(path, options = {}) {
  if (!githubToken) throw new Error('后台尚未解锁。')
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${githubToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    }
  })
  const text = await response.text()
  const data = text ? JSON.parse(text) : null
  if (!response.ok) {
    const detail = data?.message || `GitHub 请求失败（${response.status}）`
    throw new Error(detail)
  }
  return data
}

async function validateToken(token) {
  githubToken = token.trim()
  const user = await github('/user')
  if (user.login.toLowerCase() !== OWNER.toLowerCase()) {
    githubToken = ''
    throw new Error(`该 token 属于 ${user.login}，只允许 ${OWNER} 登录。`)
  }
  const repo = await github(`/repos/${OWNER}/${REPO}`)
  if (!repo.permissions?.push) {
    githubToken = ''
    throw new Error('Token 没有仓库写入权限，请授予 Contents: Read and write。')
  }
  return user
}

function showAuthMessage(message, success = false) {
  $('authMessage').textContent = message
  $('authMessage').style.color = success ? '#0c805f' : '#c0392b'
}

function showAuthView() {
  $('dashboard').classList.add('hidden')
  $('authPanel').classList.remove('hidden')
  $('accountBadge').classList.add('hidden')
  const hasStoredToken = Boolean(localStorage.getItem(STORAGE_KEY))
  $('setupView').classList.toggle('hidden', hasStoredToken)
  $('unlockView').classList.toggle('hidden', !hasStoredToken)
  $('authMessage').textContent = ''
}

async function showDashboard(user) {
  $('authPanel').classList.add('hidden')
  $('dashboard').classList.remove('hidden')
  $('accountBadge').textContent = `✓ ${user.login}`
  $('accountBadge').classList.remove('hidden')
  await loadArticles()
}

function setBusy(button, busy, text) {
  if (!button.dataset.label) button.dataset.label = button.textContent
  button.disabled = busy
  button.textContent = busy ? text : button.dataset.label
}

$('setupButton').addEventListener('click', async () => {
  const button = $('setupButton')
  const token = $('setupToken').value.trim()
  const password = $('setupPassword').value
  const confirmation = $('setupPasswordAgain').value
  if (!token) return showAuthMessage('请输入 fine-grained token。')
  if (password.length < 8) return showAuthMessage('解锁密码至少需要 8 位。')
  if (password !== confirmation) return showAuthMessage('两次输入的密码不一致。')
  setBusy(button, true, '正在验证...')
  try {
    const user = await validateToken(token)
    localStorage.setItem(STORAGE_KEY, await encryptToken(token, password))
    $('setupToken').value = ''
    $('setupPassword').value = ''
    $('setupPasswordAgain').value = ''
    await showDashboard(user)
  } catch (error) {
    githubToken = ''
    showAuthMessage(error.message)
  } finally {
    setBusy(button, false)
  }
})

$('unlockButton').addEventListener('click', async () => {
  const button = $('unlockButton')
  const password = $('unlockPassword').value
  if (!password) return showAuthMessage('请输入解锁密码。')
  setBusy(button, true, '正在解锁...')
  try {
    const encrypted = localStorage.getItem(STORAGE_KEY)
    const token = await decryptToken(encrypted, password)
    const user = await validateToken(token)
    $('unlockPassword').value = ''
    await showDashboard(user)
  } catch {
    githubToken = ''
    showAuthMessage('密码错误，或者保存的 token 已失效。')
  } finally {
    setBusy(button, false)
  }
})

$('unlockPassword').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') $('unlockButton').click()
})

$('resetButton').addEventListener('click', () => {
  if (!confirm('确定清除此浏览器保存的加密 token 吗？')) return
  localStorage.removeItem(STORAGE_KEY)
  githubToken = ''
  showAuthView()
})

$('lockButton').addEventListener('click', () => {
  githubToken = ''
  editingSource = ''
  showAuthView()
})

function safeFileName(value) {
  return value
    .replace(/[\\/:*?"<>|[\]]/g, '-')
    .replace(/[\u0000-\u001f]/g, '')
    .replace(/[. ]+$/g, '')
    .trim()
}

function currentDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date())
}

function articleTitle(source, fallback) {
  const frontmatterTitle = source.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1]?.trim()
  const headingTitle = source.replace(/^---[\s\S]*?---\s*/, '').match(/^#\s+(.+)$/m)?.[1]?.trim()
  return frontmatterTitle || headingTitle || fallback
}

function articleBody(source) {
  return source
    .replace(/^---[\s\S]*?---\s*/, '')
    .replace(/^#\s+.+(?:\r?\n)+/, '')
    .trim()
}

function decodeSidebarValue(value) {
  return value.replace(/\\'/g, "'").replace(/\\\\/g, '\\')
}

function sidebarTitles(source) {
  const titles = new Map()
  const pattern = /\{text:'((?:\\.|[^'])*)',link:'((?:\\.|[^'])*)'\}/g
  for (const match of source.matchAll(pattern)) {
    titles.set(decodeSidebarValue(match[2]), decodeSidebarValue(match[1]))
  }
  return titles
}

async function getRepositoryFile(filePath) {
  const encodedPath = filePath.split('/').map(encodeURIComponent).join('/')
  const data = await github(`/repos/${OWNER}/${REPO}/contents/${encodedPath}?ref=${BRANCH}`)
  return { ...data, text: base64ToText(data.content) }
}

async function loadArticles() {
  $('articleList').innerHTML = '<div class="empty">正在读取 GitHub 仓库...</div>'
  const [tree, sidebar] = await Promise.all([
    github(`/repos/${OWNER}/${REPO}/git/trees/${BRANCH}?recursive=1`),
    getRepositoryFile('.vitepress/sidebar.mts')
  ])
  const titles = sidebarTitles(sidebar.text)
  const articles = []
  for (const section of sections) {
    const prefix = `docs/${section.path}/`
    for (const item of tree.tree) {
      if (item.type !== 'blob' || !item.path.startsWith(prefix) || !item.path.endsWith('.md')) continue
      const relative = item.path.slice(prefix.length)
      if (relative.includes('/')) continue
      const slug = relative.slice(0, -3)
      const link = `/${section.path}/${slug}`
      articles.push({
        section: section.name,
        sectionPath: section.path,
        slug,
        path: item.path,
        title: titles.get(link) || slug
      })
    }
  }
  allArticles = articles.sort((a, b) => a.section.localeCompare(b.section, 'zh-CN') || a.title.localeCompare(b.title, 'zh-CN'))
  renderArticles()
}

function renderArticles() {
  const keyword = $('articleSearch').value.trim().toLowerCase()
  const filtered = allArticles.filter((article) =>
    !keyword || [article.title, article.slug, article.section].some((value) => value.toLowerCase().includes(keyword))
  )
  const list = $('articleList')
  list.replaceChildren()
  if (!filtered.length) {
    const empty = document.createElement('div')
    empty.className = 'empty'
    empty.textContent = '没有找到文章。'
    list.appendChild(empty)
    return
  }
  for (const article of filtered) {
    const row = document.createElement('div')
    row.className = 'article-row'
    const info = document.createElement('div')
    info.className = 'article-info'
    const title = document.createElement('div')
    title.className = 'article-title'
    title.textContent = article.title
    const meta = document.createElement('div')
    meta.className = 'article-meta'
    meta.textContent = `${article.section} · ${article.slug}.md`
    const button = document.createElement('button')
    button.className = 'btn secondary'
    button.textContent = '编辑'
    button.addEventListener('click', () => openExistingArticle(article, button))
    info.append(title, meta)
    row.append(info, button)
    list.appendChild(row)
  }
}

function openEditor(section, title = '', content = '', slug = '', source = '') {
  selectedSection = section
  editingSlug = slug
  editingSource = source
  $('editorMode').textContent = slug ? '编辑文章' : '新增文章'
  $('editorSection').textContent = section.name
  $('articleTitle').value = title
  $('articleContent').value = content
  $('commitMessage').value = ''
  $('publishOutput').classList.add('hidden')
  $('editorPanel').classList.remove('hidden')
  $('articleTitle').focus()
  $('editorPanel').scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function openExistingArticle(article, button) {
  setBusy(button, true, '载入中...')
  try {
    const file = await getRepositoryFile(article.path)
    const section = sections.find((item) => item.name === article.section)
    openEditor(section, articleTitle(file.text, article.slug), articleBody(file.text), article.slug, file.text)
  } catch (error) {
    alert(error.message)
  } finally {
    setBusy(button, false)
  }
}

for (const section of sections) {
  const card = document.createElement('article')
  card.className = 'category'
  const icon = document.createElement('div')
  icon.className = 'category-icon'
  icon.textContent = section.icon
  const title = document.createElement('h3')
  title.textContent = section.name
  const detail = document.createElement('p')
  detail.textContent = section.path
  const button = document.createElement('button')
  button.className = 'btn primary'
  button.textContent = '新增文章'
  button.addEventListener('click', () => openEditor(section))
  card.append(icon, title, detail, button)
  $('categories').appendChild(card)
}

function escapeSingleQuotes(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function updateSidebar(source, section, title, slug) {
  const link = `/${section.path}/${slug}`
  const escapedLink = escapeSingleQuotes(link)
  const escapedTitle = escapeSingleQuotes(title)
  if (source.includes(`link:'${escapedLink}'`)) {
    const pattern = new RegExp(`\\{text:'(?:\\\\.|[^'])*',link:'${escapeRegExp(escapedLink)}'\\}`)
    return source.replace(pattern, `{text:'${escapedTitle}',link:'${escapedLink}'}`)
  }
  const eol = source.includes('\r\n') ? '\r\n' : '\n'
  const groupStart = source.indexOf(`    '/${section.path}/':[{`)
  const itemsStart = source.indexOf('items:', groupStart)
  const itemsEnd = source.indexOf(`${eol}      ]`, itemsStart)
  if (groupStart < 0 || itemsStart < 0 || itemsEnd < 0) throw new Error('无法识别侧边栏栏目。')
  const entry = `${eol}        {text:'${escapedTitle}',link:'${escapedLink}'},`
  return source.slice(0, itemsEnd) + entry + source.slice(itemsEnd)
}

async function commitFiles(files, message) {
  const reference = await github(`/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`)
  const parentSha = reference.object.sha
  const parentCommit = await github(`/repos/${OWNER}/${REPO}/git/commits/${parentSha}`)
  const treeEntries = []
  for (const file of files) {
    const blob = await github(`/repos/${OWNER}/${REPO}/git/blobs`, {
      method: 'POST',
      body: JSON.stringify({ content: textToBase64(file.content), encoding: 'base64' })
    })
    treeEntries.push({ path: file.path, mode: '100644', type: 'blob', sha: blob.sha })
  }
  const tree = await github(`/repos/${OWNER}/${REPO}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({ base_tree: parentCommit.tree.sha, tree: treeEntries })
  })
  const commit = await github(`/repos/${OWNER}/${REPO}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({ message, tree: tree.sha, parents: [parentSha] })
  })
  await github(`/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha, force: false })
  })
  return commit.sha
}

$('publishButton').addEventListener('click', async () => {
  if (publishing) return
  const title = $('articleTitle').value.trim()
  const content = $('articleContent').value.trim()
  if (!selectedSection) return alert('请选择栏目。')
  if (!title) return alert('请输入文章标题。')
  const slug = editingSlug || safeFileName(title)
  if (!slug) return alert('文章标题无法生成有效文件名。')
  if (!editingSlug && allArticles.some((article) => article.section === selectedSection.name && article.slug === slug)) {
    return alert('该栏目中已存在同名文章，请从已有文章进入编辑。')
  }
  if (!confirm(`确定将《${title}》提交到 GitHub 并自动部署吗？`)) return

  const button = $('publishButton')
  const output = $('publishOutput')
  publishing = true
  setBusy(button, true, '正在发布...')
  output.classList.remove('hidden')
  output.textContent = '正在读取最新仓库状态...'
  try {
    const sidebar = await getRepositoryFile('.vitepress/sidebar.mts')
    const oldDate = editingSource.match(/^date:\s*(.+)$/m)?.[1]?.trim()
    const article = `---\ntitle: ${JSON.stringify(title)}\ndate: ${oldDate || currentDate()}\n---\n\n# ${title}\n\n${content || '在这里开始写作。'}\n`
    const updatedSidebar = updateSidebar(sidebar.text, selectedSection, title, slug)
    const files = [{ path: `docs/${selectedSection.path}/${slug}.md`, content: article }]
    if (updatedSidebar !== sidebar.text) files.push({ path: '.vitepress/sidebar.mts', content: updatedSidebar })
    output.textContent = '正在创建 GitHub 提交...'
    const message = $('commitMessage').value.trim() || `${editingSlug ? 'Update' : 'Add'} article: ${title}`
    const commitSha = await commitFiles(files, message)
    output.textContent = `提交成功：${commitSha.slice(0, 7)}\nGitHub Actions 正在自动构建部署。\n\n网站：https://${OWNER}.github.io/\n部署状态：https://github.com/${OWNER}/${REPO}/actions`
    editingSlug = slug
    editingSource = article
    await loadArticles()
  } catch (error) {
    output.textContent = `发布失败：${error.message}\n\n如果提示分支已更新，请刷新文章列表后重试。`
  } finally {
    publishing = false
    setBusy(button, false)
  }
})

$('closeEditor').addEventListener('click', () => $('editorPanel').classList.add('hidden'))
$('refreshButton').addEventListener('click', () => loadArticles().catch((error) => alert(error.message)))
$('articleSearch').addEventListener('input', renderArticles)

showAuthView()
