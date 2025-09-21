// admin/admin.js
import { supabase } from "../js/supabaseClient.js";
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

document.addEventListener("DOMContentLoaded", () => {
    // ----- Local copies -----
    let flowers = [];
    let hardGoods = [];
    let designers = [];
    let percentages = { id: uuidv4(), greens: 0, wastage: 0, ccfee: 0 };
    let deletedFlowerIds = [];
    // ----- Pagination & Filter State -----
    let flowersCurrentLetter = "All"; // Default: show all
    let flowersRowsShown = 100;        // Number of rows initially visible
    const flowersRowsIncrement = 10;   // Number of rows to add when "Load More" is clicked

    // ----- DOM elements -----
    const flowersTable = document.querySelector("#flowersTable tbody");
    const hardGoodsTable = document.querySelector("#hardGoodsTable tbody");
    const designerList = document.querySelector("#designerList");

    const addFlowerButton = document.getElementById("addFlower");
    //const saveFlowersButton = document.getElementById("saveFlowers");
    const addHardGoodButton = document.getElementById("addHardGood");
    const saveHardGoodsButton = document.getElementById("saveHardGoods");
    const savePercentagesButton = document.getElementById("savePercentages");
    const addDesignerButton = document.getElementById("addDesigner");
    const saveDesignersButton = document.getElementById("saveDesigners");
    const newDesignerInput = document.getElementById("newDesigner");

    const greensInput = document.getElementById("greensPercent");
    const wastageInput = document.getElementById("wastagePercent");
    const ccfeeInput = document.getElementById("ccfeePercent");

    // ----- Render Alphabet Buttons -----
function renderFlowerAlphabet() {
    const container = document.getElementById("flowersAlphabetFilter");
    if (!container) return;

    const letters = ["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
    container.innerHTML = "";

    letters.forEach(letter => {
        const btn = document.createElement("button");
        btn.textContent = letter;
        btn.classList.add("alphabet-btn");
        if (letter === flowersCurrentLetter) btn.classList.add("active");

        btn.addEventListener("click", () => {
            flowersCurrentLetter = letter;
            flowersRowsShown = 10; // Reset visible rows when changing letter
            renderFlowers();
            renderFlowerAlphabet(); // update active button
        });

        container.appendChild(btn);
    });
}

    // ----- Render Functions -----
function renderFlowers() {
    flowersTable.innerHTML = "";
    // Do NOT sort here, sorting happens only on save
// 1️⃣ Filter by selected alphabet
let filteredFlowers = flowers;
if (flowersCurrentLetter !== "All") {
    filteredFlowers = flowers.filter(f => f.name.toUpperCase().startsWith(flowersCurrentLetter));
}

// 2️⃣ Paginate
const flowersToShow = filteredFlowers.slice(0, flowersRowsShown);

// 3️⃣ Render only the filtered & paginated flowers
flowersToShow.forEach(flower => {
const btnText = flower.saved ===false ? "Add" : "Update";

        const row = document.createElement("tr");
        row.innerHTML = `
            <td><input type="text" class="flowerName" value="${flower.name}"></td>
            <td><input type="number" step="0.01" class="flowerWholesale" value="${flower.wholesale || 0}"></td>
            <td><input type="number" step="0.01" class="flowerMarkup" value="${flower.markup || 1}"></td>
            <td><input type="number" step="0.01" class="flowerRetail" value="${flower.retail || 0}"></td>
            <td>
            <button class="updateFlower">${btnText}</button>
            <button class="removeFlower">Remove</button>
            </td>
            
        `;
        flowersTable.appendChild(row);

        const wholesaleInput = row.querySelector(".flowerWholesale");
        const markupInput = row.querySelector(".flowerMarkup");
        const retailInput = row.querySelector(".flowerRetail");

        // Name
        row.querySelector(".flowerName").addEventListener("blur", e => {
            flower.name = e.target.value;
        });

        // Wholesale input updates retail live
        wholesaleInput.addEventListener("input", e => {
            flower.wholesale = Number(e.target.value) || 0;
            flower.retail = +(flower.wholesale * flower.markup).toFixed(2);
            retailInput.value = flower.retail;
        });

        // Markup input updates retail live
        markupInput.addEventListener("input", e => {
          flower.markup = Number(e.target.value) || 1;

    if (flower.wholesale > 0) {
        // Normal: update retail
        flower.retail = +(flower.wholesale * flower.markup).toFixed(2);
        retailInput.value = flower.retail;
    } else if (flower.retail > 0) {
        // New: calculate wholesale if retail exists
        flower.wholesale = +(flower.retail / flower.markup).toFixed(2);
        wholesaleInput.value = flower.wholesale;
    }
});

        // Retail input updates markup live
        retailInput.addEventListener("input", e => {
           flower.retail = Number(e.target.value) || 0;

    if (flower.wholesale > 0) {
        // Normal: update markup
        flower.markup = flower.wholesale > 0 ? +(flower.retail / flower.wholesale).toFixed(2) : 1;
        markupInput.value = flower.markup;
    } else if (flower.markup > 0) {
        // New: calculate wholesale if markup exists
        flower.wholesale = +(flower.retail / flower.markup).toFixed(2);
        wholesaleInput.value = flower.wholesale;
    }
});

/*row.querySelector(".removeFlower").addEventListener("click", async () => {
  try {
      const tenantId = localStorage.getItem("tenantId");

    // 1️⃣ Remove from local array first (immediate UI update)
    flowers = flowers.filter(f => f.id !== flower.id);
    renderFlowers();

    // 2️⃣ Only try to delete from Supabase if the flower was already saved
    if (flower.saved) {
    
      // ✅ Delete by id only; we know this flower belongs to the current tenant
      const { error } = await supabase
        .from("flowers")
        .delete()
        .eq("id", flower.id)
        .eq("tenant_id", tenantId);

      if (error) {
        console.error("Failed to remove flower from database:", error);
        alert("Error deleting flower from database: " + error.message);

        // Optional: put it back in local array if deletion fails
        flowers.unshift(flower);
        renderFlowers();
        return;
      }
    }

    // 3️⃣ Notify user
    alert(flower.name + " removed!");
  } catch (err) {
    console.error("Unexpected error removing flower:", err);
    alert("Unexpected error removing flower. Check console for details.");
  }
});*/

row.querySelector(".removeFlower").addEventListener("click", async () => {
  console.log('Removing flower:', flower);

  try {
    const tenantId = localStorage.getItem("tenantId");
    console.log('TenantId:', tenantId);

    const { data, error } = await supabase
      .from("flowers")
      .delete()
      .eq("id", flower.id)       // check this
      //.eq("tenant_id", tenantId) // temporarily comment this out for testing
      .select();

    console.log('Delete result:', { error, count });

    if (error) throw error;
    alert("Flower removed!");
    
    // remove from local array anyway
    flowers = flowers.filter(f => f.id !== flower.id);
    renderFlowers();

  } catch (err) {
    console.error("Delete failed:", err);
    alert("Error deleting flower: " + err.message);
  }
});

/*row.querySelector(".removeFlower").addEventListener("click", async () => {
  if (!confirm(`Remove ${flower.name}?`)) return;

  const tenantId = localStorage.getItem("tenantId");

  // Only try deleting from Supabase if this flower is already saved
  if (flower.saved) {
    const { error } = await supabase
      .from("flowers")
      .delete()
      .eq("id", flower.id)
      .eq("tenant_id", tenantId);

    if (error) {
      console.error("Failed to remove flower from database:", error);
      alert("Error deleting flower from database: " + error.message);
      return;
    }
  }

  // ✅ Remove from local array *after* successful delete or if unsaved
  flowers = flowers.filter(f => f.id !== flower.id);
  renderFlowers();
});
*/

// ADD or UPDATE button
row.querySelector(".updateFlower").addEventListener("click", async () => {
  const tenantId = localStorage.getItem("tenantId");

  // Read latest values from inputs
  const name = row.querySelector(".flowerName").value.trim();
  const wholesale = Number(row.querySelector(".flowerWholesale").value) || 0;
  const markup = Number(row.querySelector(".flowerMarkup").value) || 1;
  const retail = Number(row.querySelector(".flowerRetail").value) || 0;

  // Update the local flower object

  flower.name = name;
  flower.wholesale = wholesale;
  flower.markup = markup;
  flower.retail = retail;

  // Build payload for Supabase
  const { saved, ...flowerData } = flower; // exclude 'saved' flag
  const payload = {
    ...flowerData,
    tenant_id: tenantId
  };

  // Save (insert or update) in Supabase
  const { data, error } = await supabase
    .from("flowers")
    .upsert([payload], { onConflict: ["id"] })
    .select();

  if (error) {
    console.error("Supabase upsert error:", error);
    alert("Error saving flower: " + error.message);
    return;
  }

  // Mark saved and update local object with any new values from DB
  flower.saved = true;
  Object.assign(flower, data[0]);

  renderFlowers(); // refresh UI to show correct button text
  alert(flower.name + " saved/updated!");
  
});




     /*   // 4️⃣ Optionally, show "More" button if there are more rows
const flowersMoreButton = document.getElementById("flowersLoadMore");
if (flowersMoreButton) {
    flowersMoreButton.style.display = filteredFlowers.length > flowersRowsShown ? "inline-block" : "none";
// Add click handler to load more rows
    flowersMoreButton.onclick = () => {
        flowersRowsShown += flowersRowsIncrement;
        renderFlowers();
    };
}
    }
});*/


    });  

}

    function renderHardGoods() {
        hardGoodsTable.innerHTML = "";
        hardGoods.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><input type="text" class="hardGoodName" value="${item.name}"></td>
                <td><input type="number" class="hardGoodPrice" value="${item.price}"></td>
                <td><button class="removeHardGood">Remove</button></td>
            `;
            hardGoodsTable.appendChild(row);

            row.querySelector(".hardGoodName").addEventListener("input", e => {
                item.name = e.target.value;
            });
            row.querySelector(".hardGoodPrice").addEventListener("input", e => {
                item.price = Number(e.target.value) || 0;
            });
            row.querySelector(".removeHardGood").addEventListener("click", () => {
                hardGoods = hardGoods.filter(h => h.id !== item.id);
                renderHardGoods();
            });
        });
    }

    function renderDesigners() {
        designerList.innerHTML = "";
        designers.forEach(designer => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><input type="text" class="designerName" value="${designer.name}"></td>
                <td><button class="removeDesigner">Remove</button></td>
            `;
            designerList.appendChild(row);

            row.querySelector(".designerName").addEventListener("input", e => {
                designer.name = e.target.value;
            });
            row.querySelector(".removeDesigner").addEventListener("click", () => {
                designers = designers.filter(d => d.id !== designer.id);
                renderDesigners();
            });
        });
    }

    // ----- Buttons -----
    addFlowerButton.addEventListener("click", () => {
        const tenantId = localStorage.getItem("tenantId");
        flowers.unshift({ 
            id: uuidv4(), 
            name: "",
            wholesale: 0, 
            markup: 3.5, 
            retail: 0, 
            saved:false
         });
        renderFlowers();
    });

    addHardGoodButton.addEventListener("click", () => {
        hardGoods.unshift({ id: uuidv4(), name: "", price: 0 });
        renderHardGoods();
    });

    addDesignerButton.addEventListener("click", () => {
        const name = newDesignerInput.value.trim();
        if (!name) return;
        designers.unshift({ id: uuidv4(), name });
        newDesignerInput.value = "";
        renderDesigners();
    });


/*saveFlowersButton.addEventListener("click", async () => {
  const tenantId = localStorage.getItem("tenantId");
  const idsToDelete = [...deletedFlowerIds]; // snapshot

  // disable UI while saving
  saveFlowersButton.disabled = true;
  const origText = saveFlowersButton.textContent;
  saveFlowersButton.textContent = "Saving...";

  try {
    // 1) Delete removed flowers
    if (idsToDelete.length > 0) {
      console.log("Attempting to delete IDs:", idsToDelete);
      const { data: deleted, error: deleteError } = await supabase
        .from("flowers")
        .delete()
        .in("id", idsToDelete)
        .eq("tenant_id", tenantId)
        .select();

      if (deleteError) {
        console.error("Supabase delete error:", deleteError);
        throw new Error(deleteError.message);
        }
console.log("Deleted rows from DB:", deleted);
      deletedFlowerIds = []; // reset on error to avoid repeated failures
    }

    // 2) Upsert remaining flowers (exclude idsToDelete)
    const flowersToSave = flowers
      .filter(f => (f.name || "").trim() !== "" && !idsToDelete.includes(f.id))
      .map(f => ({ ...f, tenant_id: tenantId }));

    console.log("Upserting flowers (count):", flowersToSave.length, flowersToSave.slice(0,6));
    if (flowersToSave.length > 0) {
      const { data: upsertData, error: upsertError } = await supabase
        .from("flowers")
        .upsert(flowersToSave, { onConflict: ["id"] })
        .select();

      if (upsertError) {
        console.error("Supabase upsert error:", upsertError);
        throw new Error(upsertError.message);
      }
      console.log("Upsert returned rows:", upsertData?.length, upsertData?.slice(0,6));
    }

    // 3) Re-fetch and render to confirm DB state
    const { data: freshData, error: fetchError } = await supabase
      .from("flowers")
      .select("*")
      .eq("tenant_id", tenantId);

    if (fetchError) {
      console.error("Supabase fetch error:", fetchError);
      throw new Error(fetchError.message);
    }

    console.log("Fetched rows from DB:", freshData?.length);
    flowers = freshData || [];
    flowers.sort((a, b) => a.name.localeCompare(b.name || ""));
    renderFlowers();

    console.log("✅ Save complete");
  } catch (err) {
    console.error("Save failed:", err);
    alert(err.message || "Save failed - check console for details.");
  } finally {
    // re-enable UI
    saveFlowersButton.disabled = false;
    saveFlowersButton.textContent = origText;
  }
});*/

    saveHardGoodsButton.addEventListener("click", async () => {
        const tenantId = localStorage.getItem("tenantId");
        const hardGoodsWithTenant = hardGoods.map(h => ({ ...h, tenant_id: tenantId }));
        const { error } = await supabase.from("hard_goods")
            .upsert(hardGoodsWithTenant, { onConflict: ["id"] });
        if (error) return alert("Error saving hard goods: " + error.message);

        const { data } = await supabase.from("hard_goods").select("*").eq("tenant_id", tenantId);
        hardGoods = data || [];
        hardGoods.sort((a, b) => a.name.localeCompare(b.name || ""));
        renderHardGoods();
        alert("Hard goods saved!");
    });

    saveDesignersButton.addEventListener("click", async () => {
        const tenantId = localStorage.getItem("tenantId");
        const designersWithTenant = designers.map(d => ({ ...d, tenant_id: tenantId }));
        const { error } = await supabase.from("designers")
            .upsert(designersWithTenant, { onConflict: ["id"] });
        if (error) return alert("Error saving designers: " + error.message);

        const { data } = await supabase.from("designers").select("*").eq("tenant_id", tenantId);
        designers = data || [];
        designers.sort((a, b) => a.name.localeCompare(b.name || ""));
        renderDesigners();
        alert("Designers saved!");
    });

    savePercentagesButton.addEventListener("click", async () => {
        const tenantId = localStorage.getItem('tenantId');
        percentages = {
            ...percentages,
            tenant_id: tenantId,
            greens: parseFloat(greensInput.value) || 0,
            wastage: parseFloat(wastageInput.value) || 0,
            ccfee: parseFloat(ccfeeInput.value) || 0
        };
        const { error } = await supabase.from("percentages")
            .upsert([percentages], { onConflict: "id" });
        if (error) return alert("Error saving percentages: " + error.message);

        const { data } = await supabase.from("percentages").select("*").eq("tenant_id", tenantId);
        percentages = data?.[0] || percentages;

        greensInput.value = parseFloat(percentages.greens || 0).toFixed(2);
        wastageInput.value = parseFloat(percentages.wastage || 0).toFixed(2);
        ccfeeInput.value = parseFloat(percentages.ccfee || 0).toFixed(2);

        alert("Percentages saved!");
    

    });

    // ----- Load from Supabase -----
    async function loadFromSupabase() {
        const tenantId = localStorage.getItem('tenantId');

        const { data: flowerData } = await supabase.from("flowers").select("*").eq("tenant_id", tenantId);
        
        const { data: hardGoodData } = await supabase.from("hard_goods").select("*").eq("tenant_id", tenantId);
        
        const { data: designerData } = await supabase.from("designers").select("*").eq("tenant_id", tenantId);
        
        const { data: percData } = await supabase.from("percentages").select("*").eq("tenant_id", tenantId);
        
        flowers = (flowerData || []).map(f => ({ ...f, saved: true })); // mark as saved
        hardGoods = hardGoodData || [];
        designers = designerData || [];
        percentages = percData?.[0] || { id: uuidv4(), greens: 0, wastage: 0, ccfee: 0 };

        renderFlowers();
        renderHardGoods();
        renderDesigners();

        greensInput.value = parseFloat(percentages.greens || 0).toFixed(2);
        wastageInput.value = parseFloat(percentages.wastage || 0).toFixed(2);
        ccfeeInput.value = parseFloat(percentages.ccfee || 0).toFixed(2);
    }
    

    // ----- Initialize -----
    loadFromSupabase();
});
