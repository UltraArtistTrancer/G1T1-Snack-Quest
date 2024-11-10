import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import AuthLayout from '../components/common/AuthLayout';
import FormField from '../components/common/FormField';
import { validatePassword, sanitizeInput } from '../utils/securityUtils';

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

    const handleChange = (e) => {
        const { name, value } = e.target;
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
                [name]: value
            }));
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
        setError('');

        // Validate password
        if (!validatePassword(formData.password)) {
            setError('Password must be at least 8 characters and contain uppercase, lowercase, numbers, and special characters');
            return;
        }

        // Sanitize inputs
        const sanitizedData = {
            email: sanitizeInput(formData.email),
            username: sanitizeInput(formData.username),
            // ... sanitize other fields
        };

        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                sanitizedData.email,
                sanitizedData.password
            );

            await setDoc(doc(db, "users", userCredential.user.uid), {
                username: sanitizedData.username,
                gender: sanitizedData.gender,
                birthdate: sanitizedData.birthdate,
                height: sanitizedData.height,
                weight: sanitizedData.weight,
                lifestyle: sanitizedData.lifestyle,
                goals: sanitizedData.goals,
                mealTimes: sanitizedData.mealTimes,
                createdAt: new Date().toISOString(),
                calorieNeeds: 0,
                carbohydrates: 0,
                fat: 0,
                fibre: 0,
                protein: 0


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
        <AuthLayout title="Create Account">
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

                {/* Physical Information */}
                <FormField
                    label="Height (cm)"
                    type="number"
                    value={formData.height}
                    onChange={handleChange}
                    name="height"
                    required
                />

                <FormField
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
        </AuthLayout>
    );
};

export default Register;