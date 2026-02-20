function issues() {
  const me = {};
  // Get params from the URL
  const params = new URLSearchParams(window.location.search);
  let page = parseInt(params.get("page")) || 1;
  const pageSize = parseInt(params.get("pageSize")) || 20;
  const query = params.get("query") || "";

  me.showError = ({ msg, res, type = "danger" } = {}) => {
    // Show an error using bootstrap alerts in the main tag
    const main = document.querySelector("main");
    const alert = document.createElement("div");
    alert.className = `alert alert-${type}`;
    alert.role = type;
    alert.innerText = `${msg}: ${res.status} ${res.statusText}`;
    main.prepend(alert);
  };

  me.loadProjectsDropdowns = async () => {
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) return;

      const data = await res.json();
      const projects = data.projects || [];

      const createSelect = document.getElementById("projectId");
      const updateSelect = document.getElementById("update-projectId");

      const fill = (select) => {
        if (!select) return;
        // keep first option ("No project")
        select.innerHTML = `<option value="">No project</option>`;
        for (const p of projects) {
          const opt = document.createElement("option");
          opt.value = p._id; // important: send string id, backend converts to ObjectId
          opt.textContent = p.title;
          select.appendChild(opt);
        }
      };

      fill(createSelect);
      fill(updateSelect);
    } catch (e) {
      console.error("Failed to load projects for dropdown:", e);
    }
  };

  const renderPagination = ({ maxPage = 20 } = {}) => {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    // Render pages for +/- 3 around the current page
    const startPage = Math.max(1, page - 3);
    const endPage = Math.min(maxPage, page + 3);

    for (let i = startPage; i <= endPage; i++) {
      const li = document.createElement("li");
      li.className = "page-item";
      if (i === page) {
        li.classList.add("active");
      }
      const a = document.createElement("a");
      a.className = "page-link";
      li.appendChild(a);
      a.href = `?page=${i}&pageSize=${pageSize}&query=${query}`;
      a.innerText = i;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        page = i;
        me.refreshIssues();
      });
      pagination.appendChild(li);
    }
  };

  const renderIssues = (issuesDiv, issues) => {
    for (const issue of issues) {
      const {
        _id,
        issueImage,
        issueText,
        category,
        neighborhood,
        status,
        reportedBy,
        modifiedAt,
      } = issue;
      const issueCard = document.createElement("div");
      issueCard.className = "col-md-3 mb-3";
      issueCard.dataset.id = _id;
      const imageUrl = issueImage || "./assets/arrow.png";

      issueCard.innerHTML = `
    <div class="card h-100">  
      <div class="card-body">
        <img 
          src="${imageUrl}" 
          class="img-fluid rounded mb-2" 
          alt="${issueText}" 
          style="height: 180px; width: 180px; object-fit: contain;">
        <span class="badge bg-secondary mb-2">${category}</span>
        <h3 class="h5">${neighborhood}</h3>
        <p class="card-text">${issueText}</p>
        <p class="reported-by">${reportedBy}</p>
        <div class="status-section">
          <p class="text-muted">Status: <strong>${status}</strong></p>
          <small class="text-muted">Last Updated: ${modifiedAt}</small> 
          <br>
          <div class="d-flex justify-content-center align-items-center">
            <button class="btn btn-info m-3">Info</button>
            <button class="btn btn-sm btn-danger btn-delete m-3">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `;

      const deleteBtn = issueCard.querySelector(".btn-delete");

      deleteBtn.addEventListener("click", async () => {
        const confirmDelete = confirm(
          "Are you sure you want to delete this issue?"
        );

        if (confirmDelete) {
          // Call the method via the 'me' object to ensure it's in scope
          await me.deleteIssue(_id);
        }
      });

      const updateBtn = issueCard.querySelector(".btn-info");

      updateBtn.addEventListener("click", async () => {
        const idInput = document.getElementById("update-issue-id");
        const descInput = document.getElementById("update-description");
        const catInput = document.getElementById("update-category");
        const neighInput = document.getElementById("update-neighborhood");

        const projInput = document.getElementById("update-projectId");

        const upModal = document.getElementById("updateModal");

        // if it doesn't have an ID or the modal
        if (!idInput || !upModal) {
          console.error("Oops! Could not find the modal elements in the DOM.");
          return;
        }

        // fill the modal
        idInput.value = _id;
        descInput.value = issueText;
        catInput.value = category;
        neighInput.value = neighborhood;

        if (projInput) projInput.value = issue.projectId || "";

        // Use 'new' keyword and pass the element
        // Can't quite reuse the same modal
        const modal = new window.bootstrap.Modal(upModal);
        modal.show();
      });

      issuesDiv.appendChild(issueCard);
    }
  };

  me.setupUpdateListener = () => {
    const updateForm = document.getElementById("update-issue-form");

    updateForm.addEventListener("submit", async (e) => {
      e.preventDefault(); // stop the refresh
      // console.log("getting here");

      // grab the NEW values from the modal inputs
      const id = document.getElementById("update-issue-id").value;

      const updatedData = {
        issueText: document.getElementById("update-description").value,
        category: document.getElementById("update-category").value,
        neighborhood: document.getElementById("update-neighborhood").value,

        projectId: document.getElementById("update-projectId")?.value || null,
      };

      // pass the ID and the OBJECT to your method
      await me.updateIssue(id, updatedData);
    });
  };

  me.refreshIssues = async () => {
    // Check the filterbar for any specifics
    const searchFilter = document.getElementById("issue-search")?.value || "";
    const neighborhoodFilter =
      document.getElementById("issue-neighborhood")?.value || "";
    const categoryFilter =
      document.getElementById("issue-category")?.value || "";
    const activeChip =
      document.querySelector(".issue-chip.active")?.dataset.chip || "all";
    const statusFilter = activeChip !== "all" ? activeChip : "";

    const res = await fetch(
      `/api/issues?page=${page}&pageSize=${pageSize}&query=${query}`
    );

    if (!res.ok) {
      console.error("Failed to fetch issues", res.status, res.statusText);
      me.showError({ msg: "Failed to fetch issues", res });
      return;
    }

    const data = await res.json();

    const issuesDiv = document.getElementById("issues-row");

    issuesDiv.innerHTML = "";

    renderIssues(issuesDiv, data.issues);
    renderPagination();
  };

  me.addIssue = () => {
    const issueForm = document.getElementById("new-issue-form");

    issueForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const selectedProjectId =
        document.getElementById("projectId")?.value || "";

      const issue = {
        issueText: document.getElementById("issue-description").value,
        issueImage: document.getElementById("issue-image").value,
        category: document.getElementById("category").value,
        neighborhood: document.getElementById("neighborhood").value,
        reportedBy: "testUser",

        projectId: selectedProjectId || null,
      };

      try {
        const res = await fetch("/api/issues", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(issue),
        });

        if (res.ok) {
          const issueModal = document.getElementById("issue-modal");
          const modal = window.bootstrap.Modal.getInstance(issueModal);
          if (modal) modal.hide();

          issueForm.reset();

          me.refreshIssues();
        } else {
          alert("Failed to save issue");
        }
      } catch (err) {
        console.error("Error posting issue:", err);
      }
    });
  };

  me.deleteIssue = async (id) => {
    try {
      const res = await fetch(`/api/issues/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        //TODO: I could change the color of the button after deleted or give a message

        me.refreshIssues();
      } else {
        alert("Failed to delete issue");
      }
    } catch (err) {
      console.error("Error deleting issue:", err);
    }
  };

  me.updateIssue = async (id, updatedData) => {
    try {
      const res = await fetch(`/api/issues/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      //TODO: I think I'm currently creating a modal per issue, and it would be better instead
      // to reuse one
      if (res.ok) {
        const updateModal = document.getElementById("updateModal");
        const modal = window.bootstrap.Modal.getInstance(updateModal);
        if (modal) modal.hide();
        me.refreshIssues();
      } else {
        alert("Failed to save issue");
      }
    } catch (err) {
      console.error("Error posting issue:", err);
    }
  };

  me.setupUpdateListener = () => {
    const updateForm = document.getElementById("update-issue-form");

    updateForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // grab the NEW values from the modal inputs
      const id = document.getElementById("update-issue-id").value;

      const updatedData = {
        issueText: document.getElementById("update-description").value,
        category: document.getElementById("update-category").value,
        neighborhood: document.getElementById("update-neighborhood").value,
      };

      // pass the ID and the OBJECT to method for updating the DB (event > route > DB > back to client)
      await me.updateIssue(id, updatedData);
    });
  };

  me.setupFilterListeners = () => {
    document
      .getElementById("issue-search")
      ?.addEventListener("input", () => me.refreshIssues());
    document
      .getElementById("issue-neighborhood")
      ?.addEventListener("change", () => me.refreshIssues());
    document
      .getElementById("issue-category")
      ?.addEventListener("change", () => {
        me.refreshIssues();
      });

    document.querySelectorAll(".issue-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll(".issue-chip")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        me.refreshIssues();
      });
    });
  };

  me.loadCategoryCounts = async () => {
    const res = await fetch("/api/issues?page=1&pageSize=1000");
    const data = await res.json();

    // take the data and reduce them to just the categories and their counts
    const counts = (data.issues || []).reduce((acc, issue) => {
      const cat = (issue.category || "unknown").toLowerCase();
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    console.log(counts);
    document.getElementById("train-count").textContent = counts.train || 0;
    document.getElementById("bus-count").textContent = counts.bus || 0;
    document.getElementById("bike-count").textContent = counts.bike || 0;
    document.getElementById("ped-count").textContent = counts.pedestrian || 0;
  };

  return me;
}

const myIssues = issues();

myIssues.loadProjectsDropdowns();
myIssues.refreshIssues();
myIssues.addIssue();
myIssues.setupUpdateListener();
myIssues.setupFilterListeners();
myIssues.loadCategoryCounts();
