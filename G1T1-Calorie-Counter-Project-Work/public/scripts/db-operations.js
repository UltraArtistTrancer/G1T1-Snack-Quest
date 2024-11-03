import { db } from './firebase-config.js';
import { doc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

export async function addFoodEntry(userId, foodData) {
    const userRef = doc(db, "users", userId);
    
    const newEntry = {
        date: new Date().toISOString(),
        foodName: foodData.foodName,
        nutrition: {
            calories: Number(foodData.calories),
            carbs: Number(foodData.carbs),
            protein: Number(foodData.protein),
            fat: Number(foodData.fat)
        },
        mealType: foodData.mealType,
        timestamp: Date.now()
    };

    return updateDoc(userRef, {
        foodHistory: arrayUnion(newEntry)
    });
}

export async function getFoodHistory(userId) {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data().foodHistory || [] : [];
} 