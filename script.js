let cases = [];

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

async function loadCases() {
  try {
    const response = await fetch("./data/cases.json");

    if (!response.ok) {
      throw new Error("医案数据加载失败");
    }

    cases = await response.json();
    renderCases(cases);
  } catch (error) {
    console.error(error);
    grid.innerHTML = "";
    emptyState.hidden = false;
    emptyState.textContent = "医案数据加载失败，请检查 cases.json 路径或格式。";
    caseCount.textContent = "0";
    resultHint.textContent = "当前无法读取医案数据。";
  }
}

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
        <span class="tag">${item.category || ""}</span>
        <span class="tag">${item.pattern || ""}</span>
      </div>
      <h3>${item.title || "未命名医案"}</h3>
      <p>${item.summary || ""}</p>
      <div class="case-footer">
        <span>${item.formula || ""}</span>
        <span>查看详情</span>
      </div>
    `;
    card.addEventListener("click", () => openModal(item));
    grid.appendChild(card);
  });
}

function openModal(item) {
  modalFields.category.textContent = item.category || "";
  modalFields.title.textContent = item.title || "未命名医案";
  modalFields.formula.textContent = `主方：${item.formula || ""}`;
  modalFields.pattern.textContent = `方证：${item.pattern || ""}`;
  modalFields.complaint.textContent = item.complaint || "";
  modalFields.diagnosis.textContent = item.diagnosis || "";
  modalFields.prescription.textContent = item.prescription || "";
  modalFields.outcome.textContent = item.outcome || "";
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
    return Object.values(item).some((value) => {
      return String(value).toLowerCase().includes(query);
    });
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

loadCases();
