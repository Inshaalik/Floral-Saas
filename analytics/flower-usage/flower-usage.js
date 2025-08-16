document.addEventListener("DOMContentLoaded", () => {
  const dateRangeSelect = document.getElementById("dateRange");
  const tableBody = document.querySelector("#usageTable tbody");

  function loadFlowerData() {
    loadSharedData(); // Make sure shared data is loaded
    const recipes = masterRecipes || [];
    const range = dateRangeSelect.value;

    const startDate = getStartDate(range);
    const endDate = new Date();

    const flowerTotals = {};
    const hardGoodsTotals = {};

    recipes.forEach(recipe => {
      const recipeDate = new Date(recipe.date);
      if (recipeDate >= startDate && recipeDate <= endDate) {
        // Flowers
        recipe.flowers.forEach(f => {
          if (!flowerTotals[f.name]) flowerTotals[f.name] = 0;
          flowerTotals[f.name] += f.quantity || 0;
        });
        // Hard Goods
        recipe.hardGoods.forEach(h => {
          if (!hardGoodsTotals[h.name]) hardGoodsTotals[h.name] = 0;
          hardGoodsTotals[h.name] += 1; // count each usage
        });
      }
    });

    renderTable(flowerTotals, hardGoodsTotals);
  }

  function getStartDate(range) {
    const today = new Date();
    switch (range) {
      case "thisWeek":
        const day = today.getDay();
        return new Date(today.setDate(today.getDate() - day));
      case "thisMonth":
        return new Date(today.getFullYear(), today.getMonth(), 1);
      case "last30Days":
        return new Date(today.setDate(today.getDate() - 30));
      case "thisYear":
        return new Date(today.getFullYear(), 0, 1);
      default:
        return new Date(0);
    }
  }

 function renderTable(flowerTotals, hardGoodsTotals) {
  tableBody.innerHTML = "";

  Object.keys(flowerTotals).forEach(name => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${name}</td>
      <td>Flower</td>
      <td>${flowerTotals[name]}</td>
      <td>-</td>
    `;
    tableBody.appendChild(row);
  });

  Object.keys(hardGoodsTotals).forEach(name => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${name}</td>
      <td>Hard Good</td>
      <td>${hardGoodsTotals[name]}</td>
      <td>-</td>
    `;
    tableBody.appendChild(row);
  });
}


  dateRangeSelect.addEventListener("change", loadFlowerData);

  loadFlowerData(); // initial load
});
