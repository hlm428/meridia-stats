// MeridiaStats boot — hash router, nav state and control wiring. No
// framework: the router swaps the page's HTML and re-attaches its controls.
import { VIEWS } from "./views.js";
import { explorerCsv, filteredIndicators, setRegionSort, setYear, state } from "./store.js";

const app = document.getElementById("app");
const navLinks = [...document.querySelectorAll(".top-nav a")];

function route() {
  const hash = location.hash.replace(/^#/, "") || "/";
  const path = hash.startsWith("/") ? hash : `/${hash}`;
  const render = VIEWS[path] || VIEWS["/"];
  const query = path === "/data" ? state.explorerQuery : "";
  app.innerHTML = render(query);
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${path}`);
    if (link.getAttribute("href") === `#${path}`) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  wire(path);
  window.scrollTo(0, 0);
}

function downloadCsv() {
  const csv = explorerCsv(state.explorerQuery);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "meridiastats-indicators-2019-2026.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function wire(path) {
  const yearSelect = document.getElementById("year-select");
  if (yearSelect) {
    yearSelect.addEventListener("change", () => {
      setYear(Number(yearSelect.value));
      route();
    });
  }

  const regionTable = document.getElementById("region-table");
  if (regionTable) {
    regionTable.querySelectorAll("th[data-sort]").forEach((th) => {
      th.addEventListener("click", () => {
        setRegionSort(th.dataset.sort);
        route();
      });
    });
  }

  if (path === "/data") {
    const search = document.getElementById("explorer-search");
    if (search) {
      search.addEventListener("input", () => {
        state.explorerQuery = search.value;
        // Re-render only the table body and the count, keeping focus in the box.
        const fresh = VIEWS["/data"](state.explorerQuery);
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<div>${fresh}</div>`, "text/html");
        const newTable = doc.querySelector("table.explorer");
        const oldTable = document.querySelector("table.explorer");
        if (newTable && oldTable) oldTable.replaceWith(newTable);
        const shown = filteredIndicators(state.explorerQuery).length;
        const csvButton = document.getElementById("csv-download");
        if (csvButton) csvButton.textContent = `Download CSV (${shown} indicator${shown === 1 ? "" : "s"})`;
        const note = document.querySelector(".card .note");
        if (note) {
          note.textContent = `Showing ${shown} of 14 indicators. The highlighted column is ${state.year}. CSV downloads exactly the rows shown.`;
        }
        search.focus();
        // Keep the caret at the end after the re-render.
        const end = search.value.length;
        search.setSelectionRange(end, end);
      });
    }
    const csvButton = document.getElementById("csv-download");
    if (csvButton) csvButton.addEventListener("click", downloadCsv);
  }
}

window.addEventListener("hashchange", route);
route();
