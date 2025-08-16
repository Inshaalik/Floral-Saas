// ----- Shared Data Module -----
// This file ONLY handles data storage and updates

// Load saved master data from LocalStorage
function loadSharedData() {
    window.masterFlowers = JSON.parse(localStorage.getItem("masterFlowers")) || [];
    window.masterHardGoods = JSON.parse(localStorage.getItem("masterHardGoods")) || [];
    window.masterDesigners = JSON.parse(localStorage.getItem("masterDesigners")) || [];
    window.masterPercentages = JSON.parse(localStorage.getItem("masterPercentages")) || { greens: 0, wastage: 0, ccFee: 0 };
    window.masterRecipes = JSON.parse(localStorage.getItem("masterRecipes")) || [];
}

// Save master data to LocalStorage
function saveSharedData() {
    localStorage.setItem("masterFlowers", JSON.stringify(window.masterFlowers));
    localStorage.setItem("masterHardGoods", JSON.stringify(window.masterHardGoods));
    localStorage.setItem("masterDesigners", JSON.stringify(window.masterDesigners));
    localStorage.setItem("masterPercentages", JSON.stringify(window.masterPercentages));
    localStorage.setItem("masterRecipes", JSON.stringify(window.masterRecipes));
}

// Notify other pages that shared data has changed
function notifySharedDataChanged() {
    window.dispatchEvent(new Event("sharedDataChanged"));
}

// ----- Recipes Storage -----
function saveRecipe(recipe) {
    window.masterRecipes.push(recipe);
    localStorage.setItem("masterRecipes", JSON.stringify(window.masterRecipes));

    // Dispatch event so other pages can react if needed
    window.dispatchEvent(new Event("sharedDataChanged"));

    function deleteRecipe(index) {
    // Remove recipe at given index
    window.masterRecipes.splice(index, 1);
    localStorage.setItem("masterRecipes", JSON.stringify(window.masterRecipes));
    window.dispatchEvent(new Event("sharedDataChanged"));
}

}

// Initial load
loadSharedData();
