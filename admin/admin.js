// admin/admin.js
import { supabase } from "../js/supabaseClient.js";

document.addEventListener("DOMContentLoaded", () => {
    // ----- Local copies of master data -----
    let flowers = [];
    let hardGoods = [];
    let designers = [];
    let percentages = { greens: 0, wastage: 0, ccFee: 0 };

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
    const ccFeeInput = document.getElementById("ccFeePercent");

    // ----- Render Functions -----
    function renderFlowers() {
        flowersTable.innerHTML = "";
        flowers.forEach((flower, i) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><input type="text" data-index="${i}" class="flowerName" value="${flower.name}"></td>
                <td><input type="number" data-index="${i}" class="flowerPrice" value="${flower.price}"></td>
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
                <td><input type="text" data-index="${i}" class="designerName" value="${designer}"></td>
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
        document.querySelectorAll(".flowerPrice").forEach(input => {
            input.addEventListener("input", e => {
                flowers[e.target.dataset.index].price = Number(e.target.value);
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
                designers[e.target.dataset.index] = e.target.value;
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
        flowers.push({ name: "", price: 0 });
        renderFlowers();
    });

    saveFlowersButton.addEventListener("click", async () => {
        await supabase.from("flowers").delete().neq("id", 0);
        const { error } = await supabase.from("flowers").insert(flowers);
        if (error) console.error(error);
        else alert("Flowers saved to Supabase!");
    });

    addHardGoodButton.addEventListener("click", () => {
        hardGoods.push({ name: "", price: 0 });
        renderHardGoods();
    });

    saveHardGoodsButton.addEventListener("click", async () => {
        await supabase.from("hard_goods").delete().neq("id", 0);
        const { error } = await supabase.from("hard_goods").insert(hardGoods);
        if (error) console.error(error);
        else alert("Hard Goods saved to Supabase!");
    });

    savePercentagesButton.addEventListener("click", async () => {
        percentages.greens = Number(greensInput.value);
        percentages.wastage = Number(wastageInput.value);
        percentages.ccFee = Number(ccFeeInput.value);

        await supabase.from("percentages").delete().neq("id", 0);
        const { error } = await supabase.from("percentages").insert([percentages]);
        if (error) console.error(error);
        else alert("Percentages saved to Supabase!");
    });

    addDesignerButton.addEventListener("click", () => {
        const name = newDesignerInput.value.trim();
        if (name) {
            designers.push(name);
            newDesignerInput.value = "";
            renderDesigners();
        }
    });

    saveDesignersButton.addEventListener("click", async () => {
        await supabase.from("designers").delete().neq("id", 0);
        const insertData = designers.map(name => ({ name }));
        const { error } = await supabase.from("designers").insert(insertData);
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
        designers = designerData?.map(d => d.name) || [];
        percentages = percData?.[0] || { greens: 0, wastage: 0, ccFee: 0 };

        renderFlowers();
        renderHardGoods();
        renderDesigners();
        greensInput.value = percentages.greens?.toFixed(2) || "0.00";
        wastageInput.value = percentages.wastage?.toFixed(2) || "0.00";
        ccFeeInput.value = percentages.ccFee?.toFixed(2) || "0.00";
    }

    // ----- Initialize -----
    loadFromSupabase();
});
