import { supabase } from './supabaseClient.js';

// ----- DOM Elements -----
const tableBody = document.querySelector("#analyticsTable tbody");
const designerFilter = document.getElementById("designerFilter");
const flowerFilter = document.getElementById("flowerFilter");
const dateFromInput = document.getElementById("dateFrom");
const dateToInput = document.getElementById("dateTo");
const applyFiltersBtn = document.getElementById("applyFilters");
const sortSelect = document.getElementById("sortSelect"); // optional dropdown for sort options

let recipesData = [];

// ----- Load Recipes from Supabase -----
async function loadRecipes() {
    try {
        const { data, error } = await supabase
            .from('recipes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Parse description JSON into usable objects
        recipesData = data.map(r => {
            let desc = {};
            try { desc = JSON.parse(r.description || '{}'); } catch (e) { console.error(e); }

            return {
                id: r.id,
                date: new Date(r.created_at).toISOString().split("T")[0],
                name: r.name,
                designer: desc.designer || "",
                flowers: desc.flowers || [],
                hardGoods: desc.hardGoods || [],
                percentages: desc.percentages || { greens: 0, wastage: 0, ccFee: 0 }
            };
        });

        populateFilters();
        renderTable(recipesData);
    } catch (err) {
        console.error("Error loading recipes from Supabase:", err);
    }
}

// ----- Populate Filter Dropdowns -----
function populateFilters() {
    designerFilter.innerHTML = '<option value="">--All Designers--</option>';
    flowerFilter.innerHTML = '<option value="">--All Flowers--</option>';

    const designers = [...new Set(recipesData.map(r => r.designer))].sort();
    designers.forEach(d => {
        const option = document.createElement("option");
        option.value = d;
        option.textContent = d;
        designerFilter.appendChild(option);
    });

    const flowers = [...new Set(recipesData.flatMap(r => r.flowers.map(f => f.name)))].sort();
    flowers.forEach(f => {
        const option = document.createElement("option");
        option.value = f;
        option.textContent = f;
        flowerFilter.appendChild(option);
    });
}

// ----- Render Table -----
function renderTable(data) {
    tableBody.innerHTML = "";

    data.forEach(r => {
        const flowerNames = r.flowers.map(f => `${f.name} (${f.quantity})`).join(", ");
        const hardGoodsNames = r.hardGoods.map(h => h.name).join(", ");
        const flowerTotal = r.flowers.reduce((sum,f)=>sum + f.price*f.quantity,0);
        const hardGoodsTotal = r.hardGoods.reduce((sum,h)=>sum + h.price,0);
        const totalCost = flowerTotal + hardGoodsTotal + r.percentages.greens + r.percentages.wastage + r.percentages.ccFee;

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
            <td><button class="deleteRecipe" data-id="${r.id}">Delete</button></td>
        `;
        tableBody.appendChild(row);
    });

    attachDeleteHandlers();
}

// ----- Delete Recipe -----
function attachDeleteHandlers() {
    document.querySelectorAll(".deleteRecipe").forEach(btn => {
        btn.addEventListener("click", async e => {
            const id = e.target.dataset.id;
            if (!confirm("Are you sure you want to delete this recipe?")) return;

            try {
                const { error } = await supabase.from('recipes').delete().eq('id', id);
                if (error) throw error;
                await loadRecipes();
            } catch (err) {
                console.error("Error deleting recipe:", err);
            }
        });
    });
}

// ----- Apply Filters -----
function applyFilters() {
    let filtered = [...recipesData];

    if (designerFilter.value) filtered = filtered.filter(r => r.designer === designerFilter.value);
    if (flowerFilter.value) filtered = filtered.filter(r => r.flowers.some(f => f.name === flowerFilter.value));
    if (dateFromInput.value) filtered = filtered.filter(r => r.date >= dateFromInput.value);
    if (dateToInput.value) filtered = filtered.filter(r => r.date <= dateToInput.value);

    applySort(filtered);
    renderTable(filtered);
}

// ----- Sorting -----
function applySort(data) {
    const sortVal = sortSelect ? sortSelect.value : "date-desc";

    switch(sortVal) {
        case "name-asc":
            data.sort((a,b) => a.name.localeCompare(b.name));
            break;
        case "name-desc":
            data.sort((a,b) => b.name.localeCompare(a.name));
            break;
        case "cost-asc":
            data.sort((a,b) => {
                const totalA = a.flowers.reduce((s,f)=>s+f.price*f.quantity,0) + a.hardGoods.reduce((s,h)=>s+h.price,0);
                const totalB = b.flowers.reduce((s,f)=>s+f.price*f.quantity,0) + b.hardGoods.reduce((s,h)=>s+h.price,0);
                return totalA - totalB;
            });
            break;
        case "cost-desc":
            data.sort((a,b) => {
                const totalA = a.flowers.reduce((s,f)=>s+f.price*f.quantity,0) + a.hardGoods.reduce((s,h)=>s+h.price,0);
                const totalB = b.flowers.reduce((s,f)=>s+f.price*f.quantity,0) + b.hardGoods.reduce((s,h)=>s+h.price,0);
                return totalB - totalA;
            });
            break;
        case "date-asc":
            data.sort((a,b) => new Date(a.date) - new Date(b.date));
            break;
        case "date-desc":
        default:
            data.sort((a,b) => new Date(b.date) - new Date(a.date));
            break;
    }
}

// ----- Event Listeners -----
applyFiltersBtn.addEventListener("click", applyFilters);
if (sortSelect) sortSelect.addEventListener("change", applyFilters);

// ----- Initialize -----
loadRecipes();
