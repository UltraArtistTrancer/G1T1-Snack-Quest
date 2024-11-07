import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const CLIENT = new GoogleGenerativeAI(String(API_KEY));
const MODEL_NAME = "models/gemini-1.5-pro";
const MODEL = CLIENT.getGenerativeModel({
    model: MODEL_NAME
})

// Regular expressions for validation
const NUTRITION_RESPONSE_REGEX = /^calories\|(\d+)\|carbohydrates\|(\d+)\|protein\|(\d+)\|fats\|(\d+)$/;
const SAFE_FOOD_REGEX = /^[\w\s,()-]+$/;

// Default nutrition values
export const DEFAULT_NUTRITION = 'calories|0|carbohydrates|0|protein|0|fats|0';

// Sanitize and validate food input
const sanitizeFoodInput = (input) => {
    if (!input || typeof input !== 'string') return false;

    // Remove any potentially harmful characters and normalize
    const sanitized = input
        .trim()
        .toLowerCase()
        .replace(/[\u2018\u2019]/g, "'") // Smart quotes
        .replace(/[\u201C\u201D]/g, '"'); // Smart double quotes

    // Check if the sanitized input matches our safe pattern
    return SAFE_FOOD_REGEX.test(sanitized) ? sanitized : false;
};

// Validate nutrition response format
const validateNutritionResponse = (response) => {
    if (!response || typeof response !== 'string') return false;

    // Clean the response
    const cleaned = response
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '');

    // Check if response matches expected format
    const match = cleaned.match(NUTRITION_RESPONSE_REGEX);
    if (!match) return false;

    // Validate numeric ranges
    const [, calories, carbs, protein, fats] = match.map(Number);

    // Check for reasonable ranges
    const isValid = (
        calories >= 0 && calories <= 5000 &&
        carbs >= 0 && carbs <= 500 &&
        protein >= 0 && protein <= 200 &&
        fats >= 0 && fats <= 200
    );

    return isValid ? cleaned : false;
};

// Create safe nutrition query
const createNutritionQuery = (foodItem) => {
    const sanitizedFood = sanitizeFoodInput(foodItem);
    if (!sanitizedFood) return { query: '', error: 'Invalid food input' };

    // Create a constrained prompt that enforces the expected format
    const query = [
        'Provide only the nutritional values for the following food in this exact format:',
        'calories|X|carbohydrates|Y|protein|Z|fats|W',
        'where X, Y, Z, and W are whole numbers.',
        'Do not include any other text or information.',
        `If uncertain, return ${DEFAULT_NUTRITION}.`,
        `Food item: ${sanitizedFood}`
    ].join(' ');

    return { query, error: null };
};

// Process nutrition response
const processNutritionResponse = (response) => {
    const validatedResponse = validateNutritionResponse(response);
    return validatedResponse || DEFAULT_NUTRITION;
};

export const getNutritionFromGemini = async (foodItem) => {
    try {
        const { query, error} = createNutritionQuery(foodItem);

        let response;

        if (error) {
            response = DEFAULT_NUTRITION;
        } else {
            response = await MODEL.generateContent(query);
        }

        const data = await response.response;

        if (data === undefined) {
            return DEFAULT_NUTRITION;
        }

        const nutritionText = data?.text() || '';

        if (nutritionText.trim() === DEFAULT_NUTRITION) {
            return DEFAULT_NUTRITION;
        }

        const validatedResponse = processNutritionResponse(nutritionText);

        // Parse the nutrition values from the response
        const values = validatedResponse.split('|');
        const nutritionInfo = {
            calories: 0,
            carbs: 0,
            protein: 0,
            fats: 0
        };

        for (let i = 0; i < values.length - 1; i += 2) {
            const key = values[i]?.toLowerCase().trim();
            const value = parseInt(values[i + 1]) || 0;

            if (key.includes('calories')) nutritionInfo.calories = value;
            else if (key.includes('carbohydrates')) nutritionInfo.carbs = value;
            else if (key.includes('protein')) nutritionInfo.protein = value;
            else if (key.includes('fats')) nutritionInfo.fats = value;
        }

        return nutritionInfo;
    } catch (error) {
        console.error('Error getting nutrition from Gemini:', error);
        return {
            calories: 0,
            carbs: 0,
            protein: 0,
            fats: 0
        };
    }
};
// Add these new regex constants at the top
const NUTRITION_NEEDS_RESPONSE_REGEX = /^carbohydrates\|(\d+)\|protein\|(\d+)\|fat\|(\d+)\|fiber\|(\d+)\|calorieNeeds\|(\d+)$/i;
const PARTIAL_RESPONSE_REGEX = /carbohydrates\|(\d+)\|protein\|(\d+)\|fat\|(\d+)\|fiber\|(\d+)\|(\d+)$/i;

// Add this new helper function
const fixNutritionFormat = (response) => {
    if (!response) return null;

    // Clean the response
    const cleaned = response.trim().toLowerCase().replace(/\s+/g, '');

    // Check if already in correct format
    if (NUTRITION_NEEDS_RESPONSE_REGEX.test(cleaned)) {
        return cleaned;
    }

    // Try to fix common format issues
    const partialMatch = cleaned.match(PARTIAL_RESPONSE_REGEX);
    if (partialMatch) {
        // If the last number is missing "calorieNeeds|", add it
        const [, carbs, protein, fat, fiber, calories] = partialMatch;
        return `carbohydrates|${carbs}|protein|${protein}|fat|${fat}|fiber|${fiber}|calorieNeeds|${calories}`;
    }

    return null;
};

// Update the fetchNutritionData function
export const fetchNutritionData = async ({ sex, age, height, weight, activity, goals }) => {
    try {
        const DEFAULT_NUTRITION_NEEDS = "Calculation Failed";

        const query = [
            'Provide only the nutritional requirements for the following human in this exact format:',
            'carbohydrates|X|protein|Y|fat|Z|fiber|A|calorieNeeds|B',
            'where X, Y, Z, A, and B are whole numbers.',
            'Do not include any other text or information.',
            `If uncertain, return ${DEFAULT_NUTRITION_NEEDS}.`,
            'Human:',
            `Human Height: ${height} cm`,
            `Human Weight: ${weight} kg`,
            `Human Age: ${age} years`,
            `Human Gender: ${sex}`,
            `Human Activity Level: ${activity}`,
            `Human Exercise Goals: ${goals}`
        ].join('\n');

        const response = await MODEL.generateContent(query);
        const data = await response.response;
        let nutritionString = data?.text();

        console.log('Original response:', nutritionString);

        if (nutritionString === undefined || nutritionString === DEFAULT_NUTRITION_NEEDS) {
            return {
                error: true,
                message: 'Failed to get nutrition data from Gemini',
                data: null
            };
        }

        // Try to fix format issues
        const fixedFormat = fixNutritionFormat(nutritionString);
        if (!fixedFormat) {
            return {
                error: true,
                message: 'Invalid nutrition data format received',
                data: null
            };
        }

        nutritionString = fixedFormat;
        console.log('Fixed format:', nutritionString);

        // Parse the data into an object
        const values = nutritionString.split('|');
        const nutritionData = {};

        for (let i = 0; i < values.length; i += 2) {
            if (values[i] && values[i + 1]) {
                nutritionData[values[i]] = Math.round(parseFloat(values[i + 1]));
            }
        }

        // Validate that we have all required fields
        const requiredFields = ['carbohydrates', 'protein', 'fat', 'fiber', 'calorieNeeds'];
        for (const field of requiredFields) {
            if (!nutritionData[field]) {
                return {
                    error: true,
                    message: `There was an error in the calculation. Please resubmit the changes.`,
                    data: null
                };
            }
        }

        return {
            error: false,
            message: null,
            data: nutritionData
        };

    } catch (error) {
        console.error('Error fetching nutrition data:', error);
        return {
            error: true,
            message: 'Failed to calculate nutrition requirements. Please try again.',
            data: null
        };
    }
};