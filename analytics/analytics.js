// Load shared data
loadSharedData();

// Grab the table body
const tableBody = document.querySelector("#analyticsTable tbody");

// Filters
const designerFilter = document.getElementById("designerFilter");
const flowerFilter = document.getElementById("flowerFilter");
const dateFromInput = document.getElementById("dateFrom");
const dateToInput = document.getElementById("dateTo");
const applyFiltersBtn = document.getElementById("applyFilters");

// Example: Assuming savedRecipes is an array in sharedData
// Each recipe: { date, name, designer, flowers: [{name, qty, price}], hardGoods: [{name, price}], percentages: {...} }
let recipesData = window.masterRecipes || [];  // We'll add saving to masterRecipes later

// Populate filter dropdowns
function populateFilters() {
    const designers = [...new Set(recipesData.map(r => r.designer))];
    designers.forEach(d => {
        const option = document.createElement("option");
        option.value = d;
        option.textContent = d;
        designerFilter.appendChild(option);
    });

    const flowers = [...new Set(recipesData.flatMap(r => r.flowers.map(f => f.name)))];
    flowers.forEach(f => {
        const option = document.createElement("option");
        option.value = f;
        option.textContent = f;
        flowerFilter.appendChild(option);
    });
}

// Render table
function renderTable(data) {
    tableBody.innerHTML = "";
    data.forEach((r, i) => {
        const flowerNames = r.flowers.map(f => `${f.name} (${f.quantity})`).join(", ");
        const hardGoodsNames = r.hardGoods.map(h => `${h.name}`).join(", ");
        const totalCost = r.flowers.reduce((sum,f)=>sum+f.price*f.quantity,0)
                       + r.hardGoods.reduce((sum,h)=>sum+h.price,0)
                       + r.percentages.greens + r.percentages.wastage + r.percentages.ccFee;
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${r.date}</td>
            <td>${r.name}</td>
            <td>${r.designer}</td>
            <td>${flowerNames}</td>
            <td>${hardGoodsNames}</td>
            <td>${r.percentages.greens.toFixed(2)}</td>
            <td>${r.percentages.wastage.toFixed(2)}</td>
            <td>${r.percentages.ccFee.toFixed(2)}</td>
            <td>${totalCost.toFixed(2)}</td>
            <td><button class="deleteRecipe" data-index="${i}">Delete</button></td>

        `;
        tableBody.appendChild(row);
    });
    // Attach delete handlers
    document.querySelectorAll(".deleteRecipe").forEach(btn => {
        btn.addEventListener("click", e => {
            const i = e.target.dataset.index;
            window.masterRecipes.splice(i, 1); // remove recipe
            localStorage.setItem("masterRecipes", JSON.stringify(window.masterRecipes));
            loadSharedData();           // reload shared data
            renderTable(window.masterRecipes); // refresh table
        });
    });
}

// Apply filters
function applyFilters() {
    let filtered = [...recipesData];
    if (designerFilter.value) filtered = filtered.filter(r => r.designer === designerFilter.value);
    if (flowerFilter.value) filtered = filtered.filter(r => r.flowers.some(f => f.name === flowerFilter.value));
    if (dateFromInput.value) filtered = filtered.filter(r => r.date >= dateFromInput.value);
    if (dateToInput.value) filtered = filtered.filter(r => r.date <= dateToInput.value);

    renderTable(filtered);
}

// Initialize
populateFilters();
renderTable(recipesData);

// Event listener
applyFiltersBtn.addEventListener("click", applyFilters);
