import { supabase } from './supabaseClient.js';  // adjust path if needed

// ----- Shared Data Module -----
// This file ONLY handles data storage and updates

// Load saved master data from LocalStorage
async function loadSharedData() {
    // First, try to fetch live data from Supabase
    try {
        const { data: flowersData, error: flowersError } = await supabase
            .from('flowers')
            .select('name, wholesale, markup, retail'); // <-- pull retail instead of price

        if (flowersError) throw flowersError;
        window.masterFlowers = flowersData || JSON.parse(localStorage.getItem("masterFlowers")) || [];

        const { data: hardGoodsData, error: hardGoodsError } = await supabase
            .from('hard_goods')
            .select('*');

        if (hardGoodsError) throw hardGoodsError;
        window.masterHardGoods = hardGoodsData || JSON.parse(localStorage.getItem("masterHardGoods")) || [];

        const { data: designersData, error: designersError } = await supabase
            .from('designers')
            .select('name');

        if (designersError) throw designersError;
        window.masterDesigners = (designersData || []).map(d => d.name) || JSON.parse(localStorage.getItem("masterDesigners")) || [];

        const { data: percentagesData, error: percError } = await supabase
            .from('percentages')
            .select('*')
            .limit(1)
            .single();

        if (percError) throw percError;
        window.masterPercentages = percentagesData || JSON.parse(localStorage.getItem("masterPercentages")) || { greens: 0, wastage: 0, ccFee: 0 };

        // Also save to LocalStorage so pages offline can still work
        saveSharedData();
        notifySharedDataChanged();

    } catch (err) {
        console.error("Error loading data from Supabase:", err);
        // fallback to LocalStorage
        window.masterFlowers = JSON.parse(localStorage.getItem("masterFlowers")) || [];
        window.masterHardGoods = JSON.parse(localStorage.getItem("masterHardGoods")) || [];
        window.masterDesigners = JSON.parse(localStorage.getItem("masterDesigners")) || [];
        window.masterPercentages = JSON.parse(localStorage.getItem("masterPercentages")) || { greens: 0, wastage: 0, ccFee: 0 };
    }
}

// Save master data to LocalStorage
function saveSharedData() {
    localStorage.setItem("masterFlowers", JSON.stringify(window.masterFlowers));
    localStorage.setItem("masterHardGoods", JSON.stringify(window.masterHardGoods));
    localStorage.setItem("masterDesigners", JSON.stringify(window.masterDesigners));
    localStorage.setItem("masterPercentages", JSON.stringify(window.masterPercentages));
    localStorage.setItem("masterRecipes", JSON.stringify(window.masterRecipes || []));
}

// Notify other pages that shared data has changed
function notifySharedDataChanged() {
    window.dispatchEvent(new Event("sharedDataChanged"));
}

// ----- Recipes Storage -----
function saveRecipe(recipe) {
    window.masterRecipes = window.masterRecipes || [];
    window.masterRecipes.push(recipe);
    localStorage.setItem("masterRecipes", JSON.stringify(window.masterRecipes));

    // Dispatch event so other pages can react if needed
    notifySharedDataChanged();
}

function deleteRecipe(index) {
    if (!window.masterRecipes) return;
    window.masterRecipes.splice(index, 1);
    localStorage.setItem("masterRecipes", JSON.stringify(window.masterRecipes));
    notifySharedDataChanged();
}

// Initial load
loadSharedData();

export { loadSharedData, saveSharedData, saveRecipe, deleteRecipe, notifySharedDataChanged };
