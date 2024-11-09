import { useState, useEffect } from 'react';
import { Container, Card, Spinner, Alert } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getDailyNutrition } from '../services/firebaseHelpers';
import { useAuth } from '../hooks/useAuth';
import Navigation from '../components/common/Navigation';

const AboutYou = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [nutritionData, setNutritionData] = useState([]);
    const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', 'year'

    useEffect(() => {
        const fetchNutritionData = async () => {
            try {
                const dates = [];
                const data = [];
                const today = new Date();
                let startDate = new Date();
                
                // Calculate date range based on selected timeRange
                switch (timeRange) {
                    case 'week':
                        startDate.setDate(today.getDate() - 6);
                        break;
                    case 'month':
                        startDate.setMonth(today.getMonth() - 1);
                        break;
                    case 'year':
                        startDate.setFullYear(today.getFullYear() - 1);
                        break;
                    default:
                        startDate.setDate(today.getDate() - 6);
                }

                // Generate dates array
                for (let date = new Date(startDate); date <= today; date.setDate(date.getDate() + 1)) {
                    dates.push(date.toISOString().split('T')[0]);
                }

                // Fetch nutrition data for each date
                for (const date of dates) {
                    const dailyNutrition = await getDailyNutrition(user.uid, date);
                    data.push({
                        date,
                        calories: dailyNutrition.calories,
                        protein: dailyNutrition.protein,
                        carbs: dailyNutrition.carbs,
                        fats: dailyNutrition.fats
                    });
                }

                setNutritionData(data);
            } catch (err) {
                console.error('Error fetching nutrition data:', err);
                setError('Failed to load nutrition data');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchNutritionData();
        }
    }, [user, timeRange]);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
    
        const options = {
            month: 'short',
            day: 'numeric',
            timeZone: 'America/Halifax', // Use Halifax timezone
        };
    
        switch (timeRange) {
            case 'week':
                return date.toLocaleDateString('en-US', options);
            case 'month':
                return date.toLocaleDateString('en-US', options);
            case 'year':
                return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'America/Halifax' });
            default:
                return date.toLocaleDateString('en-US', options);
        }
    };

    if (loading) {
        return (
            <>
                <Navigation />
                <Container className="py-5 text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </Container>
            </>
        );
    }

    return (
        <>
            <Navigation />
            <Container className="py-4">
                <h2 className="text-center mb-4">Nutrition Trends</h2>

                {error && (
                    <Alert variant="danger" className="mb-4">
                        {error}
                    </Alert>
                )}

                {/* Calories Chart */}
                <Card className="mb-4 shadow-sm">
                    <Card.Body>
                        <h5 className="mb-4">Daily Calorie Intake</h5>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={nutritionData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tickFormatter={formatDate} />
                                <YAxis />
                                <Tooltip labelFormatter={formatDate} />
                                <Legend />
                                <Line type="monotone" dataKey="calories" stroke="#8884d8" name="Calories (kcal)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card.Body>
                </Card>

                {/* Macronutrients Chart */}
                <Card className="shadow-sm">
                    <Card.Body>
                        <h5 className="mb-4">Daily Macronutrients</h5>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={nutritionData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tickFormatter={formatDate} />
                                <YAxis />
                                <Tooltip labelFormatter={formatDate} />
                                <Legend />
                                <Line type="monotone" dataKey="protein" stroke="#8884d8" name="Protein (g)" />
                                <Line type="monotone" dataKey="carbs" stroke="#82ca9d" name="Carbs (g)" />
                                <Line type="monotone" dataKey="fats" stroke="#ffc658" name="Fats (g)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card.Body>
                </Card>
            </Container>
        </>
    );
};

export default AboutYou;