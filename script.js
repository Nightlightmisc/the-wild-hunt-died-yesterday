document.addEventListener('DOMContentLoaded', () => {
  const navLinksMenu = document.getElementById('nav-links');
  const menuToggle = document.getElementById('menu-toggle');
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const categorySelect = document.getElementById('category-select');
  const recipeContent = document.getElementById('recipe-content');
  const statusMsg = document.getElementById('status-msg');
  const recipesGrid = document.getElementById('recipes-grid');
  
  // Modal elements
  const modalOverlay = document.getElementById('modal-overlay');
  const closeModalBtn = document.getElementById('close-modal');
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalCuisine = document.getElementById('modal-cuisine');
  const modalCategory = document.getElementById('modal-category');
  const modalCalories = document.getElementById('modal-calories');
  const modalIngredients = document.getElementById('modal-ingredients');
  const modalInstructions = document.getElementById('modal-instructions');

  // About Modal elements
  const aboutLink = document.getElementById('about-link');
  const aboutOverlay = document.getElementById('about-overlay');
  const closeAboutModalBtn = document.getElementById('close-about-modal');

  let allRecipes = [];
  let recipes = [];
  let categories = [];
  let isOpen = false;

  // Toggle mobile navigation menu
  menuToggle.addEventListener('click', () => {
    isOpen = !isOpen;
    if (isOpen) {
      navLinksMenu.classList.add('nav-active');
      document.getElementById('bar-top').classList.add('open-top');
      document.getElementById('bar-mid').classList.add('open-mid');
      document.getElementById('bar-bot').classList.add('open-bot');
    } else {
      navLinksMenu.classList.remove('nav-active');
      document.getElementById('bar-top').classList.remove('open-top');
      document.getElementById('bar-mid').classList.remove('open-mid');
      document.getElementById('bar-bot').classList.remove('open-bot');
    }
  });

  // Fetch all recipes from DummyJSON
  const fetchRecipes = async (query = '', category = '') => {
    statusMsg.style.display = 'block';
    statusMsg.className = 'status-msg';
    statusMsg.textContent = 'Loading recipes...';
    recipesGrid.style.display = 'none';

    try {
      if (allRecipes.length === 0) {
        const response = await fetch('https://dummyjson.com/recipes?limit=50');
        if (!response.ok) throw new Error('Failed to fetch recipes. Please try again.');
        
        const data = await response.json();
        allRecipes = data.recipes || [];

        // Extract unique categories
        const uniqueCats = [...new Set(allRecipes.map(r => r.mealType?.[0] || r.cuisine))];
        categories = uniqueCats.filter(Boolean);
        
        // Populate category dropdown
        categorySelect.innerHTML = '<option value="">All Categories</option>';
        categories.forEach(cat => {
          const opt = document.createElement('option');
          opt.value = cat;
          opt.textContent = cat;
          categorySelect.appendChild(opt);
        });
      }

      let filtered = allRecipes;

      if (category) {
        filtered = filtered.filter(r => 
          (r.mealType && r.mealType.includes(category)) || r.cuisine === category
        );
      }

      if (query.trim()) {
        const term = query.trim().toLowerCase();
        filtered = filtered.filter(r => 
          r.name.toLowerCase().includes(term) ||
          r.cuisine.toLowerCase().includes(term) ||
          r.ingredients.some(ing => ing.toLowerCase().includes(term))
        );
      }

      recipes = filtered.map(formatRecipeData);
      renderRecipes();

    } catch (error) {
      statusMsg.style.display = 'block';
      statusMsg.className = 'status-msg error';
      statusMsg.textContent = error.message;
      console.error('Error fetching recipes:', error);
    }
  };

  const formatRecipeData = (recipe) => ({
    id: recipe.id,
    name: recipe.name,
    cuisine: recipe.cuisine || 'General',
    category: recipe.mealType ? recipe.mealType.join(', ') : 'General',
    image: recipe.image,
    caloriesPerServing: recipe.caloriesPerServing ? `${recipe.caloriesPerServing} kcal` : 'N/A',
    ingredients: recipe.ingredients || [],
    instructions: recipe.instructions || []
  });

  const renderRecipes = () => {
    if (recipes.length === 0) {
      statusMsg.style.display = 'block';
      statusMsg.className = 'status-msg';
      statusMsg.textContent = 'No recipes found.';
      recipesGrid.style.display = 'none';
      return;
    }

    statusMsg.style.display = 'none';
    recipesGrid.style.display = 'grid';
    recipesGrid.innerHTML = '';

    recipes.forEach(recipe => {
      const card = document.createElement('div');
      card.className = 'recipe-card';
      card.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.name}" class="recipe-img" />
        <p>Food name: ${recipe.name}</p>
        <p>Country: ${recipe.cuisine}</p>
      `;
      card.addEventListener('click', () => openRecipeModal(recipe));
      recipesGrid.appendChild(card);
    });
  };

  const openRecipeModal = (recipe) => {
    modalImg.src = recipe.image;
    modalImg.alt = recipe.name;
    modalTitle.textContent = recipe.name;
    modalCuisine.textContent = recipe.cuisine;
    modalCategory.textContent = recipe.category;
    modalCalories.textContent = recipe.caloriesPerServing;

    modalIngredients.innerHTML = recipe.ingredients.map(i => `<li>${i}</li>`).join('');
    modalInstructions.innerHTML = recipe.instructions.map(s => `<li>${s}</li>`).join('');

    modalOverlay.style.display = 'flex';
  };

  closeModalBtn.addEventListener('click', () => {
    modalOverlay.style.display = 'none';
  });

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.style.display = 'none';
  });

  // About modal actions
  aboutLink.addEventListener('click', (e) => {
    e.preventDefault();
    aboutOverlay.style.display = 'flex';
    if (isOpen) menuToggle.click();
  });

  closeAboutModalBtn.addEventListener('click', () => {
    aboutOverlay.style.display = 'none';
  });

  aboutOverlay.addEventListener('click', (e) => {
    if (e.target === aboutOverlay) aboutOverlay.style.display = 'none';
  });

  // Search submission
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    categorySelect.value = '';
    fetchRecipes(searchInput.value, '');
  });

  // Category filter change
  categorySelect.addEventListener('change', () => {
    searchInput.value = '';
    fetchRecipes('', categorySelect.value);
  });

  // Initialize data fetch on load
  fetchRecipes();
});