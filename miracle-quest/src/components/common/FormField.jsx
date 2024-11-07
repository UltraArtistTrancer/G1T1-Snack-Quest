import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';

const FormField = ({
   label,
   type = "text",
   name,
   value,
   onChange,
   error,
   placeholder = "",
   required = false
}) => {
    return (
        <Form.Group className="mb-3">
            <Form.Label column="sm">{label}</Form.Label>
            <Form.Control
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                isInvalid={!!error}
            />
            {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
        </Form.Group>
    );
};

FormField.propTypes = {
    label: PropTypes.string.isRequired,
    type: PropTypes.string,
    name: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]).isRequired,
    onChange: PropTypes.func.isRequired,
    error: PropTypes.string,
    placeholder: PropTypes.string,
    required: PropTypes.bool
};

export default FormField;