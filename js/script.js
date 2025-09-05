// ----- Main Calculator -----
// Pulls live data from sharedData.js
import { supabase } from './supabaseClient.js';
import { loadSharedData, saveRecipe } from './sharedData.js';

document.addEventListener("DOMContentLoaded", async () => {
    // ----- Load shared data initially -----
    await loadSharedData();

    // ----- Set tenant ID from localStorage -----
    window.currentTenantId = localStorage.getItem('tenantId');
    if (!window.currentTenantId) {
        alert('Tenant ID missing. Please log in again.');
        window.location.href = 'login/login.html';
        return;
    }

    // ----- DOM Elements -----
    const recipeNameInput = document.getElementById("recipeName");
    const designerSelect = document.getElementById("designerSelect");
    const flowerList = document.getElementById("flowerList");
    const flowerSelectInput = document.getElementById("flowerSelect"); // NEW input
    const flowerQtyInput = document.getElementById("flowerQty");       // NEW input
    const addFlowerButton = document.getElementById("addFlowerButton");
    const hardGoodsSelect = document.getElementById("hardGoodsSelect");
    const customerPriceInput = document.getElementById("customerPrice");
    const greensInput = document.getElementById("greens");
    const wastageInput = document.getElementById("wastage");
    const ccfeeInput = document.getElementById("ccfee");
    const flowerTotalOutput = document.getElementById("flowerTotal");
    const remainingOutput = document.getElementById("remaining");
    const saveRecipeButton = document.getElementById("saveRecipeButton");
    const clearButton = document.getElementById("clearButton");

    // ----- State -----
    let flowersData = window.masterFlowers || [];
    let hardGoodsData = window.masterHardGoods || [];
    let percentagesData = window.masterPercentages || { greens: 0, wastage: 0, ccfee: 0 };
    let designersData = window.masterDesigners || [];

    let flowers = [];
    let selectedHardGood = { name: "", price: 0 };

    // ----- Render Functions -----
    function renderFlowers() {
        flowerList.innerHTML = "";
        flowers.forEach((flower, index) => {
            const row = document.createElement("div");
            row.classList.add("flower-row");
            row.textContent = `${flower.name} $${flower.price.toFixed(2)} x ${flower.quantity}`;

            const removeBtn = document.createElement("button");
            removeBtn.textContent = "Remove";
            removeBtn.dataset.index = index;
            removeBtn.addEventListener("click", () => {
                flowers.splice(index, 1);
                renderFlowers();
                updateTotals();
            });

            row.appendChild(removeBtn);
            flowerList.appendChild(row);
        });

        updateTotals();
    }

    function renderHardGoods() {
        hardGoodsSelect.innerHTML = '<option value="">--Select Hard Good--</option>';
        hardGoodsData.forEach(h => {
            const option = document.createElement("option");
            option.value = h.name;
            option.textContent = `${h.name} ($${h.price || 0})`;
            hardGoodsSelect.appendChild(option);
        });
    }

    function renderDesigners() {
        designerSelect.innerHTML = '<option value="">--Select Designer--</option>';
        designersData.forEach(d => {
            const option = document.createElement("option");
            option.value = d.name;
            option.textContent = d.name;
            designerSelect.appendChild(option);
        });
    }

    function populateFlowerDatalist() {
        const datalist = document.getElementById("flowerOptions");
        datalist.innerHTML = "";
        flowersData.forEach(f => {
            const option = document.createElement("option");
            option.value = f.name;
            datalist.appendChild(option);
        });
    }

    function updateTotals() {
        const flowerTotal = flowers.reduce((sum, f) => sum + (f.price * (f.quantity || 0)), 0);
        const hardGoodsCost = selectedHardGood.price || 0;
        const customerPrice = Number(customerPriceInput.value) || 0;

        const greensValue = (percentagesData.greens / 100) * customerPrice;
        const wastageValue = (percentagesData.wastage / 100) * customerPrice;
        const ccfeeValue = (percentagesData.ccfee / 100) * customerPrice;

        greensInput.value = greensValue.toFixed(2);
        wastageInput.value = wastageValue.toFixed(2);
        ccfeeInput.value = ccfeeValue.toFixed(2);

        const totalSpent = flowerTotal + hardGoodsCost + greensValue + wastageValue + ccfeeValue;
        const remaining = customerPrice - totalSpent;

        flowerTotalOutput.textContent = totalSpent.toFixed(2);
        remainingOutput.textContent = remaining.toFixed(2);
    }

    // ----- Event Listeners -----
    // Hard goods selection
    hardGoodsSelect.addEventListener("change", e => {
        const selected = hardGoodsData.find(h => h.name === e.target.value);
        selectedHardGood = selected || { name: "", price: 0 };
        updateTotals();
    });

    // Customer price input
    customerPriceInput.addEventListener("input", updateTotals);

    // Flower selection - dropdown + quantity input
    addFlowerButton.addEventListener("click", () => {
        const selectedName = flowerSelectInput.value.trim();
        const qty = Number(flowerQtyInput.value);
        if (!selectedName) {
            alert("Please select a flower.");
            return;
        }
        if (!qty || qty <= 0) {
            alert("Please enter a valid quantity.");
            return;
        }

        const master = flowersData.find(f => f.name.toLowerCase() === selectedName.toLowerCase());
        if (!master) {
            alert("Flower not found.");
            return;
        }

        flowers.push({ name: master.name, price: master.retail, quantity: qty });
        flowerSelectInput.value = "";
        flowerQtyInput.value = 1;
        renderFlowers();
    });

    // Save recipe
    saveRecipeButton.addEventListener("click", async () => {
        if (!recipeNameInput.value || !designerSelect.value) {
            alert("Please enter a recipe name and select a designer.");
            return;
        }

        const tenantId = window.currentTenantId;

        const recipePayload = {
            tenant_id: tenantId,
            name: recipeNameInput.value,
            description: JSON.stringify({
                flowers: flowers.map(f => ({ name: f.name, quantity: f.quantity, price: f.price })),
                hardGoods: selectedHardGood.name ? [{ name: selectedHardGood.name, price: selectedHardGood.price }] : [],
                percentages: {
                    greens: Number(greensInput.value),
                    wastage: Number(wastageInput.value),
                    ccfee: Number(ccfeeInput.value)
                }
            }),
            total_stems: flowers.reduce((sum, f) => sum + (f.quantity || 0), 0)
        };

        try {
            const { data, error } = await supabase.from('recipes').insert([recipePayload]);
            if (error) throw error;
            alert("Recipe saved to Supabase!");
        } catch (err) {
            console.error("Error saving recipe:", err);
            alert("Failed to save recipe. Check console for details.");
        }
    });

    // Clear all inputs
    clearButton.addEventListener("click", () => {
        recipeNameInput.value = "";
        designerSelect.value = "";
        customerPriceInput.value = 0;
        greensInput.value = 0;
        wastageInput.value = 0;
        ccfeeInput.value = 0;

        flowers = [];
        selectedHardGood = { name: "", price: 0 };
        flowerSelectInput.value = "";
        flowerQtyInput.value = 1;

        renderFlowers();
        renderHardGoods();
        renderDesigners();
        updateTotals();
    });

    // ----- Initial Render -----
    populateFlowerDatalist();
    renderDesigners();
    renderHardGoods();
    renderFlowers();
    updateTotals();

    // ----- Live updates from Admin -----
    window.addEventListener("sharedDataChanged", async () => {
        await loadSharedData();

        flowersData = window.masterFlowers || [];
        hardGoodsData = window.masterHardGoods || [];
        percentagesData = window.masterPercentages || { greens: 0, wastage: 0, ccfee: 0 };
        designersData = window.masterDesigners || [];

        populateFlowerDatalist();
        renderFlowers();
        renderHardGoods();
        renderDesigners();
        updateTotals();
    });
});
