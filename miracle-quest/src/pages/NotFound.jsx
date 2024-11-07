import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <Container>
            <Row className="justify-content-center align-items-center min-vh-100">
                <Col xs={12} md={6} className="text-center">
                    <h1 className="display-1">404</h1>
                    <h2 className="mb-4">Page Not Found</h2>
                    <p className="mb-4">The specified file was not found on this website. Please check the URL for mistakes and try again.</p>
                    <Button variant="primary" onClick={() => navigate('/')}>
                        Return Home
                    </Button>
                </Col>
            </Row>
        </Container>
    );
};

export default NotFound;