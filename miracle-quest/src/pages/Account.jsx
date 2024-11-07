import { useState, useEffect } from 'react';
import {Container, Card, Form, Button, Alert, Row, Col, InputGroup} from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { getUserData, updateUserData, isUsernameAvailable } from '../services/firebaseHelpers';
import { fetchNutritionData } from '../services/geminiApi.js';
import Navigation from '../components/common/Navigation';
import PropTypes from "prop-types";
import { setupMealNotifications } from '../utils/notificationHelper';

const Account = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [usernameError, setUsernameError] = useState('');
    const [originalUsername, setOriginalUsername] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        sex: '',
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

    // Fetch user data on component mount
    useEffect(() => {
        const loadUserData = async () => {
            try {
                if (user) {
                    const userData = await getUserData(user.uid);
                    if (userData) {
                        setFormData({
                            username: userData.username || '',
                            sex: userData.sex || '',
                            birthdate: userData.birthdate || '',
                            height: userData.height || '',
                            weight: userData.weight || '',
                            lifestyle: userData.lifestyle || '',
                            goals: userData.goals || '',
                            mealTimes: {
                                breakfast: userData.mealTimes?.breakfast || '',
                                lunch: userData.mealTimes?.lunch || '',
                                dinner: userData.mealTimes?.dinner || ''
                            }
                        });
                        setOriginalUsername(userData.username || '');
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

    const handleChange = async (e) => {
        const { name, value } = e.target;
        if (name === 'username') {
            setUsernameError('');
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
                [name]: value
            }));
        }

        // Check username availability when username changes
        if (name === 'username' && value !== originalUsername) {
            setIsCheckingUsername(true);
            try {
                const isAvailable = await isUsernameAvailable(value, user.uid);
                if (!isAvailable) {
                    setUsernameError('Username is already taken');
                }
            } catch {
                setUsernameError('Error checking username availability');
            } finally {
                setIsCheckingUsername(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsProcessing(true);
        setLoadingMessage('Updating your profile...');

        try {
            if (usernameError) {
                setError('Please fix the username error before submitting');
                setIsProcessing(false);
                return;
            }

            setLoadingMessage('Calculating nutrition requirements...');
            const nutritionResponse = await fetchNutritionData({
                sex: formData.sex,
                age: calculateAge(formData.birthdate),
                height: formData.height,
                weight: formData.weight,
                activity: formData.lifestyle,
                goals: formData.goals
            });

            if (nutritionResponse.error) {
                setError(`${nutritionResponse.message}`);
                setIsProcessing(false);
                return;
            }

            setLoadingMessage('Saving your changes...');
            await updateUserData(user.uid, {
                ...formData,
                ...nutritionResponse.data
            });

            setSuccess('Profile updated successfully!');
            setOriginalUsername(formData.username);

            if (success) {
                setupMealNotifications(formData.mealTimes);
            }
        } catch (err) {
            setError('Failed to update profile');
            console.error(err);
        } finally {
            setIsProcessing(false);
            setLoadingMessage('');
        }
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

    const InitialLoading = () => (
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
            <div className="text-center">
                <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <h5 className="text-primary">Loading your profile...</h5>
            </div>
        </div>
    );

    const LoadingOverlay = ({ message }) => (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
             style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', zIndex: 9999 }}>
            <div className="text-center">
                <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <h5 className="text-primary">{message}</h5>
            </div>
        </div>
    );

    LoadingOverlay.propTypes = {
        message: PropTypes.string,
    }

    if (loading) {
        return <InitialLoading/>;
    }

    return (
        <>
            <Navigation />
            {isProcessing && <LoadingOverlay message={loadingMessage} />}
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={8}>
                        <Card className="shadow-sm">
                            <Card.Body>
                                <h2 className="text-center mb-4">Account Settings</h2>

                                {error && <Alert variant="danger">{error}</Alert>}
                                {success && <Alert variant="success">{success}</Alert>}

                                <Form onSubmit={handleSubmit}>
                                    {/* Personal Information */}
                                    <h5 className="mb-3">Personal Information</h5>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Username</Form.Label>
                                        <InputGroup hasValidation>
                                            <Form.Control
                                                type="text"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                isInvalid={!!usernameError}
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {usernameError}
                                            </Form.Control.Feedback>
                                            {isCheckingUsername && (
                                                <InputGroup.Text>
                                                    <span className="spinner-border spinner-border-sm"/>
                                                </InputGroup.Text>
                                            )}
                                        </InputGroup>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Gender</Form.Label>
                                        <Form.Select
                                            name="sex"
                                            value={formData.sex}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Birthdate</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="birthdate"
                                            value={formData.birthdate}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>

                                    {/* Physical Information */}
                                    <h5 className="mb-3">Physical Information</h5>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Height (cm)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="height"
                                            value={formData.height}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Weight (kg)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="weight"
                                            value={formData.weight}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>

                                    {/* Lifestyle and Goals */}
                                    <h5 className="mb-3">Lifestyle & Goals</h5>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Lifestyle</Form.Label>
                                        <Form.Select
                                            name="lifestyle"
                                            value={formData.lifestyle}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select lifestyle</option>
                                            <option value="sedentary">Sedentary (little or no exercise)</option>
                                            <option value="light">Light (exercise 1-3 times/week)</option>
                                            <option value="moderate">Moderate (exercise 3-5 times/week)</option>
                                            <option value="active">Active (daily exercise)</option>
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
                                    <Form.Group className="mb-3">
                                        <Form.Label>Breakfast Time</Form.Label>
                                        <Form.Control
                                            type="time"
                                            name="mealTimes.breakfast"
                                            value={formData.mealTimes.breakfast}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Lunch Time</Form.Label>
                                        <Form.Control
                                            type="time"
                                            name="mealTimes.lunch"
                                            value={formData.mealTimes.lunch}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Dinner Time</Form.Label>
                                        <Form.Control
                                            type="time"
                                            name="mealTimes.dinner"
                                            value={formData.mealTimes.dinner}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="w-100 position-relative"
                                        disabled={isProcessing || isCheckingUsername || !!usernameError}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Processing...
                                            </>
                                        ) : 'Update Profile'}
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default Account;