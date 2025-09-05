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
        flowers.forEach((flower, i) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><input type="text" data-index="${i}" class="flowerName" value="${flower.name}"></td>
                <td><input type="number" step="0.01" data-index="${i}" class="flowerWholesale" value="${flower.wholesale || 0}"></td>
                <td><input type="number" step="0.01" data-index="${i}" class="flowerMarkup" value="${flower.markup || 1}"></td>
                <td><input type="number" step="0.01" data-index="${i}" class="flowerRetail" value="${flower.retail || 0}"></td>
                <td><button data-index="${i}" class="removeFlower">Remove</button></td>
            `;
            flowersTable.appendChild(row);
        });
        addFlowerListeners();
    }

    function renderHardGoods() {
        hardGoodsTable.innerHTML = "";
        hardGoods.forEach((item, i) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><input type="text" data-index="${i}" class="hardGoodName" value="${item.name}"></td>
                <td><input type="number" data-index="${i}" class="hardGoodPrice" value="${item.price}"></td>
                <td><button data-index="${i}" class="removeHardGood">Remove</button></td>
            `;
            hardGoodsTable.appendChild(row);
        });
        addHardGoodListeners();
    }

    function renderDesigners() {
        designerList.innerHTML = "";
        designers.forEach((designer, i) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><input type="text" data-index="${i}" class="designerName" value="${designer.name}"></td>
                <td><button data-index="${i}" class="removeDesigner">Remove</button></td>
            `;
            designerList.appendChild(row);
        });
        addDesignerListeners();
    }

    // ----- Flower listeners -----
    function addFlowerListeners() {
        document.querySelectorAll(".flowerName").forEach(input => {
            input.addEventListener("blur", e => {
                flowers[e.target.dataset.index].name = e.target.value;
            });
            input.addEventListener("keydown", e => { if (e.key === "Enter") e.target.blur(); });
        });

        document.querySelectorAll(".flowerWholesale").forEach(input => {
            input.addEventListener("blur", e => {
                const i = e.target.dataset.index;
                flowers[i].wholesale = Number(e.target.value) || 0;
                flowers[i].retail = +(flowers[i].wholesale * flowers[i].markup).toFixed(2);
                renderFlowers();
            });
            input.addEventListener("keydown", e => { if (e.key === "Enter") e.target.blur(); });
        });

        document.querySelectorAll(".flowerMarkup").forEach(input => {
            input.addEventListener("blur", e => {
                const i = e.target.dataset.index;
                flowers[i].markup = Number(e.target.value) || 1;
                flowers[i].retail = +(flowers[i].wholesale * flowers[i].markup).toFixed(2);
                renderFlowers();
            });
            input.addEventListener("keydown", e => { if (e.key === "Enter") e.target.blur(); });
        });

        document.querySelectorAll(".flowerRetail").forEach(input => {
            input.addEventListener("blur", e => {
                const i = e.target.dataset.index;
                flowers[i].retail = Number(e.target.value) || 0;
                flowers[i].markup = flowers[i].wholesale > 0 ? +(flowers[i].retail / flowers[i].wholesale).toFixed(2) : 1;
                renderFlowers();
            });
            input.addEventListener("keydown", e => { if (e.key === "Enter") e.target.blur(); });
        });

        document.querySelectorAll(".removeFlower").forEach(btn => {
            btn.addEventListener("click", e => {
                flowers.splice(e.target.dataset.index, 1);
                renderFlowers();
            });
        });
    }

    // ----- Hard goods listeners -----
    function addHardGoodListeners() {
        document.querySelectorAll(".hardGoodName").forEach(input => {
            input.addEventListener("input", e => {
                hardGoods[e.target.dataset.index].name = e.target.value;
            });
        });
        document.querySelectorAll(".hardGoodPrice").forEach(input => {
            input.addEventListener("input", e => {
                hardGoods[e.target.dataset.index].price = Number(e.target.value);
            });
        });
        document.querySelectorAll(".removeHardGood").forEach(btn => {
            btn.addEventListener("click", e => {
                hardGoods.splice(e.target.dataset.index, 1);
                renderHardGoods();
            });
        });
    }

    // ----- Designer listeners -----
    function addDesignerListeners() {
        document.querySelectorAll(".designerName").forEach(input => {
            input.addEventListener("input", e => {
                designers[e.target.dataset.index].name = e.target.value;
            });
        });
        document.querySelectorAll(".removeDesigner").forEach(btn => {
            btn.addEventListener("click", e => {
                designers.splice(e.target.dataset.index, 1);
                renderDesigners();
            });
        });
    }

    // ----- Buttons -----
    addFlowerButton.addEventListener("click", () => {
        flowers.push({ id: uuidv4(), name: "", wholesale: 0, markup: 1, retail: 0 });
        renderFlowers();
    });

    saveFlowersButton.addEventListener("click", async () => {
        const tenantId = localStorage.getItem('tenantId');
        const flowersWithTenant = flowers.map(f => ({ ...f, tenant_id: tenantId }));
        const { error } = await supabase.from("flowers")
            .upsert(flowersWithTenant, { onConflict: ["tenant_id", "name"] });
        if (error) return alert("Error saving flowers: " + error.message);
        
        const { data } = await supabase.from("flowers").select("*").eq("tenant_id", tenantId);
        flowers = data || [];
        renderFlowers();
        alert("Flowers saved!");
    });

    addHardGoodButton.addEventListener("click", () => {
        hardGoods.push({ id: uuidv4(), name: "", price: 0 });
        renderHardGoods();
    });

    saveHardGoodsButton.addEventListener("click", async () => {
        const tenantId = localStorage.getItem('tenantId');
        const hardGoodsWithTenant = hardGoods.map(h => ({ ...h, tenant_id: tenantId }));
        const { error } = await supabase.from("hard_goods")
            .upsert(hardGoodsWithTenant, { onConflict: ["tenant_id", "name"] });
        if (error) return alert("Error saving hard goods: " + error.message);

        const { data } = await supabase.from("hard_goods").select("*").eq("tenant_id", tenantId);
        hardGoods = data || [];
        renderHardGoods();
        alert("Hard goods saved!");
    });

    addDesignerButton.addEventListener("click", () => {
        const name = newDesignerInput.value.trim();
        if (!name) return;
        designers.push({ id: uuidv4(), name });
        newDesignerInput.value = "";
        renderDesigners();
    });

    saveDesignersButton.addEventListener("click", async () => {
        const tenantId = localStorage.getItem('tenantId');
        const designersWithTenant = designers.map(d => ({ ...d, tenant_id: tenantId }));
        const { error } = await supabase.from("designers")
            .upsert(designersWithTenant, { onConflict: ["tenant_id", "name"] });
        if (error) return alert("Error saving designers: " + error.message);

        const { data } = await supabase.from("designers").select("*").eq("tenant_id", tenantId);
        designers = data || [];
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
            .upsert([percentages], { onConflict: ["tenant_id"] });
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
