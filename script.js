const csvFile = document.getElementById("csvFile");
const csvText = document.getElementById("csvText");

const csvTable = document.getElementById("csvTable");
const tableSection = document.getElementById("tableSection");

const fileInfo = document.getElementById("fileInfo");

const createTableButton = document.getElementById("createTableButton");
const exportButton = document.getElementById("exportButton");
const clearButton = document.getElementById("clearButton");

const tableExport = document.getElementById("tableExport");


// -----------------------------
// Kontrola knihoven
// -----------------------------

if (typeof Papa === "undefined") {
    console.error("Papa Parse se nepodařilo načíst.");
}

if (typeof htmlToImage === "undefined") {
    console.error("html-to-image se nepodařilo načíst.");
}


// -----------------------------
// Nahrání CSV souboru
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

            console.error("Chyba při načítání CSV:", error);

            alert("CSV soubor se nepodařilo načíst.");
        }
    });

});


// -----------------------------
// Vytvoření tabulky z textu
// -----------------------------

createTableButton.addEventListener("click", function () {

    const text = csvText.value.trim();

    if (!text) {
        alert("Nejdříve vlož CSV data.");
        return;
    }

    Papa.parse(text, {
        header: true,
        skipEmptyLines: true,

        complete: function (results) {

            console.log("CSV data:", results.data);

            if (!results.data || results.data.length === 0) {
                alert("CSV neobsahuje žádná data.");
                return;
            }

            createTable(results.data);

            tableSection.classList.remove("d-none");

        },

        error: function (error) {

            console.error("Chyba při zpracování CSV:", error);

            alert("CSV data se nepodařilo zpracovat.");
        }
    });

});


// -----------------------------
// Vytvoření HTML tabulky
// -----------------------------

function createTable(data) {

    csvTable.innerHTML = "";

    if (!data || data.length === 0) {

        csvTable.innerHTML = `
            <tbody>
                <tr>
                    <td class="text-center text-secondary">
                        CSV neobsahuje žádná data.
                    </td>
                </tr>
            </tbody>
        `;

        return;
    }


    // -----------------------------
    // Hlavička
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
    // Tělo tabulky
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
        alert("Exportní knihovna se nepodařila načíst.");
        return;
    }

    try {

        exportButton.disabled = true;
        exportButton.textContent = "Generuji obrázek...";


        const dataUrl = await htmlToImage.toPng(tableExport, {
            pixelRatio: 2,
            backgroundColor: "#ffffff"
        });


        // Vytvoření odkazu pro stažení
        const link = document.createElement("a");

        link.download = "csv-table.png";
        link.href = dataUrl;

        link.click();

    } catch (error) {

        console.error("Chyba při exportu:", error);

        alert("Tabulku se nepodařilo exportovat jako obrázek.");

    } finally {

        exportButton.disabled = false;
        exportButton.textContent = "Stáhnout jako PNG";

    }

});


// -----------------------------
// Vymazání všeho
// -----------------------------

clearButton.addEventListener("click", function () {

    csvFile.value = "";
    csvText.value = "";

    fileInfo.textContent = "";

    csvTable.innerHTML = "";

    tableSection.classList.add("d-none");

});