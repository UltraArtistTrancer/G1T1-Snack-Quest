import { Container, Row, Col, Card } from 'react-bootstrap';
import PropTypes from 'prop-types';

const AuthLayout = ({ children, title }) => {
    return (
        <Container fluid className="bg-light h-100">
            <Row className="justify-content-center align-items-center min-vh-100 w-100 m-0">
                <Col xs={11} sm={8} md={6} lg={4} className="mx-auto">
                    <Card className="shadow-lg border-0 rounded-3">
                        <Card.Body className="p-4 p-md-5">
                            <h2 className="text-center mb-4 fw-bold">{title}</h2>
                            {children}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

AuthLayout.propTypes = {
    children: PropTypes.node.isRequired,
    title: PropTypes.string.isRequired
};

export default AuthLayout;