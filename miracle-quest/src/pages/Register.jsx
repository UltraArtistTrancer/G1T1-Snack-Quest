import { useState } from 'react';
import { Form, Formfield, Button, Alert, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { fetchNutritionData } from '../services/geminiApi.js';
import AuthLayout from '../components/common/AuthLayout';
import FormField from '../components/common/FormField';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        gender: '',
        birthdate: '',
        height: '',
        weight: '',
        lifestyle: '',
        goals: '',
        mealTimes: {
            breakfast: '',
            lunch: '',
            dinner: ''
        }
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [age, setAge] = useState('');

    const calculateAge = (birthdate) => {
        const birthDate = new Date(birthdate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();

        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
        }

        return age;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'birthdate') {
            const calculatedAge = calculateAge(value);
            setAge(calculatedAge);
        }

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
            if (value == 'male') {
                console.log(value);
            };
        }
    };

    const validateForm = () => {
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setError('');
        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            // const gender = formData.gender;

            // console.log({ gender, age, height, weight, lifestyle });


            // const data = await fetchNutritionData({
            //     sex: formData.gender,
            //     age: age,
            //     height: formData.height,
            //     weight: formData.weight,
            //     activity: formData.lifestyle,
            // });
            // const nutritionData = await fetchNutritionData({
            //     sex: gender,
            //     age,
            //     height,
            //     weight,
            //     activity: lifestyle
            // });
            
            // console.log(formData.gender);
            // console.log(formData.age);
            // console.log(formData.height);
            // console.log(formData.weight);
            // console.log(formData.lifestyle);
            

            // await setDoc(doc(db, "users", userId), {
            //     username,
            //     gender,
            //     birthdate: formData.birthdate,
            //     height,
            //     weight,
            //     lifestyle,
            //     goals: formData.goals,
            //     mealTimes: formData.mealTimes,
            //     createdAt: new Date().toISOString(),
            //     nutrition: {
            //         carbohydrates: nutritionData.carbohydrates,
            //         protein: nutritionData.protein,
            //         fat: nutritionData.fat,
            //         fiber: nutritionData.fiber,
            //         bmi: nutritionData.bmi,
            //         calorieNeeds: nutritionData.calorieNeeds
            //     }
            // });
            // const nutritionResponse = await fetchNutritionData({
            //     sex: formData.gender,
            //     age: calculateAge(formData.birthdate),
            //     height: formData.height,
            //     weight: formData.weight,
            //     activity: formData.lifestyle,
            //     goals: formData.goals
            // });

            await setDoc(doc(db, "users", userCredential.user.uid), {
                username: formData.username,
                gender: formData.gender,
                birthdate: formData.birthdate,
                height: formData.height,
                weight: formData.weight,
                lifestyle: formData.lifestyle,
                goals: formData.goals,
                mealTimes: formData.mealTimes,
                createdAt: new Date().toISOString(),
                // carbohydrates: data.carbohydrates,
                // protein: data.protein,
                // fat: data.fat,
                // fiber: data.fiber,
                // bmi: data.bmi,
                // calorieNeeds: data.calorieNeeds,
            });

            navigate('/home');
        } catch (err) {
            setError('Failed to create account. ' + err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <Card className="auth-card">
                <Card.Body>
                    <h2 className="text-center mb-4">Create Account</h2>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <FormField
                            label="Username"
                            value={formData.username}
                            onChange={handleChange}
                            name="username"
                            required
                        />

                        <FormField
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            name="email"
                            required
                        />

                        <FormField
                            label="Password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            name="password"
                            required
                        />

                        <FormField
                            label="Confirm Password"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            name="confirmPassword"
                            required
                        />

                        <Form.Group className="mb-3">
                            <Form.Label>Gender</Form.Label>
                            <Form.Select
                                id="sex"
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </Form.Select>
                        </Form.Group>

                        <FormField
                            label="Birthdate"
                            type="date"
                            value={formData.birthdate}
                            onChange={handleChange}
                            name="birthdate"
                            required
                        />

                        {age && (
                                <Form.Group className="mb-3">
                                <Form.Label>Age</Form.Label>
                                <Form.Control id="currentAge" type="text" value={age} readOnly />
                                </Form.Group>
                            )}

                        {/* Physical Information */}
                        <FormField
                            id="height"
                            label="Height (cm)"
                            type="number"
                            value={formData.height}
                            onChange={handleChange}
                            name="height"
                            required
                        />

                        <FormField
                            id="weight"
                            label="Weight (kg)"
                            type="number"
                            value={formData.weight}
                            onChange={handleChange}
                            name="weight"
                            required
                        />

                        {/* Lifestyle and Goals */}
                        <Form.Group className="mb-3">
                            <Form.Label>Lifestyle</Form.Label>
                            <Form.Select
                                id="lifestyle"
                                name="lifestyle"
                                value={formData.lifestyle}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select lifestyle</option>
                                <option value="sedentary">Sedentary</option>
                                <option value="light">Light Exercise</option>
                                <option value="moderate">Moderate Exercise</option>
                                <option value="active">Active</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Fitness Goals</Form.Label>
                            <Form.Select
                                name="goals"
                                value={formData.goals}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select goal</option>
                                <option value="diet">Diet</option>
                                <option value="muscle">Gain Muscle</option>
                                <option value="endurance">Increase Endurance</option>
                            </Form.Select>
                        </Form.Group>

                        {/* Meal Times */}
                        <h5 className="mb-3">Usual Meal Times</h5>
                        <FormField
                            label="Breakfast Time"
                            type="time"
                            value={formData.mealTimes.breakfast}
                            onChange={handleChange}
                            name="mealTimes.breakfast"
                            required
                        />

                        <FormField
                            label="Lunch Time"
                            type="time"
                            value={formData.mealTimes.lunch}
                            onChange={handleChange}
                            name="mealTimes.lunch"
                            required
                        />

                        <FormField
                            label="Dinner Time"
                            type="time"
                            value={formData.mealTimes.dinner}
                            onChange={handleChange}
                            name="mealTimes.dinner"
                            required
                        />

                        <Button
                            variant="primary"
                            type="submit"
                            className="w-100 mt-4"
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Register'}
                        </Button>
                    </Form>

                    <div className="text-center mt-3">
                        <p>Already have an account? <Link to="/login">Login here</Link></p>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default Register;