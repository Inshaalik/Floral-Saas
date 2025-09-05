import { supabase } from "../js/supabaseClient.js";

// ----- Universal save helper -----
async function saveItems(table, rows, tenantId, conflictColumns = ["tenant_id", "name"]) {
  const payload = rows.map(row => ({
    id: row.id,           // keep id if editing, undefined if new
    tenant_id: tenantId,
    ...row
  }));

  const { data, error } = await supabase
    .from(table)
    .upsert(payload, { onConflict: conflictColumns.join(",") });

  if (error) console.error(`Error saving ${table}:`, error.message);
  else console.log(`${table} saved successfully`, data);

  return data;
}

// ----- Create editable row -----
function createRow(tableBody, fields = {}, rowId = undefined) {
  const tr = document.createElement("tr");
  tr.dataset.id = rowId || "";

  Object.keys(fields).forEach(key => {
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.type = typeof fields[key] === "number" ? "number" : "text";
    input.value = fields[key];
    input.dataset.field = key;
    td.appendChild(input);
    tr.appendChild(td);
  });

  // Action column
  const td = document.createElement("td");
  const removeBtn = document.createElement("button");
  removeBtn.textContent = "🗑️";
  removeBtn.addEventListener("click", () => tr.remove());
  td.appendChild(removeBtn);
  tr.appendChild(td);

  tableBody.appendChild(tr);
}

// ----- Setup table helper -----
function setupTable(tableId, addBtnId, saveBtnId, defaultFields, tableName) {
  const tableBody = document.querySelector(`#${tableId} tbody`);
  const addBtn = document.getElementById(addBtnId);
  const saveBtn = document.getElementById(saveBtnId);

  addBtn.addEventListener("click", () => createRow(tableBody, defaultFields));

  saveBtn.addEventListener("click", async () => {
    const tenantId = localStorage.getItem("tenantId");

    const rows = Array.from(tableBody.querySelectorAll("tr")).map(tr => {
      const fields = {};
      tr.querySelectorAll("input").forEach(input => {
        fields[input.dataset.field] =
          input.type === "number" ? parseFloat(input.value) || 0 : input.value;
      });
      return { ...fields, id: tr.dataset.id || undefined };
    });

    const saved = await saveItems(tableName, rows, tenantId);

    // Update row ids after save
    tableBody.querySelectorAll("tr").forEach((tr, i) => {
      tr.dataset.id = saved[i].id;
    });

    alert(`${tableName} saved successfully!`);
  });
}

// ----- Initialize tables -----
document.addEventListener("DOMContentLoaded", async () => {
  const tenantId = localStorage.getItem("tenantId");

  // Load existing data
  const [{ data: flowers = [] }, { data: hardGoods = [] }, { data: designers = [] }] =
    await Promise.all([
      supabase.from("flowers").select("*").eq("tenant_id", tenantId),
      supabase.from("hard_goods").select("*").eq("tenant_id", tenantId),
      supabase.from("designers").select("*").eq("tenant_id", tenantId)
    ]);

  // Render existing rows
  flowers.forEach(f => createRow(document.querySelector("#flowersTable tbody"), {
    name: f.name,
    wholesale: f.wholesale,
    markup: f.markup,
    retail: f.retail
  }, f.id));

  hardGoods.forEach(h => createRow(document.querySelector("#hardGoodsTable tbody"), {
    name: h.name,
    price: h.price
  }, h.id));

  designers.forEach(d => createRow(document.querySelector("#designerTable tbody"), {
    name: d.name
  }, d.id));

  // Setup tables
  setupTable("flowersTable", "addFlower", "saveFlowers", { name: "", wholesale: 0, markup: 1, retail: 0 }, "flowers");
  setupTable("hardGoodsTable", "addHardGood", "saveHardGoods", { name: "", price: 0 }, "hard_goods");
  setupTable("designerTable", "addDesigner", "saveDesigners", { name: "" }, "designers");
});
