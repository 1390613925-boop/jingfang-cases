const sources = [
  {
    key: "formulas",
    label: "经典经方",
    path: "./data/formulas.json",
    grid: document.querySelector("#formulasGrid"),
    count: document.querySelector("#formulaCount"),
    hint: document.querySelector("#formulasHint"),
    tagClass: ""
  },
  {
    key: "cases",
    label: "倪师医案",
    path: "./data/cases.json",
    grid: document.querySelector("#casesGrid"),
    count: document.querySelector("#caseCount"),
    hint: document.querySelector("#casesHint"),
    tagClass: "type-case"
  },
  {
    key: "experience",
    label: "个人经验",
    path: "./data/experience.json",
    grid: document.querySelector("#experienceGrid"),
    count: document.querySelector("#experienceCount"),
    hint: document.querySelector("#experienceHint"),
    tagClass: "type-experience"
  }
];

const searchInput = document.querySelector("#siteSearch");
const emptyState = document.querySelector("#emptyState");
const modal = document.querySelector("#detailModal");

const modalFields = {
  category: document.querySelector("#modalCategory"),
  title: document.querySelector("#modalTitle"),
  tags: document.querySelector("#modalTags"),
  details: document.querySelector("#modalDetails")
};

const state = {
  formulas: [],
  cases: [],
  experience: []
};

const detailLabels = {
  title: "标题",
  category: "分类",
  formula: "方名",
  pattern: "病机",
  symptoms: "症状",
  keywords: "关键词",
  summary: "摘要",
  source: "来源",
  composition: "组成",
  usage: "用法",
  indications: "主治",
  notes: "要点",
  complaint: "主诉",
  diagnosis: "辨证",
  prescription: "处方",
  outcome: "转归",
  record: "记录",
  reflection: "复盘"
};

const detailOrder = [
  "formula",
  "pattern",
  "symptoms",
  "keywords",
  "summary",
  "source",
  "composition",
  "usage",
  "indications",
  "complaint",
  "diagnosis",
  "prescription",
  "outcome",
  "record",
  "reflection",
  "notes"
];

function normalizeItems(items, source) {
  return items.map((item, index) => ({
    ...item,
    id: item.id || `${source.key}-${index + 1}`,
    type: source.key,
    typeLabel: source.label
  }));
}

async function loadData() {
  try {
    const results = await Promise.all(
      sources.map(async (source) => {
        const response = await fetch(source.path);
        if (!response.ok) {
          throw new Error(`无法读取 ${source.path}`);
        }
        const data = await response.json();
        return [source.key, normalizeItems(data, source)];
      })
    );

    results.forEach(([key, items]) => {
      state[key] = items;
    });

    renderAll();
  } catch (error) {
    emptyState.hidden = false;
    emptyState.textContent = `${error.message}，请检查 data 目录下的 JSON 文件。`;
  }
}

function getSearchText(item) {
  const fields = [
    item.title,
    item.formula,
    item.pattern,
    item.symptoms,
    item.keywords,
    item.category,
    item.summary
  ];

  return fields.flat().filter(Boolean).join(" ").toLowerCase();
}

function filterItems(items, query) {
  if (!query) {
    return items;
  }
  return items.filter((item) => getSearchText(item).includes(query));
}

function renderAll() {
  const query = searchInput.value.trim().toLowerCase();
  let totalVisible = 0;

  sources.forEach((source) => {
    const items = filterItems(state[source.key], query);
    totalVisible += items.length;
    renderSection(source, items);
  });

  emptyState.hidden = totalVisible > 0;
  if (totalVisible === 0) {
    emptyState.textContent = "没有找到匹配内容，请换个关键词试试。";
  }
}

function renderSection(source, items) {
  source.grid.innerHTML = "";
  source.count.textContent = items.length;
  source.hint.textContent = items.length
    ? `共 ${items.length} 条，点击卡片查看详情。`
    : "当前搜索没有匹配内容。";

  items.forEach((item) => {
    const card = document.createElement("button");
    card.className = "library-card";
    card.type = "button";
    card.innerHTML = `
      <div class="tag-row">
        <span class="tag ${source.tagClass}">${item.typeLabel}</span>
        ${renderTag(item.category)}
        ${renderTag(item.pattern)}
      </div>
      <h3>${escapeHtml(item.title || item.formula || "未命名资料")}</h3>
      <p>${escapeHtml(item.summary || item.notes || "暂无摘要。")}</p>
      <div class="card-footer">
        <span>${escapeHtml(item.formula || item.category || "资料")}</span>
        <span>查看详情</span>
      </div>
    `;
    card.addEventListener("click", () => openModal(item));
    source.grid.appendChild(card);
  });
}

function renderTag(value) {
  if (!value) {
    return "";
  }
  return `<span class="tag">${escapeHtml(String(value))}</span>`;
}

function openModal(item) {
  modalFields.category.textContent = item.typeLabel;
  modalFields.title.textContent = item.title || item.formula || "未命名资料";
  modalFields.tags.innerHTML = [
    item.category,
    item.formula,
    item.pattern,
    ...(Array.isArray(item.keywords) ? item.keywords : [])
  ].filter(Boolean).map((value) => `<span class="tag">${escapeHtml(String(value))}</span>`).join("");

  modalFields.details.innerHTML = buildDetails(item);
  modal.hidden = false;
  document.body.style.overflow = "hidden";
}

function buildDetails(item) {
  const keys = [
    ...detailOrder,
    ...Object.keys(item).filter((key) => !detailOrder.includes(key))
  ];

  return keys
    .filter((key) => !["id", "type", "typeLabel", "title", "category"].includes(key))
    .filter((key) => hasValue(item[key]))
    .map((key) => `
      <div class="detail-item">
        <div class="detail-label">${detailLabels[key] || key}</div>
        <p class="detail-value">${escapeHtml(formatValue(item[key]))}</p>
      </div>
    `)
    .join("");
}

function hasValue(value) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function formatValue(value) {
  if (Array.isArray(value)) {
    return value.join("、");
  }
  return String(value);
}

function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = "";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

searchInput.addEventListener("input", renderAll);

modal.addEventListener("click", (event) => {
  if (event.target.matches("[data-close-modal]")) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) {
    closeModal();
  }
});

loadData();
