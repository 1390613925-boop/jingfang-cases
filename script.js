const datasets = {
  formulas: [],
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
  jinguiGrid: document.querySelector("#jinguiGrid"),
  formulaCount: document.querySelector("#formulaCount"),
  sourceCount: document.querySelector("#sourceCount"),
  jinguiCount: document.querySelector("#jinguiCount"),
  bookFilters: document.querySelector("#bookFilters"),
  categoryFilters: document.querySelector("#categoryFilters"),
  modal: document.querySelector("#detailModal"),
  modalTitle: document.querySelector("#modalTitle"),
  modalMeta: document.querySelector("#modalMeta"),
  modalBody: document.querySelector("#modalBody"),
  closeModal: document.querySelector("#closeModal")
};

const categories = ["全部", "太阳病", "阳明病", "少阳病", "太阴病", "少阴病", "厥阴病", "霍乱病", "差后劳复", "金匮要略"];

function createButton(label, group, activeValue) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "filter-chip";
  btn.textContent = label;
  btn.dataset.value = label;
  btn.dataset.group = group;
  btn.classList.toggle("active", label === activeValue);
  return btn;
}

function setupFilters() {
  ["全部", "伤寒论", "金匮要略"].forEach((label) => els.bookFilters.appendChild(createButton(label, "book", filters.book)));
  categories.forEach((label) => els.categoryFilters.appendChild(createButton(label, "category", filters.category)));
}

async function fetchJson(url, fallback = []) {
  try {
    const res = await fetch(`${url}?v=${Date.now()}`);
    if (!res.ok) throw new Error(`${url} ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn(`读取失败：${url}`, error);
    return fallback;
  }
}

async function fetchText(url, fallback = "") {
  try {
    const res = await fetch(`${url}?v=${Date.now()}`);
    if (!res.ok) throw new Error(`${url} ${res.status}`);
    return await res.text();
  } catch (error) {
    console.warn(`读取失败：${url}`, error);
    return fallback;
  }
}

async function loadAll() {
  const [articleText, legacyFormulas, jingui] = await Promise.all([
    fetchText("./data/articles.json"),
    fetchJson("./data/formulas.json"),
    fetchJson("./data/jingui-clauses.json")
  ]);

  datasets.formulas = mergeFormulas(parseFormulaCards(articleText), legacyFormulas);
  datasets.jingui = jingui.map((item) => ({
    ...item,
    type: "jingui",
    category: item.category || "金匮要略",
    searchBlob: buildSearchBlob(item)
  }));
  renderAll();
}

function mergeFormulas(parsed, legacy) {
  const byName = new Map();

  parsed.forEach((item) => {
    byName.set(item.name, item);
  });

  legacy.forEach((item) => {
    if (!item.name || byName.has(item.name)) return;
    const normalized = {
      ...item,
      type: "formula",
      book: item.source || item.book || "伤寒论",
      category: item.category || item.sixChannel || "经方",
      sourceTopic: item.sourceTopic || item.category || "基础方剂",
      clauses: item.clauses || item.clause || "",
      notes: item.notes || item.analysis || ""
    };
    normalized.keywords = buildKeywords(normalized);
    normalized.searchBlob = buildSearchBlob(normalized);
    byName.set(normalized.name, normalized);
  });

  return [...byName.values()].sort((a, b) => categoryRank(a.category) - categoryRank(b.category));
}

function categoryRank(category = "") {
  const order = ["太阳", "阳明", "少阳", "太阴", "少阴", "厥阴", "霍乱", "差后", "金匮"];
  const index = order.findIndex((key) => category.includes(key));
  return index === -1 ? order.length : index;
}

function parseFormulaCards(raw) {
  const textParts = raw.split(/(?=文件名：)/).filter((part) => part.includes("【方名】"));
  const cards = [];

  textParts.forEach((textPart) => {
    const volume = getLineValue(textPart, "卷次");
    const sourceTopic = getLineValue(textPart, "范围");
    const sections = textPart.split(/\n={20,}\n/).filter((section) => section.includes("【方名】"));

    sections.forEach((section, index) => {
      const names = normalizeFormulaNames(getField(section, "方名"));
      if (!names.length) return;
      const category = detectCategory(sourceTopic + section);

      names.forEach((name, nameIndex) => {
        const item = {
          id: makeId(`${name}-${index}-${nameIndex}`),
          name,
          title: sectionHeading(section) || name,
          book: "伤寒论",
          source: "伤寒论",
          type: "formula",
          category,
          volume,
          sourceTopic,
          clauses: getField(section, "条文") || getField(section, "条文关联"),
          sixChannel: getField(section, "六经"),
          syndrome: getField(section, "证型") || getField(section, "主证"),
          pattern: getField(section, "病机") || getField(section, "核心病机"),
          treatment: getField(section, "治法"),
          composition: getField(section, "组成"),
          dosage: getField(section, "常用成人剂量参考") || getField(section, "常用剂量提醒"),
          usage: getField(section, "煎服法"),
          formulaMeaning: getField(section, "方义"),
          keyPoints: getField(section, "辨证重点") || getField(section, "辨证抓手") || getField(section, "使用抓手"),
          differentiation: getField(section, "鉴别"),
          warnings: getField(section, "误用提醒") || getField(section, "临床提醒"),
          notes: getField(section, "条辨"),
          raw: section.trim()
        };
        item.keywords = buildKeywords(item);
        cards.push(item);
      });
    });
  });

  const byName = new Map();
  cards.forEach((item) => {
    const previous = byName.get(item.name);
    if (!previous || (item.raw || "").length > (previous.raw || "").length) {
      byName.set(item.name, item);
    }
  });
  return [...byName.values()];
}

function getLineValue(text, label) {
  const match = text.match(new RegExp(`${label}：(.+)`));
  return match ? match[1].trim() : "";
}

function firstField(section, labels) {
  for (const label of labels) {
    const value = getField(section, label);
    if (value) return value;
  }
  return "";
}

function getField(section, label) {
  const match = section.match(new RegExp(`【${label}】\\s*([\\s\\S]*?)(?=\\n【[^】]+】|$)`));
  return match ? cleanText(match[1]) : "";
}

function normalizeFormulaNames(value) {
  return value
    .split(/\n+/)
    .map((name) => name.replace(/[。；;]+$/g, "").replace(/，简称.*$/g, "").trim())
    .filter(Boolean);
}

function cleanText(value) {
  return value.trim().replace(/\n{3,}/g, "\n\n");
}

function sectionHeading(section) {
  for (const line of section.split("\n")) {
    const value = line.trim();
    if (value && !value.startsWith("【") && !/^=+$/.test(value)) {
      return value.replace(/^[一二三四五六七八九十百〇零]+[、.．]?/, "");
    }
  }
  return "";
}

function detectCategory(value) {
  for (const key of ["太阳", "阳明", "少阳", "太阴", "少阴", "厥阴"]) {
    if (value.includes(key)) return `${key}病`;
  }
  if (value.includes("霍乱")) return "霍乱病";
  if (value.includes("差后") || value.includes("劳复") || value.includes("阴阳易")) return "差后劳复";
  return "伤寒论";
}

function makeId(name) {
  return `formula-${[...name].map((char) => char.charCodeAt(0).toString(16)).join("-")}`;
}

function buildKeywords(item) {
  return [
    item.name,
    item.category,
    item.sourceTopic,
    item.syndrome,
    item.pattern,
    item.treatment
  ].join("、").split(/[、，,。\s]+/).filter((value, index, list) => value && list.indexOf(value) === index).slice(0, 18);
}

function buildSearchBlob(item) {
  return [
    item.title,
    item.name,
    item.formula,
    item.category,
    item.book,
    item.source,
    item.sourceTopic,
    item.volume,
    item.sixChannel,
    item.syndrome,
    item.pattern,
    item.symptoms,
    item.treatment,
    item.composition,
    item.clauses,
    item.notes,
    item.keyPoints,
    item.keywords,
    item.tags,
    item.raw
  ].flat().filter(Boolean).join(" ").toLowerCase();
}

function renderAll() {
  const query = els.search.value.trim().toLowerCase();
  const formulas = filterItems(datasets.formulas, query);
  const jingui = filterItems(datasets.jingui, query);

  els.formulaCount.textContent = formulas.length;
  els.sourceCount.textContent = new Set(datasets.formulas.map((item) => item.sourceTopic).filter(Boolean)).size;
  els.jinguiCount.textContent = datasets.jingui.length;

  renderCards(els.formulasGrid, formulas, "formula");
  renderCards(els.jinguiGrid, jingui, "jingui");
  els.empty.classList.toggle("hidden", formulas.length + jingui.length > 0);
}

function filterItems(items, query) {
  return items.filter((item) => {
    const bookOk = filters.book === "全部" || (item.book || item.source || "").includes(filters.book) || item.category === filters.book;
    const categoryOk = filters.category === "全部" || (item.category || "").includes(filters.category) || (item.sixChannel || "").includes(filters.category);
    const searchOk = !query || (item.searchBlob || buildSearchBlob(item)).includes(query);
    return bookOk && categoryOk && searchOk;
  });
}

function renderCards(container, items, kind) {
  container.innerHTML = "";
  const fragment = document.createDocumentFragment();

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = `data-card ${kind}-card`;
    card.tabIndex = 0;
    card.dataset.id = item.id || item.name;
    card.dataset.kind = kind;
    card.innerHTML = cardTemplate(item, kind);
    card.addEventListener("click", () => openDetail(item, kind));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDetail(item, kind);
      }
    });
    fragment.appendChild(card);
  });

  container.appendChild(fragment);
}

function cardTemplate(item, kind) {
  const title = item.name || item.title || item.formula || "未命名";
  const meta = [item.category, item.sourceTopic || item.book || item.source, item.sixChannel].filter(Boolean).slice(0, 3);
  const intro = item.syndrome || item.pattern || item.clauses || item.notes || "点击查看条文与方证整理。";
  const keywords = (item.keywords || buildKeywords(item)).slice(0, 5);

  return `
    <div class="card-topline">
      <span>${kind === "jingui" ? "金匮条文" : item.book || item.source || "伤寒方剂"}</span>
      <span>${item.volume || item.source || ""}</span>
    </div>
    <h3>${escapeHtml(title)}</h3>
    <p>${escapeHtml(intro)}</p>
    <div class="meta-list">${meta.map((value) => `<span>${escapeHtml(value)}</span>`).join("")}</div>
    <div class="keyword-row">${keywords.map((value) => `<em>${escapeHtml(value)}</em>`).join("")}</div>
  `;
}

function openDetail(item, kind) {
  els.modalTitle.textContent = item.name || item.title || item.formula || "详情";
  els.modalMeta.innerHTML = [item.book || item.source, item.category, item.sourceTopic || item.volume].filter(Boolean)
    .map((value) => `<span>${escapeHtml(value)}</span>`).join("");
  els.modalBody.innerHTML = buildDetails(item, kind);
  els.modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  els.closeModal.focus();
}

function buildDetails(item, kind) {
  if (kind === "jingui") {
    return detailSections([
      ["条文", item.clause || item.clauses],
      ["篇章", item.chapter],
      ["病机", item.pattern],
      ["关键词", (item.keywords || []).join("、")],
      ["整理", item.notes]
    ]);
  }

  return detailSections([
    ["条文", item.clauses],
    ["六经", item.sixChannel || item.category],
    ["主证 / 证型", item.syndrome],
    ["病机", item.pattern],
    ["治法", item.treatment],
    ["组成", item.composition],
    ["剂量参考", item.dosage],
    ["煎服法", item.usage],
    ["方义", item.formulaMeaning],
    ["辨证抓手", item.keyPoints],
    ["鉴别", item.differentiation],
    ["提醒", item.warnings],
    ["条辨", item.notes]
  ]);
}

function detailSections(entries) {
  return entries.filter(([, value]) => value).map(([title, value]) => `
    <section class="detail-section">
      <h4>${escapeHtml(title)}</h4>
      <p>${formatText(value)}</p>
    </section>
  `).join("");
}

function formatText(value) {
  return escapeHtml(Array.isArray(value) ? value.join("、") : String(value)).replace(/\n/g, "<br>");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function closeDetail() {
  els.modal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

setupFilters();
loadAll();

els.search.addEventListener("input", renderAll);
els.bookFilters.addEventListener("click", (event) => {
  if (!event.target.matches("button")) return;
  filters.book = event.target.dataset.value;
  [...els.bookFilters.children].forEach((btn) => btn.classList.toggle("active", btn === event.target));
  renderAll();
});
els.categoryFilters.addEventListener("click", (event) => {
  if (!event.target.matches("button")) return;
  filters.category = event.target.dataset.value;
  [...els.categoryFilters.children].forEach((btn) => btn.classList.toggle("active", btn === event.target));
  renderAll();
});
els.closeModal.addEventListener("click", closeDetail);
els.modal.addEventListener("click", (event) => {
  if (event.target === els.modal) closeDetail();
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !els.modal.classList.contains("hidden")) closeDetail();
});