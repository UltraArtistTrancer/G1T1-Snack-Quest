import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { getDailyNutrition, getUserData } from '../services/firebaseHelpers';
import Navigation from '../components/common/Navigation';
import ChatInterface from '../components/dashboard/ChatInterface';
import { NutritionCard } from "../components/dashboard/NutritionCard";
import { setupMealNotifications } from '../utils/notificationHelper';
import { fetchNutritionData } from '../services/geminiApi.js';

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
    const [emoji, setEmoji] = useState('😊'); // Default emoji
    const [waterIntake, setWaterIntake] = useState(0); // Daily water intake
    const [mealLogged, setMealLogged] = useState(false); // Track if meal is logged

    const processNutritionValue = (value) => {
        if (!value) return 0;
        if (typeof value === 'number') return value;
        const cleanValue = value.toString().replace(/,/g, '');
        return Math.round(parseFloat(cleanValue)) || 0;
    };

    const calculateAge = (birthdate) => {
        const today = new Date();
        const birthDate = new Date(birthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };

    // Fetch user data on component mount
    useEffect(() => {
        const loadUserData = async () => {
            try {
                if (user) {
                    const userData = await getUserData(user.uid);
                    if (userData) {
                        const nutritionResponse = fetchNutritionData({
                            sex: userData.sex,
                            age: calculateAge(userData.birthdate),
                            height: userData.height,
                            weight: userData.weight,
                            activity: userData.lifestyle,
                            goals: userData.goals
                        });
                        console.log(nutritionResponse);
                        await updateUserData(user.uid, {
                            ...nutritionResponse.data
                        });
                    }
                }
            } catch (err) {
                setError('Failed to load user data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, [user]);    

    const calculateDailyNutrition = useCallback(async () => {
        try {
            if (!user) return;
            const userData = await getUserData(user.uid);
            if (!userData) return;

            const now = new Date();
            console.log(Date())
            // const today = new Date().toISOString().split('T')[0];
            //console.log(today);
            // const formatDateInSingapore = (dateString) => {
            //     const date = new Date(dateString);
            //     const options = {
            //         year: 'numeric',
            //         month: '2-digit',  // Ensures two-digit month (e.g., '11')
            //         day: '2-digit',    // Ensures two-digit day (e.g., '09')
            //         timeZone: 'Asia/Singapore',  // Singapore timezone
            //     };
                
                // Get the date in the required format: YYYY-MM-DD
            //     const formattedDate = date.toLocaleDateString('en-US', options);
                
            //     // Convert the formatted date to 'YYYY-MM-DD' format
            //     const [month, day, year] = formattedDate.split('/');
            //     return `${year}-${month}-${day}`;
            // };
            const thisToday=now.toLocaleDateString('en-CA');
            const thisTime = now.toLocaleTimeString('en-US', { hour12: false });
            console.log(thisToday)
            console.log(thisTime)
            const dailyTotals = await getDailyNutrition(user.uid, thisToday);

            const processedTargets = {
                calories: processNutritionValue(userData.calorieNeeds),
                carbs: processNutritionValue(userData.carbohydrates),
                protein: processNutritionValue(userData.protein),
                fats: processNutritionValue(userData.fat)
            };

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

            // Calculate daily water intake (e.g., 30-35 ml per kg of body weight)
            const weightInKg = userData.weight; // Assuming weight is stored in userData
            const recommendedWaterIntake = weightInKg * 30; // in ml
            setWaterIntake(recommendedWaterIntake);
        } catch (error) {
            console.error('Error calculating daily nutrition:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        calculateDailyNutrition();
    }, [calculateDailyNutrition]);

    useEffect(() => {
        // Update emoji based on selected meal time
        switch (selectedMealTime) {
            case 'Breakfast':
                setEmoji('🍳');
                break;
            case 'Lunch':
                setEmoji('🥗');
                break;
            case 'Dinner':
                setEmoji('🍽️');
                break;
            case 'Snack':
                setEmoji('🍏');
                break;
            default:
                setEmoji('😊');
        }
    }, [selectedMealTime]);

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
                <h2 className="text-center mb-4">Current Progress {emoji}</h2>
                <p className="text-center">Stay hydrated! Your recommended daily water intake is {waterIntake} ml.</p>
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