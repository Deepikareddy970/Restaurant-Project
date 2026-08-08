// Guramrit Resto & Cafe - Main JS Controller

const API_BASE_URL = import.meta.env.VITE_API_URL || '';


// SPLASH SCREEN CONFIGURATION (Easily editable loading messages, timings, etc.)
const SPLASH_CONFIG = {
  minDurationMs: 3500,      // Minimum display time (3.5s) to allow animations to breathe
  maxDurationMs: 5000,      // Maximum safety cap (5s) to force-dismiss if loading stalls
  messageIntervalMs: 1500,  // Interval to rotate loading messages
  messages: [
    "Preparing your experience",
    "Firing up the kitchen",
    "Plating something special",
    "Almost ready"
  ]
};

// GLOBAL STATE FOR MENU & CART
let MENU_DATA = [];
let selectedMealTime = sessionStorage.getItem("selectedMealTime") || "Lunch";
let selectedDietType = sessionStorage.getItem("selectedDietType") || "Veg";
let searchQuery = "";

// Meal Time and Diet Type dynamic mapping helpers
function getMenuItemMealTimes(item) {
  if (item.category === "Breakfast") return ["Breakfast"];
  if (item.category === "Snacks") return ["Snacks"];
  return ["Lunch", "Dinner"];
}

function getMenuItemDietType(item) {
  return (item.type && item.type.toLowerCase() === "veg") ? "Veg" : "Non-Veg";
}

function filterMenuItems(mealTime, dietType) {
  return MENU_DATA.filter(item => {
    const itemMealTimes = getMenuItemMealTimes(item);
    const itemDietType = getMenuItemDietType(item);
    return itemMealTimes.includes(mealTime) && itemDietType === dietType;
  });
}


// CATEGORY HERO IMAGES FOR THE MENU TOP BANNER
const CATEGORY_HEROES = {
  "Breakfast": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=1200",
  "Indian Tandoor": "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?q=80&w=1200",
  "Indian Curries": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1200",
  "Chinese": "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1200",
  "Soups & Sea Food": "https://images.unsplash.com/photo-1559737607-b3769c2d5d4a?q=80&w=1200",
  "Rice & Biryani": "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=1200",
  "Breads": "https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=1200",
  "Snacks": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1200",
  "Egg Dishes": "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=1200",
  "Salads & Beverages": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200"
};

// CATEGORY ICONS FOR TEXT-FORWARD CARDS
const CATEGORY_ICONS = {
  "Breakfast": "🥞",
  "Indian Tandoor": "🔥",
  "Indian Curries": "🍛",
  "Chinese": "🥢",
  "Soups & Sea Food": "🍤",
  "Rice & Biryani": "🍚",
  "Breads": "🫓",
  "Snacks": "🍿",
  "Egg Dishes": "🍳",
  "Salads & Beverages": "🍹"
};

// TIME SLOTS BY SESSION
const TIME_SLOTS = {
  Breakfast: ["07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM"],
  Lunch: ["12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM"],
  "Shaam Ki Mehfil": ["05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM"],
  Dinner: ["06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM", "09:00 PM", "09:30 PM"]
};

// GALLERY IMAGE URLS FOR LIGHTBOX
const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200",
  "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200",
  "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=1200",
  "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=1200",
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1200",
  "https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1200",
  "https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=1200"
];

// --- INIT APP CONTROLLER ---
document.addEventListener("DOMContentLoaded", () => {
  // Update Owner Portal URL dynamically if production API_BASE_URL is set
  const ownerPortalLink = document.querySelector('a[href="/admin"]');
  if (ownerPortalLink && API_BASE_URL) {
    ownerPortalLink.href = `${API_BASE_URL}/admin`;
  }

  initSplashScreen(); // Initialize splash screen first!
  initScrollEffects();
  initMobileMenu();
  loadAndInitMenu();
  initBookingWizard();
  initLightboxGallery();
  initFormSubmit();
  initComboOffers(); // Initialize Combo Offers & Sticky CTA
  initDineInFlow();   // Initialize step-by-step Dine-In ordering flow and tracking
  initOrderOnlineFlow(); // Initialize Order Online takeaway/delivery flow
  initServicesHub();
});

// 1. SCROLL EFFECTS & REVEALS
function initScrollEffects() {
  const header = document.getElementById("header");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  const revealElements = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale");
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: "0px 0px -50px 0px"
  });

  revealElements.forEach(el => revealObserver.observe(el));
}

// 2. MOBILE HEADER MENU OVERLAY
function initMobileMenu() {
  const burgerBtn = document.getElementById("burger-btn");
  const navMobile = document.getElementById("nav-mobile");

  burgerBtn.addEventListener("click", () => {
    const isActive = burgerBtn.classList.toggle("active");
    navMobile.classList.toggle("active");
    burgerBtn.setAttribute("aria-expanded", isActive);
    navMobile.setAttribute("aria-hidden", !isActive);
    document.body.style.overflow = isActive ? "hidden" : "";
  });

  navMobile.querySelectorAll(".nav-link, .btn").forEach(link => {
    link.addEventListener("click", () => {
      burgerBtn.classList.remove("active");
      navMobile.classList.remove("active");
      burgerBtn.setAttribute("aria-expanded", "false");
      navMobile.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    });
  });
}

// Category and Subcategory mapping helper
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

// 3. LOAD AND DYNAMICALLY RENDER THE MENU FROM BACKEND OR FALLBACK
async function loadAndInitMenu() {
  const grid = document.getElementById("menu-grid");

  try {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--color-text-muted);">Loading our fresh culinary menu...</div>`;

    let rawMenuObject = null;
    try {
      const res = await fetch(`${API_BASE_URL}/api/menu`);
      if (!res.ok) throw new Error("Failed to fetch menu from API server");
      rawMenuObject = await res.json();
    } catch (apiErr) {
      console.warn("Backend API connection failed, using local menu fallback data:", apiErr);
      const res = await fetch("/menu-fallback.json");
      if (!res.ok) throw new Error("Failed to fetch fallback local menu data");
      rawMenuObject = await res.json();
    }

    // Map object to flat array of dishes with category and subCategory fields
    const flatItems = [];
    Object.entries(rawMenuObject).forEach(([rawKey, itemsList]) => {
      const mapping = CATEGORY_MAP[rawKey] || { category: "Others", subCategory: rawKey };
      if (Array.isArray(itemsList)) {
        itemsList.forEach(item => {
          const itemId = item.id || item._id || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          flatItems.push({
            ...item,
            id: itemId,
            category: mapping.category,
            subCategory: mapping.subCategory
          });
        });
      } else if (itemsList && typeof itemsList === "object") {
        Object.entries(itemsList).forEach(([subGroup, subGroupList]) => {
          if (Array.isArray(subGroupList)) {
            const itemType = subGroup.toLowerCase() === "veg" ? "veg" : "non-veg";
            subGroupList.forEach(item => {
              const itemId = item.id || item._id || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              flatItems.push({
                ...item,
                id: itemId,
                type: item.type || itemType,
                category: mapping.category,
                subCategory: mapping.subCategory
              });
            });
          }
        });
      }
    });
    MENU_DATA = flatItems;

    // Setup Search Event Listener
    const searchInput = document.getElementById("menu-search");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderMenu();
      });
    }

    // Setup Meal-Time Cards UI state & Event Listeners
    const mealCards = document.querySelectorAll(".menu-preview .meal-time-selector .meal-card");
    mealCards.forEach(card => {
      const mealVal = card.getAttribute("data-meal");
      if (mealVal === selectedMealTime) {
        card.classList.add("active");
        card.setAttribute("aria-pressed", "true");
      } else {
        card.classList.remove("active");
        card.setAttribute("aria-pressed", "false");
      }

      card.addEventListener("click", () => {
        mealCards.forEach(c => {
          c.classList.remove("active");
          c.setAttribute("aria-pressed", "false");
        });
        card.classList.add("active");
        card.setAttribute("aria-pressed", "true");
        selectedMealTime = mealVal;
        sessionStorage.setItem("selectedMealTime", selectedMealTime);
        updateMenuHeaderBranding();
        renderMenu();
      });
    });

    // Setup Veg/Non-Veg Toggle UI state & Event Listeners
    const toggleBtns = document.querySelectorAll(".menu-preview .veg-nonveg-toggle .veg-nonveg-toggle-btn");
    toggleBtns.forEach(btn => {
      const dietVal = btn.getAttribute("data-diet");
      if (dietVal === selectedDietType) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }

      btn.addEventListener("click", () => {
        toggleBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedDietType = dietVal;
        sessionStorage.setItem("selectedDietType", selectedDietType);
        renderMenu();
      });
    });

    // Initial render
    updateMenuHeaderBranding();
    renderMenu();

  } catch (err) {
    console.error("Error initializing menu:", err);
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--color-accent);">Unable to connect to the menu server or load offline data. Please try refreshing.</div>`;
  }
}

function updateMenuHeaderBranding() {
  const menuTitleEl = document.querySelector(".menu-preview .text-center h2");
  const menuDescEl = document.querySelector(".menu-preview .text-center p");
  if (!menuTitleEl || !menuDescEl) return;

  if (selectedMealTime === "Breakfast") {
    menuTitleEl.innerHTML = `Our Multi-Cuisine <span class="italic">Menu</span> <div class="shaam-mehfil-title-badge" style="font-size: 1.5rem; margin-top: 10px; color: var(--color-accent); font-family: var(--font-serif); font-style: italic;">Subah Ka Swaad</div>`;
    menuDescEl.innerHTML = `<strong>Fresh Start, Traditional Taste</strong><br><span style="font-size: 0.9rem; color: var(--color-text-soft);">Parathas • South Indian • Chai 🌅 (Served 7:00 AM – 10:00 AM)</span>`;
  } else if (selectedMealTime === "Lunch") {
    menuTitleEl.innerHTML = `Our Multi-Cuisine <span class="italic">Menu</span> <div class="shaam-mehfil-title-badge" style="font-size: 1.5rem; margin-top: 10px; color: var(--color-accent); font-family: var(--font-serif); font-style: italic;">Dopahar Ka Daawat</div>`;
    menuDescEl.innerHTML = `<strong>A Hearty Midday Feast</strong><br><span style="font-size: 0.9rem; color: var(--color-text-soft);">Thalis • Curries • Rice Specials ☀️ (Served 12:00 PM – 3:00 PM)</span>`;
  } else if (selectedMealTime === "Dinner") {
    menuTitleEl.innerHTML = `Our Multi-Cuisine <span class="italic">Menu</span> <div class="shaam-mehfil-title-badge" style="font-size: 1.5rem; margin-top: 10px; color: var(--color-accent); font-family: var(--font-serif); font-style: italic;">Shahi Dastarkhwan</div>`;
    menuDescEl.innerHTML = `<strong>An Elegant Culinary Finale</strong><br><span style="font-size: 0.9rem; color: var(--color-text-soft);">Tandoori Specialties • Biryani • Rich Gravies 🌙 (Served 6:30 PM – 10:00 PM)</span>`;
  } else if (selectedMealTime === "Snacks") {
    menuTitleEl.innerHTML = `Our Multi-Cuisine <span class="italic">Menu</span> <div class="shaam-mehfil-title-badge" style="font-size: 1.5rem; margin-top: 10px; color: var(--color-accent); font-family: var(--font-serif); font-style: italic;">Shaam Ki Mehfil</div>`;
    menuDescEl.innerHTML = `<strong>Har Shaam, Kuch Khaas</strong><br><span style="font-size: 0.9rem; color: var(--color-text-soft);">Café • Chaat • Snacks ☕ (Served 5:00 PM – 9:00 PM)</span>`;
  } else {
    menuTitleEl.innerHTML = `Our Multi-Cuisine <span class="italic">Menu</span>`;
    menuDescEl.textContent = `Savor the essence of tradition with our extensive list of signature dishes. Filter by cuisine or search directly.`;
  }
}

// RENDER FILTERED MENU
function renderMenu() {
  const grid = document.getElementById("menu-grid");
  if (!grid) return;

  grid.style.opacity = 0;

  setTimeout(() => {
    grid.innerHTML = "";

    // 1. Filter by mealTime and dietType
    let items = filterMenuItems(selectedMealTime, selectedDietType);

    // 2. Filter by search query
    if (searchQuery) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery) ||
        (item.description || "").toLowerCase().includes(searchQuery)
      );
    }

    if (items.length === 0) {
      const emptyDiv = document.createElement("div");
      emptyDiv.style.cssText = "grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--color-text-soft); font-family: var(--font-serif); font-style: italic;";
      emptyDiv.textContent = selectedMealTime === "Snacks"
        ? "Shaam Ki Mehfil menu launching soon — check back shortly!"
        : "No dishes found matching your search filters.";
      grid.appendChild(emptyDiv);
      grid.style.opacity = 1;
      return;
    }

    // Group by category if we have multiple categories
    const categoriesPresent = [...new Set(items.map(item => item.category).filter(Boolean))];
    const categoryOrder = [
      "Breakfast",
      "Indian Tandoor",
      "Indian Curries",
      "Chinese",
      "Soups & Sea Food",
      "Rice & Biryani",
      "Breads",
      "Snacks",
      "Egg Dishes",
      "Salads & Beverages"
    ];
    categoriesPresent.sort((a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b));

    if (categoriesPresent.length > 1) {
      categoriesPresent.forEach(cat => {
        const catItems = items.filter(item => item.category === cat);
        if (catItems.length === 0) return;

        const sectionHeader = document.createElement("div");
        sectionHeader.style.cssText = "grid-column: 1 / -1; margin-top: var(--space-md); border-bottom: 2px solid var(--color-accent-sec); padding-bottom: var(--space-3xs); margin-bottom: var(--space-xs);";
        sectionHeader.innerHTML = `<h3 style="font-family: var(--font-serif); font-size: 1.3rem; font-style: italic; color: var(--color-text);">${cat}</h3>`;
        grid.appendChild(sectionHeader);

        catItems.forEach(item => {
          grid.appendChild(createItemCard(item));
        });
      });
    } else {
      items.forEach(item => {
        grid.appendChild(createItemCard(item));
      });
    }

    grid.style.opacity = 1;
  }, 250);
}

// CREATE A MENU ITEM CARD DOM ELEMENT
function createItemCard(item) {
  const card = document.createElement("div");

  // Text-forward card details
  const hasImage = !!item.image;
  card.className = `menu-item-card border-${item.type} ${!hasImage ? 'no-image' : ''} reveal-left`;

  // Format prices (handling multi-pricing objects and normal numbers)
  let priceHtml = "";
  let orderButtonHtml = "";
  if (typeof item.price === "object" && item.price !== null) {
    const keys = Object.keys(item.price);
    if (keys.length === 1 && keys[0] === "default") {
      priceHtml = `<span class="menu-item-price">₹${item.price.default}</span>`;
      orderButtonHtml = `<button class="btn btn-secondary add-to-order-btn" data-id="${item.id}" data-size="" style="margin-top: 8px; padding: 4px 10px; font-size: 0.75rem; text-transform: none;">Add to Order (₹${item.price.default})</button>`;
    } else {
      priceHtml = `<div class="menu-price-group">` +
        Object.entries(item.price).map(([size, value]) => {
          if (size === "default") {
            return `<span class="menu-price-tag">₹${value}</span>`;
          }
          return `<span class="menu-price-tag">${size}: ₹${value}</span>`;
        }).join('') +
        `</div>`;
      orderButtonHtml = `<div style="display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap;">` +
        Object.entries(item.price).map(([size, value]) => {
          if (size === "default") return '';
          return `<button class="btn btn-secondary add-to-order-btn" data-id="${item.id}" data-size="${size}" style="padding: 4px 10px; font-size: 0.75rem; text-transform: none;">Add ${size} (₹${value})</button>`;
        }).join('') + `</div>`;
    }
  } else {
    priceHtml = `<span class="menu-item-price">₹${item.price}</span>`;
    orderButtonHtml = `<button class="btn btn-secondary add-to-order-btn" data-id="${item.id}" data-size="" style="margin-top: 8px; padding: 4px 10px; font-size: 0.75rem; text-transform: none;">Add to Order (₹${item.price})</button>`;
  }

  card.innerHTML = `
    ${hasImage ? `
      <div class="menu-item-img">
        <img src="${item.image}" alt="${item.name} at Guramrit Resto" loading="lazy">
      </div>
    ` : ''}
    <div class="menu-item-info">
      <div class="menu-item-head">
        <span class="menu-item-title">
          ${item.name} 
          <span class="diet-tag diet-${item.type}" style="margin-left: 6px;" title="${item.type}"></span>
        </span>
        ${priceHtml}
      </div>
      ${item.description ? `<p class="menu-item-desc">${item.description}</p>` : ''}
      ${orderButtonHtml}
    </div>
  `;

  // Animate card reveal immediately
  setTimeout(() => card.classList.add("revealed"), 50);

  return card;
}

// 4. RESERVATION ENGINE WIZARD
function initBookingWizard() {
  const stepContent1 = document.getElementById("step-1-content");
  const stepContent2 = document.getElementById("step-2-content");
  const stepContent3 = document.getElementById("step-3-content");

  const stepPill1 = document.getElementById("progress-step-1");
  const stepPill2 = document.getElementById("progress-step-2");
  const stepPill3 = document.getElementById("progress-step-3");

  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");
  const bookingForm = document.getElementById("booking-form");
  const bookingSuccess = document.getElementById("booking-success");
  const navButtons = document.getElementById("booking-nav-buttons");

  const inputSession = document.getElementById("book-session");
  const inputTime = document.getElementById("book-time");
  const inputDate = document.getElementById("book-date");

  let currentStep = 1;

  // Set smart default for Date (Today or Tomorrow)
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  inputDate.value = `${year}-${month}-${day}`;
  inputDate.setAttribute("min", `${year}-${month}-${day}`);

  // Set smart default for times based on session
  function updateTimeOptions(sessionVal) {
    inputTime.innerHTML = "";
    const slots = TIME_SLOTS[sessionVal] || [];
    slots.forEach(slot => {
      const opt = document.createElement("option");
      opt.value = slot;
      opt.textContent = slot;
      inputTime.appendChild(opt);
    });
  }

  inputSession.addEventListener("change", (e) => {
    updateTimeOptions(e.target.value);
  });

  updateTimeOptions("Lunch");

  if (bookingForm) {
    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault();
    });
  }

  btnNext.addEventListener("click", () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        goToStep(currentStep + 1);
      } else {
        submitBookingForm();
      }
    }
  });

  btnPrev.addEventListener("click", () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  });

  function goToStep(stepNum) {
    stepContent1.style.display = "none";
    stepContent2.style.display = "none";
    stepContent3.style.display = "none";

    stepPill1.className = "progress-step";
    stepPill2.className = "progress-step";
    stepPill3.className = "progress-step";

    currentStep = stepNum;

    if (currentStep === 1) {
      stepContent1.style.display = "block";
      stepPill1.classList.add("active");
      btnPrev.style.visibility = "hidden";
      btnNext.textContent = "Next Step";
    } else if (currentStep === 2) {
      stepContent2.style.display = "block";
      stepPill1.classList.add("completed");
      stepPill2.classList.add("active");
      btnPrev.style.visibility = "visible";
      btnNext.textContent = "Next Step";
    } else if (currentStep === 3) {
      stepContent3.style.display = "block";
      stepPill1.classList.add("completed");
      stepPill2.classList.add("completed");
      stepPill3.classList.add("active");
      btnPrev.style.visibility = "visible";
      btnNext.textContent = "Confirm Booking";
    }
  }

  // STEP VALIDATION
  function validateStep(stepNum) {
    let isValid = true;

    if (stepNum === 1) {
      if (!inputDate.value) {
        inputDate.style.borderColor = "var(--color-accent)";
        isValid = false;
      } else {
        inputDate.style.borderColor = "";
      }
    } else if (stepNum === 3) {
      const name = document.getElementById("book-name");
      const email = document.getElementById("book-email");
      const phone = document.getElementById("book-phone");

      const errName = document.getElementById("error-name");
      const errEmail = document.getElementById("error-email");
      const errPhone = document.getElementById("error-phone");

      if (!name.value.trim()) {
        name.style.borderColor = "var(--color-accent)";
        errName.className = "error-msg";
        isValid = false;
      } else {
        name.style.borderColor = "";
        errName.className = "error-msg sr-only";
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.value.trim())) {
        email.style.borderColor = "var(--color-accent)";
        errEmail.className = "error-msg";
        isValid = false;
      } else {
        email.style.borderColor = "";
        errEmail.className = "error-msg sr-only";
      }

      const phoneClean = phone.value.replace(/[^0-9]/g, '');
      if (phoneClean.length < 10) {
        phone.style.borderColor = "var(--color-accent)";
        errPhone.className = "error-msg";
        isValid = false;
      } else {
        phone.style.borderColor = "";
        errPhone.className = "error-msg sr-only";
      }
    }

    return isValid;
  }

  // SUBMIT FORM DATA TO BACKEND
  async function submitBookingForm() {
    // Hide previous errors
    const errorBanner = document.getElementById("booking-error-banner");
    if (errorBanner) errorBanner.style.display = "none";

    const nameVal = document.getElementById("book-name").value.trim();
    const emailVal = document.getElementById("book-email").value.trim();
    const phoneVal = document.getElementById("book-phone").value.trim();
    const dateVal = document.getElementById("book-date").value;
    const timeVal = document.getElementById("book-time").value;
    const guestsVal = document.getElementById("book-guests").value;
    const occasionVal = document.getElementById("book-occasion").value;
    const seatingSel = document.getElementById("book-seating");
    const seatingVal = seatingSel.options[seatingSel.selectedIndex].text;
    const notesVal = document.getElementById("book-notes").value.trim();

    // Disable button to prevent double-clicks
    btnNext.disabled = true;
    btnNext.textContent = "Processing...";

    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: nameVal,
          email: emailVal,
          phone: phoneVal,
          date: dateVal,
          time: timeVal,
          partySize: parseInt(guestsVal, 10),
          occasion: occasionVal,
          seating: seatingVal,
          notes: notesVal
        })
      });

      let result = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      }

      if (!response.ok) {
        // Handle validations or rate limits
        let errMsg = result.error || "Failed to make reservation. The server is currently offline or unresponsive. Please try again later.";
        if (result.errors && Array.isArray(result.errors)) {
          errMsg = result.errors.map(err => err.msg).join("<br>");
        }
        throw new Error(errMsg);
      }

      // Success confirmation screen
      const formattedDate = new Date(dateVal).toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });

      document.getElementById("summary-name").textContent = nameVal;
      document.getElementById("summary-datetime").textContent = `${formattedDate} at ${timeVal}`;
      document.getElementById("summary-guests").textContent = `${guestsVal} Guests`;
      document.getElementById("summary-seating").textContent = seatingVal;

      // Inject generated booking ID persistently
      let bookingIdRow = document.getElementById("summary-booking-id-row");
      if (!bookingIdRow) {
        bookingIdRow = document.createElement("div");
        bookingIdRow.className = "booking-summary-row";
        bookingIdRow.id = "summary-booking-id-row";
        bookingIdRow.innerHTML = `
          <span class="booking-summary-label">Booking ID</span>
          <span class="booking-summary-val" id="summary-booking-id" style="font-family: monospace; color: var(--color-accent); font-size: 1.05rem;">-</span>
        `;
        document.querySelector(".booking-summary-list").appendChild(bookingIdRow);
      }
      document.getElementById("summary-booking-id").textContent = result.bookingId;

      // Show success container
      bookingForm.style.display = "none";
      bookingSuccess.style.display = "block";
      navButtons.style.display = "none";

      // Reset form variables
      document.getElementById("btn-book-another").onclick = () => {
        bookingForm.reset();
        bookingForm.style.display = "block";
        bookingSuccess.style.display = "none";
        navButtons.style.display = "flex";
        goToStep(1);
      };

    } catch (err) {
      console.error("Booking error:", err);

      // Inject error banner inside UI
      let errBanner = document.getElementById("booking-error-banner");
      if (!errBanner) {
        errBanner = document.createElement("div");
        errBanner.id = "booking-error-banner";
        errBanner.style.cssText = "color: var(--color-accent); background-color: var(--color-accent-soft); padding: var(--space-sm); border-radius: var(--border-radius-sm); margin-bottom: var(--space-md); font-size: 0.875rem; font-weight: 600;";
        const step3Content = document.getElementById("step-3-content");
        step3Content.insertBefore(errBanner, step3Content.firstChild);
      }
      errBanner.innerHTML = err.message;
      errBanner.style.display = "block";

    } finally {
      // Re-enable button
      btnNext.disabled = false;
      btnNext.textContent = "Confirm Booking";
    }
  }

  // HERO WIDGET INTEGRATION
  const heroWidgetBtn = document.getElementById("hero-widget-btn");
  if (heroWidgetBtn) {
    heroWidgetBtn.addEventListener("click", () => {
      const widgetGuests = document.getElementById("widget-guests").value;
      const widgetDate = document.getElementById("widget-date").value;
      const widgetTime = document.getElementById("widget-time").value;

      document.getElementById("book-guests").value = widgetGuests;
      if (widgetDate) {
        document.getElementById("book-date").value = widgetDate;
      }

      if (widgetTime.includes("AM")) {
        inputSession.value = "Breakfast";
      } else if (widgetTime.includes("12:30")) {
        inputSession.value = "Lunch";
      } else if (widgetTime.includes("06:00")) {
        inputSession.value = "Shaam Ki Mehfil";
      } else {
        inputSession.value = "Dinner";
      }
      updateTimeOptions(inputSession.value);
      inputTime.value = widgetTime;

      document.getElementById("booking").scrollIntoView({ behavior: "smooth" });

      setTimeout(() => {
        document.getElementById("book-guests").focus();
      }, 800);
    });
  }
}

// 5. GALLERY LIGHTBOX CONTROLS
function initLightboxGallery() {
  const items = document.querySelectorAll(".gallery-item");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const closeBtn = document.getElementById("lightbox-close");
  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");

  let currentIdx = 0;

  function openLightbox(idx) {
    currentIdx = idx;
    lightboxImg.src = GALLERY_IMAGES[currentIdx];
    lightboxImg.alt = `Ambience gallery view ${currentIdx + 1} of Guramrit Resto`;
    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function showNext() {
    currentIdx = (currentIdx + 1) % GALLERY_IMAGES.length;
    lightboxImg.src = GALLERY_IMAGES[currentIdx];
  }

  function showPrev() {
    currentIdx = (currentIdx - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length;
    lightboxImg.src = GALLERY_IMAGES[currentIdx];
  }

  items.forEach((item, index) => {
    item.addEventListener("click", () => {
      openLightbox(index);
    });
  });

  closeBtn.addEventListener("click", closeLightbox);
  nextBtn.addEventListener("click", showNext);
  prevBtn.addEventListener("click", showPrev);

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;

    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") showNext();
    if (e.key === "ArrowLeft") showPrev();
  });
}

// 6. LOYALTY NEWSLETTER SUBMISSION
function initFormSubmit() {
  const loyaltyForm = document.getElementById("loyalty-form");
  const loyaltySuccess = document.getElementById("loyalty-success");

  if (loyaltyForm) {
    loyaltyForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("loyalty-email").value;
      if (email) {
        loyaltyForm.style.display = "none";
        loyaltySuccess.style.display = "block";
      }
    });
  }
}

// 7. COMBO OFFERS SECTION CONTROLLER
const COMBO_OFFERS = [
  {
    id: "offer-1",
    title: "Non-Veg Family Feast Combo",
    price: 999,
    subtitle: "for 4",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600",
    ribbon: "Most Popular",
    ribbonClass: "popular",
    savingsBadge: "Save ₹511 (34% off)",
    items: [
      "2 Starters: Chicken Tikka + Seekh Kebab",
      "2 Main Course: Butter Chicken + Chicken Kadai",
      "4 Rotis/Naan or 2 portions Rice",
      "1 Dal",
      "4 Soft Drinks"
    ]
  },
  {
    id: "offer-2",
    title: "Veg Family Combo",
    price: 899,
    subtitle: "for 4",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600",
    ribbon: "Veg Favorite",
    ribbonClass: "veg",
    savingsBadge: "Save ~₹350 (est.)",
    items: [
      "2 Starters: Paneer Tikka + Veg Manchurian",
      "2 Main Course: Paneer Butter Masala + Dal Makhani",
      "4 Rotis/Naan",
      "1 Rice/Jeera Rice"
    ]
  },
  {
    id: "offer-3",
    title: "Premium Non-Veg Combo",
    price: 1499,
    subtitle: "for 4",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=600",
    ribbon: "Best Value for Groups",
    ribbonClass: "premium",
    savingsBadge: "Premium Pick",
    items: [
      "2 Starters (incl. 1 seafood/prawn starter)",
      "3 Main Course (incl. 1 prawn/seafood main)",
      "Rice + Rotis",
      "1 Dessert to share",
      "4 Beverages"
    ]
  }
];

function initComboOffers() {
  const offersGrid = document.getElementById("offers-grid");
  const stickyCta = document.getElementById("sticky-offers-cta");
  const offersSection = document.getElementById("special-offers");

  if (!offersGrid) return;

  // 1. Render all 3 offer cards dynamically
  offersGrid.innerHTML = COMBO_OFFERS.map(offer => {
    const ribbonHtml = offer.ribbon
      ? `<div class="offer-card-ribbon ${offer.ribbonClass || ''}">${offer.ribbon}</div>`
      : "";

    const itemsHtml = offer.items.map(item => `<li>${item}</li>`).join("");

    return `
      <div class="offer-card" id="${offer.id}" tabindex="0" aria-label="${offer.title} Combo: Price ₹${offer.price} ${offer.subtitle}. Includes ${offer.items.join(', ')}">
        <div class="offer-card-inner">
          
          <!-- FRONT SIDE -->
          <div class="offer-card-front">
            <div class="offer-card-image-wrapper">
              ${ribbonHtml}
              <img src="${offer.image}" alt="${offer.title}" class="offer-card-img" loading="lazy">
            </div>
            <div class="offer-card-front-content">
              <span class="offer-savings-badge">${offer.savingsBadge}</span>
              <h3 class="offer-card-title">${offer.title}</h3>
              <div class="offer-card-price-row">
                <span class="offer-card-price">₹${offer.price}</span>
                <span class="offer-card-subtitle">/ ${offer.subtitle}</span>
              </div>
              <span class="offer-card-hint">See what's included →</span>
            </div>
          </div>
          
          <!-- BACK SIDE -->
          <div class="offer-card-back">
            <h3 class="offer-card-back-title">${offer.title}</h3>
            <ul class="offer-item-list">
              ${itemsHtml}
            </ul>
            <div class="offer-card-back-ctas">
              <span class="offer-savings-badge">${offer.savingsBadge}</span>
              <a href="#booking" class="btn btn-primary btn-sm">Order Now</a>
            </div>
          </div>
          
        </div>
      </div>
    `;
  }).join("");

  // 2. Attach click & touch listeners to cards for flipping (ideal for mobile/tap-to-flip)
  const cards = offersGrid.querySelectorAll(".offer-card");
  cards.forEach(card => {
    // Click & Touch trigger
    card.addEventListener("click", (e) => {
      // Don't flip card if they click the CTA button inside the back side
      if (e.target.closest(".btn")) return;
      card.classList.toggle("flipped");
    });

    // Keyboard support (Enter or Space to flip)
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.classList.toggle("flipped");
      }
    });
  });

  // 3. Staggered Scroll-Entrance Animation (using IntersectionObserver)
  if (window.IntersectionObserver && offersSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const cards = entry.target.querySelectorAll(".offer-card");
          cards.forEach((card, index) => {
            setTimeout(() => {
              card.classList.add("animate-in");
            }, index * 100);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    observer.observe(offersSection);
  } else {
    // Fallback for older browsers
    cards.forEach(card => card.classList.add("animate-in"));
  }

  // 4. Sticky CTA Scroll trigger & smooth scrolling
  if (stickyCta && offersSection) {
    window.addEventListener("scroll", () => {
      const rect = offersSection.getBoundingClientRect();
      // Show sticky CTA once scrolled past the bottom of the offers section
      if (rect.bottom < 0) {
        stickyCta.classList.add("show");
      } else {
        stickyCta.classList.remove("show");
      }
    });

    // Smooth scroll to offers section on click
    stickyCta.addEventListener("click", () => {
      offersSection.scrollIntoView({ behavior: "smooth" });
    });
  }
}

// 8. PREMIUM ANIMATED SPLASH SCREEN CONTROLLER
function initSplashScreen() {
  const splash = document.getElementById("splash-screen");
  const progressBar = document.getElementById("splash-progress-bar");
  const loadingText = document.getElementById("splash-loading-text");
  const percentageText = document.getElementById("splash-percentage");
  const skipBtn = document.getElementById("splash-skip-btn");
  const bodyStyle = document.getElementById("splash-body-style");

  if (!splash) return;

  // Add entry animation classes with small staggered timeouts to trigger CSS transitions
  setTimeout(() => {
    const logoContainer = splash.querySelector(".splash-logo-container");
    const title = splash.querySelector(".splash-title");
    const tagline = splash.querySelector(".splash-tagline");
    const loaderContainer = splash.querySelector(".splash-loader-container");

    if (logoContainer) logoContainer.classList.add("animate-in");
    if (title) title.classList.add("animate-in");
    if (tagline) tagline.classList.add("animate-in");
    if (loaderContainer) loaderContainer.classList.add("animate-in");
  }, 100);

  // 1. Dynamic loading messages rotation
  let messageIndex = 0;
  const messageInterval = setInterval(() => {
    messageIndex = (messageIndex + 1) % SPLASH_CONFIG.messages.length;
    if (loadingText) {
      loadingText.style.opacity = "0";
      setTimeout(() => {
        loadingText.textContent = SPLASH_CONFIG.messages[messageIndex];
        loadingText.style.opacity = "1";
      }, 200);
    }
  }, SPLASH_CONFIG.messageIntervalMs);

  // 2. Progress percentage counter & timing
  let progress = 0;
  let isDismissed = false;
  const startTime = Date.now();

  const updateProgress = (targetProgress, duration) => {
    const stepTime = 30; // 30ms updates
    const steps = duration / stepTime;
    const increment = (targetProgress - progress) / steps;

    const timer = setInterval(() => {
      if (isDismissed) {
        clearInterval(timer);
        return;
      }
      progress += increment;
      if (progress >= targetProgress) {
        progress = targetProgress;
        clearInterval(timer);
      }
      const roundedProgress = Math.min(100, Math.floor(progress));
      if (progressBar) progressBar.style.width = `${roundedProgress}%`;
      if (percentageText) percentageText.textContent = `${roundedProgress}%`;
    }, stepTime);
  };

  // Phase 1: progress to 40% over 800ms
  updateProgress(40, 800);

  // Phase 2: progress to 80% over another 1200ms
  setTimeout(() => {
    updateProgress(80, 1200);
  }, 800);

  // Show Skip button after minDurationMs
  setTimeout(() => {
    if (skipBtn && !isDismissed) {
      skipBtn.classList.add("show");
    }
  }, SPLASH_CONFIG.minDurationMs);

  // Clean-up and dismiss function
  const dismissSplash = () => {
    if (isDismissed) return;
    isDismissed = true;
    clearInterval(messageInterval);

    // Set progress to 100% immediately
    if (progressBar) progressBar.style.width = "100%";
    if (percentageText) percentageText.textContent = "100%";

    // Fade out splash screen
    splash.classList.add("fade-out");

    // Enable normal scroll on body by removing inline styles and body-style block
    document.body.style.overflow = "";
    if (bodyStyle) {
      bodyStyle.remove();
    }

    // Remove element after transition finishes to free memory
    setTimeout(() => {
      splash.remove();
    }, 600);
  };

  // Attach event listener to skip button
  if (skipBtn) {
    skipBtn.addEventListener("click", dismissSplash);
  }

  // Monitor resource loads and page load event
  const checkCompletion = () => {
    const elapsed = Date.now() - startTime;
    const remainingTime = Math.max(0, SPLASH_CONFIG.minDurationMs - elapsed);

    // Wait at least the min duration to let animations breathe, then dismiss
    setTimeout(() => {
      updateProgress(100, 300);
      setTimeout(dismissSplash, 300);
    }, remainingTime);
  };

  if (document.readyState === "complete") {
    checkCompletion();
  } else {
    window.addEventListener("load", checkCompletion);
  }

  // Safety Cap: Force dismissal if page load takes too long (even if assets aren't 100% complete)
  setTimeout(dismissSplash, SPLASH_CONFIG.maxDurationMs);
}

// ----------------------------------------------------
// DINE-IN WIZARD ORDERING & TRACKING CONTROLLER
// ----------------------------------------------------
function initDineInFlow() {
  const modal = document.getElementById("dine-in-modal");
  const closeBtn = document.getElementById("dine-modal-close");
  const stepsHeader = document.getElementById("dine-wizard-steps-header");

  // Step Panes
  const pane1 = document.getElementById("dine-step-1");
  const pane2 = document.getElementById("dine-step-2");
  const pane3 = document.getElementById("dine-step-3");
  const pane4 = document.getElementById("dine-step-4");
  const paneTracker = document.getElementById("dine-step-tracker-pane");

  // Inputs
  const tableSelect = document.getElementById("dine-table-select");
  const guestsSelect = document.getElementById("dine-guests-select");
  const searchInput = document.getElementById("dine-menu-search");
  const categoriesContainer = document.getElementById("dine-menu-categories");
  const itemsContainer = document.getElementById("dine-menu-items-container");
  const sidebarList = document.getElementById("dine-sidebar-items-list");
  const sidebarTotal = document.getElementById("dine-sidebar-total");

  const custNameInput = document.getElementById("dine-cust-name");
  const custEmailInput = document.getElementById("dine-cust-email");
  const custPhoneInput = document.getElementById("dine-cust-phone");

  // Review Elements
  const reviewTable = document.getElementById("dine-review-table");
  const reviewGuests = document.getElementById("dine-review-guests");
  const reviewName = document.getElementById("dine-review-name");
  const reviewEmail = document.getElementById("dine-review-email");
  const reviewItemsTbody = document.getElementById("dine-review-items-tbody");
  const reviewGrandTotal = document.getElementById("dine-review-grand-total");

  // Tracker Elements
  const trackerOrderId = document.getElementById("dine-tracker-order-id");
  const trackerEmailSent = document.getElementById("dine-tracker-email-sent");
  const trackerCloseBtn = document.getElementById("dine-btn-tracker-close");

  // Navigation Buttons
  const btnGotoStep2 = document.getElementById("dine-btn-goto-step2");
  const btnBackToStep1 = document.getElementById("dine-btn-back-to-step1");
  const btnGotoStep3 = document.getElementById("dine-btn-goto-step3");
  const btnBackToStep2 = document.getElementById("dine-btn-back-to-step2");
  const btnGotoStep4 = document.getElementById("dine-btn-goto-step4");
  const btnBackToStep3 = document.getElementById("dine-btn-back-to-step3");
  const btnSubmitOrder = document.getElementById("dine-btn-submit-order");

  // Local Dine-In Flow State Variables
  let dineInCart = [];
  let pendingAddDish = null;
  let selectedTable = "";
  let guestCount = 1;
  let dineMealTime = "Lunch"; // Placeholder initialized dynamically later
  let dineDietType = "Veg";
  let searchVal = "";
  let currentStep = 1;
  let pollingInterval = null;
  let lastAnnouncedStatus = "";

  function getDefaultMealTimeByTimeOfDay() {
    const hours = new Date().getHours();
    const minutes = new Date().getMinutes();
    const decimalTime = hours + minutes / 60;

    if (decimalTime < 11) {
      return "Breakfast";
    } else if (decimalTime >= 11 && decimalTime < 16) {
      return "Lunch";
    } else if (decimalTime >= 16 && decimalTime < 18.5) {
      return "Snacks";
    } else {
      return "Dinner";
    }
  }

  function syncDineUIState() {
    const dineMealCards = document.querySelectorAll("#dine-meal-time-selector .meal-card");
    dineMealCards.forEach(card => {
      const mealVal = card.getAttribute("data-dine-meal");
      if (mealVal === dineMealTime) {
        card.classList.add("active");
        card.setAttribute("aria-pressed", "true");
      } else {
        card.classList.remove("active");
        card.setAttribute("aria-pressed", "false");
      }
    });

    const dineDietBtns = document.querySelectorAll(".dine-search-filter-row .veg-nonveg-toggle-btn");
    dineDietBtns.forEach(btn => {
      const dietVal = btn.getAttribute("data-dine-diet");
      if (dietVal === dineDietType) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  dineMealTime = getDefaultMealTimeByTimeOfDay();

  function getDisplayPrice(priceObj) {
    if (typeof priceObj === 'number') return priceObj;
    if (!priceObj) return 0;
    if (priceObj.default !== undefined) return Number(priceObj.default) || 0;
    if (priceObj.full !== undefined) return Number(priceObj.full) || 0;
    if (priceObj.half !== undefined) return Number(priceObj.half) || 0;
    if (typeof priceObj === 'object') {
      const vals = Object.values(priceObj).map(Number).filter(v => !isNaN(v));
      if (vals.length > 0) return vals[0];
    }
    return Number(priceObj) || 0;
  }

  if (!modal) return;

  // Real-time phone number sanitization (only allow digits, max 10 characters)
  if (custPhoneInput) {
    custPhoneInput.setAttribute("maxlength", "10");
    custPhoneInput.setAttribute("inputmode", "numeric");
    custPhoneInput.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
  }

  const bookPhoneInput = document.getElementById("book-phone");
  if (bookPhoneInput) {
    bookPhoneInput.setAttribute("maxlength", "10");
    bookPhoneInput.setAttribute("inputmode", "numeric");
    bookPhoneInput.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
  }

  // Bind Dine-In meal-time cards
  const dineMealCards = document.querySelectorAll("#dine-meal-time-selector .meal-card");
  dineMealCards.forEach(card => {
    card.addEventListener("click", () => {
      dineMealCards.forEach(c => {
        c.classList.remove("active");
        c.setAttribute("aria-pressed", "false");
      });
      card.classList.add("active");
      card.setAttribute("aria-pressed", "true");
      dineMealTime = card.getAttribute("data-dine-meal");
      renderDineDishes();
    });
  });

  // Bind Dine-In Veg/Non-Veg toggle buttons
  const dineDietBtns = document.querySelectorAll(".dine-search-filter-row .veg-nonveg-toggle-btn");
  dineDietBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      dineDietBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      dineDietType = btn.getAttribute("data-dine-diet");
      renderDineDishes();
    });
  });

  // Bind Dine-In Search Input
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchVal = e.target.value.toLowerCase().trim();
      renderDineDishes();
    });
  }

  // Initialize table & guest counts
  if (tableSelect) {
    tableSelect.innerHTML = "";
    for (let i = 1; i <= 20; i++) {
      const opt = document.createElement("option");
      opt.value = `Table ${i}`;
      opt.textContent = `Table ${i}`;
      tableSelect.appendChild(opt);
    }
  }

  if (guestsSelect) {
    guestsSelect.innerHTML = "";
    const guestOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 40, 50, 75, 100];
    
    guestOptions.forEach(num => {
      const opt = document.createElement("option");
      opt.value = num;
      opt.textContent = num === 100 ? "100+ Guests" : `${num} ${num === 1 ? 'Guest' : 'Guests'}`;
      guestsSelect.appendChild(opt);
    });
  }

  // Open modal triggers
  const triggers = [
    ...document.querySelectorAll(".nav-dine-link"),
    document.getElementById("hero-order-btn"),
    document.getElementById("home-dinein-card-btn")
  ];

  triggers.forEach(trigger => {
    if (trigger) {
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        openDineInFlow();
      });
    }
  });

  // Setup Event Delegation for Add-to-Order buttons in the main menu grid
  const menuGrid = document.getElementById("menu-grid");
  if (menuGrid) {
    menuGrid.addEventListener("click", (e) => {
      if (e.target.classList.contains("add-to-order-btn")) {
        const id = e.target.getAttribute("data-id");
        const item = MENU_DATA.find(i => i.id === id);
        if (item) {
          openDineInFlow(item);
        }
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      closeDineInFlow();
    });
  }

  // Modal open function
  window.openDineInFlow = openDineInFlow;
  function openDineInFlow(pendingItem) {
    if (pendingItem) {
      pendingAddDish = pendingItem;
    } else {
      pendingAddDish = null;
    }

    // Check if there is an active tracked order in localStorage
    const savedOrder = localStorage.getItem("activeDineInOrder");
    if (savedOrder) {
      try {
        const orderData = JSON.parse(savedOrder);
        startTrackingOrder(orderData.orderId, orderData.email);
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
        return;
      } catch (e) {
        localStorage.removeItem("activeDineInOrder");
      }
    }

    // Otherwise, start standard wizard from step 1
    currentStep = 1;
    dineInCart = [];
    showStep(1);
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  function closeDineInFlow() {
    modal.style.display = "none";
    document.body.style.overflow = "";
    // If tracking is active, do not stop polling, just close modal.
  }

  // Wizard navigation transitions
  function showStep(stepNum) {
    currentStep = stepNum;

    // Hide all panes
    pane1.style.display = "none";
    pane2.style.display = "none";
    pane3.style.display = "none";
    pane4.style.display = "none";
    paneTracker.style.display = "none";
    stepsHeader.style.display = "flex";

    // Show selected pane
    if (stepNum === 1) pane1.style.display = "flex";
    if (stepNum === 2) pane2.style.display = "flex";
    if (stepNum === 3) pane3.style.display = "flex";
    if (stepNum === 4) pane4.style.display = "flex";

    // Update wizard steps header styling
    document.querySelectorAll(".wizard-step").forEach(stepEl => {
      const stepIdx = parseInt(stepEl.getAttribute("data-step"));
      stepEl.classList.remove("active", "completed");
      if (stepIdx === stepNum) {
        stepEl.classList.add("active");
      } else if (stepIdx < stepNum) {
        stepEl.classList.add("completed");
      }
    });
  }

  // STEP 1 -> STEP 2
  if (btnGotoStep2) {
    btnGotoStep2.addEventListener("click", () => {
      selectedTable = tableSelect.value;
      guestCount = parseInt(guestsSelect.value) || 1;

      // Reset to time-of-day default
      dineMealTime = getDefaultMealTimeByTimeOfDay();
      dineDietType = "Veg";

      // If there was a pending item from the homepage, add it now
      if (pendingAddDish) {
        addToDineCart(pendingAddDish);
        const itemMealTimes = getMenuItemMealTimes(pendingAddDish);
        if (itemMealTimes && itemMealTimes.length > 0) {
          dineMealTime = itemMealTimes[0];
        }
        dineDietType = getMenuItemDietType(pendingAddDish);
        pendingAddDish = null;
      }

      showStep(2);
      syncDineUIState();
      renderDineDishes();
      renderDineSidebar();
    });
  }

  // STEP 2 -> STEP 1
  if (btnBackToStep1) {
    btnBackToStep1.addEventListener("click", () => {
      showStep(1);
    });
  }

  // STEP 2 -> STEP 3
  if (btnGotoStep3) {
    btnGotoStep3.addEventListener("click", () => {
      if (dineInCart.length === 0) {
        alert("Your order is empty. Please add at least one dish before continuing.");
        return;
      }
      showStep(3);
    });
  }

  // STEP 3 -> STEP 2
  if (btnBackToStep2) {
    btnBackToStep2.addEventListener("click", () => {
      showStep(2);
      syncDineUIState();
      renderDineDishes();
      renderDineSidebar();
    });
  }

  // STEP 3 -> STEP 4
  if (btnGotoStep4) {
    btnGotoStep4.addEventListener("click", () => {
      const name = custNameInput.value.trim();
      const email = custEmailInput.value.trim();

      if (!name) {
        alert("Please enter your name.");
        return;
      }

      // Check email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        alert("Please enter a valid email address to receive order updates.");
        return;
      }

      // Check phone format if entered (Optional field)
      const phone = custPhoneInput ? custPhoneInput.value.trim() : "";
      if (phone && !/^\d{10}$/.test(phone)) {
        alert("Please enter a valid 10-digit phone number.");
        return;
      }

      showStep(4);
      renderDineReview();
    });
  }

  // STEP 4 -> STEP 3
  if (btnBackToStep3) {
    btnBackToStep3.addEventListener("click", () => {
      showStep(3);
    });
  }

  // STEP 4 -> SUBMIT ORDER
  if (btnSubmitOrder) {
    btnSubmitOrder.addEventListener("click", async () => {
      const totalAmount = dineInCart.reduce((sum, item) => sum + (getDisplayPrice(item.price) * item.quantity), 0);
      const payload = {
        customerName: custNameInput.value.trim(),
        customerEmail: custEmailInput.value.trim().toLowerCase(),
        customerPhone: custPhoneInput.value.trim() || "N/A",
        tableNumber: selectedTable,
        partySize: guestCount,
        items: dineInCart.map(item => ({
          menuItemId: item.id,
          name: item.name,
          price: getDisplayPrice(item.price),
          quantity: item.quantity,
          size: item.size || ""
        })),
        totalAmount
      };

      btnSubmitOrder.disabled = true;
      btnSubmitOrder.textContent = "Placing Order...";

      try {
        const response = await fetch(`${API_BASE_URL}/api/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          let errorMsg = `Server returned status ${response.status}`;
          try {
            const errData = await response.json();
            if (errData && errData.details) {
              errorMsg = errData.details;
            } else if (errData && errData.error) {
              errorMsg = errData.error;
            } else if (errData && errData.errors && Array.isArray(errData.errors)) {
              errorMsg = errData.errors.map(e => e.msg).join(", ");
            }
          } catch (_) { }
          throw new Error(errorMsg);
        }

        const data = await response.json();

        // Save order details to localStorage for persistence on page reload
        localStorage.setItem("activeDineInOrder", JSON.stringify({
          orderId: data.orderId,
          email: payload.customerEmail
        }));

        // Transition to live status tracking
        startTrackingOrder(data.orderId, payload.customerEmail);

      } catch (err) {
        console.error("Dine-In submission failed:", err);
        alert("Failed to submit Dine-In order: " + err.message);
        btnSubmitOrder.disabled = false;
        btnSubmitOrder.textContent = "Place Dine-In Order 🍽️";
      }
    });
  }

  // --- MENU DATA POPULATION & RENDERING ---
  function getMenuCategories() {
    if (MENU_DATA.length > 0) {
      const cats = [...new Set(MENU_DATA.map(item => item.category))];
      return cats.filter(Boolean);
    }
    return [
      "Indian Tandoor",
      "Indian Curries",
      "Chinese",
      "Soups & Sea Food",
      "Rice & Biryani",
      "Breads",
      "Egg Dishes",
      "Salads & Beverages"
    ];
  }

  function renderDineDishes() {
    if (!itemsContainer) return;
    const scrollTop = itemsContainer.scrollTop;
    itemsContainer.innerHTML = "";

    let dishes = filterMenuItems(dineMealTime, dineDietType);
    console.log("renderDineDishes: dineMealTime =", dineMealTime, "dineDietType =", dineDietType, "count =", dishes.length);

    // Filter by search query
    if (searchVal) {
      dishes = dishes.filter(d =>
        d.name.toLowerCase().includes(searchVal) ||
        (d.description && d.description.toLowerCase().includes(searchVal))
      );
    }

    if (dishes.length === 0) {
      const msg = dineMealTime === "Snacks"
        ? "Shaam Ki Mehfil menu launching soon — check back shortly!"
        : "No dishes found matching your search filters.";
      itemsContainer.innerHTML = `<div style="grid-column:1/-1; text-align:center; font-size:0.9rem; color:var(--color-text-soft); font-style:italic;">${msg}</div>`;
      return;
    }

    function createDishCard(dish) {
      const card = document.createElement("div");
      card.className = "dine-dish-card";

      const cartItem = dineInCart.find(i => i.id === dish.id);
      const isVegSymbol = getMenuItemDietType(dish) === "Veg" ? "🟢" : "🔴";

      card.innerHTML = `
        <div class="dine-dish-info">
          <h4>${isVegSymbol} ${dish.name}</h4>
          <p class="dine-dish-desc">${dish.description || 'Freshly made with traditional restaurant recipes.'}</p>
          <div class="dine-dish-price">₹${getDisplayPrice(dish.price)}</div>
        </div>
        <div class="dine-dish-actions">
          ${cartItem ? `
            <div class="dine-sb-item-controls" style="margin-top: 8px;">
              <button class="dine-qty-btn dine-minus" data-id="${dish.id}">-</button>
              <span class="dine-qty-val">${cartItem.quantity}</span>
              <button class="dine-qty-btn dine-plus" data-id="${dish.id}">+</button>
            </div>
          ` : `
            <button class="btn btn-dine-primary dine-add-btn" data-id="${dish.id}" style="width:100%; padding:6px 12px; font-size:0.75rem; margin-top:8px;">+ Add to Order</button>
          `}
        </div>
      `;

      // Event listeners
      const addBtn = card.querySelector(".dine-add-btn");
      if (addBtn) {
        addBtn.addEventListener("click", () => addToDineCart(dish));
      }

      const plusBtn = card.querySelector(".dine-plus");
      if (plusBtn) {
        plusBtn.addEventListener("click", () => updateDineCartQty(dish.id, 1));
      }

      const minusBtn = card.querySelector(".dine-minus");
      if (minusBtn) {
        minusBtn.addEventListener("click", () => updateDineCartQty(dish.id, -1));
      }

      return card;
    }

    // Group by category if we have multiple categories
    const categoriesPresent = [...new Set(dishes.map(d => d.category).filter(Boolean))];
    const categoryOrder = [
      "Breakfast",
      "Indian Tandoor",
      "Indian Curries",
      "Chinese",
      "Soups & Sea Food",
      "Rice & Biryani",
      "Breads",
      "Snacks",
      "Egg Dishes",
      "Salads & Beverages"
    ];
    categoriesPresent.sort((a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b));

    if (categoriesPresent.length > 1) {
      categoriesPresent.forEach(cat => {
        const catDishes = dishes.filter(d => d.category === cat);
        if (catDishes.length === 0) return;

        const sectionHeader = document.createElement("div");
        sectionHeader.className = "dine-menu-section-header";
        sectionHeader.style.cssText = "grid-column: 1 / -1; margin-top: 16px; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 2px solid rgba(0, 0, 0, 0.1); color: var(--color-text); font-family: var(--font-serif); font-size: 1.1rem; font-weight: 700;";
        sectionHeader.textContent = cat === "Snacks" ? "Shaam Ki Mehfil (Café • Chaat • Snacks)" : cat;
        itemsContainer.appendChild(sectionHeader);

        catDishes.forEach(dish => {
          itemsContainer.appendChild(createDishCard(dish));
        });
      });
    } else {
      dishes.forEach(dish => {
        itemsContainer.appendChild(createDishCard(dish));
      });
    }
    itemsContainer.scrollTop = scrollTop;
  }

  // --- CART MANIPULATION ---
  function addToDineCart(dish) {
    const existing = dineInCart.find(i => i.id === dish.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      dineInCart.push({
        id: dish.id,
        name: dish.name,
        price: getDisplayPrice(dish.price),
        quantity: 1,
        size: dish.size || ""
      });
    }
    renderDineDishes();
    renderDineSidebar();
  }

  function updateDineCartQty(dishId, change) {
    const item = dineInCart.find(i => i.id === dishId);
    if (item) {
      item.quantity += change;
      if (item.quantity <= 0) {
        dineInCart = dineInCart.filter(i => i.id !== dishId);
      }
    }
    renderDineDishes();
    renderDineSidebar();
  }

  function renderDineSidebar() {
    if (!sidebarList) return;
    sidebarList.innerHTML = "";

    if (dineInCart.length === 0) {
      sidebarList.innerHTML = `<div class="dine-empty-cart">No items added yet. Click "+ Add to Order" to begin!</div>`;
      if (sidebarTotal) sidebarTotal.textContent = "₹0";
      return;
    }

    dineInCart.forEach(item => {
      const row = document.createElement("div");
      row.className = "dine-sidebar-item";
      row.innerHTML = `
        <div class="dine-sb-item-info">
          <div class="dine-sb-item-name">${item.name}</div>
          <div class="dine-sb-item-price">₹${getDisplayPrice(item.price)} x ${item.quantity}</div>
        </div>
        <div class="dine-sb-item-controls">
          <button class="dine-qty-btn dine-sb-minus" data-id="${item.id}">-</button>
          <span class="dine-qty-val">${item.quantity}</span>
          <button class="dine-qty-btn dine-sb-plus" data-id="${item.id}">+</button>
        </div>
      `;

      row.querySelector(".dine-sb-plus").addEventListener("click", () => updateDineCartQty(item.id, 1));
      row.querySelector(".dine-sb-minus").addEventListener("click", () => updateDineCartQty(item.id, -1));

      sidebarList.appendChild(row);
    });

    const total = dineInCart.reduce((sum, item) => sum + (getDisplayPrice(item.price) * item.quantity), 0);
    if (sidebarTotal) sidebarTotal.textContent = `₹${total}`;
  }

  // --- REVIEW RENDER ---
  function renderDineReview() {
    if (reviewTable) reviewTable.textContent = selectedTable;
    if (reviewGuests) reviewGuests.textContent = `${guestCount} Guest${guestCount === 1 ? '' : 's'}`;
    if (reviewName) reviewName.textContent = custNameInput.value.trim();
    if (reviewEmail) reviewEmail.textContent = custEmailInput.value.trim();

    if (!reviewItemsTbody) return;
    reviewItemsTbody.innerHTML = "";

    dineInCart.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.name}</td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: right; font-weight:600;">₹${getDisplayPrice(item.price) * item.quantity}</td>
      `;
      reviewItemsTbody.appendChild(tr);
    });

    const grandTotal = dineInCart.reduce((sum, item) => sum + (getDisplayPrice(item.price) * item.quantity), 0);
    if (reviewGrandTotal) reviewGrandTotal.textContent = `₹${grandTotal}`;
  }

  // --- CONFIRMATION MODAL CONTROLLER ---
  function startTrackingOrder(orderId, email) {
    // Hide progress bar headers and step panes
    stepsHeader.style.display = "none";
    pane1.style.display = "none";
    pane2.style.display = "none";
    pane3.style.display = "none";
    pane4.style.display = "none";
    paneTracker.style.display = "flex";

    if (trackerOrderId) trackerOrderId.textContent = orderId;

    // Reset button states
    btnSubmitOrder.disabled = false;
    btnSubmitOrder.textContent = "Place Dine-In Order 🍽️";
  }

  // Handle exiting order confirmation
  if (trackerCloseBtn) {
    trackerCloseBtn.addEventListener("click", () => {
      localStorage.removeItem("activeDineInOrder");
      dineInCart = [];
      if (custNameInput) custNameInput.value = "";
      if (custEmailInput) custEmailInput.value = "";
      if (custPhoneInput) custPhoneInput.value = "";
      renderDineDishes();
      renderDineSidebar();
      closeDineInFlow();
    });
  }

  // Auto load active confirmation on page load (if window has active order)
  const autoCheckSavedOrder = localStorage.getItem("activeDineInOrder");
  if (autoCheckSavedOrder) {
    try {
      const parsed = JSON.parse(autoCheckSavedOrder);
      if (parsed && parsed.orderId) {
        console.log(`[DineIn] Resuming active order confirmation: ${parsed.orderId}`);
        startTrackingOrder(parsed.orderId, parsed.email);
      }
    } catch (_) { }
  }
}

// 9. ORDER ONLINE TAKEAWAY/DELIVERY WIZARD CONTROLLER
function initOrderOnlineFlow() {
  const modal = document.getElementById("order-online-modal");
  const closeBtn = document.getElementById("online-modal-close");
  const stepsHeader = document.getElementById("online-wizard-steps-header");

  const pane1 = document.getElementById("online-step-1");
  const pane2 = document.getElementById("online-step-2");
  const pane3 = document.getElementById("online-step-3");
  const pane4 = document.getElementById("online-step-4");
  const paneTracker = document.getElementById("online-step-tracker-pane");

  const btnTypeDelivery = document.getElementById("btn-type-delivery");
  const btnTypeTakeaway = document.getElementById("btn-type-takeaway");
  const deliveryFields = document.getElementById("online-delivery-fields");
  const takeawayFields = document.getElementById("online-takeaway-fields");

  const addressInput = document.getElementById("online-address");
  const landmarkInput = document.getElementById("online-landmark");
  const pincodeInput = document.getElementById("online-pincode");
  const pickupTimeSelect = document.getElementById("online-pickup-time");

  const searchInput = document.getElementById("online-menu-search");
  const itemsContainer = document.getElementById("online-menu-items-container");
  const sidebarList = document.getElementById("online-sidebar-items-list");
  const sidebarTotal = document.getElementById("online-sidebar-total");

  const custNameInput = document.getElementById("online-cust-name");
  const custEmailInput = document.getElementById("online-cust-email");
  const custPhoneInput = document.getElementById("online-cust-phone");

  const reviewType = document.getElementById("online-review-type");
  const reviewFulfillmentRow = document.getElementById("online-review-fulfillment-row");
  const reviewFulfillmentVal = document.getElementById("online-review-fulfillment-val");
  const reviewName = document.getElementById("online-review-name");
  const reviewEmail = document.getElementById("online-review-email");
  const reviewPhone = document.getElementById("online-review-phone");
  const reviewItemsTbody = document.getElementById("online-review-items-tbody");
  const reviewGrandTotal = document.getElementById("online-review-grand-total");

  const trackerOrderId = document.getElementById("online-tracker-order-id");
  const trackerCloseBtn = document.getElementById("online-btn-tracker-close");

  const btnGotoStep2 = document.getElementById("online-btn-goto-step2");
  const btnBackToStep1 = document.getElementById("online-btn-back-to-step1");
  const btnGotoStep3 = document.getElementById("online-btn-goto-step3");
  const btnBackToStep2 = document.getElementById("online-btn-back-to-step2");
  const btnGotoStep4 = document.getElementById("online-btn-goto-step4");
  const btnBackToStep3 = document.getElementById("online-btn-back-to-step3");
  const btnSubmitOrder = document.getElementById("online-btn-submit-order");

  let onlineCart = [];
  let orderType = "delivery"; // "delivery" or "takeaway"
  let onlineMealTime = "Lunch";
  let onlineDietType = "Veg";
  let searchVal = "";
  let currentStep = 1;

  if (!modal) return;

  function getDefaultMealTimeByTimeOfDay() {
    const hours = new Date().getHours();
    const minutes = new Date().getMinutes();
    const decimalTime = hours + minutes / 60;

    if (decimalTime < 11) {
      return "Breakfast";
    } else if (decimalTime >= 11 && decimalTime < 16) {
      return "Lunch";
    } else if (decimalTime >= 16 && decimalTime < 18.5) {
      return "Snacks";
    } else {
      return "Dinner";
    }
  }

  // Force digits for phone number
  if (custPhoneInput) {
    custPhoneInput.setAttribute("maxlength", "10");
    custPhoneInput.setAttribute("inputmode", "numeric");
    custPhoneInput.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
  }

  // Force digits for pincode
  if (pincodeInput) {
    pincodeInput.setAttribute("maxlength", "6");
    pincodeInput.setAttribute("inputmode", "numeric");
    pincodeInput.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
  }

  // Toggle order type
  if (btnTypeDelivery && btnTypeTakeaway) {
    btnTypeDelivery.addEventListener("click", () => {
      btnTypeDelivery.classList.add("active");
      btnTypeTakeaway.classList.remove("active");
      deliveryFields.style.display = "block";
      takeawayFields.style.display = "none";
      orderType = "delivery";
    });

    btnTypeTakeaway.addEventListener("click", () => {
      btnTypeTakeaway.classList.add("active");
      btnTypeDelivery.classList.remove("active");
      deliveryFields.style.display = "none";
      takeawayFields.style.display = "block";
      orderType = "takeaway";
    });
  }

  // Bind meal cards
  const mealCards = document.querySelectorAll("#online-meal-time-selector .meal-card");
  mealCards.forEach(card => {
    card.addEventListener("click", () => {
      mealCards.forEach(c => {
        c.classList.remove("active");
        c.setAttribute("aria-pressed", "false");
      });
      card.classList.add("active");
      card.setAttribute("aria-pressed", "true");
      onlineMealTime = card.getAttribute("data-online-meal");
      renderDishes();
    });
  });

  // Bind Veg/Non-Veg toggle buttons
  const dietBtns = document.querySelectorAll("#online-step-2 .veg-nonveg-toggle-btn");
  dietBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      dietBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      onlineDietType = btn.getAttribute("data-online-diet");
      renderDishes();
    });
  });

  // Bind Search Input
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchVal = e.target.value.toLowerCase().trim();
      renderDishes();
    });
  }

  function syncUIState() {
    const cards = document.querySelectorAll("#online-meal-time-selector .meal-card");
    cards.forEach(card => {
      const meal = card.getAttribute("data-online-meal");
      if (meal === onlineMealTime) {
        card.classList.add("active");
        card.setAttribute("aria-pressed", "true");
      } else {
        card.classList.remove("active");
        card.setAttribute("aria-pressed", "false");
      }
    });

    const btns = document.querySelectorAll("#online-step-2 .veg-nonveg-toggle-btn");
    btns.forEach(btn => {
      const diet = btn.getAttribute("data-online-diet");
      if (diet === onlineDietType) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  window.openOrderOnlineFlow = function() {
    currentStep = 1;
    onlineCart = [];
    onlineMealTime = getDefaultMealTimeByTimeOfDay();
    onlineDietType = "Veg";
    searchVal = "";
    if (searchInput) searchInput.value = "";
    
    if (addressInput) addressInput.value = "";
    if (landmarkInput) landmarkInput.value = "";
    if (pincodeInput) pincodeInput.value = "";

    showStep(1);
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
  };

  function closeFlow() {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }

  if (closeBtn) closeBtn.addEventListener("click", closeFlow);
  if (trackerCloseBtn) trackerCloseBtn.addEventListener("click", closeFlow);

  function showStep(stepNum) {
    currentStep = stepNum;

    pane1.style.display = "none";
    pane2.style.display = "none";
    pane3.style.display = "none";
    pane4.style.display = "none";
    paneTracker.style.display = "none";
    stepsHeader.style.display = "flex";

    if (stepNum === 1) pane1.style.display = "block";
    if (stepNum === 2) pane2.style.display = "flex";
    if (stepNum === 3) pane3.style.display = "block";
    if (stepNum === 4) pane4.style.display = "flex";

    document.querySelectorAll("#online-wizard-steps-header .wizard-step").forEach(stepEl => {
      const stepIdx = parseInt(stepEl.getAttribute("data-step"));
      stepEl.classList.remove("active", "completed");
      if (stepIdx === stepNum) {
        stepEl.classList.add("active");
      } else if (stepIdx < stepNum) {
        stepEl.classList.add("completed");
      }
    });
  }

  if (btnGotoStep2) {
    btnGotoStep2.addEventListener("click", () => {
      if (orderType === "delivery") {
        if (!addressInput.value.trim()) {
          alert("Please enter a delivery address.");
          return;
        }
        const pin = pincodeInput.value.trim();
        if (!pin || pin.length < 6) {
          alert("Please enter a valid 6-digit pincode.");
          return;
        }
      }
      showStep(2);
      syncUIState();
      renderDishes();
      renderSidebar();
    });
  }

  if (btnBackToStep1) {
    btnBackToStep1.addEventListener("click", () => {
      showStep(1);
    });
  }

  if (btnGotoStep3) {
    btnGotoStep3.addEventListener("click", () => {
      if (onlineCart.length === 0) {
        alert("Your order is empty. Please add at least one dish.");
        return;
      }
      showStep(3);
    });
  }

  if (btnBackToStep2) {
    btnBackToStep2.addEventListener("click", () => {
      showStep(2);
      syncUIState();
      renderDishes();
      renderSidebar();
    });
  }

  if (btnGotoStep4) {
    btnGotoStep4.addEventListener("click", () => {
      const name = custNameInput.value.trim();
      const email = custEmailInput.value.trim();
      const phone = custPhoneInput.value.trim();

      if (!name) {
        alert("Please enter your name.");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        alert("Please enter a valid email address.");
        return;
      }
      if (!phone || phone.length < 10) {
        alert("Please enter a valid 10-digit phone number.");
        return;
      }

      showStep(4);
      renderReview();
    });
  }

  if (btnBackToStep3) {
    btnBackToStep3.addEventListener("click", () => {
      showStep(3);
    });
  }

  function getDisplayPrice(priceObj) {
    if (typeof priceObj === 'number') return priceObj;
    if (!priceObj) return 0;
    if (priceObj.default !== undefined) return Number(priceObj.default) || 0;
    if (priceObj.full !== undefined) return Number(priceObj.full) || 0;
    if (priceObj.half !== undefined) return Number(priceObj.half) || 0;
    if (typeof priceObj === 'object') {
      const vals = Object.values(priceObj).map(Number).filter(v => !isNaN(v));
      if (vals.length > 0) return vals[0];
    }
    return Number(priceObj) || 0;
  }

  function getMenuItemDietType(item) {
    return (item.type && item.type.toLowerCase() === "veg") ? "Veg" : "Non-Veg";
  }

  function renderDishes() {
    if (!itemsContainer) return;
    const scrollTop = itemsContainer.scrollTop;
    itemsContainer.innerHTML = "";

    let dishes = filterMenuItems(onlineMealTime, onlineDietType);
    console.log("renderDishes: onlineMealTime =", onlineMealTime, "onlineDietType =", onlineDietType, "count =", dishes.length);

    if (searchVal) {
      dishes = dishes.filter(d =>
        d.name.toLowerCase().includes(searchVal) ||
        (d.description && d.description.toLowerCase().includes(searchVal))
      );
    }

    if (dishes.length === 0) {
      const msg = onlineMealTime === "Snacks"
        ? "Shaam Ki Mehfil menu launching soon — check back shortly!"
        : "No dishes found matching your search.";
      itemsContainer.innerHTML = `<div style="grid-column:1/-1; text-align:center; font-size:0.9rem; color:var(--color-text-soft); font-style:italic;">${msg}</div>`;
      return;
    }

    dishes.forEach(dish => {
      const card = document.createElement("div");
      card.className = "dine-dish-card";

      const cartItem = onlineCart.find(i => i.id === dish.id);
      const isVegSymbol = getMenuItemDietType(dish) === "Veg" ? "🟢" : "🔴";

      card.innerHTML = `
        <div class="dine-dish-info">
          <h4>${isVegSymbol} ${dish.name}</h4>
          <p class="dine-dish-desc">${dish.description || 'Freshly made with traditional recipes.'}</p>
          <div class="dine-dish-price">₹${getDisplayPrice(dish.price)}</div>
        </div>
        <div class="dine-dish-actions">
          ${cartItem ? `
            <div class="dine-sb-item-controls" style="margin-top: 8px;">
              <button class="dine-qty-btn minus-btn" data-id="${dish.id}">-</button>
              <span class="dine-qty-val">${cartItem.quantity}</span>
              <button class="dine-qty-btn plus-btn" data-id="${dish.id}">+</button>
            </div>
          ` : `
            <button class="btn btn-dine-primary add-btn" data-id="${dish.id}" style="width:100%; padding:6px 12px; font-size:0.75rem; margin-top:8px;">+ Add to Order</button>
          `}
        </div>
      `;

      const addBtn = card.querySelector(".add-btn");
      if (addBtn) addBtn.addEventListener("click", () => addToCart(dish));

      const plusBtn = card.querySelector(".plus-btn");
      if (plusBtn) plusBtn.addEventListener("click", () => updateCartQty(dish.id, 1));

      const minusBtn = card.querySelector(".minus-btn");
      if (minusBtn) minusBtn.addEventListener("click", () => updateCartQty(dish.id, -1));

      itemsContainer.appendChild(card);
    });
    itemsContainer.scrollTop = scrollTop;
  }

  function addToCart(dish) {
    const existing = onlineCart.find(i => i.id === dish.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      onlineCart.push({
        id: dish.id,
        name: dish.name,
        price: getDisplayPrice(dish.price),
        quantity: 1,
        size: dish.size || ""
      });
    }
    renderDishes();
    renderSidebar();
  }

  function updateCartQty(dishId, change) {
    const item = onlineCart.find(i => i.id === dishId);
    if (item) {
      item.quantity += change;
      if (item.quantity <= 0) {
        onlineCart = onlineCart.filter(i => i.id !== dishId);
      }
    }
    renderDishes();
    renderSidebar();
  }

  function renderSidebar() {
    if (!sidebarList) return;
    sidebarList.innerHTML = "";

    if (onlineCart.length === 0) {
      sidebarList.innerHTML = `<div class="dine-empty-cart">No items added yet.</div>`;
      if (sidebarTotal) sidebarTotal.textContent = "₹0";
      return;
    }

    onlineCart.forEach(item => {
      const row = document.createElement("div");
      row.className = "dine-sidebar-item";
      row.innerHTML = `
        <div class="dine-sb-item-info">
          <div class="dine-sb-item-name">${item.name}</div>
          <div class="dine-sb-item-price">₹${item.price} x ${item.quantity}</div>
        </div>
        <div class="dine-sb-item-controls">
          <button class="dine-qty-btn sb-minus" data-id="${item.id}">-</button>
          <span class="dine-qty-val">${item.quantity}</span>
          <button class="dine-qty-btn sb-plus" data-id="${item.id}">+</button>
        </div>
      `;

      row.querySelector(".sb-plus").addEventListener("click", () => updateCartQty(item.id, 1));
      row.querySelector(".sb-minus").addEventListener("click", () => updateCartQty(item.id, -1));

      sidebarList.appendChild(row);
    });

    const total = onlineCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (sidebarTotal) sidebarTotal.textContent = `₹${total}`;
  }

  function renderReview() {
    reviewType.textContent = orderType === "delivery" ? "Delivery 🚚" : "Takeaway 🛍️";
    if (orderType === "delivery") {
      reviewFulfillmentRow.style.display = "block";
      reviewFulfillmentVal.textContent = `${addressInput.value.trim()} (Landmark: ${landmarkInput.value.trim()}, Pincode: ${pincodeInput.value.trim()})`;
    } else {
      reviewFulfillmentRow.style.display = "block";
      reviewFulfillmentVal.textContent = `Estimated Pickup: ${pickupTimeSelect.value}`;
    }

    reviewName.textContent = custNameInput.value.trim();
    reviewEmail.textContent = custEmailInput.value.trim();
    reviewPhone.textContent = custPhoneInput.value.trim();

    reviewItemsTbody.innerHTML = "";
    onlineCart.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.name}</td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: right; font-weight:600;">₹${item.price * item.quantity}</td>
      `;
      reviewItemsTbody.appendChild(tr);
    });

    const grandTotal = onlineCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (reviewGrandTotal) reviewGrandTotal.textContent = `₹${grandTotal}`;
  }

  if (btnSubmitOrder) {
    btnSubmitOrder.addEventListener("click", async () => {
      btnSubmitOrder.disabled = true;
      btnSubmitOrder.textContent = "Placing Order...";

      const totalAmount = onlineCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      let tblNum = "Online Order";
      if (orderType === "delivery") {
        tblNum = `Delivery: ${addressInput.value.trim()}, Landmark: ${landmarkInput.value.trim()} (Pincode: ${pincodeInput.value.trim()})`;
      } else {
        tblNum = `Takeaway (Pickup: ${pickupTimeSelect.value})`;
      }

      const payload = {
        customerName: custNameInput.value.trim(),
        customerEmail: custEmailInput.value.trim().toLowerCase(),
        customerPhone: custPhoneInput.value.trim(),
        tableNumber: tblNum,
        partySize: 1,
        items: onlineCart.map(item => ({
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size || ""
        })),
        totalAmount,
        type: orderType
      };

      try {
        const response = await fetch(`${API_BASE_URL}/api/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error("Failed to submit online order.");
        }

        const data = await response.json();
        
        stepsHeader.style.display = "none";
        pane1.style.display = "none";
        pane2.style.display = "none";
        pane3.style.display = "none";
        pane4.style.display = "none";
        paneTracker.style.display = "flex";

        trackerOrderId.textContent = data.orderId || "ORD-XXXX";

      } catch (err) {
        console.error(err);
        alert("Error placing order: " + err.message);
        btnSubmitOrder.disabled = false;
        btnSubmitOrder.textContent = "Place Order 🥡";
      }
    });
  }
}

// 10. SERVICES ENQUIRY CONTROLLER
function initServicesHub() {
  const modal = document.getElementById("service-enquiry-modal");
  const closeBtn = document.getElementById("enquiry-modal-close");
  const successCloseBtn = document.getElementById("enq-success-close");
  const form = document.getElementById("service-enquiry-form");

  if (!modal) return;

  function closeEnquiryModal() {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }

  if (closeBtn) closeBtn.addEventListener("click", closeEnquiryModal);
  if (successCloseBtn) successCloseBtn.addEventListener("click", closeEnquiryModal);

  window.openEnquiryForm = function(serviceType) {
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";

    document.querySelectorAll(".enq-custom-fields").forEach(el => {
      el.style.display = "none";
    });

    if (form) form.style.display = "block";
    document.getElementById("enq-success-view").style.display = "none";

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateInput = document.getElementById("enq-date");
    if (dateInput) {
      dateInput.value = `${year}-${month}-${day}`;
      dateInput.setAttribute("min", `${year}-${month}-${day}`);
    }

    let title = "Service Enquiry";
    let targetBlockId = "";

    if (serviceType === "birthday-parties") {
      title = "Birthday Party Booking";
      targetBlockId = "enq-fields-birthday";
    } else if (serviceType === "events-celebrations") {
      title = "Events & Celebrations";
      targetBlockId = "enq-fields-events";
    } else if (serviceType === "corporate-catering") {
      title = "Corporate Events & Catering";
      targetBlockId = "enq-fields-corporate";
    } else if (serviceType === "catering-services") {
      title = "Catering Services";
      targetBlockId = "enq-fields-catering";
    } else if (serviceType === "celebration-packages") {
      title = "Celebration Packages";
      targetBlockId = "enq-fields-packages";
    } else if (serviceType === "bulk-orders") {
      title = "Bulk & Pre-Orders";
      targetBlockId = "enq-fields-bulk";
    } else if (serviceType === "private-venue") {
      title = "Private Venue Booking";
      targetBlockId = "enq-fields-venue";
    }

    document.getElementById("enquiry-modal-title").textContent = title;
    const block = document.getElementById(targetBlockId);
    if (block) {
      block.style.display = "block";
    }

    modal.setAttribute("data-active-service", title);
  };

  const serviceCards = document.querySelectorAll(".services-grid .service-card");
  serviceCards.forEach(card => {
    card.addEventListener("click", () => {
      const type = card.getAttribute("data-service-type");
      if (type === "book-table") {
        document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
      } else if (type === "order-online") {
        if (typeof window.openOrderOnlineFlow === "function") {
          window.openOrderOnlineFlow();
        }
      } else if (type === "family-dining") {
        const dineGuests = document.getElementById("dine-guests-select");
        if (dineGuests) {
          dineGuests.value = "10";
        }
        document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
      } else if (type) {
        window.openEnquiryForm(type);
      }
    });
  });

  const triggers = [
    document.getElementById("nav-book-btn"),
    document.getElementById("mobile-menu-book-btn"),
    document.getElementById("hero-book-order-btn"),
    document.getElementById("mobile-sticky-book-btn"),
    document.getElementById("menu-reserve-btn")
  ];

  triggers.forEach(t => {
    if (t) {
      t.addEventListener("click", (e) => {
        e.preventDefault();
        const servSec = document.getElementById("our-services");
        if (servSec) servSec.scrollIntoView({ behavior: "smooth" });
      });
    }
  });

  const navLinks = [
    { id: "nav-order-online-link", action: "order" },
    { id: "mobile-order-online-link", action: "order" },
    { id: "nav-book-table-link", action: "book" },
    { id: "mobile-book-table-link", action: "book" },
    { id: "nav-catering-link", action: "catering" },
    { id: "mobile-catering-link", action: "catering" }
  ];

  navLinks.forEach(linkObj => {
    const el = document.getElementById(linkObj.id);
    if (el) {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        if (linkObj.action === "book") {
          document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
        } else if (linkObj.action === "order") {
          if (typeof window.openOrderOnlineFlow === "function") {
            window.openOrderOnlineFlow();
          }
        } else if (linkObj.action === "catering") {
          window.openEnquiryForm("catering-services");
        }
      });
    }
  });

  const phoneInput = document.getElementById("enq-phone");
  if (phoneInput) {
    phoneInput.setAttribute("maxlength", "10");
    phoneInput.setAttribute("inputmode", "numeric");
    phoneInput.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById("enq-name");
      const phoneInput = document.getElementById("enq-phone");
      const emailInput = document.getElementById("enq-email");
      const dateInput = document.getElementById("enq-date");
      const guestsSelect = document.getElementById("enq-guests");
      const timeSelect = document.getElementById("enq-time");
      const submitBtn = document.getElementById("enq-submit-btn");

      let isValid = true;
      [nameInput, phoneInput, emailInput, dateInput].forEach(input => {
        if (!input.value.trim()) {
          input.style.borderColor = "var(--color-accent)";
          isValid = false;
        } else {
          input.style.borderColor = "";
        }
      });

      if (!isValid) return;

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value.trim())) {
        emailInput.style.borderColor = "var(--color-accent)";
        alert("Please enter a valid email address.");
        return;
      }

      if (phoneInput.value.length < 10) {
        phoneInput.style.borderColor = "var(--color-accent)";
        alert("Please enter a valid 10-digit phone number.");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting Enquiry...";

      let activeService = modal.getAttribute("data-active-service") || "Service Enquiry";
      let customDetails = [];

      if (activeService === "Birthday Party Booking") {
        customDetails.push(`Cake: ${document.getElementById("enq-birth-cake").value}`);
        customDetails.push(`Decor: ${document.getElementById("enq-birth-decor").value}`);
      } else if (activeService === "Events & Celebrations") {
        customDetails.push(`Event Type: ${document.getElementById("enq-event-type").value}`);
        customDetails.push(`Exclusivity: ${document.getElementById("enq-event-slot").value}`);
      } else if (activeService === "Corporate Events & Catering") {
        const comp = document.getElementById("enq-corp-name").value.trim();
        if (comp) customDetails.push(`Company: ${comp}`);
        customDetails.push(`AV: ${document.getElementById("enq-corp-av").value}`);
      } else if (activeService === "Catering Services") {
        const addr = document.getElementById("enq-cat-address").value.trim();
        if (addr) customDetails.push(`Venue: ${addr}`);
        customDetails.push(`Diet: ${document.getElementById("enq-cat-diet").value}`);
        customDetails.push(`Cuisine: ${document.getElementById("enq-cat-cuisine").value}`);
      } else if (activeService === "Celebration Packages") {
        const radio = document.querySelector('input[name="enq-package-select"]:checked');
        customDetails.push(`Package: ${radio ? radio.value : "Silver"}`);
      } else if (activeService === "Bulk & Pre-Orders") {
        const det = document.getElementById("enq-bulk-details").value.trim();
        if (det) customDetails.push(`Items: ${det}`);
        customDetails.push(`Fulfill: ${document.getElementById("enq-bulk-fulfillment").value}`);
      } else if (activeService === "Private Venue Booking") {
        customDetails.push(`Setup: ${document.getElementById("enq-venue-setup").value}`);
        customDetails.push(`Excl: ${document.getElementById("enq-venue-excl").value}`);
      }

      const extraNotes = document.getElementById("enq-notes").value.trim();
      if (extraNotes) {
        customDetails.push(`Note: ${extraNotes}`);
      }

      const payload = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        date: dateInput.value,
        time: timeSelect.value,
        partySize: parseInt(guestsSelect.value, 10),
        occasion: activeService,
        seating: "Enquiry Form",
        notes: customDetails.join(" | ")
      };

      try {
        const response = await fetch(`${API_BASE_URL}/api/bookings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error("Failed to submit enquiry.");
        }

        const data = await response.json();
        
        form.style.display = "none";
        const successView = document.getElementById("enq-success-view");
        
        document.getElementById("enq-success-id").textContent = data.bookingId || "GR-" + Math.floor(1000 + Math.random() * 9000);
        document.getElementById("enq-success-service-name").textContent = payload.occasion;
        document.getElementById("enq-success-date").textContent = payload.date;
        document.getElementById("enq-success-guests").textContent = `${payload.partySize} Guests`;
        document.getElementById("enq-success-name").textContent = payload.name;
        document.getElementById("enq-success-phone").textContent = payload.phone;

        successView.style.display = "block";
        form.reset();

      } catch (err) {
        console.error("Enquiry submission error:", err);
        alert("Error: " + err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Enquiry";
      }
    });
  }
}


