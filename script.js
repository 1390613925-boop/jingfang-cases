const datasets = {
  formulas: [],
  jingui: [],
  cases: []
};

const filters = {
  book: "全部",
  category: "全部"
};

let activeModule = "formulas";
const CASE_RENDER_LIMIT = 90;
let searchRenderTimer = 0;
let searchRenderFrame = 0;

const formulaCategoryOrder = ["太阳病", "阳明病", "少阳病", "太阴病", "少阴病", "厥阴病", "霍乱病", "差后劳复与阴阳易", "伤寒论"];

const shanghan113Rows = `
太阳病|白虎加人参汤
太阳病|甘草干姜汤
太阳病|桂枝二麻黄一汤
太阳病|桂枝二越婢一汤
太阳病|桂枝加附子汤
太阳病|桂枝加葛根汤
太阳病|桂枝麻黄各半汤
太阳病|桂枝去桂加茯苓白术汤
太阳病|桂枝去芍药加附子汤
太阳病|桂枝去芍药汤
太阳病|桂枝汤
太阳病|桂枝加厚朴杏子汤
太阳病|芍药甘草汤
太阳病|四逆汤
少阳病|柴胡加龙骨牡蛎汤
少阳病|柴胡加芒硝汤
少阳病|大柴胡汤
太阳病|大青龙汤
太阳病|抵当汤
太阳病|抵当丸
太阳病|茯苓甘草汤
太阳病|茯苓桂枝白术甘草汤
太阳病|茯苓桂枝甘草大枣汤
太阳病|茯苓四逆汤
太阳病|干姜附子汤
太阳病|葛根黄芩黄连汤
太阳病|葛根加半夏汤
太阳病|葛根汤
太阳病|桂枝甘草龙骨牡蛎汤
太阳病|桂枝甘草汤
太阳病|桂枝加桂汤
太阳病|桂枝新加汤
太阳病|桂枝去芍药加蜀漆牡蛎龙骨救逆汤
太阴病|厚朴生姜半夏甘草人参汤
太阳病|麻黄汤
太阳病|麻黄杏仁甘草石膏汤
太阳病|芍药甘草附子汤
太阳病|桃核承气汤
阳明病|调胃承气汤
太阳病|五苓散
少阳病|小柴胡汤
太阴病|小建中汤
太阳病|小青龙汤
太阳病|禹余粮丸
少阴病|真武汤
太阳病|栀子豉汤
太阳病|栀子甘草豉汤
太阳病|栀子干姜汤
太阳病|栀子厚朴汤
太阳病|栀子生姜豉汤
阳明病|白虎汤
太阳病|三物白散
太阳病|半夏泻心汤
少阳病|柴胡桂枝干姜汤
少阳病|柴胡桂枝汤
太阳病|赤石脂禹余粮汤
太阳病|大黄黄连泻心汤
太阳病|大陷胸汤
太阳病|大陷胸丸
太阳病|附子泻心汤
太阳病|甘草附子汤
太阳病|甘草泻心汤
太阳病|瓜蒂散
太阳病|桂枝附子汤
太阴病|桂枝人参汤
太阳病|黄连汤
太阳病|黄芩加半夏生姜汤
太阳病|黄芩汤
太阳病|去桂加白术汤
太阳病|生姜泻心汤
太阳病|十枣汤
太阳病|文蛤散
太阳病|小陷胸汤
太阳病|旋覆代赭汤
太阳病|炙甘草汤
阳明病|大承气汤
阳明病|麻黄连轺赤小豆汤
阳明病|麻子仁丸
阳明病|蜜煎
阳明病|吴茱萸汤
阳明病|小承气汤
阳明病|茵陈蒿汤
阳明病|栀子柏皮汤
阳明病|猪苓汤
太阴病|桂枝加大黄汤
太阴病|桂枝加芍药汤
少阴病|白通加猪胆汁汤
少阴病|白通汤
少阴病|半夏散及汤
少阴病|附子汤
少阴病|甘草汤
少阴病|黄连阿胶汤
少阴病|桔梗汤
少阴病|苦酒汤
少阴病|麻黄附子甘草汤
少阴病|麻黄附子细辛汤
少阴病|四逆散
少阴病|桃花汤
少阴病|通脉四逆汤
少阴病|猪肤汤
厥阴病|白头翁汤
厥阴病|当归四逆加吴茱萸生姜汤
厥阴病|当归四逆汤
厥阴病|干姜黄芩黄连人参汤
厥阴病|麻黄升麻汤
厥阴病|乌梅丸
霍乱病|理中丸
霍乱病|四逆加人参汤
霍乱病|通脉四逆加猪胆汁汤
差后劳复与阴阳易|牡蛎泽泻散
差后劳复与阴阳易|烧裈散
差后劳复与阴阳易|枳实栀子豉汤
差后劳复与阴阳易|竹叶石膏汤
`.trim();

const els = {
  search: document.querySelector("#siteSearch"),
  empty: document.querySelector("#emptyState"),
  formulasGrid: document.querySelector("#formulasGrid"),
  jinguiGrid: document.querySelector("#jinguiGrid"),
  casesGrid: document.querySelector("#casesGrid"),
  formulaCount: document.querySelector("#formulaCount"),
  sourceCount: document.querySelector("#sourceCount"),
  jinguiCount: document.querySelector("#jinguiCount"),
  caseCount: document.querySelector("#caseCount"),
  moduleTabs: document.querySelectorAll("[data-module-tab]"),
  modulePanels: document.querySelectorAll("[data-module-panel]"),
  formulasHint: document.querySelector("#formulasHint"),
  jinguiHint: document.querySelector("#jinguiHint"),
  casesHint: document.querySelector("#casesHint"),
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
  sourceUrl: "原文链接",
  date: "日期",
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
  notes: "条辨 / 按语",
  summary: "摘要",
  content: "医案正文",
  status: "整理状态",
  standardIndex: "113方序号"
};

const detailOrder = [
  "book",
  "source",
  "category",
  "volume",
  "sourceTopic",
  "date",
  "sourceUrl",
  "summary",
  "clauses",
  "sixChannel",
  "syndrome",
  "pattern",
  "treatment",
  "composition",
  "dosage",
  "usage",
  "formulaMeaning",
  "keyPoints",
  "differentiation",
  "warnings",
  "indications",
  "notes",
  "content",
  "status",
  "standardIndex",
  "keywords"
];

async function loadData() {
  const [articleText, legacyFormulas, jingui, cases] = await Promise.all([
    loadArticleCorpus(),
    fetchJson("./data/formulas.json").catch(() => []),
    fetchJson("./data/jingui-clauses.json"),
    fetchJson("./data/cases.json").catch(() => [])
  ]);

  datasets.formulas = mergeFormulas(parseFormulaCards(articleText), legacyFormulas);
  datasets.jingui = jingui.map((item) => ({ ...item, book: "金匮要略", type: "jingui" }));
  datasets.cases = cases.map(normalizeCase);
  buildSearchIndex();
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

function normalizeCase(item) {
  return {
    ...item,
    book: item.book || "倪师医案",
    source: item.source || "医案资料",
    category: item.category || "倪师医案",
    type: "case",
    title: item.title || item.name || "未命名医案",
    keywords: item.keywords || [item.title, item.formula, item.pattern, item.category].filter(Boolean),
    symptoms: item.symptoms || []
  };
}

function buildSearchIndex() {
  [...datasets.formulas, ...datasets.jingui, ...datasets.cases].forEach((item) => {
    item._searchText = buildSearchText(item);
  });
}

async function loadArticleCorpus() {
  const raw = await fetchText("./data/articles.json");
  try {
    const index = JSON.parse(raw);
    if (!Array.isArray(index)) return raw;
    const parts = await Promise.all(index.map(async (article) => {
      if (!article.path) return "";
      const body = await fetchText(article.path);
      return [
        `文件名：${article.title || article.id || article.path}`,
        `卷次：${article.volume || ""}`,
        `范围：${article.category || article.title || ""}`,
        "",
        body
      ].join("\n");
    }));
    return parts.filter(Boolean).join("\n\n");
  } catch (error) {
    return appendSupplementalArticles(raw);
  }
}

async function appendSupplementalArticles(raw) {
  const supplemental = [
    {
      title: "太阳病篇：麻黄汤系、大小青龙汤系、麻杏石甘汤系",
      volume: "第二卷",
      category: "太阳病",
      path: "./data/articles/sh-taiyang-mahuang.txt"
    }
  ];

  const parts = await Promise.all(supplemental.map(async (article) => {
    try {
      const body = await fetchText(article.path);
      if (raw.includes(body.slice(0, 80))) return "";
      return [
        `文件名：${article.title}`,
        `卷次：${article.volume}`,
        `范围：${article.category}`,
        "",
        body
      ].join("\n");
    } catch (error) {
      return "";
    }
  }));

  return [raw, ...parts.filter(Boolean)].join("\n\n");
}

function mergeFormulas(parsed, legacy) {
  const byName = new Map();
  const standardFormulas = getStandardFormulas();
  const standardNames = new Set(standardFormulas.map((item) => item.name));

  standardFormulas.forEach((item) => {
    byName.set(item.name, item);
  });

  legacy.forEach((item) => {
    normalizeFormulaNames(item.name || "").forEach((name, index) => {
      const canonicalName = canonicalizeFormulaName(name);
      if (standardNames.has(canonicalName)) {
        byName.set(canonicalName, mergeFormulaCard(byName.get(canonicalName), normalizeLegacyFormula(item, canonicalName, index)));
      }
    });
  });
  parsed.forEach((item) => {
    const canonicalName = canonicalizeFormulaName(item.name);
    if (standardNames.has(canonicalName)) {
      byName.set(canonicalName, mergeFormulaCard(byName.get(canonicalName), { ...item, name: canonicalName, status: "已整理" }));
    }
  });
  return [...byName.values()].sort((a, b) => {
    const rank = getCategoryRank(a.category) - getCategoryRank(b.category);
    return rank || `${a.category}${a.name}`.localeCompare(`${b.category}${b.name}`, "zh-Hans-CN");
  });
}

function getStandardFormulas() {
  return shanghan113Rows.split("\n").map((row, index) => {
    const [category, name] = row.split("|");
    return {
      id: makeId(`standard-${name}`),
      name,
      book: "伤寒论",
      source: "伤寒论",
      type: "formula",
      category,
      sourceTopic: "《伤寒论》113方底表",
      status: "待补条辨",
      notes: "已列入《伤寒论》113方底表，详细条文、组成、方义与鉴别待继续整理补充。",
      keywords: [name, category, "113方", "待补条辨"],
      standardIndex: index + 1
    };
  });
}

function mergeFormulaCard(base, incoming) {
  return {
    ...base,
    ...incoming,
    id: base?.id || incoming.id,
    category: incoming.category || base?.category,
    sourceTopic: incoming.sourceTopic || base?.sourceTopic,
    status: incoming.status || base?.status
  };
}

function normalizeLegacyFormula(item, name = item.name, index = 0) {
  return {
    ...item,
    id: item.id ? `${item.id}-${index}` : makeId(name),
    name,
    book: item.source || "伤寒论",
    source: item.source || "伤寒论",
    type: "formula",
    syndrome: item.syndrome || item.pattern || "",
    treatment: item.treatment || "",
    formulaMeaning: item.formulaMeaning || "",
    keyPoints: item.keyPoints || "",
    sourceTopic: item.sourceTopic || item.category || "",
    keywords: item.keywords || [item.name, item.category].filter(Boolean),
    status: "已整理"
  };
}

function parseFormulaCards(raw) {
  const textParts = raw.split(/(?=文件名：)/).filter((part) => part.includes("【方名】"));
  const cards = [];

  textParts.forEach((textPart) => {
    const volume = getLineValue(textPart, "卷次");
    const sourceTopic = getLineValue(textPart, "范围");
    const sections = getFormulaSections(textPart);

    sections.forEach((section, index) => {
      const names = normalizeFormulaNames(getField(section, "方名"));
      if (!names.length) return;
      const category = detectCategory(sourceTopic) || detectCategory(section) || "伤寒论";

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

function getFormulaSections(text) {
  const nameMatches = [...text.matchAll(/【方名】/g)];
  if (!nameMatches.length) return [];
  const starts = nameMatches.map((match, index) => {
    const nameAt = match.index;
    const previousNameAt = index > 0 ? nameMatches[index - 1].index : 0;
    const clauseAt = text.lastIndexOf("【条文", nameAt);
    if (clauseAt > previousNameAt) return clauseAt;
    const separatorAt = text.lastIndexOf("============================================================", nameAt);
    return separatorAt > previousNameAt ? separatorAt : previousNameAt;
  });

  return starts.map((start, index) => {
    const end = starts[index + 1] || text.length;
    return text.slice(start, end).trim();
  }).filter((section, index, list) => section.includes("【方名】") && list.indexOf(section) === index);
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
  return value
    .split(/\r?\n+/)
    .map((name) => name.replace(/[。；;]+$/g, "").replace(/[，,](简称|又名).*$/g, "").trim())
    .filter(Boolean);
}

function canonicalizeFormulaName(name) {
  const cleaned = name
    .replace(/[。；;]+$/g, "")
    .replace(/[，,](简称|又名).*$/g, "")
    .trim();
  const aliases = {
    "麻杏甘石汤": "麻黄杏仁甘草石膏汤",
    "麻黄杏子甘草石膏汤": "麻黄杏仁甘草石膏汤",
    "苓桂甘枣汤": "茯苓桂枝甘草大枣汤",
    "桂枝汤加厚朴杏子": "桂枝加厚朴杏子汤",
    "桂枝加芍药生姜各一两人参三两新加汤": "桂枝新加汤",
    "桂枝去芍药加蜀漆龙骨牡蛎救逆汤": "桂枝去芍药加蜀漆牡蛎龙骨救逆汤",
    "白散": "三物白散",
    "复脉汤": "炙甘草汤",
    "麻黄细辛附子汤": "麻黄附子细辛汤",
    "白通加猪胆汤": "白通加猪胆汁汤",
    "蜜煎导法": "蜜煎",
    "理中汤": "理中丸"
  };
  return aliases[cleaned] || cleaned;
}

function cleanText(value) {
  return value.replace(/\r/g, "").trim().replace(/\n{3,}/g, "\n\n");
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
  if (value.includes("劳复") || value.includes("阴阳易")) return "差后劳复与阴阳易";
  return "";
}

function getCategoryRank(category = "") {
  const index = formulaCategoryOrder.findIndex((item) => item === category || category.includes(item.replace(/病$/, "")));
  return index === -1 ? formulaCategoryOrder.length : index;
}

function makeId(name) {
  return `formula-${[...name].map((char) => char.charCodeAt(0).toString(16)).join("-")}`;
}

function buildKeywords(item) {
  return [
    item.name,
    item.category,
    item.syndrome,
    item.pattern,
    item.treatment
  ].join("、").split(/[、，,。\s]+/).filter((value, index, list) => value && list.indexOf(value) === index).slice(0, 18);
}

function renderFilters() {
  renderChips(els.bookFilters, ["全部", "伤寒论", "金匮要略", "倪师医案"], "book");
  const source = activeModule === "formulas" ? datasets.formulas : activeModule === "jingui" ? datasets.jingui : datasets.cases;
  const ordered = ["太阳病", "阳明病", "少阳病", "太阴病", "少阴病", "厥阴病", "未定六经"];
  const rest = [...new Set(source.map((item) => item.category).filter(Boolean))]
    .filter((item) => !ordered.includes(item))
    .sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
  const categories = ["全部", ...ordered.filter((item) => source.some((entry) => entry.category === item)), ...rest];
  renderChips(els.categoryFilters, categories, "category");
}

function renderChips(container, values, key) {
  container.innerHTML = values.map((value) => `<button class="chip ${filters[key] === value ? "is-active" : ""}" type="button" data-filter="${key}" data-value="${escapeHtml(value)}">${escapeHtml(value)}</button>`).join("");
}

function renderAll() {
  const query = normalizeForSearch(els.search.value.trim());
  const formulas = applyFilters(datasets.formulas, query);
  const jingui = applyFilters(datasets.jingui, query);
  const cases = applyFilters(datasets.cases, query);

  syncModulePanels();
  if (activeModule === "formulas") renderFormulaCards(formulas);
  if (activeModule === "jingui") renderClauseList(els.jinguiGrid, jingui, "金匮要略");
  if (activeModule === "cases") renderCaseCards(cases, query);

  els.formulaCount.textContent = formulas.length;
  els.sourceCount.textContent = new Set(datasets.formulas.map((item) => item.sourceTopic).filter(Boolean)).size;
  els.jinguiCount.textContent = jingui.length;
  els.caseCount.textContent = cases.length;
  els.formulasHint.textContent = formulas.length ? `共 ${formulas.length} 首方剂，按六经分组，点击卡片查看详情。` : "当前筛选没有方剂。";
  els.jinguiHint.textContent = jingui.length ? `共 ${jingui.length} 条金匮要略条文。` : "当前筛选没有金匮要略条文。";
  els.casesHint.textContent = caseHintText(cases, query);
  const activeCount = activeModule === "formulas" ? formulas.length : activeModule === "jingui" ? jingui.length : cases.length;
  els.empty.hidden = activeCount > 0;
}

function syncModulePanels() {
  els.moduleTabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.moduleTab === activeModule);
  });
  els.modulePanels.forEach((panel) => {
    panel.hidden = panel.dataset.modulePanel !== activeModule;
  });
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
  if (item._searchText !== undefined) return item._searchText;
  item._searchText = buildSearchText(item);
  return item._searchText;
}

function buildSearchText(item) {
  return normalizeForSearch([
    item.title,
    item.name,
    item.formula,
    item.number,
    item.text,
    item.book,
    item.source,
    item.sourceUrl,
    item.date,
    item.category,
    item.volume,
    item.sixChannel,
    item.syndrome,
    item.pattern,
    item.treatment,
    item.summary,
    item.content,
    item.symptoms,
    item.keywords,
    item.formulas,
    item.clauses
  ].flat().filter(Boolean).join(" "));
}

function normalizeForSearch(value) {
  const map = {
    "醫": "医", "藥": "药", "學": "学", "經": "经", "論": "论", "證": "证", "條": "条", "辨": "辨",
    "湯": "汤", "劑": "剂", "方": "方", "傷": "伤", "寒": "寒", "雜": "杂", "臟": "脏", "腑": "腑",
    "陽": "阳", "陰": "阴", "腎": "肾", "肝": "肝", "膽": "胆", "脾": "脾", "胃": "胃", "肺": "肺",
    "腸": "肠", "腦": "脑", "頭": "头", "風": "风", "濕": "湿", "熱": "热", "寒": "寒", "氣": "气",
    "血": "血", "痰": "痰", "飲": "饮", "癥": "症", "癰": "痈", "瘡": "疮", "腫": "肿", "瘤": "瘤",
    "癲": "癫", "癇": "痫", "癒": "愈", "療": "疗", "診": "诊", "斷": "断", "處": "处", "體": "体",
    "婦": "妇", "兒": "儿", "產": "产", "髮": "发", "發": "发", "後": "后", "裡": "里", "裏": "里",
    "轉": "转", "變": "变", "關": "关", "開": "开", "閉": "闭", "瀉": "泻", "補": "补", "虛": "虚",
    "實": "实", "濁": "浊", "鬱": "郁", "滯": "滞", "鬆": "松", "緊": "紧", "緩": "缓", "雙": "双",
    "單": "单", "難": "难", "臨": "临", "床": "床", "師": "师", "漢": "汉", "唐": "唐", "學生": "学生",
    "棗": "枣", "薑": "姜", "蔥": "葱", "蔘": "参", "參": "参", "朮": "术", "麥": "麦", "麴": "曲",
    "黃": "黄", "龍": "龙", "鬚": "须", "鬱": "郁", "硃": "朱", "硃": "朱", "礬": "矾", "鹽": "盐",
    "烏": "乌", "雞": "鸡", "馬": "马", "驚": "惊", "驅": "驱", "蟲": "虫", "蟬": "蝉", "蠣": "蛎",
    "貝": "贝", "貞": "贞", "貧": "贫", "貫": "贯", "連": "连", "遠": "远", "適": "适", "遲": "迟",
    "選": "选", "還": "还", "這": "这", "個": "个", "與": "与", "為": "为", "無": "无", "來": "来",
    "會": "会", "應": "应", "時": "时", "點": "点", "見": "见", "觀": "观", "問": "问", "聞": "闻",
    "說": "说", "記": "记", "錄": "录", "寫": "写", "復": "复", "續": "续", "對": "对", "帶": "带",
    "數": "数", "歲": "岁", "號": "号", "頁": "页", "類": "类", "總": "总", "別": "别", "塊": "块",
    "裡": "里", "從": "从", "點": "点", "擊": "击", "顯": "显", "頁": "页", "網": "网"
  };
  return String(value || "")
    .toLowerCase()
    .replace(/[，。、“”‘’；：？！《》（）【】\[\]{}]/g, " ")
    .replace(/[\s\r\n\t]+/g, " ")
    .replace(/[\u3400-\u9fff]/g, (char) => map[char] || char)
    .trim();
}

function renderFormulaCards(items) {
  const groups = groupByCategory(items);
  els.formulasGrid.innerHTML = groups.map(([category, formulas]) => `
    <section class="formula-group" aria-labelledby="group-${makeId(category)}">
      <div class="formula-group-head">
        <h3 id="group-${makeId(category)}">${escapeHtml(category)}</h3>
        <span>${formulas.length} 首</span>
      </div>
      <div class="formula-group-grid">
        ${formulas.map(formulaCard).join("")}
      </div>
    </section>
  `).join("");
}

function groupByCategory(items) {
  const byCategory = new Map();
  items.forEach((item) => {
    const category = item.category || "未分经";
    if (!byCategory.has(category)) byCategory.set(category, []);
    byCategory.get(category).push(item);
  });
  return [...byCategory.entries()].sort((a, b) => getCategoryRank(a[0]) - getCategoryRank(b[0]));
}

function formulaCard(item) {
  return `
    <button class="library-card" type="button" data-kind="formula" data-id="${escapeHtml(item.id)}">
      <div class="tag-row">${tag(item.source)}${tag(item.category)}${tag(item.volume)}${tag(item.status)}</div>
      <h3>${escapeHtml(item.name)}</h3>
      <p>${escapeHtml(item.syndrome || item.pattern || item.notes || "")}</p>
      <div class="card-footer"><span>${escapeHtml(item.treatment || item.sourceTopic || "方证详情")}</span><span>查看详情</span></div>
    </button>
  `;
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

function renderCaseCards(items, query) {
  const visible = shouldLimitCases(query) ? items.slice(0, CASE_RENDER_LIMIT) : items;
  const groups = groupByCategory(visible);
  const channelStats = caseChannelStats(items);
  const notice = shouldLimitCases(query) && items.length > CASE_RENDER_LIMIT
    ? `<p class="result-note">当前匹配 ${items.length} 篇，先显示 ${CASE_RENDER_LIMIT} 篇。继续输入病名、方名、症状或选择六经，可以更快定位。</p>`
    : "";
  els.casesGrid.innerHTML = `
    <div class="channel-overview">${channelStats.map(([name, count]) => `<button class="channel-pill" type="button" data-filter="category" data-value="${escapeHtml(name)}"><strong>${escapeHtml(name)}</strong><span>${count}</span></button>`).join("")}</div>
    ${notice}
    ${groups.map(([category, cases]) => `
      <section class="formula-group" aria-labelledby="case-group-${makeId(category)}">
        <div class="formula-group-head">
          <h3 id="case-group-${makeId(category)}">${escapeHtml(category)}</h3>
          <span>${cases.length} 篇</span>
        </div>
        <div class="formula-group-grid case-grid">
          ${cases.map(caseCard).join("")}
        </div>
      </section>
    `).join("")}
  `;
}

function shouldLimitCases(query) {
  return !query && filters.category === "全部";
}

function caseHintText(items, query) {
  if (!items.length) return "当前筛选没有医案。";
  if (shouldLimitCases(query) && items.length > CASE_RENDER_LIMIT) {
    return `共 ${items.length} 篇医案，已按六经归类。默认先显示 ${CASE_RENDER_LIMIT} 篇，建议用搜索或六经筛选。`;
  }
  return `共 ${items.length} 篇医案，点击卡片查看全文。`;
}

function caseChannelStats(items) {
  const order = ["太阳病", "阳明病", "少阳病", "太阴病", "少阴病", "厥阴病", "未定六经"];
  const counts = new Map(order.map((name) => [name, 0]));
  items.forEach((item) => {
    const key = item.category || item.sixChannel || "未定六经";
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return [...counts.entries()].filter(([, count]) => count > 0);
}

function caseCard(item) {
  return `
    <button class="library-card article-card" type="button" data-kind="case" data-id="${escapeHtml(item.id)}">
      <div class="tag-row">${tag(item.source)}${tag(item.date)}${(item.keywords || []).slice(0, 3).map(tag).join("")}</div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.summary || item.content || "")}</p>
      <div class="card-footer"><span>${escapeHtml(item.formula || item.pattern || item.category || "医案全文")}</span><span>查看详情</span></div>
    </button>
  `;
}

function tag(value) {
  return value ? `<span class="tag">${escapeHtml(String(value))}</span>` : "";
}

function openDetail(kind, id) {
  const sourceKey = kind === "formula" ? "formulas" : kind === "case" ? "cases" : "jingui";
  const item = datasets[sourceKey].find((entry) => entry.id === id);
  if (!item) return;
  const title = item.name || item.title || `${item.book || ""} ${item.number || ""}`.trim();
  els.modalCategory.textContent = kind === "formula" ? "方剂" : kind === "case" ? "医案" : item.book;
  els.modalTitle.textContent = title;
  els.modalTags.innerHTML = [item.source, item.book, item.category, item.volume, ...(item.keywords || [])].filter(Boolean).map(tag).join("");
  els.modalDetails.innerHTML = buildDetails(item);
  els.modal.hidden = false;
  document.body.style.overflow = "hidden";
}

function buildDetails(item) {
  const hidden = new Set(["id", "name", "title", "type", "raw", "_searchText"]);
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
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

document.addEventListener("click", (event) => {
  const moduleTab = event.target.closest("[data-module-tab]");
  if (moduleTab) {
    activeModule = moduleTab.dataset.moduleTab;
    filters.book = activeModule === "formulas" ? "伤寒论" : activeModule === "jingui" ? "金匮要略" : "倪师医案";
    filters.category = "全部";
    renderFilters();
    renderAll();
    return;
  }

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

els.search.addEventListener("input", () => {
  window.clearTimeout(searchRenderTimer);
  window.cancelAnimationFrame(searchRenderFrame);
  searchRenderTimer = window.setTimeout(() => {
    searchRenderFrame = window.requestAnimationFrame(renderAll);
  }, 160);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !els.modal.hidden) closeModal();
});

loadData().catch((error) => {
  els.empty.hidden = false;
  els.empty.textContent = `${error.message}，请检查 data 目录下的 JSON 文件。`;
});
