import { Link } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import PropTypes from 'prop-types';

const CustomNavLink = ({ to, children }) => (
    <Nav.Item>
        <Link to={to} className="nav-link">
            {children}
        </Link>
    </Nav.Item>
);

CustomNavLink.propTypes = {
    to: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

export default CustomNavLink;