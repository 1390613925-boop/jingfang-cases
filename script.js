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
  sourceTopic: "整理范围",
  formula: "方名",
  formulas: "关联方剂",
  clauses: "条文",
  number: "条文编号",
  text: "条文",
  sixChannel: "六经",
  syndrome: "证型 / 主证",
  pattern: "病机",
  treatment: "治法",
  symptoms: "症状",
  keywords: "关键词",
  composition: "组成",
  dosage: "常用成人剂量参考",
  usage: "煎服法",
  formulaMeaning: "方义",
  keyPoints: "辨证抓手",
  differentiation: "鉴别",
  warnings: "提醒",
  indications: "主治",
  notes: "条辨 / 按语"
};

const detailOrder = ["book", "source", "category", "volume", "sourceTopic", "clauses", "sixChannel", "syndrome", "pattern", "treatment", "composition", "dosage", "usage", "formulaMeaning", "keyPoints", "differentiation", "warnings", "indications", "notes", "keywords"];

async function loadData() {
  const [articleText, legacyFormulas, jingui] = await Promise.all([
    fetchText("./data/articles.json"),
    fetchJson("./data/formulas.json").catch(() => []),
    fetchJson("./data/jingui-clauses.json")
  ]);
  datasets.formulas = mergeFormulas(parseFormulaCards(articleText), legacyFormulas);
  datasets.jingui = jingui.map((item) => ({ ...item, book: "金匮要略", type: "jingui" }));
  renderFilters();
  renderAll();
}

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`无法读取 ${path}`);
  return response.json();
}

async function fetchText(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`无法读取 ${path}`);
  return response.text();
}

function mergeFormulas(parsed, legacy) {
  const byName = new Map();
  legacy.forEach((item) => {
    if (item.name) byName.set(item.name, normalizeLegacyFormula(item));
  });
  parsed.forEach((item) => byName.set(item.name, item));
  return [...byName.values()].sort((a, b) => `${a.category}${a.name}`.localeCompare(`${b.category}${b.name}`, "zh-Hans-CN"));
}

function normalizeLegacyFormula(item) {
  return {
    ...item,
    book: item.source || "伤寒论",
    source: item.source || "伤寒论",
    type: "formula",
    syndrome: item.syndrome || item.pattern || "",
    treatment: item.treatment || "",
    formulaMeaning: item.formulaMeaning || "",
    keyPoints: item.keyPoints || "",
    sourceTopic: item.sourceTopic || item.category || "",
    keywords: item.keywords || [item.name, item.category].filter(Boolean)
  };
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
    if (!previous || (item.raw || "").length > (previous.raw || "").length) byName.set(item.name, item);
  });
  return [...byName.values()];
}

function getLineValue(text, label) {
  const match = text.match(new RegExp(`${label}：(.+)`));
  return match ? match[1].trim() : "";
}

function getField(section, label) {
  const match = section.match(new RegExp(`【${label}】\\s*([\\s\\S]*?)(?=\\n【[^】]+】|$)`));
  return match ? cleanText(match[1]) : "";
}

function normalizeFormulaNames(value) {
  return value.split(/\n+/).map((name) => name.replace(/[。；;]+$/g, "").replace(/，简称.*$/g, "").trim()).filter(Boolean);
}

function cleanText(value) {
  return value.trim().replace(/\n{3,}/g, "\n\n");
}

function sectionHeading(section) {
  for (const line of section.split("\n")) {
    const value = line.trim();
    if (value && !value.startsWith("【") && !/^=+$/.test(value)) return value.replace(/^[一二三四五六七八九十百〇零]+[、.．]?/, "");
  }
  return "";
}

function detectCategory(value) {
  for (const key of ["太阳", "阳明", "少阳", "太阴", "少阴", "厥阴"]) {
    if (value.includes(key)) return `${key}病`;
  }
  if (value.includes("霍乱")) return "霍乱病";
  if (value.includes("劳复") || value.includes("阴阳易")) return "差后劳复与阴阳易";
  return "伤寒论";
}

function makeId(name) {
  return `formula-${[...name].map((char) => char.charCodeAt(0).toString(16)).join("-")}`;
}

function buildKeywords(item) {
  return [item.name, item.category, item.syndrome, item.pattern, item.treatment].join("、").split(/[、，,。\s]+/).filter((value, index, list) => value && list.indexOf(value) === index).slice(0, 18);
}

function renderFilters() {
  renderChips(els.bookFilters, ["全部", "伤寒论", "金匮要略"], "book");
  const categories = ["全部", ...new Set([...datasets.formulas, ...datasets.jingui].map((item) => item.category).filter(Boolean))];
  renderChips(els.categoryFilters, categories, "category");
}

function renderChips(container, values, key) {
  container.innerHTML = values.map((value) => `<button class="chip ${filters[key] === value ? "is-active" : ""}" type="button" data-filter="${key}" data-value="${escapeHtml(value)}">${escapeHtml(value)}</button>`).join("");
}

function renderAll() {
  const query = els.search.value.trim().toLowerCase();
  const formulas = applyFilters(datasets.formulas, query);
  const jingui = applyFilters(datasets.jingui, query);
  renderFormulaCards(formulas);
  renderClauseList(els.jinguiGrid, jingui, "金匮要略");
  els.formulaCount.textContent = formulas.length;
  els.sourceCount.textContent = new Set(datasets.formulas.map((item) => item.sourceTopic).filter(Boolean)).size;
  els.jinguiCount.textContent = jingui.length;
  els.formulasHint.textContent = formulas.length ? `共 ${formulas.length} 首方剂，点击卡片查看详情。` : "当前筛选没有方剂。";
  els.jinguiHint.textContent = jingui.length ? `共 ${jingui.length} 条金匮要略条文。` : "当前筛选没有金匮要略条文。";
  els.empty.hidden = formulas.length + jingui.length > 0;
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
  return [item.title, item.name, item.formula, item.number, item.text, item.book, item.source, item.category, item.volume, item.sixChannel, item.syndrome, item.pattern, item.treatment, item.summary, item.symptoms, item.keywords, item.formulas, item.clauses].flat().filter(Boolean).join(" ").toLowerCase();
}

function renderFormulaCards(items) {
  els.formulasGrid.innerHTML = items.map((item) => `
    <button class="library-card" type="button" data-kind="formula" data-id="${escapeHtml(item.id)}">
      <div class="tag-row">${tag(item.source)}${tag(item.category)}${tag(item.volume)}</div>
      <h3>${escapeHtml(item.name)}</h3>
      <p>${escapeHtml(item.syndrome || item.pattern || item.notes || "")}</p>
      <div class="card-footer"><span>${escapeHtml(item.treatment || item.sourceTopic || "方证详情")}</span><span>查看详情</span></div>
    </button>
  `).join("");
}

function renderClauseList(container, items, book) {
  container.innerHTML = items.map((item) => `
    <button class="clause-card" type="button" data-kind="jingui" data-id="${escapeHtml(item.id)}">
      <div class="clause-head"><strong>${escapeHtml(item.number ? `${book} ${item.number}` : book)}</strong><span>${escapeHtml(item.category)}</span></div>
      <p>${escapeHtml(item.text)}</p>
      <div class="tag-row">${(item.formulas || []).map(tag).join("")}</div>
    </button>
  `).join("");
}

function tag(value) {
  return value ? `<span class="tag">${escapeHtml(String(value))}</span>` : "";
}

function openDetail(kind, id) {
  const sourceKey = kind === "formula" ? "formulas" : "jingui";
  const item = datasets[sourceKey].find((entry) => entry.id === id);
  if (!item) return;
  const title = item.name || item.title || `${item.book || ""} ${item.number || ""}`.trim();
  els.modalCategory.textContent = kind === "formula" ? "方剂" : item.book;
  els.modalTitle.textContent = title;
  els.modalTags.innerHTML = [item.source, item.book, item.category, item.volume, ...(item.keywords || [])].filter(Boolean).map(tag).join("");
  els.modalDetails.innerHTML = buildDetails(item);
  els.modal.hidden = false;
  document.body.style.overflow = "hidden";
}

function buildDetails(item) {
  const hidden = new Set(["id", "name", "title", "type", "raw"]);
  const keys = [...detailOrder, ...Object.keys(item).filter((key) => !detailOrder.includes(key))];
  return keys.filter((key) => !hidden.has(key)).filter((key) => hasValue(item[key])).map((key) => `
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
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
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
  if (event.target.matches("[data-close-modal]")) closeModal();
});

els.search.addEventListener("input", renderAll);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !els.modal.hidden) closeModal();
});

loadData().catch((error) => {
  els.empty.hidden = false;
  els.empty.textContent = `${error.message}，请检查 data 目录下的 JSON 文件。`;
});
