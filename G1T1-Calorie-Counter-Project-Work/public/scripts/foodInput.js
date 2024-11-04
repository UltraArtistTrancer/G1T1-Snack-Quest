import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { singaporeFoodDB } from './singaporeFoodDB.js';

// Initialize Firebase (add your config)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Food history functions
async function getFoodHistory(userId) {
    try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            const foodHistory = userDoc.data().foodHistory || [];
            return foodHistory.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort newest first
        }
        return [];
    } catch (error) {
        console.error("Error getting food history:", error);
        throw error;
    }
}

async function addFoodEntry(userId, foodData) {
    try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            const currentFoodHistory = userDoc.data().foodHistory || [];
            
            const newFoodEntry = {
                date: foodData.datetime || new Date().toISOString(),
                foodName: foodData.foodName,
                calories: Number(foodData.calories || 0),
                protein: Number(foodData.protein || 0),
                carbs: Number(foodData.carbs || 0),
                fat: Number(foodData.fat || 0),
                mealType: foodData.mealType
            };
            
            const updatedFoodHistory = [...currentFoodHistory, newFoodEntry];
            
            await updateDoc(userRef, {
                foodHistory: updatedFoodHistory
            });
            
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error adding food entry:", error);
        throw error;
    }
}

// Add this food aliases object for different spellings
const foodAliases = {
    "bak chor mee": ["bak chor mee", "bcm", "minced meat noodles", "bak chor mian"],
    "chicken rice": ["chicken rice", "hainanese chicken rice", "ji fan", "white chicken rice"],
    "laksa": ["laksa", "curry laksa", "penang laksa"],
    "char kway teow": ["char kway teow", "ckw", "char kuay teow", "char kuey teow"],
    "nasi lemak": ["nasi lemak", "coconut rice", "malay rice"],
    "roti prata": ["roti prata", "prata", "roti canai"],
    "hainanese curry rice": ["hainanese curry rice", "curry rice"],
    "fish head curry": ["fish head curry", "curry fish head"],
    "satay": ["satay", "sate", "saté"],
    "hokkien mee": ["hokkien mee", "hokkien noodles"],
    "bee hoon goreng": ["bee hoon goreng", "fried bee hoon"],
    "murtabak": ["murtabak", "murtabak roti"],
    "curry puff": ["curry puff", "puff pastry", "curry pastry"],
    "bak kut teh": ["bak kut teh", "pork rib soup"],
    "popiah": ["popiah", "spring rolls", "fresh spring rolls"],
    "rojak": ["rojak", "fruit rojak"],
    "kaya toast": ["kaya toast", "kaya bread"],
    "mee siam": ["mee siam", "spicy noodle"],
    "otak otak": ["otak otak", "spicy fish cake"],
    "mee goreng": ["mee goreng", "fried noodles"],
    "teh tarik": ["teh tarik", "pulled tea"],
    "kway chap": ["kway chap", "flat rice noodle soup"],
    "fish soup": ["fish soup", "fish slice soup"],
    "yong tau foo": ["yong tau foo", "stuffed tofu"],
    "char siew rice": ["char siew rice", "barbecue pork rice"],
    "sambal stingray": ["sambal stingray", "stingray sambal"],
    "ngoh hiang": ["ngoh hiang", "five spice roll"],
    "lor mee": ["lor mee", "braised noodle soup"],
    "claypot rice": ["claypot rice", "clay pot rice"],
    "tahu goreng": ["tahu goreng", "fried tofu"],
    "ikan bakar": ["ikan bakar", "grilled fish"],
    "bee hoon soup": ["bee hoon soup", "rice vermicelli soup"]
};


// Modified searchLocalFood function to handle different spellings
async function searchLocalFood(query) {
    query = query.toLowerCase().trim();
    
    // First, check if the query matches any aliases
    const matchedFood = Object.entries(foodAliases).find(([_, aliases]) => 
        aliases.some(alias => 
            alias.includes(query) || query.includes(alias) ||
            // Add Levenshtein distance check for typos
            aliases.some(alias => levenshteinDistance(query, alias) <= 2)
        )
    );
    
    if (matchedFood) {
        const [mainName] = matchedFood;
        return [singaporeFoodDB[mainName]];
    }
    
    // Fallback to direct database search
    const results = Object.entries(singaporeFoodDB).filter(([key]) => 
        key.includes(query) || query.includes(key) ||
        levenshteinDistance(query, key) <= 2
    );
    
    return results.map(([_, value]) => value);
}

// Add Levenshtein distance function for fuzzy matching
function levenshteinDistance(str1, str2) {
    const track = Array(str2.length + 1).fill(null).map(() =>
        Array(str1.length + 1).fill(null));
    
    for(let i = 0; i <= str1.length; i++) track[0][i] = i;
    for(let j = 0; j <= str2.length; j++) track[j][0] = j;
    
    for(let j = 1; j <= str2.length; j++) {
        for(let i = 1; i <= str1.length; i++) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1,
                track[j - 1][i] + 1,
                track[j - 1][i - 1] + indicator
            );
        }
    }
    
    return track[str2.length][str1.length];
}

// Form handling
document.addEventListener('DOMContentLoaded', () => {
    const foodForm = document.getElementById('food-form');
    const foodNameInput = document.getElementById('food-name');
    const suggestionsDiv = document.getElementById('suggestions');
    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('error-message');
    
    let typingTimer;
    
    foodNameInput?.addEventListener('input', (e) => {
        clearTimeout(typingTimer);
        const query = e.target.value;
        
        typingTimer = setTimeout(async () => {
            if (query.length < 2) {
                suggestionsDiv.style.display = 'none';
                return;
            }
            
            const results = await searchLocalFood(query);
            
            if (results.length > 0) {
                // Show suggestions
                suggestionsDiv.innerHTML = results.map(food => `
                    <div class="suggestion-item" data-food='${JSON.stringify(food)}'>
                        ${food.foodName}
                    </div>
                `).join('');
                suggestionsDiv.style.display = 'block';
                
                // Add click handlers for suggestions
                document.querySelectorAll('.suggestion-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const foodData = JSON.parse(item.dataset.food);
                        foodNameInput.value = foodData.foodName;
                        document.getElementById('calories').value = foodData.calories;
                        document.getElementById('protein').value = foodData.protein;
                        document.getElementById('carbs').value = foodData.carbs;
                        document.getElementById('fat').value = foodData.fat;
                        suggestionsDiv.style.display = 'none';
                    });
                });
            } else {
                suggestionsDiv.style.display = 'none';
            }
        }, 300);
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!suggestionsDiv.contains(e.target) && e.target !== foodNameInput) {
            suggestionsDiv.style.display = 'none';
        }
    });

    foodForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Hide any existing messages
        if (successMessage) successMessage.style.display = 'none';
        if (errorMessage) errorMessage.style.display = 'none';
        
        const foodData = {
            foodName: document.getElementById('food-name').value,
            calories: document.getElementById('calories').value,
            protein: document.getElementById('protein').value,
            carbs: document.getElementById('carbs').value,
            fat: document.getElementById('fat').value,
            mealType: document.getElementById('meal-type').value,
            datetime: document.getElementById('meal-datetime').value
        };

        const user = auth.currentUser;
        if (user) {
            try {
                await addFoodEntry(user.uid, foodData);
                foodForm.reset();
                document.getElementById('meal-datetime').value = new Date().toISOString().slice(0, 16);
                if (successMessage) {
                    successMessage.textContent = 'Food entry added successfully!';
                    successMessage.style.display = 'block';
                } else {
                    alert('Food entry added successfully!');
                }
            } catch (error) {
                if (errorMessage) {
                    errorMessage.textContent = 'Error adding food entry. Please try again.';
                    errorMessage.style.display = 'block';
                } else {
                    alert('Error adding food entry. Please try again.');
                }
            }
        } else {
            if (errorMessage) {
                errorMessage.textContent = 'Please log in to add food entries.';
                errorMessage.style.display = 'block';
            } else {
                alert('Please log in to add food entries.');
            }
        }
    });

    // Add this to set default datetime when page loads
    const datetimeInput = document.getElementById('meal-datetime');
    if (datetimeInput) {
        datetimeInput.value = new Date().toISOString().slice(0, 16);
    }
});

// Export functions for use in other files
export { getFoodHistory, addFoodEntry }; 