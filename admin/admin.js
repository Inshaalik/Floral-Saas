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

    // ----- DOM elements -----
    const flowersTable = document.querySelector("#flowersTable tbody");
    const hardGoodsTable = document.querySelector("#hardGoodsTable tbody");
    const designerList = document.querySelector("#designerList");

    const addFlowerButton = document.getElementById("addFlower");
    const saveFlowersButton = document.getElementById("saveFlowers");
    const addHardGoodButton = document.getElementById("addHardGood");
    const saveHardGoodsButton = document.getElementById("saveHardGoods");
    const savePercentagesButton = document.getElementById("savePercentages");
    const addDesignerButton = document.getElementById("addDesigner");
    const saveDesignersButton = document.getElementById("saveDesigners");
    const newDesignerInput = document.getElementById("newDesigner");

    const greensInput = document.getElementById("greensPercent");
    const wastageInput = document.getElementById("wastagePercent");
    const ccfeeInput = document.getElementById("ccfeePercent");

    // ----- Render Functions -----
function renderFlowers() {
    flowersTable.innerHTML = "";
    // Do NOT sort here, sorting happens only on save
    flowers.forEach(flower => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><input type="text" class="flowerName" value="${flower.name}"></td>
            <td><input type="number" step="0.01" class="flowerWholesale" value="${flower.wholesale || 0}"></td>
            <td><input type="number" step="0.01" class="flowerMarkup" value="${flower.markup || 1}"></td>
            <td><input type="number" step="0.01" class="flowerRetail" value="${flower.retail || 0}"></td>
            <td><button class="removeFlower">Remove</button></td>
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

row.querySelector(".removeFlower").addEventListener("click", () => {
    if (!confirm(`Remove ${flower.name || 'this flower'}?`)) return;

    // Track deleted flower IDs (existing flowers)
    if (flower.id && !deletedFlowerIds.includes(flower.id)) {
        deletedFlowerIds.push(flower.id);
    }

    // Remove from local array (all flowers have unique id)
    flowers = flowers.filter(f => f.id !== flower.id);

    console.log("flowers array after remove:", flowers);
    console.log("deletedFlowerIds array:", deletedFlowerIds);

    renderFlowers();
});

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
        flowers.push({ id: uuidv4(), name: "", wholesale: 0, markup: 3.5, retail: 0 });
        renderFlowers();
    });

    addHardGoodButton.addEventListener("click", () => {
        hardGoods.push({ id: uuidv4(), name: "", price: 0 });
        renderHardGoods();
    });

    addDesignerButton.addEventListener("click", () => {
        const name = newDesignerInput.value.trim();
        if (!name) return;
        designers.push({ id: uuidv4(), name });
        newDesignerInput.value = "";
        renderDesigners();
    });


saveFlowersButton.addEventListener("click", async () => {
    const tenantId = localStorage.getItem("tenantId");

    // 1️⃣ Delete removed flowers from Supabase first
    if (deletedFlowerIds.length > 0) {
        console.log("Deleting flowers with IDs:", deletedFlowerIds);
        const { error: deleteError } = await supabase
            .from("flowers")
            .delete()
            .in("id", deletedFlowerIds)
            .eq("tenant_id", tenantId);
        if (deleteError) 
            return alert("Error deleting flowers: " + deleteError.message);  
         deletedFlowerIds = []; // reset after successful deletion
    }
    // 2️⃣ Upsert remaining flowers
    const flowersToSave = flowers
    .filter(f => f.name.trim() !== "")
    .map(f => ({ ...f, tenant_id: tenantId})); 
              console.log("Upserting flowers:", flowersToSave);
     if (flowersToSave.length > 0) {       
    const { error: upsertError } = await supabase
        .from("flowers")
        .upsert(flowersToSave, { onConflict: ["id"] });
    if (upsertError) {
        return alert("Error saving flowers: " + upsertError.message);
    }
    }
    // 3️⃣ Re-fetch and render to make sure local state is correct
    const { data } = await supabase.from("flowers").select("*").eq("tenant_id", tenantId);
    flowers = data || [];
    flowers.sort((a, b) => a.name.localeCompare(b.name || ""));
    renderFlowers();

    alert("Flowers saved!");
});

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
        
        flowers = flowerData || [];
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
