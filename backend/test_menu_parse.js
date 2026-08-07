const API_BASE_URL = 'http://localhost:5000';

const CATEGORY_MAP = {
  "Breakfast": { category: "Breakfast", subCategory: "Breakfast" },
  "Snacks": { category: "Snacks", subCategory: "Snacks" },
  "Veg Starter": { category: "Indian Tandoor", subCategory: "Veg Starters" },
  "Non-Veg Starter": { category: "Indian Tandoor", subCategory: "Non-Veg Starters" },
  "Veg Main Course": { category: "Indian Curries", subCategory: "Veg Main Course" },
  "Non-Veg Main Course": { category: "Indian Curries", subCategory: "Non-Veg Main Course" },
  "Veg-Chinese Appetizers": { category: "Chinese", subCategory: "Veg-Chinese Appetizers" },
  "Non-Veg Chinese Appetizers": { category: "Chinese", subCategory: "Non-Veg Chinese Appetizers" },
  "Chinese Main Course": { category: "Chinese", subCategory: "Chinese Main Course" },
  "Soup": { category: "Soups & Sea Food", subCategory: "Soups" },
  "Sea Food (Choice of Sauce)": { category: "Soups & Sea Food", subCategory: "Sea Food Specials" },
  "Rice Dishes": { category: "Rice & Biryani", subCategory: "Rice & Biryani" },
  "Bread Dishes": { category: "Breads", subCategory: "Breads" },
  "Egg Dishes": { category: "Egg Dishes", subCategory: "Egg Dishes" },
  "Appetizer (Salads & Sides)": { category: "Salads & Beverages", subCategory: "Appetizers & Salads" },
  "Beverages": { category: "Salads & Beverages", subCategory: "Beverages" }
};

function getMenuItemMealTimes(item) {
  if (item.category === "Breakfast") return ["Breakfast"];
  if (item.category === "Snacks") return ["Snacks"];
  return ["Lunch", "Dinner"];
}

function getMenuItemDietType(item) {
  return (item.type && item.type.toLowerCase() === "veg") ? "Veg" : "Non-Veg";
}

async function test() {
  const res = await fetch(`${API_BASE_URL}/api/menu`);
  const rawMenuObject = await res.json();
  const flatItems = [];
  
  Object.entries(rawMenuObject).forEach(([rawKey, itemsList]) => {
    const mapping = CATEGORY_MAP[rawKey] || { category: "Others", subCategory: rawKey };
    if (Array.isArray(itemsList)) {
      itemsList.forEach(item => {
        flatItems.push({
          ...item,
          category: mapping.category,
          subCategory: mapping.subCategory
        });
      });
    } else if (itemsList && typeof itemsList === "object") {
      Object.entries(itemsList).forEach(([subGroup, subGroupList]) => {
        if (Array.isArray(subGroupList)) {
          const itemType = subGroup.toLowerCase() === "veg" ? "veg" : "non-veg";
          subGroupList.forEach(item => {
            flatItems.push({
              ...item,
              type: item.type || itemType,
              category: mapping.category,
              subCategory: mapping.subCategory
            });
          });
        }
      });
    }
  });

  console.log(`Total items parsed: ${flatItems.length}`);
  
  const snacks = flatItems.filter(item => item.category === "Snacks");
  console.log(`Total Snacks parsed: ${snacks.length}`);
  if (snacks.length > 0) {
    console.log("Sample Snack item:", snacks[0]);
    console.log("Diet Type for sample Snack item:", getMenuItemDietType(snacks[0]));
    console.log("Meal Times for sample Snack item:", getMenuItemMealTimes(snacks[0]));
  }
}

test().catch(console.error);
