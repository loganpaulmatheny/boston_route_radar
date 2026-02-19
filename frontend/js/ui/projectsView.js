function statusLabel(status) {
  if (status === "planned") return "Planned";
  if (status === "in_progress") return "In Progress";
  if (status === "completed") return "Completed";
  return status || "Unknown";
}

function safeText(v) {
  return (v ?? "").toString();
}

export function renderProjects(gridEl, projects) {
  gridEl.innerHTML = "";

  const frag = document.createDocumentFragment();

  projects.forEach((p) => {
    const card = document.createElement("article");
    card.className = "project-card";

    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";

    const img = document.createElement("img");
    img.className = "project-img";
    img.alt = safeText(p.title) || "Project image";
    img.src =
      p.imageUrl ||
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=60";

    const float = document.createElement("div");
    float.className = "badge-float";
    float.textContent = statusLabel(p.status);

    wrapper.appendChild(img);
    wrapper.appendChild(float);

    const body = document.createElement("div");
    body.className = "project-body";

    const title = document.createElement("div");
    title.className = "project-title";
    title.textContent = safeText(p.title);

    const pill = document.createElement("span");
    pill.className = `pill ${p.status || ""}`;
    pill.textContent = statusLabel(p.status);

    const neighborhoods = document.createElement("div");
    neighborhoods.className = "meta";
    neighborhoods.textContent = safeText((p.neighborhoods || []).join(", "));

    const est = document.createElement("div");
    est.className = "meta";
    est.textContent = p.estCompletion
      ? `Est. completion: ${p.estCompletion}`
      : "Est. completion: N/A";

    const linked = document.createElement("div");
    linked.className = "meta";
    linked.textContent =
      typeof p.linkedIssues === "number"
        ? `Linked Issues: ${p.linkedIssues}`
        : "Linked Issues: 0";

    body.appendChild(title);
    body.appendChild(pill);
    body.appendChild(neighborhoods);
    body.appendChild(est);
    body.appendChild(linked);

    const footer = document.createElement("div");
    footer.className = "project-footer";

    const viewBtn = document.createElement("button");
    viewBtn.className = "btn btn-primary";
    viewBtn.textContent = "View";
    viewBtn.dataset.action = "view";
    viewBtn.dataset.id = p._id;

    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-outline-secondary";
    editBtn.textContent = "Edit";
    editBtn.dataset.action = "edit";
    editBtn.dataset.id = p._id;

    const delBtn = document.createElement("button");
    delBtn.className = "btn btn-outline-danger";
    delBtn.textContent = "Delete";
    delBtn.dataset.action = "delete";
    delBtn.dataset.id = p._id;

    footer.appendChild(viewBtn);
    footer.appendChild(editBtn);
    footer.appendChild(delBtn);

    card.appendChild(wrapper);
    card.appendChild(body);
    card.appendChild(footer);

    frag.appendChild(card);
  });

  gridEl.appendChild(frag);
}
