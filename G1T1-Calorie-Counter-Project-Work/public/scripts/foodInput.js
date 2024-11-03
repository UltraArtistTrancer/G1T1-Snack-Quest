import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

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
                date: new Date().toISOString(),
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

// Form handling
document.addEventListener('DOMContentLoaded', () => {
    const foodForm = document.getElementById('food-form');
    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('error-message');
    
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
            mealType: document.getElementById('meal-type').value
        };

        const user = auth.currentUser;
        if (user) {
            try {
                await addFoodEntry(user.uid, foodData);
                foodForm.reset();
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
});

// Export functions for use in other files
export { getFoodHistory, addFoodEntry }; 