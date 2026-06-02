# 经方派医案展示

一个无依赖、无框架的静态网页项目，用于展示经方派医案资料。页面包含医案卡片、关键词搜索和详情弹窗，适合直接部署到 GitHub Pages、Vercel 或其他静态托管平台。

## 文件结构

```text
.
├── index.html      # 页面结构
├── style.css       # 页面样式
├── script.js       # 医案数据、搜索和详情弹窗逻辑
├── vercel.json     # Vercel 静态站点配置
├── .gitignore      # Git 忽略规则
└── README.md       # 项目说明
```

## 本地打开方式

直接双击 `index.html`，或在浏览器中打开该文件即可。

也可以使用任意静态服务器预览，但本项目不需要安装依赖，也不需要执行 `npm build`。

## GitHub Pages 部署方式

1. 将本项目推送到 GitHub 仓库。
2. 进入仓库的 `Settings`。
3. 打开 `Pages`。
4. 在 `Build and deployment` 中选择 `Deploy from a branch`。
5. 分支选择 `main`，目录选择 `/root`。
6. 保存后等待 GitHub Pages 构建完成。

部署完成后，GitHub 会提供一个类似下面的访问地址：

```text
https://你的用户名.github.io/仓库名/
```

## Vercel 部署方式

1. 登录 Vercel。
2. 选择 `Add New...`，然后选择 `Project`。
3. 导入当前 GitHub 仓库。
4. Framework Preset 选择 `Other`。
5. Build Command 留空。
6. Output Directory 留空或使用默认设置。
7. 点击部署。

本项目包含 `vercel.json`，会让 Vercel 将项目作为静态站点发布，并把所有路由回退到 `index.html`。该配置不会影响 GitHub Pages。

## 说明

本项目仅用于经方派医案展示与学习示例，不包含后端服务、数据库或第三方依赖。
