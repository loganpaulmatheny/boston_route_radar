import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../api/projectsApi.js";
import { renderProjects } from "../ui/projectsView.js";
import { openModal, closeModal, wireModalClose } from "../ui/modal.js";

function uniqueNeighborhoods(projects) {
  const set = new Set();
  projects.forEach((p) => (p.neighborhoods || []).forEach((n) => set.add(n)));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function filterProjects(projects, { q, neighborhood, status, chip }) {
  const query = (q || "").trim().toLowerCase();

  return projects.filter((p) => {
    const title = (p.title || "").toLowerCase();
    const hoodStr = (p.neighborhoods || []).join(" ").toLowerCase();

    const matchQuery =
      !query || title.includes(query) || hoodStr.includes(query);
    const matchNeighborhood =
      !neighborhood || (p.neighborhoods || []).includes(neighborhood);

    const statusToUse = chip && chip !== "all" ? chip : status;
    const matchStatus = !statusToUse || p.status === statusToUse;

    return matchQuery && matchNeighborhood && matchStatus;
  });
}

function fillNeighborhoodDropdown(selectEl, projects) {
  const current = selectEl.value;
  selectEl.innerHTML = `<option value="">All Neighborhoods</option>`;

  uniqueNeighborhoods(projects).forEach((n) => {
    const opt = document.createElement("option");
    opt.value = n;
    opt.textContent = n;
    selectEl.appendChild(opt);
  });

  selectEl.value = current;
}

function getFormPayload() {
  const title = document.getElementById("title").value.trim();
  const neighborhoodsRaw = document
    .getElementById("neighborhoods")
    .value.trim();
  const neighborhoods = neighborhoodsRaw
    ? neighborhoodsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return {
    title,
    neighborhoods,
    status: document.getElementById("formStatus").value,
    estCompletion: document.getElementById("estCompletion").value.trim(),
    imageUrl: document.getElementById("imageUrl").value.trim(),
  };
}

function setFormFromProject(p) {
  document.getElementById("projectId").value = p?._id || "";
  document.getElementById("title").value = p?.title || "";
  document.getElementById("neighborhoods").value = (
    p?.neighborhoods || []
  ).join(", ");
  document.getElementById("formStatus").value = p?.status || "planned";
  document.getElementById("estCompletion").value = p?.estCompletion || "";
  document.getElementById("imageUrl").value = p?.imageUrl || "";
}

async function main() {
  wireModalClose();

  const grid = document.getElementById("projects-grid");
  const empty = document.getElementById("empty-state");

  const searchEl = document.getElementById("search");
  const hoodEl = document.getElementById("neighborhood");
  const statusEl = document.getElementById("status");
  const createBtn = document.getElementById("btn-create");

  const form = document.getElementById("project-form");
  const modalTitle = document.getElementById("project-modal-title");

  const confirmDanger = document.getElementById("confirm-danger");
  const confirmText = document.getElementById("confirm-text");

  let allProjects = [];
  let chip = "all";
  let pendingDeleteId = null;

  async function refresh() {
    const data = await getProjects();
    allProjects = data.projects || [];

    fillNeighborhoodDropdown(hoodEl, allProjects);

    const filtered = filterProjects(allProjects, {
      q: searchEl.value,
      neighborhood: hoodEl.value,
      status: statusEl.value,
      chip,
    });

    renderProjects(grid, filtered);

    if (filtered.length === 0) empty.classList.remove("d-none");
    else empty.classList.add("d-none");
  }

  document.querySelectorAll(".chip").forEach((btn) => {
    btn.addEventListener("click", async () => {
      document
        .querySelectorAll(".chip")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      chip = btn.dataset.chip;
      await refresh();
    });
  });

  [searchEl, hoodEl, statusEl].forEach((el) => {
    el.addEventListener("input", refresh);
    el.addEventListener("change", refresh);
  });

  createBtn.addEventListener("click", () => {
    modalTitle.textContent = "Create Project";
    setFormFromProject(null);
    openModal("project-modal");
  });

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;
    const project = allProjects.find((p) => p._id === id);

    if (action === "view") {
      alert(`View: ${project?.title || "Project"}`);
      return;
    }

    if (action === "edit") {
      modalTitle.textContent = "Edit Project";
      setFormFromProject(project);
      openModal("project-modal");
      return;
    }

    if (action === "delete") {
      pendingDeleteId = id;
      confirmText.textContent = `Delete "${project?.title || "this project"}"? This cannot be undone.`;
      openModal("confirm-modal");
    }
  });

  confirmDanger.addEventListener("click", async () => {
    if (!pendingDeleteId) return;
    await deleteProject(pendingDeleteId);
    pendingDeleteId = null;
    closeModal("confirm-modal");
    await refresh();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("projectId").value;
    const payload = getFormPayload();
    if (!payload.title) return;

    if (id) await updateProject(id, payload);
    else await createProject(payload);

    closeModal("project-modal");
    await refresh();
  });

  await refresh();
}

main().catch((e) => {
  console.error(e);
  alert(e.message || "Failed to load Projects page");
});
