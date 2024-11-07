import { useEffect, useState } from 'react';
import { Alert, Badge } from 'react-bootstrap';
import { calculateRemainingTargets, getRecommendedCuisines, getMealTypeByTime } from '../../utils/nutritionHelper';

const SmartRecommendations = ({ nutritionData, onRecommendationSelect }) => {
    const [recommendations, setRecommendations] = useState([]);
    const currentMealType = getMealTypeByTime();

    useEffect(() => {
        const remaining = calculateRemainingTargets(
            {
                calories: nutritionData.calories.consumed,
                protein: nutritionData.protein.consumed,
                carbs: nutritionData.carbs.consumed,
                fats: nutritionData.fats.consumed
            },
            {
                calories: nutritionData.calories.target,
                protein: nutritionData.protein.target,
                carbs: nutritionData.carbs.target,
                fats: nutritionData.fats.target
            }
        );

        const recommendedCuisines = getRecommendedCuisines(remaining);
        setRecommendations(recommendedCuisines);
    }, [nutritionData]);

    if (!currentMealType || recommendations.length === 0) return null;

    return (
        <Alert variant="info" className="mb-3">
            <h6>Smart Recommendations for {currentMealType}</h6>
            <p className="mb-2">Based on your remaining nutrition targets, we recommend:</p>
            <div className="d-flex gap-2 flex-wrap">
                {recommendations.map(cuisine => (
                    <Badge 
                        key={cuisine}
                        bg="primary" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => onRecommendationSelect(cuisine)}
                    >
                        {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                    </Badge>
                ))}
            </div>
        </Alert>
    );
};

export default SmartRecommendations; 