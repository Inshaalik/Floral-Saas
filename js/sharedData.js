import { supabase } from './supabaseClient.js';

async function loadSharedData() {
    try {
        const tenantId = localStorage.getItem("tenantId");
        if (!tenantId) {
            console.error("Tenant ID missing – cannot load data");
            return;
        }

        // Flowers
        const { data: flowersData, error: flowersError } = await supabase
            .from('flowers')
            .select('name, wholesale, markup, retail')
            .eq('tenant_id', tenantId);
        if (flowersError) throw flowersError;
        window.masterFlowers = flowersData || [];

        // Hard Goods
        const { data: hardGoodsData, error: hardGoodsError } = await supabase
            .from('hard_goods')
            .select('*')
            .eq('tenant_id', tenantId);
        if (hardGoodsError) throw hardGoodsError;
        window.masterHardGoods = hardGoodsData || [];

        // Designers – select both id and name
        const { data: designersData, error: designersError } = await supabase
            .from('designers')
            .select('id, name')
            .eq('tenant_id', tenantId);
        if (designersError) throw designersError;
        window.masterDesigners = (designersData || []).map(d => d.name); // keep as array of names

        // Percentages
        const { data: percentagesData, error: percError } = await supabase
            .from('percentages')
            .select('*')
            .eq('tenant_id', tenantId)
            .single();
        if (percError) throw percError;
        window.masterPercentages = percentagesData || { greens: 0, wastage: 0, ccfee: 0 };

        // Save to LocalStorage
        saveSharedData();
        notifySharedDataChanged();

    } catch (err) {
        console.error("Error loading data from Supabase:", err);

        window.masterFlowers = JSON.parse(localStorage.getItem("masterFlowers")) || [];
        window.masterHardGoods = JSON.parse(localStorage.getItem("masterHardGoods")) || [];
        window.masterDesigners = JSON.parse(localStorage.getItem("masterDesigners")) || [];
        window.masterPercentages = JSON.parse(localStorage.getItem("masterPercentages")) || { greens: 0, wastage: 0, ccfee: 0 };
    }
}

function saveSharedData() {
    localStorage.setItem("masterFlowers", JSON.stringify(window.masterFlowers));
    localStorage.setItem("masterHardGoods", JSON.stringify(window.masterHardGoods));
    localStorage.setItem("masterDesigners", JSON.stringify(window.masterDesigners));
    localStorage.setItem("masterPercentages", JSON.stringify(window.masterPercentages));
    localStorage.setItem("masterRecipes", JSON.stringify(window.masterRecipes || []));
}

function notifySharedDataChanged() {
    window.dispatchEvent(new Event("sharedDataChanged"));
}

function saveRecipe(recipe) {
    window.masterRecipes = window.masterRecipes || [];
    window.masterRecipes.push(recipe);
    saveSharedData();
    notifySharedDataChanged();
}

function deleteRecipe(index) {
    if (!window.masterRecipes) return;
    window.masterRecipes.splice(index, 1);
    saveSharedData();
    notifySharedDataChanged();
}

// Initial load
loadSharedData();

export { loadSharedData, saveSharedData, saveRecipe, deleteRecipe, notifySharedDataChanged };
