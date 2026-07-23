import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { createInterface } from 'node:readline/promises'

const sections = [
  { name: '技术总结', path: '技术分享/技术总结' },
  { name: '疑难困惑', path: '技术分享/疑难困惑' },
  { name: '日常随笔', path: '生活分享/日常随笔' },
  { name: '旅行日记', path: '生活分享/旅行日记' },
  { name: '育儿分享', path: '生活分享/育儿分享' },
  { name: '观海听涛', path: '观读感受/观海听涛' },
  { name: '书读万卷', path: '观读感受/书读万卷' }
]

function getArgument(name) {
  const index = process.argv.indexOf(`--${name}`)
  return index >= 0 ? process.argv[index + 1] : undefined
}

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
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date())
}

async function fileExists(filePath) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

async function main() {
  const root = path.resolve(import.meta.dirname, '..')
  const isDryRun = process.argv.includes('--dry-run')
  const rl = createInterface({ input: process.stdin, output: process.stdout })

  try {
    let sectionInput = getArgument('section')
    if (!sectionInput) {
      console.log('\n请选择文章栏目：')
      sections.forEach((section, index) => console.log(`  ${index + 1}. ${section.name}`))
      sectionInput = await rl.question('\n输入序号：')
    }

    const section = sections.find((item, index) =>
      item.name === sectionInput || item.path === sectionInput || String(index + 1) === sectionInput
    )
    if (!section) throw new Error('栏目无效，请输入列表中的序号或名称。')

    const rawTitle = getArgument('title') || await rl.question('文章标题：')
    const title = rawTitle.trim()
    const fileName = safeFileName(title)
    if (!title || !fileName) throw new Error('文章标题不能为空。')

    const articlePath = path.join(root, 'docs', ...section.path.split('/'), `${fileName}.md`)
    if (await fileExists(articlePath)) throw new Error(`文章已存在：${articlePath}`)

    const article = `---\ntitle: ${JSON.stringify(title)}\ndate: ${currentDate()}\n---\n\n# ${title}\n\n在这里开始写作。\n`
    const sidebarPath = path.join(root, '.vitepress', 'sidebar.mts')
    const sidebar = await readFile(sidebarPath, 'utf8')
    const eol = sidebar.includes('\r\n') ? '\r\n' : '\n'
    const groupMarker = `    '/${section.path}/':[{`
    const groupStart = sidebar.indexOf(groupMarker)
    if (groupStart < 0) throw new Error(`侧边栏中没有找到栏目：${section.path}`)

    const itemsStart = sidebar.indexOf('items:', groupStart)
    const itemsEnd = sidebar.indexOf(`${eol}      ]`, itemsStart)
    if (itemsStart < 0 || itemsEnd < 0) throw new Error('无法识别侧边栏结构。')

    const link = `/${section.path}/${fileName}`
    const entry = `${eol}        {text:'${escapeSingleQuotes(title)}',link:'${escapeSingleQuotes(link)}'},`
    const updatedSidebar = sidebar.slice(0, itemsEnd) + entry + sidebar.slice(itemsEnd)

    if (!isDryRun) {
      await mkdir(path.dirname(articlePath), { recursive: true })
      await writeFile(articlePath, article, 'utf8')
      await writeFile(sidebarPath, updatedSidebar, 'utf8')
    }

    console.log(`\n${isDryRun ? '验证通过，计划创建' : '文章已创建'}：${articlePath}`)
    console.log(`页面路径：${link}`)
    if (!isDryRun) console.log('写完后双击“一键发布.cmd”即可上线。')
  } finally {
    rl.close()
  }
}

main().catch((error) => {
  console.error(`\n创建失败：${error.message}`)
  process.exitCode = 1
})
