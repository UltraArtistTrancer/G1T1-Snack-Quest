import { useState, useRef, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { addFoodEntry } from '../../services/firebaseHelpers';
import PropTypes from "prop-types";
import { DEFAULT_NUTRITION } from "../../services/geminiApi";

const STORAGE_KEY = 'snackquest_chat_messages';
const MAX_STORED_MESSAGES = 50; // Limit stored messages to prevent storage bloat

const ChatInterface = ({ mealTime, onFoodLogged }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState(() => {
        // Initialize messages from storage on component mount
        try {
            const stored = localStorage.getItem(`${STORAGE_KEY}_${user.uid}`);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading stored messages:', error);
            return [];
        }
    });
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const chatContainerRef = useRef(null);

    // Save messages to storage whenever they change
    useEffect(() => {
        try {
            // Keep only the last MAX_STORED_MESSAGES messages
            const messagesToStore = messages.slice(-MAX_STORED_MESSAGES);
            localStorage.setItem(
                `${STORAGE_KEY}_${user.uid}`,
                JSON.stringify(messagesToStore)
            );
        } catch (error) {
            console.error('Error saving messages to storage:', error);
        }
    }, [messages, user.uid]);

    // Scroll to bottom when new messages are added
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Clear messages older than 24 hours
    useEffect(() => {
        const clearOldMessages = () => {
            const oneDayAgo = new Date();
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);

            setMessages(prevMessages =>
                prevMessages.filter(message =>
                    message.timestamp && new Date(message.timestamp) > oneDayAgo
                )
            );
        };

        // Clear old messages on mount and every hour
        clearOldMessages();
        const interval = setInterval(clearOldMessages, 60 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || !mealTime) return;

        setMessages(prev => [...prev, {
            text: `${mealTime}: ${inputText}`,
            isUser: true,
            timestamp: new Date().toISOString()
        }]);
        setInputText('');
        setLoading(true);

        try {
            // Get today's date
            const today = new Date().toLocaleDateString('en-CA');

            // Add food entry with nutrition info
            const nutritionInfo = await addFoodEntry(
                user.uid,
                today,
                mealTime,
                inputText
            );

            // If Gemini logs the food as 'This does not seem like a food item.', then do not add to Firebase.
            if (nutritionInfo === DEFAULT_NUTRITION) {
                throw new Error('This does not seem like a food item.');
            }

            // Notify parent component
            onFoodLogged();

            // Format nutrition information for display
            const nutritionMessage = formatNutritionMessage(nutritionInfo);

            // Show success message with nutrition info
            setMessages(prev => [...prev, {
                text: nutritionMessage,
                isUser: false,
                timestamp: new Date().toISOString()
            }]);
        } catch (error) {
            console.error('Error logging food:', error);
            setMessages(prev => [...prev, {
                text: 'Error logging food. Please try again.',
                isUser: false,
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const formatNutritionMessage = (nutritionInfo) => {
        return `Food logged successfully!\n
        Estimated nutrition:\n
        🔥 Calories: ${nutritionInfo.calories}kcal\n
        🥖 Carbs: ${nutritionInfo.carbs}g\n
        🥩 Protein: ${nutritionInfo.protein}g\n
        🥑 Fats: ${nutritionInfo.fats}g`;
    };

    const clearChat = () => {
        if (window.confirm('Are you sure you want to clear the chat history?')) {
            setMessages([]);
            localStorage.removeItem(`${STORAGE_KEY}_${user.uid}`);
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">Chat History</h6>
                {messages.length > 0 && (
                    <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={clearChat}
                    >
                        Clear History
                    </Button>
                )}
            </div>

            <div
                ref={chatContainerRef}
                className="chat-container mb-3"
                style={{
                    height: '300px',
                    overflowY: 'auto',
                    border: '1px solid #dee2e6',
                    borderRadius: '0.375rem',
                    padding: '1rem'
                }}
            >
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`mb-2 p-2 rounded ${
                            message.isUser
                                ? 'bg-primary text-white ms-auto'
                                : 'bg-light'
                        }`}
                        style={{
                            maxWidth: '75%',
                            width: 'fit-content',
                            marginLeft: message.isUser ? 'auto' : '0'
                        }}
                    >
                        {message.text}
                    </div>
                ))}
                {loading && (
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}
            </div>

            <Form onSubmit={handleSubmit}>
                <div className="d-flex gap-2">
                    <Form.Control
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type your food here..."
                        disabled={loading || !mealTime}
                    />
                    <Button
                        type="submit"
                        disabled={loading || !mealTime || !inputText.trim()}
                    >
                        Send
                    </Button>
                </div>
            </Form>
        </div>
    );
};

ChatInterface.propTypes = {
    mealTime: PropTypes.string.isRequired,
    onFoodLogged: PropTypes.func.isRequired
};

export default ChatInterface;