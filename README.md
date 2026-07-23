# 个人博客

## 日常写作

推荐使用在线写作后台：<https://aliuyu422.github.io/admin/>。首次使用时输入仅授权本仓库的 fine-grained token，并设置当前浏览器的解锁密码。后台可以新增、搜索和编辑文章，保存后会直接提交到 GitHub 并触发 Pages 部署，不需要启动本地服务。

本机后台 `启动写作后台.cmd` 仍保留作为离线备用方案。

也可以使用简单的命令行向导，双击 `新建文章.cmd`：

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
