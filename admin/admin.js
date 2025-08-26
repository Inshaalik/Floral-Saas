// admin/admin.js
import { supabase } from "../js/supabaseClient.js";
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

document.addEventListener("DOMContentLoaded", () => {
    // ----- Local copies of master data -----
    let flowers = [];
    let hardGoods = [];
    let designers = [];
    let percentages = { id: uuidv4(), greens: 0, wastage: 0, ccfee: 0 };

    // ----- DOM Elements -----
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
                <td><input type="number" step="0.01" data-index="${i}" class="flowerMarkup" value="${flower.markup || 0}"></td>
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

    // ----- Listeners -----
    function addFlowerListeners() {
        document.querySelectorAll(".flowerName").forEach(input => {
            input.addEventListener("input", e => {
                flowers[e.target.dataset.index].name = e.target.value;
            });
        });

        document.querySelectorAll(".flowerWholesale").forEach(input => {
            input.addEventListener("input", e => {
                const i = e.target.dataset.index;
                flowers[i].wholesale = Number(e.target.value);
                flowers[i].retail = +(flowers[i].wholesale * (1 + (flowers[i].markup || 0)/100)).toFixed(2);
                renderFlowers();
            });
        });

        document.querySelectorAll(".flowerMarkup").forEach(input => {
            input.addEventListener("input", e => {
                const i = e.target.dataset.index;
                flowers[i].markup = Number(e.target.value);
                flowers[i].retail = +(flowers[i].wholesale * (1 + flowers[i].markup/100)).toFixed(2);
                renderFlowers();
            });
        });

        document.querySelectorAll(".flowerRetail").forEach(input => {
            input.addEventListener("input", e => {
                const i = e.target.dataset.index;
                flowers[i].retail = Number(e.target.value);
                if(flowers[i].wholesale > 0){
                    flowers[i].markup = +(((flowers[i].retail / flowers[i].wholesale) - 1) * 100).toFixed(2);
                }
                renderFlowers();
            });
        });

        document.querySelectorAll(".removeFlower").forEach(btn => {
            btn.addEventListener("click", e => {
                flowers.splice(e.target.dataset.index, 1);
                renderFlowers();
            });
        });
    }

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

    // ----- Button Events -----
    addFlowerButton.addEventListener("click", () => {
        flowers.push({ id: uuidv4(), name: "", wholesale: 0, markup: 0, retail: 0 });
        renderFlowers();
    });

    saveFlowersButton.addEventListener("click", async () => {
        const { error } = await supabase
            .from("flowers")
            .upsert(flowers, { onConflict: "id" });
        if (error) console.error(error);
        else alert("Flowers saved to Supabase!");
    });

    addHardGoodButton.addEventListener("click", () => {
        hardGoods.push({ id: uuidv4(), name: "", price: 0 });
        renderHardGoods();
    });

    saveHardGoodsButton.addEventListener("click", async () => {
        const { error } = await supabase
            .from("hard_goods")
            .upsert(hardGoods, { onConflict: "id" });
        if (error) console.error(error);
        else alert("Hard Goods saved to Supabase!");
    });

    savePercentagesButton.addEventListener("click", async () => {
        percentages.greens = parseFloat(greensInput.value) || 0;
        percentages.wastage = parseFloat(wastageInput.value) || 0;
        percentages.ccfee = parseFloat(ccfeeInput.value) || 0;

        const { error } = await supabase
            .from("percentages")
            .upsert([percentages], { onConflict: "id" });
        if (error) console.error(error);
        else alert("Percentages saved to Supabase!");
    });

    addDesignerButton.addEventListener("click", () => {
        const name = newDesignerInput.value.trim();
        if (name) {
            designers.push({ id: uuidv4(), name });
            newDesignerInput.value = "";
            renderDesigners();
        }
    });

    saveDesignersButton.addEventListener("click", async () => {
        const { error } = await supabase
            .from("designers")
            .upsert(designers, { onConflict: "id" });
        if (error) console.error(error);
        else alert("Designers saved to Supabase!");
    });

    // ----- Load Data from Supabase -----
    async function loadFromSupabase() {
        const { data: flowerData } = await supabase.from("flowers").select("*");
        const { data: hardGoodData } = await supabase.from("hard_goods").select("*");
        const { data: designerData } = await supabase.from("designers").select("*");
        const { data: percData } = await supabase.from("percentages").select("*");

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
