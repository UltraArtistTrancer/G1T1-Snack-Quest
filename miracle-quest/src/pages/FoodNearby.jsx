import { useState, useCallback, useEffect, useRef } from 'react';
import { Container, Button, Alert, Form, Badge } from 'react-bootstrap';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import Navigation from '../components/common/Navigation';
import SmartRecommendations from '../components/dashboard/SmartRecommendations';
import { useAuth } from '../hooks/useAuth';
import { getUserData, getDailyNutrition } from '../services/firebaseHelpers';

const libraries = ['places'];

const mapContainerStyle = {
    width: '100%',
    height: '70vh'
};

const FOOD_TYPES = [
    'restaurant',
    'cafe',
    'bakery',
    'meal_takeaway',
    'meal_delivery',
    'food'
];

const CUISINE_TYPES = [
    'all',
    'chinese',
    'indian',
    'japanese',
    'korean',
    'italian',
    'malay',
    'thai',
    'vietnamese',
    'western'
];

const FoodNearby = () => {
    const [map, setMap] = useState(null);
    const [center, setCenter] = useState(null);
    const [places, setPlaces] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchRadius, setSearchRadius] = useState(1500);
    const [selectedFoodType, setSelectedFoodType] = useState('restaurant');
    const [directions, setDirections] = useState(null);
    const [duration, setDuration] = useState(null);
    const [distance, setDistance] = useState(null);
    const [lastSearchRadius, setLastSearchRadius] = useState(null);
    const [selectedCuisine, setSelectedCuisine] = useState('all');
    const [nutritionData, setNutritionData] = useState(null);

    const infoWindowRef = useRef(null);
    const directionsRendererRef = useRef(null);

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries
    });

    const { user } = useAuth();

    // Initialize InfoWindow and DirectionsRenderer
    useEffect(() => {
        if (isLoaded) {
            if (!infoWindowRef.current) {
                infoWindowRef.current = new window.google.maps.InfoWindow({
                    maxWidth: 300
                });
            }
            if (!directionsRendererRef.current) {
                directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
                    suppressMarkers: true, // Keep our custom markers
                    preserveViewport: true  // Don't auto-zoom when showing directions
                });
            }
        }

        return () => {
            if (infoWindowRef.current) {
                infoWindowRef.current.close();
            }
            if (directionsRendererRef.current) {
                directionsRendererRef.current.setMap(null);
            }
        };
    }, [isLoaded]);

    // Update DirectionsRenderer when map changes
    useEffect(() => {
        if (directionsRendererRef.current && map) {
            directionsRendererRef.current.setMap(map);
        }
    }, [map]);

    useEffect(() => {
        const fetchNutritionData = async () => {
            if (!user) return;
            const today = new Date().toISOString().split('T')[0];
            const dailyTotals = await getDailyNutrition(user.uid, today);
            const userData = await getUserData(user.uid);
            
            setNutritionData({
                calories: { consumed: dailyTotals.calories, target: userData.calorieNeeds },
                protein: { consumed: dailyTotals.protein, target: userData.protein },
                carbs: { consumed: dailyTotals.carbs, target: userData.carbohydrates },
                fats: { consumed: dailyTotals.fats, target: userData.fat }
            });
        };

        fetchNutritionData();
    }, [user]);

    const calculateDirections = useCallback((destination) => {
        if (!center || !destination) return;

        const directionsService = new window.google.maps.DirectionsService();

        const request = {
            origin: center,
            destination: destination.geometry.location,
            travelMode: window.google.maps.TravelMode.WALKING // Default to walking directions
        };

        directionsService.route(request, (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
                setDirections(result);

                // Extract duration and distance
                const route = result.routes[0].legs[0];
                setDuration(route.duration.text);
                setDistance(route.distance.text);

                // Update InfoWindow content with directions info
                updateInfoWindowContent(destination, route.duration.text, route.distance.text);

                // Show the directions on the map
                if (directionsRendererRef.current) {
                    directionsRendererRef.current.setDirections(result);
                }
            } else {
                setError('Could not calculate directions');
                console.error('Directions request failed:', status);
            }
        });
    }, [center]);

    const clearDirections = useCallback(() => {
        if (directionsRendererRef.current) {
            directionsRendererRef.current.setDirections({ routes: [] });
        }
        setDirections(null);
        setDuration(null);
        setDistance(null);
    }, []);

    const updateInfoWindowContent = useCallback((place, duration, distance) => {
        if (!infoWindowRef.current) return;

        const content = `
            <div>
                <h6>${place.name}</h6>
                <p class="mb-1">${place.vicinity}</p>
                ${place.rating ?
            `<p class="mb-1">Rating: ${place.rating} ⭐ (${place.user_ratings_total} reviews)</p>`
            : ''}
                ${place.price_level ?
            `<p class="mb-1">Price: ${'$'.repeat(place.price_level)}</p>`
            : ''}
                ${place.opening_hours ?
            `<p class="mb-1" style="color: ${place.opening_hours.open_now ? 'green' : 'red'}; font-weight: bold;">
                        ${place.opening_hours.open_now ? '✓ Open Now' : '✗ Closed'}
                    </p>`
            : ''}
                ${duration && distance ?
            `<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee;">
                        <p class="mb-1" style="font-weight: bold;">Walking Distance: ${distance}</p>
                        <p class="mb-0" style="font-weight: bold;">Estimated Time: ${duration}</p>
                    </div>`
            : ''}
            </div>
        `;

        infoWindowRef.current.setContent(content);
    }, []);

    const getCurrentLocation = useCallback(() => {
        setLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setCenter(userLocation);
                    setLoading(false);
                },
                (error) => {
                    setError('Error getting your location. Please enable location services.');
                    setLoading(false);
                    console.error('Error getting location:', error);
                }
            );
        } else {
            setError('Geolocation is not supported by your browser.');
            setLoading(false);
        }
    }, []);

    const searchNearbyPlaces = useCallback(() => {
        if (!map || !center) return;

        setLoading(true);
        setPlaces([]);
        clearDirections();
        if (infoWindowRef.current) {
            infoWindowRef.current.close();
        }
        setSelectedPlace(null);
        setLastSearchRadius(searchRadius);

        const service = new window.google.maps.places.PlacesService(map);
        const request = {
            location: center,
            radius: searchRadius,
            type: selectedFoodType,
            keyword: selectedCuisine === 'all' ? 'food' : `${selectedCuisine} food`
        };

        service.nearbySearch(request, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                const foodPlaces = results.filter(place =>
                    place.types.some(type => FOOD_TYPES.includes(type)) &&
                    !place.types.includes('lodging') &&
                    !place.types.includes('park') &&
                    !place.types.includes('shopping_mall')
                );

                setPlaces(foodPlaces);

                // Show message if no results found
                if (foodPlaces.length === 0) {
                    setError(`No ${selectedCuisine} ${selectedFoodType}s found within ${searchRadius/1000}km. Try changing your filters or increasing the search radius.`);
                }
            } else {
                setError('Error finding nearby places');
                console.error('Places service error:', status);
            }
            setLoading(false);
        });
    }, [map, center, searchRadius, selectedFoodType, selectedCuisine]);

    const onMapLoad = useCallback((map) => {
        setMap(map);

        map.addListener('click', () => {
            if (infoWindowRef.current) {
                infoWindowRef.current.close();
                setSelectedPlace(null);
            }
        });

        getCurrentLocation();
    }, [getCurrentLocation]);

    const DirectionsSummary = () => {
        if (!directions || !duration || !distance || !selectedPlace) return null;

        const handleClose = () => {
            clearDirections();
            setSelectedPlace(null);
            if (infoWindowRef.current) {
                infoWindowRef.current.close();
            }
        };

        return (
            <Alert variant="info" className="mt-3" dismissible onClose={handleClose}>
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 className="mb-2">Walking Directions to {selectedPlace.name}</h6>
                        <div className="d-flex gap-3">
                            <Badge bg="primary">Distance: {distance}</Badge>
                            <Badge bg="success">Time: {duration}</Badge>
                        </div>
                    </div>
                </div>
            </Alert>
        );
    };

    const handleMarkerClick = useCallback((place) => {
        if (!infoWindowRef.current) return;

        setSelectedPlace(place);
        clearDirections();
        calculateDirections(place);

        // Initially set content without directions info
        updateInfoWindowContent(place);

        infoWindowRef.current.setPosition(place.geometry.location);
        infoWindowRef.current.open(map);
    }, [map, calculateDirections, clearDirections, updateInfoWindowContent]);

    if (loadError) {
        return (
            <>
                <Navigation />
                <Container className="py-5">
                    <Alert variant="danger">
                        Error loading Google Maps. Please try again later.
                    </Alert>
                </Container>
            </>
        );
    }

    if (!isLoaded) {
        return (
            <>
                <Navigation />
                <Container className="py-5">
                    <div className="text-center">Loading Maps...</div>
                </Container>
            </>
        );
    }

    return (
        <>
            <Navigation />
            <Container fluid className="py-3">
                <div className="d-flex flex-column gap-3">
                    <Container>
                        <div className="mb-3">
                            <h4 className="text-center mb-4">Find Food Nearby</h4>
                            <Form className="row g-3 justify-content-center">
                                <div className="col-md-3">
                                    <Form.Group>
                                        <Form.Select
                                            value={selectedFoodType}
                                            onChange={(e) => setSelectedFoodType(e.target.value)}
                                            className="mb-2"
                                        >
                                            <option value="restaurant">Restaurants</option>
                                            <option value="cafe">Cafes</option>
                                            <option value="bakery">Bakeries</option>
                                            <option value="meal_takeaway">Takeaway</option>
                                            <option value="meal_delivery">Delivery</option>
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                                <div className="col-md-3">
                                    <Form.Group>
                                        <Form.Select
                                            value={selectedCuisine}
                                            onChange={(e) => setSelectedCuisine(e.target.value)}
                                            className="mb-2"
                                        >
                                            <option value="all">All Cuisines</option>
                                            {CUISINE_TYPES.filter(cuisine => cuisine !== 'all').map(cuisine => (
                                                <option key={cuisine} value={cuisine}>
                                                    {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                                <div className="col-md-3">
                                    <Form.Group>
                                        <Form.Select
                                            value={searchRadius}
                                            onChange={(e) => setSearchRadius(Number(e.target.value))}
                                            className="mb-2"
                                        >
                                            <option value={500}>500m</option>
                                            <option value={1000}>1km</option>
                                            <option value={1500}>1.5km</option>
                                            <option value={2000}>2km</option>
                                            <option value={3000}>3km</option>
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                                <div className="col-md-auto">
                                    <Button
                                        onClick={getCurrentLocation}
                                        disabled={loading}
                                        variant="outline-primary"
                                        className="me-2"
                                    >
                                        {loading ? 'Getting Location...' : 'Get Current Location'}
                                    </Button>
                                    <Button
                                        onClick={searchNearbyPlaces}
                                        disabled={!center || loading}
                                        variant="primary"
                                    >
                                        Search Nearby
                                    </Button>
                                </div>
                            </Form>
                        </div>

                        {error && (
                            <Alert variant="danger" onClose={() => setError('')} dismissible>
                                {error}
                            </Alert>
                        )}

                        {places.length > 0 && !selectedPlace && lastSearchRadius && (
                            <Alert variant="info" className="text-center">
                                Found {places.length} food places within {lastSearchRadius/1000}km
                            </Alert>
                        )}

                        <DirectionsSummary />
                    </Container>

                    <div className="position-relative">
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            zoom={15}
                            center={center || { lat: 1.3521, lng: 103.8198 }}
                            onLoad={onMapLoad}
                            options={{
                                zoomControl: true,
                                streetViewControl: false,
                                mapTypeControl: false,
                                fullscreenControl: true,
                            }}
                            onClick={() => {
                                if (infoWindowRef.current) {
                                    infoWindowRef.current.close();
                                    setSelectedPlace(null);
                                    clearDirections();
                                }
                            }}
                        >
                            {center && (
                                <Marker
                                    position={center}
                                    icon={{
                                        url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                                    }}
                                    title="Your Location"
                                />
                            )}

                            {places.map((place) => (
                                <Marker
                                    key={place.place_id}
                                    position={place.geometry.location}
                                    onClick={() => handleMarkerClick(place)}
                                    title={place.name}
                                    icon={{
                                        url: 'https://maps.google.com/mapfiles/ms/icons/restaurant.png'
                                    }}
                                />
                            ))}
                        </GoogleMap>
                    </div>
                </div>
            </Container>

            {nutritionData && (
                <SmartRecommendations 
                    nutritionData={nutritionData}
                    onRecommendationSelect={(cuisine) => {
                        setSelectedCuisine(cuisine);
                        searchNearbyPlaces();
                    }}
                />
            )}
        </>
    );
};

export default FoodNearby;