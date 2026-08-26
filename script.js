const csvFile = document.getElementById("csvFile");
const csvText = document.getElementById("csvText");

const csvTable = document.getElementById("csvTable");
const tableSection = document.getElementById("tableSection");

const fileInfo = document.getElementById("fileInfo");

const createTableButton = document.getElementById("createTableButton");
const exportButton = document.getElementById("exportButton");
const clearButton = document.getElementById("clearButton");

const tableExport = document.getElementById("tableExport");
const themeToggle = document.getElementById("themeToggle");
const tableTitleInput = document.getElementById("tableTitleInput");
const tableExportTitle = tableExport.querySelector(".table-export-title");
const homeSection = document.getElementById("homeSection");
const toolSection = document.getElementById("toolSection");
const openCsvTool = document.getElementById("openCsvTool");
const backToHome = document.getElementById("backToHome");

function showCsvTool() {
  homeSection.hidden = true;
  toolSection.hidden = false;
}

function showHome() {
  toolSection.hidden = true;
  homeSection.hidden = false;
}

openCsvTool.addEventListener("click", showCsvTool);
backToHome.addEventListener("click", showHome);
const toolsMenuToggle = document.getElementById("toolsMenuToggle");
const toolsDropdown = document.getElementById("toolsDropdown");

toolsMenuToggle.addEventListener("click", function () {
  const isOpen = toolsMenuToggle.getAttribute("aria-expanded") === "true";
  toolsMenuToggle.setAttribute("aria-expanded", String(!isOpen));
  toolsDropdown.hidden = isOpen;
});

document.addEventListener("click", function (event) {
  if (!event.target.closest(".tools-menu")) {
    toolsMenuToggle.setAttribute("aria-expanded", "false");
    toolsDropdown.hidden = true;
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    toolsMenuToggle.setAttribute("aria-expanded", "false");
    toolsDropdown.hidden = true;
  }
});

function updateTableTitle() {
  const title = tableTitleInput.value.trim() || "CSV Table";
  tableExportTitle.textContent = title;
}

tableTitleInput.addEventListener("input", updateTableTitle);
updateTableTitle();

// -----------------------------
// Dark mode
// -----------------------------

const savedTheme = localStorage.getItem("csv-table-theme");
if (
  savedTheme === "dark" ||
  (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
) {
  document.documentElement.dataset.theme = "dark";
}

function updateThemeButton() {
  const isDark = document.documentElement.dataset.theme === "dark";
  themeToggle.innerHTML = `<i class="bi bi-${isDark ? "sun-fill" : "moon-stars-fill"}"></i><span class="d-none d-sm-inline">${isDark ? "Light mode" : "Dark mode"}</span>`;
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Switch to light mode" : "Switch to dark mode",
  );
}

updateThemeButton();
themeToggle.addEventListener("click", function () {
  const isDark = document.documentElement.dataset.theme === "dark";
  document.documentElement.dataset.theme = isDark ? "light" : "dark";
  localStorage.setItem("csv-table-theme", isDark ? "light" : "dark");
  updateThemeButton();
});

// -----------------------------
// Library checks
// -----------------------------

if (typeof Papa === "undefined") {
  console.error("Papa Parse could not be loaded.");
}

if (typeof htmlToImage === "undefined") {
  console.error("html-to-image could not be loaded.");
}

// -----------------------------
// CSV file upload
// -----------------------------

csvFile.addEventListener("change", function () {
  const file = csvFile.files[0];

  if (!file) {
    return;
  }

  fileInfo.textContent = `Selected file: ${file.name}`;

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,

    complete: function (results) {
      console.log("CSV data:", results.data);

      createTable(results.data);

      tableSection.classList.remove("d-none");
    },

    error: function (error) {
      console.error("Error loading CSV:", error);

      alert("The CSV file could not be loaded.");
    },
  });
});

// -----------------------------
// Create table from text
// -----------------------------

createTableButton.addEventListener("click", function () {
  const text = csvText.value.trim();

  if (!text) {
    alert("Paste CSV data first.");
    return;
  }

  Papa.parse(text, {
    header: true,
    skipEmptyLines: true,

    complete: function (results) {
      console.log("CSV data:", results.data);

      if (!results.data || results.data.length === 0) {
        alert("The CSV contains no data.");
        return;
      }

      createTable(results.data);

      tableSection.classList.remove("d-none");
    },

    error: function (error) {
      console.error("Error processing CSV:", error);

      alert("The CSV data could not be processed.");
    },
  });
});

// -----------------------------
// Create HTML table
// -----------------------------

function createTable(data) {
  csvTable.innerHTML = "";

  if (!data || data.length === 0) {
    csvTable.innerHTML = `
            <tbody>
                <tr>
                    <td class="text-center text-secondary">
                        The CSV contains no data.
                    </td>
                </tr>
            </tbody>
        `;

    return;
  }

  // -----------------------------
  // Header
  // -----------------------------

  const headers = Object.keys(data[0]);

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  headers.forEach(function (header) {
    const th = document.createElement("th");

    th.textContent = header;

    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);

  csvTable.appendChild(thead);

  // -----------------------------
  // Table body
  // -----------------------------

  const tbody = document.createElement("tbody");

  data.forEach(function (row) {
    const tr = document.createElement("tr");

    headers.forEach(function (header) {
      const td = document.createElement("td");

      td.textContent = row[header] ?? "";

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  csvTable.appendChild(tbody);
}

// -----------------------------
// Export tabulky jako PNG
// -----------------------------

exportButton.addEventListener("click", async function () {
  if (typeof htmlToImage === "undefined") {
    alert("The export library could not be loaded.");
    return;
  }

  const originalExportStyles = {
    width: tableExport.style.width,
    maxWidth: tableExport.style.maxWidth,
    overflow: tableExport.style.overflow,
    responsiveOverflow:
      tableExport.querySelector(".table-responsive").style.overflow,
    tableWidth: csvTable.style.width,
    tableMinWidth: csvTable.style.minWidth,
  };

  try {
    exportButton.disabled = true;
    exportButton.innerHTML =
      '<i class="bi bi-hourglass-split me-1"></i>Generating image...';

    // .table-responsive can crop wide tables.
    // Temporarily expand the rendered element so html-to-image
    // captures the entire table without creating an empty clone.
    const exportWidth = Math.max(
      tableExport.clientWidth,
      csvTable.scrollWidth + 60,
    );

    tableExport.style.width = `${exportWidth}px`;
    tableExport.style.maxWidth = "none";
    tableExport.style.overflow = "visible";
    tableExport.querySelector(".table-responsive").style.overflow = "visible";
    csvTable.style.width = "max-content";
    csvTable.style.minWidth = "100%";

    const dataUrl = await htmlToImage.toPng(tableExport, {
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    });

    // Create download link
    const link = document.createElement("a");

    link.download = "csv-table.png";
    link.href = dataUrl;

    link.click();
  } catch (error) {
    console.error("Error exporting table:", error);

    alert("The table could not be exported as an image.");
  } finally {
    tableExport.style.width = originalExportStyles.width;
    tableExport.style.maxWidth = originalExportStyles.maxWidth;
    tableExport.style.overflow = originalExportStyles.overflow;
    tableExport.querySelector(".table-responsive").style.overflow =
      originalExportStyles.responsiveOverflow;
    csvTable.style.width = originalExportStyles.tableWidth;
    csvTable.style.minWidth = originalExportStyles.tableMinWidth;
    exportButton.disabled = false;
    exportButton.innerHTML =
      '<i class="bi bi-download me-1"></i>Download as PNG';
  }
});

// -----------------------------
// Clear everything
// -----------------------------

clearButton.addEventListener("click", function () {
  csvFile.value = "";
  csvText.value = "";
  tableTitleInput.value = "CSV Table";
  updateTableTitle();

  fileInfo.textContent = "";

  csvTable.innerHTML = "";

  tableSection.classList.add("d-none");
});
