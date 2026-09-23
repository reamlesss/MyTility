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
const openHelpdeskTool = document.getElementById("openHelpdeskTool");
const backToHome = document.getElementById("backToHome");
const backToHomeFromHelpdesk = document.getElementById("backToHomeFromHelpdesk");
const helpdeskSection = document.getElementById("helpdeskSection");
const employeeFormText = document.getElementById("employeeFormText");
const extractEmployeeButton = document.getElementById("extractEmployeeButton");
const employeeResultSection = document.getElementById("employeeResultSection");
const employeeResultGrid = document.getElementById("employeeResultGrid");
const copyEmployeeResultButton = document.getElementById("copyEmployeeResultButton");
const uploadModeButton = document.getElementById("uploadModeButton");
const pasteModeButton = document.getElementById("pasteModeButton");
const uploadMode = document.getElementById("uploadMode");
const pasteMode = document.getElementById("pasteMode");

function selectInputMode(mode) {
  const uploadSelected = mode === "upload";
  uploadMode.hidden = !uploadSelected;
  pasteMode.hidden = uploadSelected;
  uploadModeButton.classList.toggle("active", uploadSelected);
  pasteModeButton.classList.toggle("active", !uploadSelected);
  uploadModeButton.setAttribute("aria-selected", String(uploadSelected));
  pasteModeButton.setAttribute("aria-selected", String(!uploadSelected));
}

uploadModeButton.addEventListener("click", () => selectInputMode("upload"));
pasteModeButton.addEventListener("click", () => selectInputMode("paste"));

function showCsvTool() {
  homeSection.hidden = true;
  helpdeskSection.hidden = true;
  toolSection.hidden = false;
}

function showHelpdeskTool() {
  homeSection.hidden = true;
  toolSection.hidden = true;
  helpdeskSection.hidden = false;
}

function showHome() {
  toolSection.hidden = true;
  helpdeskSection.hidden = true;
  homeSection.hidden = false;
}

openCsvTool.addEventListener("click", showCsvTool);
openHelpdeskTool.addEventListener("click", showHelpdeskTool);
backToHome.addEventListener("click", showHome);
backToHomeFromHelpdesk.addEventListener("click", showHome);
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
  const title = tableTitleInput.value.trim() || "CSV tabulka";
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
  themeToggle.innerHTML = `<i class="bi bi-${isDark ? "sun-fill" : "moon-stars-fill"}"></i><span class="d-none d-sm-inline">${isDark ? "Světlý režim" : "Tmavý režim"}</span>`;
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Přepnout na světlý režim" : "Přepnout na tmavý režim",
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
  console.error("Knihovnu Papa Parse se nepodařilo načíst.");
}

if (typeof htmlToImage === "undefined") {
  console.error("Knihovnu html-to-image se nepodařilo načíst.");
}

// -----------------------------
// CSV file upload
// -----------------------------

csvFile.addEventListener("change", function () {
  const file = csvFile.files[0];

  if (!file) {
    return;
  }

  fileInfo.textContent = `Vybraný soubor: ${file.name}`;

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

      alert("CSV se nepodařilo načíst.");
    },
  });
});

// -----------------------------
// Create table from text
// -----------------------------

createTableButton.addEventListener("click", function () {
  const text = csvText.value.trim();

  if (!text) {
    alert("Nejdřív sem vlož CSV data, kámo.");
    return;
  }

  Papa.parse(text, {
    header: true,
    skipEmptyLines: true,

    complete: function (results) {
      console.log("CSV data:", results.data);

      if (!results.data || results.data.length === 0) {
        alert("CSV je prázdné. Tady toho moc nevykouzlíme 💀");
        return;
      }

      createTable(results.data);

      tableSection.classList.remove("d-none");
    },

    error: function (error) {
      console.error("Error processing CSV:", error);

      alert("CSV se nepodařilo zpracovat.");
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
                        CSV je prázdné. Žádná data, žádný table W.
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
    alert("Knihovnu pro export se nepodařilo načíst.");
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
  const originalTitleDisplay = tableExportTitle.style.display;

  try {
    exportButton.disabled = true;
    exportButton.innerHTML =
      '<i class="bi bi-hourglass-split me-1"></i>Generuju obrázek...';

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
    tableExportTitle.style.display = "none";

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

    alert("Tabulku se nepodařilo exportovat jako obrázek.");
  } finally {
    tableExport.style.width = originalExportStyles.width;
    tableExport.style.maxWidth = originalExportStyles.maxWidth;
    tableExport.style.overflow = originalExportStyles.overflow;
    tableExport.querySelector(".table-responsive").style.overflow =
      originalExportStyles.responsiveOverflow;
    csvTable.style.width = originalExportStyles.tableWidth;
    csvTable.style.minWidth = originalExportStyles.tableMinWidth;
    tableExportTitle.style.display = originalTitleDisplay;
    exportButton.disabled = false;
    exportButton.innerHTML =
      '<i class="bi bi-download me-1"></i>Stáhnout jako PNG';
  }
});

// -----------------------------
// Clear everything
// -----------------------------

clearButton.addEventListener("click", function () {
  csvFile.value = "";
  csvText.value = "";
  tableTitleInput.value = "CSV tabulka";
  updateTableTitle();

  fileInfo.textContent = "";

  csvTable.innerHTML = "";

  tableSection.classList.add("d-none");
});

// -----------------------------
// VstupakHelper employee extraction
// -----------------------------

const employeeFields = [
  { key: "medicalc", label: "Medicalc", patterns: ["medicalc"] },
  { key: "pivotal", label: "Pivotal", patterns: ["pivotal"] },
  {
    key: "employeeNumber",
    label: "Osobní číslo",
    patterns: ["osobni cislo zamestnance", "osobni cislo"],
  },
  { key: "birthDate", label: "Datum narození", patterns: ["datum narozeni"] },
  { key: "fullName", label: "Jméno a příjmení", patterns: ["jmeno a prijmeni"] },
  { key: "title", label: "Titul", patterns: ["titul"] },
];

function normalizeEmployeeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getFormValue(lines, patterns) {
  for (const line of lines) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) continue;

    const label = normalizeEmployeeText(line.slice(0, separatorIndex));
    const matchedPattern = patterns.some(
      (pattern) => label === pattern || label.startsWith(`${pattern} `),
    );

    if (matchedPattern) {
      return line.slice(separatorIndex + 1).trim() || "Nenalezeno";
    }
  }

  return "Nenalezeno";
}

function extractEmployeeData(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const values = Object.fromEntries(
    employeeFields.map((field) => [field.key, getFormValue(lines, field.patterns)]),
  );

  if (values.fullName === "Nenalezeno") {
    const firstName = getFormValue(lines, ["jmeno"]);
    const lastName = getFormValue(lines, ["prijmeni"]);
    if (firstName !== "Nenalezeno" || lastName !== "Nenalezeno") {
      values.fullName = [firstName, lastName]
        .filter((value) => value !== "Nenalezeno")
        .join(" ");
    }
  }

  return values;
}

function renderEmployeeResult(values) {
  employeeResultGrid.innerHTML = employeeFields
    .map(
      (field) => `
        <div class="employee-result-item">
          <span>${field.label}</span>
          <div class="employee-result-value">
            <strong>${escapeHtml(values[field.key])}</strong>
            <button class="copy-field-button" type="button" data-copy-key="${field.key}"
              aria-label="Kopírovat ${field.label}" title="Kopírovat ${field.label}">
              <i class="bi bi-copy"></i>
            </button>
          </div>
        </div>
      `,
    )
    .join("");
  employeeResultSection.hidden = false;
}

function escapeHtml(value) {
  const element = document.createElement("span");
  element.textContent = value;
  return element.innerHTML;
}

extractEmployeeButton.addEventListener("click", function () {
  const text = employeeFormText.value.trim();

  if (!text) {
    alert("Nejdřív sem vlož formulář zaměstnance, bro.");
    employeeFormText.focus();
    return;
  }

  renderEmployeeResult(extractEmployeeData(text));
});

async function copyEmployeeText(text, button, defaultContent) {
  try {
    await navigator.clipboard.writeText(text);
    button.innerHTML = '<i class="bi bi-check2"></i>';
    button.setAttribute("aria-label", "Zkopírováno");
    setTimeout(() => {
      button.innerHTML = defaultContent;
      button.setAttribute("aria-label", button.title || "Kopírovat");
    }, 1600);
  } catch (error) {
    console.error("Data zaměstnance se nepodařilo zkopírovat:", error);
    alert("Data se nepodařilo zkopírovat.");
  }
}

employeeResultGrid.addEventListener("click", function (event) {
  const button = event.target.closest(".copy-field-button");
  if (!button) return;

  const values = extractEmployeeData(employeeFormText.value.trim());
  const field = employeeFields.find((item) => item.key === button.dataset.copyKey);
  if (!field) return;

  copyEmployeeText(values[field.key], button, '<i class="bi bi-copy"></i>');
});

copyEmployeeResultButton.addEventListener("click", function () {
  const values = extractEmployeeData(employeeFormText.value.trim());
  const result = employeeFields
    .map((field) => `${field.label}: ${values[field.key]}`)
    .join("\n");

  copyEmployeeText(
    result,
    copyEmployeeResultButton,
    '<i class="bi bi-copy me-1"></i>Kopírovat vše',
  );
});
