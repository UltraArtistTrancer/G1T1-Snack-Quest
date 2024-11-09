import { useState, useEffect, useCallback, useRef } from 'react';
import {Container, Card, Table, Badge, Spinner, Alert, Row, Col, Pagination, Button, Modal, Form} from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import {deleteFoodEntry, getUserData} from '../services/firebaseHelpers';
import Navigation from '../components/common/Navigation';
import { Trash2 } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker, StreetViewPanorama } from '@react-google-maps/api';

const ITEMS_PER_PAGE = 10; // Number of items to show per page

const History = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [foodHistory, setFoodHistory] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingEntry, setDeletingEntry] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [nutritionSummary, setNutritionSummary] = useState({
        calories: 0,
        carbohydrates: 0,
        protein: 0,
        fats: 0
    });
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [dateRange, setDateRange] = useState('single'); // 'single' or 'range'
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [map, setMap] = useState(null);
    const [center, setCenter] = useState(null);
    const [places, setPlaces] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [searchRadius, setSearchRadius] = useState(1500);
    const [selectedFoodType, setSelectedFoodType] = useState('restaurant');
    const [directions, setDirections] = useState(null);
    const [duration, setDuration] = useState(null);
    const [distance, setDistance] = useState(null);
    const [lastSearchRadius, setLastSearchRadius] = useState(null);
    const [selectedCuisine, setSelectedCuisine] = useState('all');
    const [showStreetView, setShowStreetView] = useState(false);
    const [streetViewPosition, setStreetViewPosition] = useState(null);

    // Calculate pagination values
    const totalPages = Math.ceil(foodHistory.length / ITEMS_PER_PAGE);
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;

    // Add this function to filter entries based on date selection
    const getFilteredEntries = useCallback(() => {
        if (!foodHistory.length) return [];
        
        if (dateRange === 'single') {
            return foodHistory.filter(entry => entry.date === selectedDate);
        } else {
            return foodHistory.filter(entry => 
                entry.date >= selectedDate && entry.date <= endDate
            );
        }
    }, [foodHistory, selectedDate, endDate, dateRange]);

    // Modify the nutrition summary calculation to use filtered entries
    useEffect(() => {
        const filteredEntries = getFilteredEntries();
        const entryCount = filteredEntries.length;

        if (entryCount > 0) {
            const summary = filteredEntries.reduce((acc, entry) => ({
                calories: acc.calories + entry.nutrition.calories,
                carbohydrates: acc.carbohydrates + entry.nutrition.carbs,
                protein: acc.protein + entry.nutrition.protein,
                fats: acc.fats + entry.nutrition.fats
            }), { calories: 0, carbohydrates: 0, protein: 0, fats: 0 });

            // Calculate averages
            setNutritionSummary({
                calories: Math.round(summary.calories / entryCount),
                carbohydrates: Math.round(summary.carbohydrates / entryCount),
                protein: Math.round(summary.protein / entryCount),
                fats: Math.round(summary.fats / entryCount)
            });
        } else {
            // Reset summary if no entries
            setNutritionSummary({
                calories: 0,
                carbohydrates: 0,
                protein: 0,
                fats: 0
            });
        }
    }, [getFilteredEntries]);

    // Add this before the return statement
    const currentItems = getFilteredEntries().slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        const fetchFoodHistory = async () => {
            try {
                const userData = await getUserData(user.uid);
                if (userData?.foodInput) {
                    const historyEntries = [];

                    // Process the new data structure
                    Object.entries(userData.foodInput).forEach(([date, meals]) => {
                        Object.entries(meals).forEach(([mealTime, foods]) => {
                            Object.entries(foods).forEach(([foodItem, nutrition]) => {
                                historyEntries.push({
                                    date,
                                    mealTime,
                                    foodName: foodItem,
                                    nutrition: {
                                        calories: nutrition.calories || 0,
                                        carbs: nutrition.carbs || 0,
                                        protein: nutrition.protein || 0,
                                        fats: nutrition.fats || 0
                                    }
                                });
                            });
                        });
                    });

                    // Sort by date, most recent first
                    historyEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
                    setFoodHistory(historyEntries);

                    // Calculate nutrition summary
                    const summary = historyEntries.reduce((acc, entry) => ({
                        calories: acc.calories + entry.nutrition.calories,
                        carbohydrates: acc.carbohydrates + entry.nutrition.carbs,
                        protein: acc.protein + entry.nutrition.protein,
                        fats: acc.fats + entry.nutrition.fats
                    }), { calories: 0, carbohydrates: 0, protein: 0, fats: 0 });
                    setNutritionSummary(summary);
                }
            } catch (err) {
                setError('Failed to load food history');
                console.error('Error fetching food history:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchFoodHistory();
        }
    }, [user]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Pagination component
    const PaginationComponent = () => {
        if (totalPages <= 1) return null;

        let items = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        // Adjust start page if we're near the end
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // First page and prev
        items.push(
            <Pagination.First
                key="first"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(1)}
            />
        );
        items.push(
            <Pagination.Prev
                key="prev"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
            />
        );

        // Page numbers
        for (let number = startPage; number <= endPage; number++) {
            items.push(
                <Pagination.Item
                    key={number}
                    active={number === currentPage}
                    onClick={() => handlePageChange(number)}
                >
                    {number}
                </Pagination.Item>
            );
        }

        // Next and last page
        items.push(
            <Pagination.Next
                key="next"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
            />
        );
        items.push(
            <Pagination.Last
                key="last"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(totalPages)}
            />
        );

        return (
            <div className="d-flex justify-content-center mt-4">
                <Pagination>{items}</Pagination>
            </div>
        );
    };

    const handleDelete = async (entry) => {
        setDeletingEntry(entry);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        setDeleteLoading(true);
        try {
            await deleteFoodEntry(user.uid, {
                date: deletingEntry.date,
                mealTime: deletingEntry.mealTime,
                foodName: deletingEntry.foodName
            });

            // Update local state
            const updatedHistory = foodHistory.filter(item =>
                !(item.date === deletingEntry.date &&
                    item.mealTime === deletingEntry.mealTime &&
                    item.foodName === deletingEntry.foodName)
            );
            setFoodHistory(updatedHistory);

            // Recalculate nutrition summary
            const newSummary = updatedHistory.reduce((acc, entry) => ({
                calories: acc.calories + entry.nutrition.calories,
                carbohydrates: acc.carbohydrates + entry.nutrition.carbs,
                protein: acc.protein + entry.nutrition.protein,
                fats: acc.fats + entry.nutrition.fats
            }), { calories: 0, carbohydrates: 0, protein: 0, fats: 0 });
            setNutritionSummary(newSummary);

            // Adjust current page if necessary
            const newTotalPages = Math.ceil(updatedHistory.length / ITEMS_PER_PAGE);
            if (currentPage > newTotalPages) {
                setCurrentPage(Math.max(1, newTotalPages));
            }

        } catch (err) {
            setError('Failed to delete entry. Please try again.');
            console.error('Error deleting entry:', err);
        } finally {
            setDeleteLoading(false);
            setShowDeleteModal(false);
            setDeletingEntry(null);
        }
    };

    // Rest of your helper functions...
    const getMealBadgeColor = (mealTime) => {
        const normalizedMealTime = mealTime.toLowerCase();
        switch (normalizedMealTime) {
            case 'breakfast': return 'primary';
            case 'lunch': return 'success';
            case 'dinner': return 'info';
            default: return 'secondary';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'America/Chicago' // Set to Arkansas time (Central Time Zone)
        });
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
                <h2 className="text-center mb-4">Food History</h2>

                {/* Add Date Filter Controls */}
                <Card className="mb-4 shadow-sm">
                    <Card.Body>
                        <Form className="row g-3">
                            <div className="col-md-auto">
                                <Form.Check
                                    type="radio"
                                    label="Single Date"
                                    name="dateRange"
                                    checked={dateRange === 'single'}
                                    onChange={() => setDateRange('single')}
                                    inline
                                />
                                <Form.Check
                                    type="radio"
                                    label="Date Range"
                                    name="dateRange"
                                    checked={dateRange === 'range'}
                                    onChange={() => setDateRange('range')}
                                    inline
                                />
                            </div>
                            <div className="col-md-auto">
                                <Form.Control
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            {dateRange === 'range' && (
                                <div className="col-md-auto">
                                    <Form.Control
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        min={selectedDate}
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            )}
                        </Form>
                    </Card.Body>
                </Card>

                {error && (
                    <Alert
                        variant="danger"
                        className="mb-4"
                        dismissible
                        onClose={() => setError('')}
                    >
                        {error}
                    </Alert>
                )}

                {/* Nutrition Summary Card */}
                <Card className="mb-4 shadow-sm">
                    <Card.Header>
                        <h5 className="mb-0">Overall Nutrition Summary</h5>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col sm={6} md={3} className="text-center mb-3 mb-md-0">
                                <h6>Total Calories</h6>
                                <div className="h4 mb-0 text-primary">
                                    {nutritionSummary.calories.toLocaleString()} kcal
                                </div>
                            </Col>
                            <Col sm={6} md={3} className="text-center mb-3 mb-md-0">
                                <h6>Total Carbs</h6>
                                <div className="h4 mb-0 text-success">
                                    {nutritionSummary.carbohydrates.toLocaleString()}g
                                </div>
                            </Col>
                            <Col sm={6} md={3} className="text-center mb-3 mb-md-0">
                                <h6>Total Protein</h6>
                                <div className="h4 mb-0 text-info">
                                    {nutritionSummary.protein.toLocaleString()}g
                                </div>
                            </Col>
                            <Col sm={6} md={3} className="text-center">
                                <h6>Total Fats</h6>
                                <div className="h4 mb-0 text-warning">
                                    {nutritionSummary.fats.toLocaleString()}g
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Food History Table */}
                <Card className="shadow-sm">
                    <Card.Body>
                        {foodHistory.length === 0 ? (
                            <Alert variant="info">
                                No food entries found. Start logging your meals to see them here!
                            </Alert>
                        ) : (
                            <>
                                <div className="table-responsive">
                                    <Table hover>
                                        <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Meal</th>
                                            <th>Food</th>
                                            <th>Calories</th>
                                            <th>Carbs</th>
                                            <th>Protein</th>
                                            <th>Fats</th>
                                            <th>Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {currentItems.map((entry, index) => (
                                            <tr key={index}>
                                                <td>{formatDate(entry.date)}</td>
                                                <td>
                                                    <Badge bg={getMealBadgeColor(entry.mealTime)}>
                                                        {entry.mealTime}
                                                    </Badge>
                                                </td>
                                                <td>{entry.foodName}</td>
                                                <td>{entry.nutrition.calories} kcal</td>
                                                <td>{entry.nutrition.carbs}g</td>
                                                <td>{entry.nutrition.protein}g</td>
                                                <td>{entry.nutrition.fats}g</td>
                                                <td>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleDelete(entry)}
                                                        title="Delete entry"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </Table>
                                </div>
                                <PaginationComponent />
                            </>
                        )}
                    </Card.Body>
                </Card>
            </Container>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {deletingEntry && (
                        <p>
                            Are you sure you want to delete this entry?
                            <br /><br />
                            <strong>Date:</strong> {formatDate(deletingEntry.date)}<br />
                            <strong>Meal:</strong> {deletingEntry.mealTime}<br />
                            <strong>Food:</strong> {deletingEntry.foodName}
                        </p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={confirmDelete}
                        disabled={deleteLoading}
                    >
                        {deleteLoading ? 'Deleting...' : 'Delete'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default History;