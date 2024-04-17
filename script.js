const submitBtn = document.getElementById('submitBtn');
const ingredientInput = document.getElementById('ingredientInput');
const mealList = document.getElementById('mealList');
const randomMealCard = document.getElementById('randomMeal');
const loadingSpinner = document.getElementById('loadingSpinner');
const knnLogo = document.getElementById('knn-logo');

// Function to handle key press event in the input field
ingredientInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        submitBtn.click();
    }
});


// Add an event listener to the KNN logo image
knnLogo.addEventListener('click', () => {
    // Display a message alerting the user they are on the home page
    alert('You are right on the home page!');
});

// Function to fetch meals based on multiple ingredients
async function fetchMealsByIngredients(ingredients) {
    const ingredientArray = ingredients.split(',').map(ingredient => ingredient.trim());
    const promises = [];
    
    // Loop through each ingredient to fetch meals
    for (const ingredient of ingredientArray) {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);
        const data = await response.json();
        const meals = data.meals.map(meal => ({ ...meal, idMeal: meal.idMeal }));
        promises.push(meals);
    }
    
    // Wait for all promises to resolve
    const mealsArray = await Promise.all(promises);
    
    // Find meals that match all ingredients
    const matchingMeals = mealsArray.reduce((accumulator, currentValue) => {
        // If accumulator is empty, return currentValue
        if (accumulator.length === 0) {
            return currentValue;
        }
        
        // Otherwise, filter out meals that are not in currentValue
        return accumulator.filter(meal => currentValue.some(item => item.idMeal === meal.idMeal));
    }, []);
    
    return matchingMeals;
}

// Function to fetch recipe details by meal ID
async function fetchRecipeById(id) {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    const data = await response.json();
    return data.meals[0];
}

// Function to display recipe details
function displayRecipe(recipe) {
    mealList.innerHTML = '';
    const recipeCard = document.createElement('div');
    recipeCard.classList.add('card', 'row');
    recipeCard.innerHTML = `
        <div class="col-md-6">
            <img src="${recipe.strMealThumb}" class="card-img-top" alt="${recipe.strMeal}">
            <div class="card-body">
                <h5 class="card-title">${recipe.strMeal}</h5>
                <h6 class="card-subtitle mb-2 text-muted">Ingredients:</h6>
                <ul class="list-group mb-3">
                    ${getIngredientsList(recipe)}
                </ul>
            </div>
        </div>
        <div class="col-md-6">
            <div class="card-body">
                <h5 class="card-title">Instructions:</h5>
                <p class="card-text">${recipe.strInstructions}</p>
            </div>
        </div>
    `;
    mealList.appendChild(recipeCard);
}

// Function to generate list of ingredients
function getIngredientsList(recipe) {
    let ingredientsList = '';
    for (let i = 1; i <= 20; i++) {
        const ingredientName = recipe[`strIngredient${i}`];
        const ingredientMeasure = recipe[`strMeasure${i}`];
        if (ingredientName && ingredientName.trim() !== '') {
            ingredientsList += `<li class="list-group-item">${ingredientName} - ${ingredientMeasure}</li>`;
        }
    }
    return ingredientsList;
}

// Event listener for submit button
submitBtn.addEventListener('click', async () => {
    console.log('Submit button clicked');
    const ingredients = ingredientInput.value;
    try {
        showLoadingSpinner();
        const meals = await fetchMealsByIngredients(ingredients);
        hideLoadingSpinner();
        if (meals.length > 0) {
            displayMeals(meals);
        } else {
            displayError('No meals found. Please try again with different ingredients.');
        }
    } catch (error) {
        console.error('Error fetching meals:', error);
        hideLoadingSpinner();
        displayError('An error occurred while fetching meals. Please try again later.');
    }
});

// Event listener for meal cards
mealList.addEventListener('click', async (event) => {
    console.log('Meal card clicked');
    const mealCard = event.target.closest('.meal-card');
    if (mealCard) {
        const mealId = mealCard.dataset.id;
        try {
            showLoadingSpinner();
            const meal = await fetchRecipeById(mealId); // Change to fetchRecipeById
            hideLoadingSpinner();
            displayMealDetails(meal);
        } catch (error) {
            console.error('Error fetching meal details:', error);
            hideLoadingSpinner();
            displayError('An error occurred while fetching meal details. Please try again later.');
        }
    }
});

// Function to display suggested meals with nutrient content
function displayMeals(meals) {
    mealList.innerHTML = '';
    meals.forEach(meal => {
        const mealCard = document.createElement('div');
        mealCard.classList.add('col-md-3', 'mb-3', 'meal-card');
        mealCard.setAttribute('data-id', meal.idMeal); // Set data attribute for meal ID
        mealCard.innerHTML = `
            <div class="card h-100">
                <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
                <div class="card-body">
                    <h5 class="card-title">${meal.strMeal}</h5>
                    <p class="card-text">Nutrients: Protein: ${getRandomNutrient()}, Carbs: ${getRandomNutrient()}, Fat: ${getRandomNutrient()}</p>
                </div>
            </div>
        `;
        mealList.appendChild(mealCard);
    });
}

// Function to display meal details (including ingredients, instructions, and nutrients)
function displayMealDetails(meal) {
    mealList.innerHTML = ''; // Clear the mealList container

    // Create a new big card for the clicked meal
    const mealDetails = document.createElement('div');
    mealDetails.classList.add('card', 'row', 'mt-3');
    mealDetails.innerHTML = `
        <div class="col-md-6">
            <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
            <h6 class="card-subtitle mb-2 text-muted mt-3">Ingredients :</h6>
            <ul class="list-group mb-3">
                ${getIngredientsList(meal)}
            </ul>
        </div>
        <div class="col-md-6">
            <div class="card-body">
                <h5 class="card-title">${meal.strMeal}</h5>
                <h6 class="card-subtitle mb-2 text-muted">Instructions:</h6>
                <ol class="list-group mb-3">
                    ${getInstructionsList(meal)}
                </ol>
                <p class="card-text">Nutrients: Protein: ${getRandomNutrient()}, Carbs: ${getRandomNutrient()}, Fat: ${getRandomNutrient()}</p>
            </div>
        </div>
    `;

    // Append the new big card to the mealList container
    mealList.appendChild(mealDetails);
}




// Function to generate random nutrient content
function getRandomNutrient() {
    return (Math.random() * 10).toFixed(2); // Placeholder random nutrient value
}

// Function to display error message
function displayError(message) {
    mealList.innerHTML = `<p class="text-danger">${message}</p>`;
}

// Function to show loading spinner
function showLoadingSpinner() {
    loadingSpinner.classList.remove('d-none');
}

// Function to hide loading spinner
function hideLoadingSpinner() {
    loadingSpinner.classList.add('d-none');
}

// Function to fetch a random meal
async function fetchRandomMeal() {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const data = await response.json();
    return data.meals[0];
}

// Function to display random meal with ingredient list
function displayRandomMeal(meal) {
    randomMealCard.innerHTML = ''; // Make sure this is targeting the correct element
    const randomMealContent = document.createElement('div');
    randomMealContent.classList.add('card');
    randomMealContent.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">Random Meal</h5>
            <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
            <div class="card-body">
                <h5 class="card-title">${meal.strMeal}</h5>
                <h6 class="card-subtitle mb-2 text-muted">Ingredients:</h6>
                <ol class="list-group mb-3">
                    ${getIngredientsNumberedList(meal)}
                </ol>
                <h6 class="card-subtitle mb-2 text-muted">Instructions:</h6>
                <ol class="list-group">
                    ${getInstructionsList(meal)}
                </ol>
                <p class="card-text">Nutrients: Protein: ${getRandomNutrient()}, Carbs: ${getRandomNutrient()}, Fat: ${getRandomNutrient()}</p>
            </div>
        </div>
    `;
    randomMealCard.appendChild(randomMealContent);

    // Display ingredients in the "Buy these ingredients next time you're out" card
    displayIngredientsInBuyIngredients(meal);
}


// Function to generate numbered list of ingredients
function getIngredientsNumberedList(meal) {
    let ingredientsList = '';
    for (let i = 1; i <= 20; i++) {
        const ingredientName = meal[`strIngredient${i}`];
        const ingredientMeasure = meal[`strMeasure${i}`];
        if (ingredientName && ingredientName.trim() !== '') {
            ingredientsList += `<li class="list-group-item">${ingredientName} - ${ingredientMeasure}</li>`;
        }
    }
    return ingredientsList;
}

// Function to display ingredients in the "Buy these ingredients next time you're out" card
function displayIngredientsInBuyIngredients(meal) {
    const ingredientList = document.getElementById('ingredientList');
    ingredientList.innerHTML = getIngredientsNumberedList(meal);
}

// Function to generate list of ingredients
function getIngredientsList(meal) {
    let ingredientsList = '';
    for (let i = 1; i <= 20; i++) {
        const ingredientName = meal[`strIngredient${i}`];
        const ingredientMeasure = meal[`strMeasure${i}`];
        if (ingredientName && ingredientName.trim() !== '') {
            ingredientsList += `<li class="list-group-item">${ingredientName} - ${ingredientMeasure}</li>`;
        }
    }
    return ingredientsList;
}

// Function to generate list of cooking instructions
function getInstructionsList(meal) {
    const instructions = meal.strInstructions.split('\n').filter(instruction => instruction.trim() !== '');
    let instructionsList = '';
    instructions.forEach(instruction => {
        instructionsList += `<li class="list-group-item">${instruction}</li>`;
    });
    return instructionsList;
}

// Display a random meal when the page loads
window.addEventListener('DOMContentLoaded', async () => {
    const randomMeal = await fetchRandomMeal();
    displayRandomMeal(randomMeal);
});
