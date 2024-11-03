import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

async function addFoodEntry(userId, foodData) {
    try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            // Get existing food history or create empty array if it doesn't exist
            const currentFoodHistory = userDoc.data().foodHistory || [];
            
            // Create new food entry
            const newFoodEntry = {
                date: new Date().toISOString(),
                foodName: foodData.foodName,
                calories: Number(foodData.calories || 0),
                protein: Number(foodData.protein || 0),
                carbs: Number(foodData.carbs || 0),
                fat: Number(foodData.fat || 0),
                mealType: foodData.mealType
            };
            
            // Add new entry to history array
            const updatedFoodHistory = [...currentFoodHistory, newFoodEntry];
            
            // Update the document
            await updateDoc(userRef, {
                foodHistory: updatedFoodHistory
            });
            
            console.log("Food entry added successfully");
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error adding food entry:", error);
        throw error;
    }
}

// Example of how to connect this to your form
document.addEventListener('DOMContentLoaded', () => {
    const foodForm = document.getElementById('food-form');
    
    foodForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
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
                // Clear form or show success message
                foodForm.reset();
                alert('Food entry added successfully!');
            } catch (error) {
                alert('Error adding food entry. Please try again.');
            }
        } else {
            alert('Please log in to add food entries.');
        }
    });
}); 