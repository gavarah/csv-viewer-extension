let csvData = [];

const parseCSV = (text) => {
  return Papa.parse(text.trim(), {
    skipEmptyLines: true
  }).data;
};


const buildTable = (data, isHeader, enableFilters) => {
  const table = document.createElement("table");
  table.className = "csv-table";

  // Optional: Add header row
  if (isHeader) {
    const headerRow = document.createElement("tr");
    data[0].forEach(cell => {
      const th = document.createElement("th");
      th.textContent = cell.trim();
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);
  }

  // Optional: Add filter inputs below header
  if (enableFilters) {
    const filterRow = document.createElement("tr");
    const colCount = data[0].length;
    for (let i = 0; i < colCount; i++) {
      const td = document.createElement("td");
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Filter...";
      input.dataset.index = i;
      input.addEventListener("input", () => {
        const index = parseInt(input.dataset.index);
        const filter = input.value.toLowerCase();

        Array.from(table.rows).forEach((row, rowIndex) => {
          if ((isHeader && rowIndex <= 1) || (!isHeader && rowIndex === 0)) return;

          const cell = row.cells[index];
          row.style.display = cell?.textContent?.toLowerCase().includes(filter) ? "" : "none";
        });
      });
      td.appendChild(input);
      filterRow.appendChild(td);
    }
    table.appendChild(filterRow);
  }

  // Add table data rows
  const startIndex = isHeader ? 1 : 0;
  for (let i = startIndex; i < data.length; i++) {
    const row = document.createElement("tr");
    data[i].forEach(cell => {
      const td = document.createElement("td");
      td.textContent = cell.trim();
      row.appendChild(td);
    });
    table.appendChild(row);
  }

  return table;
};


const renderTable = () => {
  const isHeader = document.querySelector('input[name="header"]:checked').value === "yes";
  const enableFilters = document.getElementById("enable-filters").checked;

  const container = document.getElementById("table-container");
  container.innerHTML = "";
  const table = buildTable(csvData, isHeader, enableFilters);
  container.appendChild(table);
};

document.querySelectorAll('input[name="header"]').forEach(radio =>
  radio.addEventListener("change", renderTable)
);
document.getElementById("enable-filters").addEventListener("change", renderTable);

document.getElementById("drop-area").addEventListener("dragover", e => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
});

document.getElementById("drop-area").addEventListener("drop", e => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file && file.name.endsWith(".csv")) {
    const reader = new FileReader();
    reader.onload = event => {
      csvData = parseCSV(event.target.result);
      renderTable();
    };
    reader.readAsText(file);
  }
});
