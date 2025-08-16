// ----- Main Calculator -----
// Pulls live data from sharedData.js

document.addEventListener("DOMContentLoaded", () => {
    // ----- Load shared data initially -----
    loadSharedData();

    let flowersData = masterFlowers || [];
    let hardGoodsData = masterHardGoods || [];
    let percentagesData = masterPercentages || { greens: 0, wastage: 0, ccFee: 0 };
    let designersData = masterDesigners || [];

    // ----- DOM Elements -----
    const recipeNameInput = document.getElementById("recipeName");
    const designerSelect = document.getElementById("designerSelect");
    const flowerList = document.getElementById("flowerList");
    const addFlowerButton = document.getElementById("addFlowerButton");
    const hardGoodsSelect = document.getElementById("hardGoodsSelect");
    const customerPriceInput = document.getElementById("customerPrice");
    const greensInput = document.getElementById("greens");
    const wastageInput = document.getElementById("wastage");
    const ccFeeInput = document.getElementById("ccFee");
    const flowerTotalOutput = document.getElementById("flowerTotal");
    const remainingOutput = document.getElementById("remaining");

    const saveRecipeButton = document.getElementById("saveRecipeButton");

saveRecipeButton.addEventListener("click", () => {
    if (!recipeNameInput.value || !designerSelect.value) {
        alert("Please enter a recipe name and select a designer.");
        return;
    }

    const recipe = {
        date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
        name: recipeNameInput.value,
        designer: designerSelect.value,
        flowers: flowers.map(f => ({ name: f.name, quantity: f.quantity, price: f.price })),
        hardGoods: selectedHardGood.name ? [{ name: selectedHardGood.name, price: selectedHardGood.price }] : [],
        percentages: {
            greens: Number(greensInput.value),
            wastage: Number(wastageInput.value),
            ccFee: Number(ccFeeInput.value)
        }
    };

    saveRecipe(recipe);

    alert("Recipe saved!");
});


    // ----- State -----
    let flowers = [];
    let selectedHardGood = { name: "", price: 0 };

    // ----- Render Functions -----
    function renderFlowers() {
        flowerList.innerHTML = "";
        flowers.forEach((flower, index) => {
            const row = document.createElement("div");
            const options = flowersData
                .map(f => `<option value="${f.name}" ${f.name === flower.name ? "selected" : ""}>${f.name}</option>`)
                .join("");
            row.innerHTML = `
                <select data-index="${index}" class="flowerSelect">
                    <option value="">--Select Flower--</option>
                    ${options}
                </select>
                Quantity: <input type="number" value="${flower.quantity || 0}" min="0" data-index="${index}" class="quantityInput">
                Price per Stem: $<span class="priceDisplay">${(flower.price || 0).toFixed(2)}</span>
                <button data-index="${index}" class="removeButton">Remove</button>
            `;
            flowerList.appendChild(row);
        });
        addFlowerListeners();
        updateTotals();
    }

    function addFlowerListeners() {
        document.querySelectorAll(".flowerSelect").forEach(select => {
            select.addEventListener("change", e => {
                const i = e.target.dataset.index;
                const flowerName = e.target.value;
                const master = flowersData.find(f => f.name === flowerName);
                flowers[i].name = flowerName;
                flowers[i].price = master ? master.price : 0;
                renderFlowers();
            });
        });

        document.querySelectorAll(".quantityInput").forEach(input => {
            input.addEventListener("input", e => {
                const i = e.target.dataset.index;
                flowers[i].quantity = Number(e.target.value);
                updateTotals();
            });
        });

        document.querySelectorAll(".removeButton").forEach(button => {
            button.addEventListener("click", e => {
                const i = e.target.dataset.index;
                flowers.splice(i, 1);
                renderFlowers();
            });
        });
    }

    function renderHardGoods() {
        hardGoodsSelect.innerHTML = '<option value="">--Select Hard Good--</option>';
        hardGoodsData.forEach(h => {
            const option = document.createElement("option");
            option.value = h.name;
            option.textContent = `${h.name} ($${h.price})`;
            hardGoodsSelect.appendChild(option);
        });
    }

    function renderDesigners() {
        designerSelect.innerHTML = '<option value="">--Select Designer--</option>';
        (designersData || []).forEach(d => {
            const option = document.createElement("option");
            option.value = d;
            option.textContent = d;
            designerSelect.appendChild(option);
        });
    }

    function updateTotals() {
        const flowerTotal = flowers.reduce((sum, f) => sum + (f.price * (f.quantity || 0)), 0);
        flowerTotalOutput.textContent = flowerTotal.toFixed(2);

        const hardGoodsCost = selectedHardGood.price || 0;
        const customerPrice = Number(customerPriceInput.value) || 0;

        const greensValue = (percentagesData.greens / 100) * customerPrice;
        const wastageValue = (percentagesData.wastage / 100) * customerPrice;
        const ccFeeValue = (percentagesData.ccFee / 100) * customerPrice;

        greensInput.value = greensValue.toFixed(2);
        wastageInput.value = wastageValue.toFixed(2);
        ccFeeInput.value = ccFeeValue.toFixed(2);

        const totalCosts = flowerTotal + hardGoodsCost + greensValue + wastageValue + ccFeeValue;
        remainingOutput.textContent = (customerPrice - totalCosts).toFixed(2);
    }

    // ----- Event Listeners -----
    addFlowerButton.addEventListener("click", () => {
        flowers.push({ name: "", quantity: 0, price: 0 });
        renderFlowers();
    });

    hardGoodsSelect.addEventListener("change", e => {
        const selected = hardGoodsData.find(h => h.name === e.target.value);
        selectedHardGood = selected || { name: "", price: 0 };
        updateTotals();
    });

    [customerPriceInput].forEach(input => input.addEventListener("input", updateTotals));

    // ----- Initialize -----
    flowers.push({ name: "", quantity: 0, price: 0 });
    renderFlowers();
    renderHardGoods();
    renderDesigners();
    updateTotals();

    // ----- Live updates from Admin -----
    window.addEventListener("sharedDataChanged", () => {
        loadSharedData();
        flowersData = masterFlowers || [];
        hardGoodsData = masterHardGoods || [];
        percentagesData = masterPercentages || { greens: 0, wastage: 0, ccFee: 0 };
        designersData = masterDesigners || [];

        renderFlowers();
        renderHardGoods();
        renderDesigners();
        updateTotals();
    });
});
