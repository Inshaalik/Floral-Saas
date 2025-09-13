// admin/admin.js
import { supabase } from "../js/supabaseClient.js";
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

document.addEventListener("DOMContentLoaded", () => {
    // ----- Local copies -----
    let flowers = [];
    let hardGoods = [];
    let designers = [];
    let percentages = { id: uuidv4(), greens: 0, wastage: 0, ccfee: 0 };

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
// Remove button handler
row.querySelector(".removeFlower").addEventListener("click", async () => {
    // Confirm delete
    if (!confirm(`Remove ${flower.name || 'this flower'}?`)) return;

    // 1. Delete directly from Supabase
    if (flower.id) {
        const tenantId = localStorage.getItem('tenantId');
        console.log("Deleting flower with ID:", flower.id);

        const { error } = await supabase
        .from("flowers")
        .delete()
        .eq("id", flower.id) // make sure flower.id exists in your array
        .eq("tenant_id", tenantId);
    if (error) {
        console.error("Error deleting flower:", error);
        alert("Could not delete flower");
        return;
    }
    console.log("Flower deleted successfully");
 }

    // 2. Remove from local array
    flowers = flowers.filter(f => f.id !== flower.id);
    // 3. Re-render table
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
        const flowersWithTenant = flowers.map(f => ({ ...f, tenant_id: tenantId }));
        const { error } = await supabase.from("flowers")
            .upsert(flowersWithTenant, { onConflict: ["id"] });
        if (error) return alert("Error saving flowers: " + error.message);

        const { data } = await supabase.from("flowers").select("*").eq("tenant_id", tenantId);
        flowers = data || [];
        // ✅ Sort on save
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
