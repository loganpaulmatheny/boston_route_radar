import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../api/projectsApi.js";
import { renderProjects } from "../ui/projectsView.js";
import { openModal, closeModal, wireModalClose } from "../ui/modal.js";

function statusLabel(status) {
  if (status === "planned") return "Planned";
  if (status === "in_progress") return "In Progress";
  if (status === "completed") return "Completed";
  return status || "Unknown";
}

function fmtDate(v) {
  if (!v) return "N/A";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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

async function fetchIssuesByProjectId(projectId) {
  const res = await fetch(
    `/api/issues?projectId=${encodeURIComponent(projectId)}`
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Failed to load linked issues");
  return data;
}

async function fetchUnlinkedIssues() {
  const res = await fetch(`/api/issues?unlinked=true`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Failed to load unlinked issues");
  return data;
}

async function updateIssueProject(issueId, projectIdOrNull) {
  const res = await fetch(`/api/issues/${issueId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId: projectIdOrNull }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Failed to update issue");
  return data;
}

async function main() {
  wireModalClose();

  const grid = document.getElementById("projects-grid");
  const empty = document.getElementById("empty-state");

  const searchEl = document.getElementById("search");
  const hoodEl = document.getElementById("neighborhood");
  const statusEl = document.getElementById("status");
  const createBtn = document.getElementById("btn-create");

  const paginationEl = document.getElementById("projects-pagination");
  const countEl = document.getElementById("projects-count");
  const pageSizeEl = document.getElementById("pageSize");

  const form = document.getElementById("project-form");
  const modalTitle = document.getElementById("project-modal-title");

  const confirmDanger = document.getElementById("confirm-danger");
  const confirmText = document.getElementById("confirm-text");

  const linkedListEl = document.getElementById("linked-issues-list");
  const linkedEmptyEl = document.getElementById("linked-issues-empty");
  const openLinkBtn = document.getElementById("btn-open-link-issues");

  const linkIssuesModalEl = document.getElementById("link-issues-modal");
  const unlinkedListEl = document.getElementById("unlinked-issues-list");
  const unlinkedEmptyEl = document.getElementById("unlinked-issues-empty");

  let activeViewProjectId = null;

  let allProjects = [];
  let chip = "all";
  let pendingDeleteId = null;

  let page = 1;
  let pageSize = parseInt(pageSizeEl?.value, 10) || 9;

  async function loadAndRenderLinkedIssues(projectId) {
    if (!linkedListEl) return;

    linkedListEl.innerHTML = "";
    linkedEmptyEl?.classList.add("d-none");

    const data = await fetchIssuesByProjectId(projectId);
    const issues = data.issues || [];

    if (issues.length === 0) {
      linkedEmptyEl?.classList.remove("d-none");
      return;
    }

    for (const issue of issues) {
      const li = document.createElement("li");
      li.className =
        "list-group-item d-flex justify-content-between align-items-start";

      const left = document.createElement("div");
      left.className = "me-3";
      left.innerHTML = `
        <div class="fw-semibold">${issue.issueText || "Untitled issue"}</div>
        <div class="small text-muted">
          ${issue.neighborhood || ""}
          ${issue.category ? "• " + issue.category : ""}
        </div>
      `;

      const btn = document.createElement("button");
      btn.className = "btn btn-sm btn-outline-danger";
      btn.type = "button";
      btn.textContent = "Unlink";

      btn.addEventListener("click", async () => {
        btn.disabled = true;
        try {
          await updateIssueProject(issue._id, null); // unlink
          await loadAndRenderLinkedIssues(projectId);
          await loadFromApi("Refreshing projects…"); // update counts
        } catch (e) {
          alert(e.message || "Failed to unlink issue");
        } finally {
          btn.disabled = false;
        }
      });

      li.appendChild(left);
      li.appendChild(btn);
      linkedListEl.appendChild(li);
    }
  }

  function setPage(next) {
    page = Math.max(1, next);
    applyFilters();
    document.getElementById("projects-grid")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function renderPagination(totalItems) {
    if (!paginationEl) return;

    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    page = Math.min(page, totalPages);

    const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
    const to = Math.min(totalItems, page * pageSize);
    if (countEl) {
      countEl.textContent =
        totalItems === 0
          ? "Showing 0 projects"
          : `Showing ${from}-${to} of ${totalItems} projects`;
    }

    paginationEl.innerHTML = "";
    if (totalItems === 0) return;

    const mkItem = ({ label, disabled, active, onClick, ariaLabel } = {}) => {
      const li = document.createElement("li");
      li.className = "page-item";
      if (disabled) li.classList.add("disabled");
      if (active) li.classList.add("active");

      const a = document.createElement("a");
      a.className = "page-link";
      a.href = "#";
      a.textContent = label;
      if (ariaLabel) a.setAttribute("aria-label", ariaLabel);
      if (!disabled) {
        a.addEventListener("click", (e) => {
          e.preventDefault();
          onClick?.();
        });
      } else {
        a.tabIndex = -1;
        a.setAttribute("aria-disabled", "true");
      }

      li.appendChild(a);
      return li;
    };

    paginationEl.appendChild(
      mkItem({
        label: "‹",
        ariaLabel: "Previous",
        disabled: page <= 1,
        onClick: () => setPage(page - 1),
      })
    );

    const maxButtons = 7;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + (maxButtons - 1));
    start = Math.max(1, end - (maxButtons - 1));

    if (start > 1) {
      paginationEl.appendChild(
        mkItem({ label: "1", active: page === 1, onClick: () => setPage(1) })
      );
      if (start > 2) {
        const li = document.createElement("li");
        li.className = "page-item disabled";
        li.innerHTML = '<span class="page-link">…</span>';
        paginationEl.appendChild(li);
      }
    }

    for (let i = start; i <= end; i += 1) {
      paginationEl.appendChild(
        mkItem({
          label: String(i),
          active: i === page,
          onClick: () => setPage(i),
        })
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        const li = document.createElement("li");
        li.className = "page-item disabled";
        li.innerHTML = '<span class="page-link">…</span>';
        paginationEl.appendChild(li);
      }
      paginationEl.appendChild(
        mkItem({
          label: String(totalPages),
          active: page === totalPages,
          onClick: () => setPage(totalPages),
        })
      );
    }

    paginationEl.appendChild(
      mkItem({
        label: "›",
        ariaLabel: "Next",
        disabled: page >= totalPages,
        onClick: () => setPage(page + 1),
      })
    );
  }

  const overlay = document.getElementById("loading-overlay");
  const overlayText = document.getElementById("loading-text");
  const gridLoading = document.getElementById("grid-loading");

  let overlayCount = 0;

  function setOverlayLoading(on, message = "Loading…") {
    if (on) {
      overlayCount += 1;
      overlayText.textContent = message;
      overlay.classList.remove("d-none");
    } else {
      overlayCount = Math.max(0, overlayCount - 1);
      if (overlayCount === 0) overlay.classList.add("d-none");
    }
  }

  let filterTimer = null;

  function applyFilters() {
    gridLoading.classList.remove("d-none");
    clearTimeout(filterTimer);

    filterTimer = setTimeout(() => {
      const filtered = filterProjects(allProjects, {
        q: searchEl.value,
        neighborhood: hoodEl.value,
        status: statusEl.value,
        chip,
      });

      const totalItems = filtered.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
      page = Math.min(page, totalPages);

      const start = (page - 1) * pageSize;
      const pageItems = filtered.slice(start, start + pageSize);

      renderProjects(grid, pageItems);
      renderPagination(totalItems);

      if (filtered.length === 0) empty.classList.remove("d-none");
      else empty.classList.add("d-none");

      gridLoading.classList.add("d-none");
    }, 120);
  }

  async function loadFromApi(message = "Loading projects…") {
    setOverlayLoading(true, message);
    try {
      const data = await getProjects();
      allProjects = data.projects || [];
      fillNeighborhoodDropdown(hoodEl, allProjects);
      applyFilters();
    } finally {
      setOverlayLoading(false);
    }
  }

  document.querySelectorAll(".chip").forEach((btn) => {
    btn.addEventListener("click", async () => {
      document
        .querySelectorAll(".chip")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      chip = btn.dataset.chip;
      page = 1;
      applyFilters();
    });
  });

  let searchDebounce = null;

  searchEl.addEventListener("input", () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      page = 1;
      applyFilters();
    }, 180);
  });

  openLinkBtn?.addEventListener("click", async () => {
    if (!activeViewProjectId) return;

    unlinkedListEl.innerHTML = "";
    unlinkedEmptyEl?.classList.add("d-none");

    try {
      const data = await fetchUnlinkedIssues();
      const issues = data.issues || [];

      if (issues.length === 0) {
        unlinkedEmptyEl?.classList.remove("d-none");
      } else {
        for (const issue of issues) {
          const li = document.createElement("li");
          li.className =
            "list-group-item d-flex justify-content-between align-items-center";

          const label = document.createElement("div");
          label.innerHTML = `
            <div class="fw-semibold">${issue.issueText || "Untitled issue"}</div>
            <div class="small text-muted">
              ${issue.neighborhood || ""}
              ${issue.category ? "• " + issue.category : ""}
            </div>
          `;

          const btn = document.createElement("button");
          btn.className = "btn btn-sm btn-primary";
          btn.type = "button";
          btn.textContent = "Link";

          btn.addEventListener("click", async () => {
            btn.disabled = true;
            try {
              await updateIssueProject(issue._id, activeViewProjectId);
              closeModal("link-issues-modal");
              await loadAndRenderLinkedIssues(activeViewProjectId);
              await loadFromApi("Refreshing projects…");
            } catch (e) {
              alert(e.message || "Failed to link issue");
            } finally {
              btn.disabled = false;
            }
          });

          li.appendChild(label);
          li.appendChild(btn);
          unlinkedListEl.appendChild(li);
        }
      }

      openModal("link-issues-modal");
    } catch (e) {
      alert(e.message || "Failed to load unlinked issues");
    }
  });

  hoodEl.addEventListener("change", () => {
    page = 1;
    applyFilters();
  });
  statusEl.addEventListener("change", () => {
    page = 1;
    applyFilters();
  });

  pageSizeEl?.addEventListener("change", () => {
    pageSize = parseInt(pageSizeEl.value, 10) || 9;
    page = 1;
    applyFilters();
  });

  createBtn.addEventListener("click", () => {
    modalTitle.textContent = "Create Project";
    setFormFromProject(null);
    openModal("project-modal");
  });

  grid.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;
    const project = allProjects.find((p) => p._id === id);

    if (action === "view") {
      if (!project) return;

      const imgEl = document.getElementById("view-image");
      const safeImage =
        project.imageUrl ||
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=60";

      imgEl.src = safeImage;
      imgEl.alt = project.title || "Project image";

      const setField = (id2, value) => {
        const el = document.getElementById(id2);
        if (!el) return;
        const v = (value ?? "").toString().trim();
        el.textContent = v ? v : "N/A";
      };

      setField("view-title", project.title);
      setField(
        "view-hoods",
        (project.neighborhoods || []).length
          ? (project.neighborhoods || []).join(", ")
          : ""
      );
      setField("view-est", project.estCompletion);
      setField("view-imageUrl", project.imageUrl);
      setField("view-id", project._id);
      setField("view-created", fmtDate(project.createdAt));
      setField("view-updated", fmtDate(project.modifiedAt));

      const statusBadge = document.getElementById("view-status");
      statusBadge.textContent = statusLabel(project.status);
      statusBadge.className = "badge rounded-pill";
      if (project.status === "planned")
        statusBadge.classList.add("text-bg-primary");
      else if (project.status === "in_progress")
        statusBadge.classList.add("text-bg-warning");
      else if (project.status === "completed")
        statusBadge.classList.add("text-bg-success");
      else statusBadge.classList.add("text-bg-secondary");

      document.getElementById("view-linked").textContent =
        typeof project.linkedIssues === "number" ? project.linkedIssues : 0;

      activeViewProjectId = String(project._id);
      await loadAndRenderLinkedIssues(activeViewProjectId);
      openModal("view-modal");
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
      confirmText.textContent = `Delete "${
        project?.title || "this project"
      }"? This cannot be undone.`;
      openModal("confirm-modal");
    }
  });

  confirmDanger.addEventListener("click", async () => {
    if (!pendingDeleteId) return;
    setOverlayLoading(true, "Deleting project…");
    try {
      await deleteProject(pendingDeleteId);
      pendingDeleteId = null;
      closeModal("confirm-modal");
      await loadFromApi("Refreshing projects…");
    } finally {
      setOverlayLoading(false);
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("projectId").value;
    const payload = getFormPayload();
    if (!payload.title) return;

    setOverlayLoading(true, id ? "Saving changes…" : "Creating project…");
    try {
      if (id) await updateProject(id, payload);
      else await createProject(payload);

      closeModal("project-modal");
      await loadFromApi("Refreshing projects…");
    } finally {
      setOverlayLoading(false);
    }
  });

  await loadFromApi("Loading projects…");
}

main().catch((e) => {
  console.error(e);
  alert(e.message || "Failed to load Projects page");
});
