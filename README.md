# 个人博客

## 日常写作

Windows 下可以直接双击项目根目录的 `新建文章.cmd`：

1. 选择文章栏目。
2. 输入文章标题。
3. 脚本会创建 Markdown 模板，并自动把文章加入对应侧边栏。
4. 编辑生成的文章文件。

命令行也可以运行：

```powershell
npm run new
```

## 一键发布

写完文章后双击 `一键发布.cmd`。脚本会：

1. 展示本次所有文件变更并要求确认。
2. 执行 VitePress 正式构建。
3. 创建 Git 提交并推送到 `master`。
4. 等待 GitHub Pages 部署完成。
5. 自动打开线上网站。

命令行也可以运行：

```powershell
npm run deploy
```

线上地址：<https://aliuyu422.github.io/>
