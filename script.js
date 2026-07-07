const datasets = {
  formulas: [],
  shanghan: [],
  jingui: []
};

const filters = {
  book: "全部",
  category: "全部"
};

const els = {
  search: document.querySelector("#siteSearch"),
  empty: document.querySelector("#emptyState"),
  formulasGrid: document.querySelector("#formulasGrid"),
  shanghanGrid: document.querySelector("#shanghanGrid"),
  jinguiGrid: document.querySelector("#jinguiGrid"),
  formulaCount: document.querySelector("#formulaCount"),
  shanghanCount: document.querySelector("#shanghanCount"),
  jinguiCount: document.querySelector("#jinguiCount"),
  formulasHint: document.querySelector("#formulasHint"),
  shanghanHint: document.querySelector("#shanghanHint"),
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
  notes: "按语"
};

const detailOrder = [
  "book",
  "source",
  "category",
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
  "notes"
];

async function loadData() {
  const [formulas, shanghan, jingui] = await Promise.all([
    fetchJson("./data/formulas.json"),
    fetchJson("./data/shanghan-clauses.json"),
    fetchJson("./data/jingui-clauses.json")
  ]);

  datasets.formulas = formulas;
  datasets.shanghan = shanghan.map((item) => ({ ...item, book: "伤寒论" }));
  datasets.jingui = jingui.map((item) => ({ ...item, book: "金匮要略" }));
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

function renderFilters() {
  renderChips(els.bookFilters, ["全部", "伤寒论", "金匮要略"], "book");
  const categories = ["全部", ...new Set([
    ...datasets.formulas.map((item) => item.category),
    ...datasets.shanghan.map((item) => item.category),
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
  const formulas = applyFilters(datasets.formulas, query);
  const shanghan = applyFilters(datasets.shanghan, query);
  const jingui = applyFilters(datasets.jingui, query);

  renderFormulaCards(formulas);
  renderClauseList(els.shanghanGrid, shanghan, "伤寒论");
  renderClauseList(els.jinguiGrid, jingui, "金匮要略");

  els.formulaCount.textContent = formulas.length;
  els.shanghanCount.textContent = shanghan.length;
  els.jinguiCount.textContent = jingui.length;
  els.formulasHint.textContent = formulas.length ? `共 ${formulas.length} 首方剂。` : "当前筛选没有方剂。";
  els.shanghanHint.textContent = shanghan.length ? `共 ${shanghan.length} 条伤寒论条文。` : "当前筛选没有伤寒论条文。";
  els.jinguiHint.textContent = jingui.length ? `共 ${jingui.length} 条金匮要略条文。` : "当前筛选没有金匮要略条文。";
  els.empty.hidden = formulas.length + shanghan.length + jingui.length > 0;
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
    item.pattern,
    item.summary,
    item.symptoms,
    item.keywords,
    item.formulas,
    item.clauses
  ].flat().filter(Boolean).join(" ").toLowerCase();
}

function renderFormulaCards(items) {
  els.formulasGrid.innerHTML = items.map((item) => `
    <button class="library-card" type="button" data-kind="formula" data-id="${escapeHtml(item.id)}">
      <div class="tag-row">
        ${tag(item.source)}
        ${tag(item.category)}
      </div>
      <h3>${escapeHtml(item.name)}</h3>
      <p>${escapeHtml(item.pattern || item.indications || "")}</p>
      <div class="card-footer">
        <span>${escapeHtml(formatList(item.clauses) || "条文待补")}</span>
        <span>查看详情</span>
      </div>
    </button>
  `).join("");
}

function renderClauseList(container, items, book) {
  container.innerHTML = items.map((item) => `
    <button class="clause-card" type="button" data-kind="${book === "伤寒论" ? "shanghan" : "jingui"}" data-id="${escapeHtml(item.id)}">
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

function openDetail(kind, id) {
  const item = datasets[kind].find((entry) => entry.id === id);
  if (!item) return;
  const title = item.name || item.title || `${item.book || ""} ${item.number || ""}`.trim();
  els.modalCategory.textContent = kind === "formulas" ? "方剂" : item.book;
  els.modalTitle.textContent = title;
  els.modalTags.innerHTML = [item.source, item.book, item.category, ...(item.keywords || [])].filter(Boolean).map(tag).join("");
  els.modalDetails.innerHTML = buildDetails(item);
  els.modal.hidden = false;
  document.body.style.overflow = "hidden";
}

function buildDetails(item) {
  const keys = [...detailOrder, ...Object.keys(item).filter((key) => !detailOrder.includes(key))];
  return keys
    .filter((key) => !["id", "name", "title"].includes(key))
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
    const key = card.dataset.kind === "formula" ? "formulas" : card.dataset.kind;
    openDetail(key, card.dataset.id);
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
