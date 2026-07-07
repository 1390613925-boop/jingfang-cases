const datasets = {
  articles: [],
  formulas: [],
  jingui: []
};

const articleTextCache = new Map();

const filters = {
  book: "全部",
  category: "全部"
};

const els = {
  search: document.querySelector("#siteSearch"),
  empty: document.querySelector("#emptyState"),
  articlesGrid: document.querySelector("#articlesGrid"),
  formulasGrid: document.querySelector("#formulasGrid"),
  jinguiGrid: document.querySelector("#jinguiGrid"),
  articleCount: document.querySelector("#articleCount"),
  formulaCount: document.querySelector("#formulaCount"),
  jinguiCount: document.querySelector("#jinguiCount"),
  articlesHint: document.querySelector("#articlesHint"),
  formulasHint: document.querySelector("#formulasHint"),
  jinguiHint: document.querySelector("#jinguiHint"),
  bookFilters: document.querySelector("#bookFilters"),
  categoryFilters: document.querySelector("#categoryFilters"),
  modal: document.querySelector("#detailModal"),
  modalCategory: document.querySelector("#modalCategory"),
  modalTitle: document.querySelector("#modalTitle"),
  modalTags: document.querySelector("#modalTags"),
  modalDetails: document.querySelector("#modalDetails")
};

const labels = {
  book: "经典",
  source: "出处",
  category: "六经 / 篇章",
  volume: "卷次",
  formula: "方名",
  formulas: "关联方剂",
  clauses: "关联条文",
  number: "条文编号",
  text: "条文",
  pattern: "病机",
  symptoms: "症状",
  keywords: "关键词",
  composition: "组成",
  usage: "煎服法",
  indications: "主治",
  summary: "摘要",
  notes: "按语"
};

const detailOrder = [
  "book",
  "source",
  "category",
  "volume",
  "number",
  "text",
  "formula",
  "formulas",
  "clauses",
  "pattern",
  "symptoms",
  "keywords",
  "composition",
  "usage",
  "indications",
  "summary",
  "notes"
];

async function loadData() {
  const [articles, formulas, jingui] = await Promise.all([
    fetchJson("./data/articles.json"),
    fetchJson("./data/formulas.json"),
    fetchJson("./data/jingui-clauses.json")
  ]);

  datasets.articles = articles.map((item) => ({ ...item, type: "article" }));
  datasets.formulas = formulas.map((item) => ({
    ...item,
    book: item.source || "经方",
    type: "formula"
  }));
  datasets.jingui = jingui.map((item) => ({ ...item, book: "金匮要略", type: "jingui" }));

  renderFilters();
  renderAll();
}

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`无法读取 ${path}`);
  }
  return response.json();
}

async function fetchText(path) {
  if (articleTextCache.has(path)) {
    return articleTextCache.get(path);
  }
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`无法读取 ${path}`);
  }
  const text = await response.text();
  articleTextCache.set(path, text);
  return text;
}

function renderFilters() {
  renderChips(els.bookFilters, ["全部", "伤寒论", "金匮要略"], "book");
  const categories = ["全部", ...new Set([
    ...datasets.articles.map((item) => item.category),
    ...datasets.formulas.map((item) => item.category),
    ...datasets.jingui.map((item) => item.category)
  ].filter(Boolean))];
  renderChips(els.categoryFilters, categories, "category");
}

function renderChips(container, values, key) {
  container.innerHTML = values.map((value) => (
    `<button class="chip ${filters[key] === value ? "is-active" : ""}" type="button" data-filter="${key}" data-value="${escapeHtml(value)}">${escapeHtml(value)}</button>`
  )).join("");
}

function renderAll() {
  const query = els.search.value.trim().toLowerCase();
  const articles = applyFilters(datasets.articles, query);
  const formulas = applyFilters(datasets.formulas, query);
  const jingui = applyFilters(datasets.jingui, query);

  renderArticleCards(articles);
  renderFormulaCards(formulas);
  renderClauseList(els.jinguiGrid, jingui, "金匮要略");

  els.articleCount.textContent = articles.length;
  els.formulaCount.textContent = formulas.length;
  els.jinguiCount.textContent = jingui.length;
  els.articlesHint.textContent = articles.length ? `共 ${articles.length} 个专题。` : "当前筛选没有专题。";
  els.formulasHint.textContent = formulas.length ? `共 ${formulas.length} 首方剂。` : "当前筛选没有方剂。";
  els.jinguiHint.textContent = jingui.length ? `共 ${jingui.length} 条金匮要略条文。` : "当前筛选没有金匮要略条文。";
  els.empty.hidden = articles.length + formulas.length + jingui.length > 0;
}

function applyFilters(items, query) {
  return items.filter((item) => {
    const bookOk = filters.book === "全部" || item.book === filters.book || item.source === filters.book;
    const categoryOk = filters.category === "全部" || item.category === filters.category;
    const queryOk = !query || searchableText(item).includes(query);
    return bookOk && categoryOk && queryOk;
  });
}

function searchableText(item) {
  return [
    item.title,
    item.name,
    item.formula,
    item.number,
    item.text,
    item.book,
    item.source,
    item.category,
    item.volume,
    item.pattern,
    item.summary,
    item.symptoms,
    item.keywords,
    item.formulas,
    item.clauses
  ].flat().filter(Boolean).join(" ").toLowerCase();
}

function renderArticleCards(items) {
  els.articlesGrid.innerHTML = items.map((item) => `
    <button class="library-card article-card" type="button" data-kind="article" data-id="${escapeHtml(item.id)}">
      <div class="tag-row">
        ${tag(item.book)}
        ${tag(item.category)}
        ${tag(item.volume)}
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.summary || "")}</p>
      <div class="card-footer">
        <span>${escapeHtml((item.keywords || []).slice(0, 3).join("、"))}</span>
        <span>阅读全文</span>
      </div>
    </button>
  `).join("");
}

function renderFormulaCards(items) {
  els.formulasGrid.innerHTML = items.map((item) => `
    <button class="library-card" type="button" data-kind="formula" data-id="${escapeHtml(item.id)}">
      <div class="tag-row">
        ${tag(item.source)}
        ${tag(item.category)}
      </div>
      <h3>${escapeHtml(item.name)}</h3>
      <p>${escapeHtml(item.pattern || item.indications || item.notes || "")}</p>
      <div class="card-footer">
        <span>${escapeHtml(formatList(item.clauses) || "条文待补")}</span>
        <span>查看详情</span>
      </div>
    </button>
  `).join("");
}

function renderClauseList(container, items, book) {
  container.innerHTML = items.map((item) => `
    <button class="clause-card" type="button" data-kind="jingui" data-id="${escapeHtml(item.id)}">
      <div class="clause-head">
        <strong>${escapeHtml(item.number ? `${book} ${item.number}` : book)}</strong>
        <span>${escapeHtml(item.category)}</span>
      </div>
      <p>${escapeHtml(item.text)}</p>
      <div class="tag-row">${(item.formulas || []).map(tag).join("")}</div>
    </button>
  `).join("");
}

function tag(value) {
  if (!value) return "";
  return `<span class="tag">${escapeHtml(String(value))}</span>`;
}

async function openDetail(kind, id) {
  const sourceKey = kind === "formula" ? "formulas" : kind === "article" ? "articles" : "jingui";
  const item = datasets[sourceKey].find((entry) => entry.id === id);
  if (!item) return;

  const title = item.name || item.title || `${item.book || ""} ${item.number || ""}`.trim();
  els.modalCategory.textContent = kind === "formula" ? "方剂" : item.book;
  els.modalTitle.textContent = title;
  els.modalTags.innerHTML = [item.source, item.book, item.category, item.volume, ...(item.keywords || [])].filter(Boolean).map(tag).join("");
  els.modalDetails.innerHTML = kind === "article"
    ? "<p class=\"detail-value\">正文加载中...</p>"
    : buildDetails(item);
  els.modal.hidden = false;
  document.body.style.overflow = "hidden";

  if (kind === "article") {
    try {
      const text = await fetchText(item.path);
      els.modalDetails.innerHTML = `
        ${buildDetails(item, ["path"])}
        <div class="article-body">${escapeHtml(text)}</div>
      `;
    } catch (error) {
      els.modalDetails.innerHTML = `<p class="detail-value">${escapeHtml(error.message)}</p>`;
    }
  }
}

function buildDetails(item, extraHidden = []) {
  const hidden = new Set(["id", "name", "title", "type", ...extraHidden]);
  const keys = [...detailOrder, ...Object.keys(item).filter((key) => !detailOrder.includes(key))];
  return keys
    .filter((key) => !hidden.has(key))
    .filter((key) => hasValue(item[key]))
    .map((key) => `
      <div class="detail-item">
        <div class="detail-label">${escapeHtml(labels[key] || key)}</div>
        <p class="detail-value">${escapeHtml(formatList(item[key]))}</p>
      </div>
    `).join("");
}

function hasValue(value) {
  return Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && String(value).trim() !== "";
}

function formatList(value) {
  return Array.isArray(value) ? value.join("、") : String(value ?? "");
}

function closeModal() {
  els.modal.hidden = true;
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

document.addEventListener("click", (event) => {
  const chip = event.target.closest("[data-filter]");
  if (chip) {
    filters[chip.dataset.filter] = chip.dataset.value;
    renderFilters();
    renderAll();
    return;
  }

  const card = event.target.closest("[data-kind][data-id]");
  if (card) {
    openDetail(card.dataset.kind, card.dataset.id);
    return;
  }

  if (event.target.matches("[data-close-modal]")) {
    closeModal();
  }
});

els.search.addEventListener("input", renderAll);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !els.modal.hidden) {
    closeModal();
  }
});

loadData().catch((error) => {
  els.empty.hidden = false;
  els.empty.textContent = `${error.message}，请检查 data 目录下的 JSON 文件。`;
});
