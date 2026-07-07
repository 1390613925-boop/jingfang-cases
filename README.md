# 京方箱

经典经方、伤寒论条文、金匮要略条文资料库。项目只使用原生 HTML、CSS、JavaScript，没有框架、npm 或构建步骤，可直接部署到 GitHub Pages。

## 文件结构

```text
.
├── index.html
├── style.css
├── script.js
└── data/
    ├── formulas.json
    ├── shanghan-clauses.json
    └── jingui-clauses.json
```

## 数据说明

- `data/formulas.json`：方剂卡片数据，字段包括 `name`、`source`、`category`、`clauses`、`composition`、`usage`、`pattern`、`symptoms`、`keywords`、`notes`。
- `data/shanghan-clauses.json`：《伤寒论》条文，按六经和篇章归类。
- `data/jingui-clauses.json`：《金匮要略》条文，按篇章归类。

## 继续新增数据

新增方剂时，在 `data/formulas.json` 数组末尾加入一条对象，保证 `id` 唯一即可。

新增条文时，在对应条文文件中加入：

```json
{
  "id": "sh-399",
  "number": "399",
  "category": "太阳病",
  "chapter": "辨太阳病脉证并治",
  "text": "条文原文",
  "formulas": ["关联方名"],
  "keywords": ["太阳病", "关联方名"],
  "notes": "个人按语或校勘说明"
}
```

保存后直接提交到 GitHub，GitHub Pages 会自动更新。

## 本地预览

因为页面通过 `fetch` 读取 JSON，建议用一个静态服务器预览：

```powershell
python -m http.server 4174 --bind 127.0.0.1
```

然后打开 `http://127.0.0.1:4174/`。

## 免责声明

本站内容仅供经方学习研究，不作为诊断、治疗或自行用药依据。
