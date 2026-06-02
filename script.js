const cases = [
  {
    title: "太阳中风表虚案",
    category: "外感发热",
    formula: "桂枝汤",
    pattern: "营卫不和",
    complaint: "患者恶风汗出，发热头痛，鼻鸣干呕，脉浮缓。",
    summary: "恶风、自汗、脉浮缓为主，重在调和营卫。",
    diagnosis: "太阳中风证。表虚汗出，卫外不固，营阴失守，故见恶风汗出与脉浮缓。",
    prescription: "桂枝、芍药、生姜、大枣、炙甘草。服后啜热粥，温覆取微汗。",
    outcome: "一剂后身微汗出，恶风减轻；二剂后热退头痛止，嘱避风寒、节饮食。"
  },
  {
    title: "少阳寒热往来案",
    category: "半表半里",
    formula: "小柴胡汤",
    pattern: "少阳枢机不利",
    complaint: "患者寒热往来，胸胁苦满，口苦咽干，食欲不振，脉弦。",
    summary: "寒热往来兼胸胁苦满，抓住少阳枢机失和。",
    diagnosis: "少阳病。邪在半表半里，胆胃不和，故见口苦、咽干、胸胁不舒。",
    prescription: "柴胡、黄芩、半夏、人参、生姜、大枣、炙甘草。随证酌量加减。",
    outcome: "三剂后寒热止，胸胁舒，纳食转佳；续以调护脾胃收功。"
  },
  {
    title: "阳明腑实便秘案",
    category: "胃肠实热",
    formula: "大承气汤",
    pattern: "痞满燥实",
    complaint: "患者腹满硬痛，大便五日未行，潮热谵语，舌苔黄燥，脉沉实。",
    summary: "腹满拒按、大便不通、苔黄燥，为阳明腑实关键。",
    diagnosis: "阳明腑实证。燥屎内结，腑气不通，热扰神明，故见潮热谵语。",
    prescription: "大黄、芒硝、厚朴、枳实。以通腑泄热为法，需辨体力与津液情况。",
    outcome: "服药后得畅便，腹满热势俱减；后以清养胃津、渐进饮食。"
  },
  {
    title: "寒饮咳喘案",
    category: "咳喘痰饮",
    formula: "小青龙汤",
    pattern: "外寒内饮",
    complaint: "患者咳喘痰稀，遇冷加重，背恶寒，无汗，舌淡苔白滑。",
    summary: "外寒束表、内有水饮，咳喘痰清稀是辨证要点。",
    diagnosis: "外寒内饮证。寒邪束表，水饮上泛于肺，肺失宣降。",
    prescription: "麻黄、桂枝、干姜、细辛、半夏、五味子、芍药、炙甘草。",
    outcome: "二剂后咳喘缓解，痰量减少；继续温肺化饮，避冷饮冷风。"
  },
  {
    title: "心下痞满案",
    category: "脾胃不和",
    formula: "半夏泻心汤",
    pattern: "寒热错杂",
    complaint: "患者胃脘痞满，按之不痛，嗳气纳差，肠鸣便溏，舌苔薄腻。",
    summary: "痞而不痛、寒热错杂，以辛开苦降、调和中焦。",
    diagnosis: "寒热互结中焦，升降失司，故心下痞满而不痛，兼见肠鸣便溏。",
    prescription: "半夏、黄芩、黄连、干姜、人参、大枣、炙甘草。",
    outcome: "四剂后痞满明显减轻，纳食改善；复诊以原方减量巩固。"
  },
  {
    title: "血虚寒凝腹痛案",
    category: "妇科腹痛",
    formula: "当归四逆汤",
    pattern: "血虚寒厥",
    complaint: "患者经前少腹冷痛，手足不温，舌淡，脉细欲绝。",
    summary: "血虚兼寒，四末不温与少腹冷痛同参。",
    diagnosis: "血虚寒凝，经脉失温。寒客经络则腹痛，血虚不荣则脉细。",
    prescription: "当归、桂枝、芍药、细辛、通草、大枣、炙甘草。",
    outcome: "服药后腹痛缓，手足转温；下周期疼痛显著减轻。"
  }
];

const grid = document.querySelector("#caseGrid");
const searchInput = document.querySelector("#caseSearch");
const emptyState = document.querySelector("#emptyState");
const resultHint = document.querySelector("#resultHint");
const caseCount = document.querySelector("#caseCount");
const modal = document.querySelector("#caseModal");

const modalFields = {
  category: document.querySelector("#modalCategory"),
  title: document.querySelector("#modalTitle"),
  formula: document.querySelector("#modalFormula"),
  pattern: document.querySelector("#modalPattern"),
  complaint: document.querySelector("#modalComplaint"),
  diagnosis: document.querySelector("#modalDiagnosis"),
  prescription: document.querySelector("#modalPrescription"),
  outcome: document.querySelector("#modalOutcome")
};

function renderCases(list) {
  grid.innerHTML = "";
  emptyState.hidden = list.length > 0;
  caseCount.textContent = list.length;
  resultHint.textContent = list.length ? "点击卡片查看完整辨治过程。" : "当前搜索没有匹配结果。";

  list.forEach((item) => {
    const card = document.createElement("button");
    card.className = "case-card";
    card.type = "button";
    card.innerHTML = `
      <div class="tag-row">
        <span class="tag">${item.category}</span>
        <span class="tag">${item.pattern}</span>
      </div>
      <h3>${item.title}</h3>
      <p>${item.summary}</p>
      <div class="case-footer">
        <span>${item.formula}</span>
        <span>查看详情</span>
      </div>
    `;
    card.addEventListener("click", () => openModal(item));
    grid.appendChild(card);
  });
}

function openModal(item) {
  modalFields.category.textContent = item.category;
  modalFields.title.textContent = item.title;
  modalFields.formula.textContent = `主方：${item.formula}`;
  modalFields.pattern.textContent = `方证：${item.pattern}`;
  modalFields.complaint.textContent = item.complaint;
  modalFields.diagnosis.textContent = item.diagnosis;
  modalFields.prescription.textContent = item.prescription;
  modalFields.outcome.textContent = item.outcome;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = "";
}

function filterCases() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = cases.filter((item) => {
    return Object.values(item).some((value) => value.toLowerCase().includes(query));
  });
  renderCases(filtered);
}

searchInput.addEventListener("input", filterCases);

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

renderCases(cases);
