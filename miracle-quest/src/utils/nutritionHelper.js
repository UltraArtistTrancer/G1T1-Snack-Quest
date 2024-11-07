export const calculateRemainingTargets = (consumed, targets) => {
    return {
        calories: Math.max(0, targets.calories - consumed.calories),
        protein: Math.max(0, targets.protein - consumed.protein),
        carbs: Math.max(0, targets.carbs - consumed.carbs),
        fats: Math.max(0, targets.fats - consumed.fats)
    };
};

export const getRecommendedCuisines = (remaining) => {
    const recommendations = [];
    
    // High protein needs
    if (remaining.protein > 20) {
        recommendations.push('korean', 'japanese', 'western');
    }
    
    // High carbs needs
    if (remaining.carbs > 50) {
        recommendations.push('chinese', 'japanese', 'vietnamese');
    }
    
    // High fat needs
    if (remaining.fats > 15) {
        recommendations.push('western', 'korean', 'thai');
    }

    // Low calorie options
    if (remaining.calories < 500) {
        recommendations.push('vietnamese', 'japanese', 'thai');
    }

    return [...new Set(recommendations)];
};

export const getMealTypeByTime = () => {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 15) return 'lunch';
    if (hour >= 15 && hour < 22) return 'dinner';
    return null;
};

export const calculateDailyNeeds = (weight, height, age, sex, activityLevel, goal) => {
    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (sex.toLowerCase() === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Activity Level Multipliers
    const activityMultipliers = {
        'sedentary': 1.2,      // Little or no exercise
        'light': 1.375,        // Light exercise/sports 1-3 days/week
        'moderate': 1.55,      // Moderate exercise/sports 3-5 days/week
        'active': 1.725,       // Hard exercise/sports 6-7 days/week
        'very_active': 1.9     // Very hard exercise & physical job or training twice per day
    };

    // Calculate TDEE (Total Daily Energy Expenditure)
    const tdee = bmr * activityMultipliers[activityLevel.toLowerCase()];

    // Adjust calories based on goal
    let calorieNeeds = tdee;
    switch(goal.toLowerCase()) {
        case 'lose':
            calorieNeeds *= 0.85; // 15% deficit
            break;
        case 'gain':
            calorieNeeds *= 1.15; // 15% surplus
            break;
        // 'maintain' uses tdee as is
    }

    // Calculate macronutrient needs
    const proteinNeeds = weight * 2.2; // 2.2g per kg of body weight
    const fatNeeds = (calorieNeeds * 0.25) / 9; // 25% of calories from fat
    const carbNeeds = (calorieNeeds - (proteinNeeds * 4 + fatNeeds * 9)) / 4;

    return {
        calories: Math.round(calorieNeeds),
        protein: Math.round(proteinNeeds),
        carbs: Math.round(carbNeeds),
        fats: Math.round(fatNeeds)
    };
};

// Example usage in Account.jsx when saving user data:
const calculateAndSaveNutrition = async (formData) => {
    const dailyNeeds = calculateDailyNeeds(
        parseFloat(formData.weight),
        parseFloat(formData.height),
        calculateAge(formData.birthdate),
        formData.sex,
        formData.lifestyle,
        formData.goals
    );

    // Save these values along with other user data
    const updatedUserData = {
        ...formData,
        calorieNeeds: dailyNeeds.calories,
        protein: dailyNeeds.protein,
        carbohydrates: dailyNeeds.carbs,
        fat: dailyNeeds.fats
    };
    
    // Save to Firebase
    return updatedUserData;
}; 