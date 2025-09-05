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
    const addFlowerButton = document.getElementById("addFlowerButton");
    const hardGoodsSelect = document.getElementById("hardGoodsSelect");
    const customerPriceInput = document.getElementById("customerPrice");
    const greensInput = document.getElementById("greens");
    const wastageInput = document.getElementById("wastage");
    const ccfeeInput = document.getElementById("ccfee");
    const flowerTotalOutput = document.getElementById("flowerTotal");
    const remainingOutput = document.getElementById("remaining");
    const saveRecipeButton = document.getElementById("saveRecipeButton");

    // ----- Initialize arrays AFTER data has loaded -----
    let flowersData = window.masterFlowers || [];
    let hardGoodsData = window.masterHardGoods || [];
    let percentagesData = window.masterPercentages || { greens: 0, wastage: 0, ccfee: 0 };
    let designersData = window.masterDesigners || [];

   // renderDesigners();
    //renderHardGoods();
    //renderFlowers();
    //updateTotals();


    // ----- State -----
    let flowers = [];
    let selectedHardGood = { name: "", price: 0 };

    // ----- Render Functions -----
 function renderFlowers() {
    flowerList.innerHTML = ""; // clear previous list

    flowers.forEach((flower, index) => {
        const row = document.createElement("div");
        row.classList.add("flower-row"); // optional for styling

        row.textContent = `${flower.name} $${flower.price.toFixed(2)} x ${flower.quantity}`;

        // Remove button
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtn.dataset.index = index;
        removeBtn.classList.add("removeButton");

        removeBtn.addEventListener("click", () => {
            flowers.splice(index, 1);
            renderFlowers();
            updateTotals(); // recalc totals after removal
        });

        row.appendChild(removeBtn);
        flowerList.appendChild(row);
    });

    updateTotals(); // update spent & remaining
}



   function addFlowerListeners() {
    // Remove individual input listeners—flowers are selected via prompt now

    // Add remove button listeners
    document.querySelectorAll(".removeButton").forEach((button, index) => {
        button.addEventListener("click", () => {
            flowers.splice(index, 1);  // remove flower from state
            renderFlowers();           // re-render summary
            updateTotals();            // recalc totals
        });
    });
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

    // ----- Update Totals -----
    function updateTotals() {
    // ----- Calculate flower total -----
    const flowerTotal = flowers.reduce((sum, f) => sum + (f.price * (f.quantity || 0)), 0);

    // ----- Hard goods -----
    const hardGoodsCost = selectedHardGood.price || 0;

    // ----- Customer price -----
    const customerPrice = Number(customerPriceInput.value) || 0;

    // ----- Other percentages / costs -----
    const greensValue = (percentagesData.greens / 100) * customerPrice;
    const wastageValue = (percentagesData.wastage / 100) * customerPrice;
    const ccfeeValue = (percentagesData.ccfee / 100) * customerPrice;

    greensInput.value = greensValue.toFixed(2);
    wastageInput.value = wastageValue.toFixed(2);
    ccfeeInput.value = ccfeeValue.toFixed(2);

    // ----- Total money spent -----
    const totalSpent = flowerTotal + hardGoodsCost + greensValue + wastageValue + ccfeeValue;

    // ----- Remaining money -----
    const remaining = customerPrice - totalSpent;

    // ----- Update DOM -----
    flowerTotalOutput.textContent = totalSpent.toFixed(2);  // total money spent
    remainingOutput.textContent = remaining.toFixed(2);    // money remaining
}


    // ----- Event Listeners -----
   addFlowerButton.addEventListener("click", () => {
    // Dropdown-style prompt
    const optionsText = flowersData
        .map(f => `${f.name} ($${f.retail.toFixed(2)})`)
        .join("\n");

    const selectedName = prompt(`Select a flower by typing the name:\n${optionsText}`);
    if (!selectedName) return;

    const master = flowersData.find(f => f.name.toLowerCase() === selectedName.toLowerCase());
    if (!master) {
        alert("Flower not found.");
        return;
    }

    const qty = Number(prompt(`Enter quantity for ${master.name}:`, "1"));
    if (!qty || qty <= 0) return;

    flowers.push({ name: master.name, price: master.retail, quantity: qty });

    renderFlowers(); // just summary
});


   saveRecipeButton.addEventListener("click", async () => {
    if (!recipeNameInput.value || !designerSelect.value) {
        alert("Please enter a recipe name and select a designer.");
        return;
    }
 const tenantId = window.currentTenantId; // <-- must be set on login

    const recipePayload = {
        tenant_id: tenantId, // replace with actual tenant ID if needed
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
        // Optionally, reset form here or update UI
    } catch (err) {
        console.error("Error saving recipe:", err);
        alert("Failed to save recipe. Check console for details.");
    }


});

const clearButton = document.getElementById("clearButton");

clearButton.addEventListener("click", () => {
    // Clear inputs
    recipeNameInput.value = "";
    designerSelect.value = "";
    customerPriceInput.value = 0;
    greensInput.value = 0;
    wastageInput.value = 0;
    ccfeeInput.value = 0;

    // ----- Initialize -----
    flowers = [];
    renderFlowers();
    renderHardGoods();
    renderDesigners();
    updateTotals();
});

    // ----- Live updates from Admin -----
    window.addEventListener("sharedDataChanged", async () => {
       await loadSharedData();

       flowersData = window.masterFlowers || [];
       hardGoodsData = window.masterHardGoods || [];
       percentagesData = window.masterPercentages || { greens: 0, wastage: 0, ccfee: 0 };
       designersData = window.masterDesigners || [];

       renderFlowers();
       renderHardGoods();
       renderDesigners();
       updateTotals();
    });
});
