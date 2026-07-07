# 京方箱

经典经方、倪师医案、个人经验资料库。项目是无框架、无 npm、无构建步骤的 GitHub Pages 静态网站。

## 文件结构

```text
.
├── index.html
├── style.css
├── script.js
└── data/
    ├── formulas.json      # 经典经方
    ├── cases.json         # 倪师医案
    └── experience.json    # 个人经验
```

## 新增数据

按资料类型编辑对应 JSON 文件，在数组中追加一个对象即可。建议保留这些字段，方便搜索和详情展示：

```json
{
  "id": "unique-id",
  "title": "资料标题",
  "category": "分类",
  "formula": "方名",
  "pattern": "病机",
  "symptoms": ["症状一", "症状二"],
  "keywords": ["关键词一", "关键词二"],
  "summary": "卡片摘要",
  "notes": "详情补充"
}
```

## 部署

直接推送到 GitHub Pages 即可，不需要安装依赖或执行构建命令。

## 免责声明

本站内容仅供经方学习研究，不作为诊断、治疗或自行用药依据。
