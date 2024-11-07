import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import {getDailyNutrition, getUserData} from '../services/firebaseHelpers';
import Navigation from '../components/common/Navigation';
import ChatInterface from '../components/dashboard/ChatInterface';
import { NutritionCard } from "../components/dashboard/NutritionCard";
import { setupMealNotifications } from '../utils/notificationHelper';


const Home = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [nutritionData, setNutritionData] = useState({
        calories: { consumed: 0, target: 2500 },
        carbs: { consumed: 0, target: 300 },
        protein: { consumed: 0, target: 50 },
        fats: { consumed: 0, target: 70 }
    });
    const [selectedMealTime, setSelectedMealTime] = useState('');

    const processNutritionValue = (value) => {
        if (!value) return 0;

        if (typeof value === 'number') return value;

        const cleanValue = value.toString().replace(/,/g, '');

        if (cleanValue.includes('-')) {
            const [, max] = cleanValue.split('-').map(v => parseFloat(v.trim()));
            return Math.round(max);
        }

        return Math.round(parseFloat(cleanValue)) || 0;
    };

    const calculateDailyNutrition = useCallback(async () => {
        try {
            if (!user) return;

            const userData = await getUserData(user.uid);
            if (!userData) return;

            // Get today's date in YYYY-MM-DD format
            const today = new Date().toISOString().split('T')[0];

            // Get daily totals from the new data structure
            const dailyTotals = await getDailyNutrition(user.uid, today);

            console.log('Daily totals:', dailyTotals);
            console.log('Raw user data targets:', {
                calories: userData.calorieNeeds,
                carbs: userData.carbohydrates,
                protein: userData.protein,
                fat: userData.fat
            });

            // Process the nutrition targets
            const processedTargets = {
                calories: processNutritionValue(userData.calorieNeeds),
                carbs: processNutritionValue(userData.carbohydrates),
                protein: processNutritionValue(userData.protein),
                fats: processNutritionValue(userData.fat)
            };

            console.log('Processed targets:', processedTargets);

            // Update nutrition data with calculated values and processed targets
            setNutritionData({
                calories: {
                    consumed: dailyTotals.calories,
                    target: processedTargets.calories || 2500
                },
                carbs: {
                    consumed: dailyTotals.carbs,
                    target: processedTargets.carbs || 300
                },
                protein: {
                    consumed: dailyTotals.protein,
                    target: processedTargets.protein || 50
                },
                fats: {
                    consumed: dailyTotals.fats,
                    target: processedTargets.fats || 70
                }
            });
        } catch (error) {
            console.error('Error calculating daily nutrition:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        calculateDailyNutrition();
    }, [calculateDailyNutrition]);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                if (user) {
                    const userData = await getUserData(user.uid);
                    if (userData?.mealTimes) {
                        setupMealNotifications(userData.mealTimes);
                    }
                    // ... rest of the existing loadUserData code
                }
            } catch (err) {
                console.error('Error setting up notifications:', err);
            }
        };

        loadUserData();
    }, [user]);

    if (loading) {
        return (
            <>
                <Navigation />
                <Container className="py-5 text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </Container>
            </>
        );
    }

    return (
        <>
            <Navigation />
            <Container fluid className="py-4">
                <h2 className="text-center mb-4">Current Progress</h2>

                {/* Nutrition Cards */}
                <Row className="mb-4">
                    <NutritionCard
                        title="Calories"
                        icon="⚡"
                        current={nutritionData.calories.consumed}
                        target={nutritionData.calories.target}
                        colorClass="text-primary"
                    />
                    <NutritionCard
                        title="Carbohydrates"
                        icon="🥖"
                        current={nutritionData.carbs.consumed}
                        target={nutritionData.carbs.target}
                        colorClass="text-success"
                    />
                    <NutritionCard
                        title="Protein"
                        icon="🍖"
                        current={nutritionData.protein.consumed}
                        target={nutritionData.protein.target}
                        colorClass="text-danger"
                    />
                    <NutritionCard
                        title="Fats"
                        icon="🧈"
                        current={nutritionData.fats.consumed}
                        target={nutritionData.fats.target}
                        colorClass="text-warning"
                    />
                </Row>

                {/* Chat Interface */}
                <Row>
                    <Col md={12}>
                        <Card className="shadow-sm">
                            <Card.Body>
                                <Form className="mb-3">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Select Meal Time</Form.Label>
                                        <Form.Select
                                            value={selectedMealTime}
                                            onChange={(e) => setSelectedMealTime(e.target.value)}
                                            required
                                        >
                                            <option value="">Choose meal time...</option>
                                            <option value="Breakfast">Breakfast</option>
                                            <option value="Lunch">Lunch</option>
                                            <option value="Dinner">Dinner</option>
                                            <option value="Snack">Snack</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Form>

                                <ChatInterface
                                    mealTime={selectedMealTime}
                                    onFoodLogged={calculateDailyNutrition}
                                />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default Home;