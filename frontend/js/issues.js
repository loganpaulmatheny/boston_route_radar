function issues() {
  const me = {};
  // Get params from the URL
  const params = new URLSearchParams(window.location.search);
  let page = parseInt(params.get("page")) || 1;
  const pageSize = parseInt(params.get("pageSize")) || 20;
  const query = params.get("query") || "";

  console.log("issue params:", { page, pageSize, query });

  me.showError = ({ msg, res, type = "danger" } = {}) => {
    // Show an error using bootstrap alerts in the main tag
    const main = document.querySelector("main");
    const alert = document.createElement("div");
    alert.className = `alert alert-${type}`;
    alert.role = type;
    alert.innerText = `${msg}: ${res.status} ${res.statusText}`;
    main.prepend(alert);
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
    console.log(issues);
    for (const issue of issues) {
      const {
        issueImage,
        issueText,
        category,
        neighborhood,
        status,
        reportedBy,
        lastUpdated,
      } = issue;
      const card = document.createElement("div");
      card.className = "card mb-3";

      card.innerHTML = `
    <div class="card-body">
      <img src="${issueImage}" class="img-fluid rounded mb-2" alt="${issueText}">
      <span class="badge bg-secondary mb-2">${category}</span>
      <h3 class="h5">${neighborhood}</h3>
      <p class="card-text">${issueText}</p>
      <p class="reported-by">${reportedBy}</p>
      <div class="d-flex justify-content-between align-items-center">
        <small class="text-muted">Status: <strong>${status}</strong></small>
        <small class="text-muted">Last Updated: ${lastUpdated}</small>
        <button class="btn btn-sm btn-outline-primary">More Info</button>
      </div>
    </div>
  `;

      issuesDiv.appendChild(card);
    }
  };

  me.refreshIssues = async () => {
    const res = await fetch(
      `/api/issues?page=${page}&pageSize=${pageSize}&query=${query}`,
    );

    if (!res.ok) {
      console.error("Failed to fetch issues", res.status, res.statusText);
      me.showError({ msg: "Failed to fetch issues", res });
      return;
    }

    const data = await res.json();

    console.log("Fetched issues", data);

    const issuesDiv = document.getElementById("issues");

    issuesDiv.innerHTML = "";

    renderIssues(issuesDiv, data.issues);
    renderPagination();
  };

  return me;
}

const myIssues = issues();

myIssues.refreshIssues();
