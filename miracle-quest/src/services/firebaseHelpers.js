import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    query,
    where,
    getDocs
} from 'firebase/firestore';
import { db } from './firebase';
import {DEFAULT_NUTRITION, getNutritionFromGemini} from "./../services/geminiApi";

/**
 * Adds a new food entry with nutrition information
 */
export const addFoodEntry = async (userId, date, mealTime, foodItem) => {
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            throw new Error('User not found');
        }

        // Get nutrition info for the food item
        const nutritionInfo = await getNutritionFromGemini(foodItem);

        if (nutritionInfo === DEFAULT_NUTRITION) {
            return DEFAULT_NUTRITION;
        }

        // Get current foodInput or initialize it
        const userData = userSnap.data();
        const currentFoodInput = userData.foodInput || {};

        // Normalize mealTime to lowercase to ensure consistency
        const normalizedMealTime = mealTime.toLowerCase();

        // Create update object with new food entry
        const newFoodInput = {
            ...currentFoodInput,
            [date]: {
                ...currentFoodInput[date],
                [normalizedMealTime]: {
                    ...(currentFoodInput[date]?.[normalizedMealTime] || {}),
                    [foodItem]: nutritionInfo
                }
            }
        };

        // Update the document with new food entry
        await updateDoc(userRef, {
            foodInput: newFoodInput
        });

        return nutritionInfo;
    } catch (error) {
        console.error('Error adding food entry:', error);
        throw error;
    }
};

/**
 * Gets all food entries for a specific date
 */
export const getDailyFoodEntries = async (userId, date) => {
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            throw new Error('User not found');
        }

        const userData = userSnap.data();
        return userData.foodInput?.[date] || {};
    } catch (error) {
        console.error('Error getting daily food entries:', error);
        throw error;
    }
};

/**
 * Gets total nutrition for a specific date
 */
export const getDailyNutrition = async (userId, date) => {
    try {
        const dailyEntries = await getDailyFoodEntries(userId, date);

        const totals = {
            calories: 0,
            carbs: 0,
            protein: 0,
            fats: 0
        };

        // Sum up nutrition values from all meals
        Object.values(dailyEntries).forEach(mealEntries => {
            Object.values(mealEntries).forEach(nutritionInfo => {
                totals.calories += nutritionInfo.calories || 0;
                totals.carbs += nutritionInfo.carbs || 0;
                totals.protein += nutritionInfo.protein || 0;
                totals.fats += nutritionInfo.fats || 0;
            });
        });

        return totals;
    } catch (error) {
        console.error('Error calculating daily nutrition:', error);
        throw error;
    }
};

export const deleteFoodEntry = async (userId, entry) => {
    const { date, mealTime, foodName } = entry;
    try {
        const userRef = doc(db, "users", userId);
        const userData = await getDoc(userRef);

        if (userData.exists()) {
            const foodInput = userData.data().foodInput || {};

            // Remove the specific entry
            if (foodInput[date]?.[mealTime]?.[foodName]) {
                delete foodInput[date][mealTime][foodName];

                // Clean up empty objects
                if (Object.keys(foodInput[date][mealTime]).length === 0) {
                    delete foodInput[date][mealTime];
                }
                if (Object.keys(foodInput[date]).length === 0) {
                    delete foodInput[date];
                }

                // Update the document
                await updateDoc(userRef, { foodInput });
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('Error deleting food entry:', error);
        throw error;
    }
};

export const getUserData = async (userId) => {
    try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error getting user data:", error);
        throw error;
    }
};

export const updateUserData = async (userId, data) => {
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, data);
    } catch (error) {
        console.error("Error updating user data:", error);
        throw error;
    }
};

export const createUserData = async (userId, data) => {
    try {
        const userRef = doc(db, "users", userId);
        await setDoc(userRef, {
            ...data,
            createdAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error creating user data:", error);
        throw error;
    }
};

export const isUsernameAvailable = async (username, currentUserId = null) => {
    try {
        const userRef = collection(db, 'users');
        const q = query(userRef, where('username', '==', username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) return true;

        if (currentUserId) {
            const doc = querySnapshot.docs[0];
            return doc.id === currentUserId;
        }

        return false;
    } catch (error) {
        console.error("Error checking username:", error);
        throw error;
    }
};

export const getLeaderboardData = async (limit = 10) => {
    try {
        const usersRef = collection(db, "users");
        const querySnapshot = await getDocs(usersRef);

        const users = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            users.push({
                id: doc.id,
                username: data.username,
                weight: data.weight
            });
        });

        users.sort((a, b) => b.weight - a.weight);

        return users.slice(0, limit);
    } catch (error) {
        console.error("Error getting leaderboard data:", error);
        throw error;
    }
};