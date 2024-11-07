import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import {AuthProvider} from "./components/providers/AuthProvider.jsx";

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Account from './pages/Account';
import History from './pages/History';
import FoodNearby from './pages/FoodNearby';
import AboutYou from './pages/AboutYou';
import NotFound from './pages/NotFound';

const App = () => {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected routes */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Navigate to="/home" replace />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/home"
                        element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/account"
                        element={
                            <ProtectedRoute>
                                <Account />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/history"
                        element={
                            <ProtectedRoute>
                                <History />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/food-nearby"
                        element={
                            <ProtectedRoute>
                                <FoodNearby />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/about-you"
                        element={
                            <ProtectedRoute>
                                <AboutYou />
                            </ProtectedRoute>
                        }
                    />

                    {/* 404 route */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
};

export default App;