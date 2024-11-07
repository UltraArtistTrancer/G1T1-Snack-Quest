import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';
import CustomNavLink from "./CustomNavLink.jsx";

const Navigation = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const clearChatData = () => {
        // Clear all chat-related data from localStorage
        const keysToRemove = [];

        // Collect all chat-related keys
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (
                key.includes('chat') ||
                key.includes('message') ||
                key.includes('conversation')
            )) {
                keysToRemove.push(key);
            }
        }

        // Remove collected keys
        keysToRemove.forEach(key => localStorage.removeItem(key));
    };

    const handleLogout = async () => {
        try {
            // Clear chat data before signing out
            clearChatData();

            // Sign out
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error('Error signing out:', error);
            // Still try to clear chat data even if sign out fails
            clearChatData();
        }
    };

    if (!user) return null;

    return (
        <Navbar bg="light" expand="lg">
            <Container>
                <Navbar.Brand to="/home" as={Link}>Snack Quest</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <CustomNavLink to="/home">🌟 Home</CustomNavLink>
                        <CustomNavLink to="/about-you">🫵 About You</CustomNavLink>
                        <CustomNavLink to="/food-nearby">🍽️ Food Nearby</CustomNavLink>
                        <CustomNavLink to="/history">📜 History</CustomNavLink>
                        <CustomNavLink to="/account">👤 Account</CustomNavLink>
                    </Nav>
                    <Nav>
                        <Nav.Item>
                            <button
                                onClick={handleLogout}
                                className="nav-link"
                                style={{ background: 'none', border: 'none' }}
                            >
                                Logout
                            </button>
                        </Nav.Item>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Navigation;