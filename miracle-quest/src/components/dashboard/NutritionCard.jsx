import PropTypes from 'prop-types';
import {NutritionChart} from './NutritionChart';

export const NutritionCard = ({ title, icon, current, target, colorClass }) => {

    // Extract color class without the 'text-' prefix
    const chartColorClass = colorClass.replace('text-', '');

    return (
        <div className="col-12 col-md-6 col-lg-3 mb-4">
            <div className="nutrition-card card">
                <div className="card-body position-relative overflow-hidden">
                    <div className="nutrition-icon position-absolute">
                        {icon}
                    </div>
                    
                    <div className="nutrition-content">
                        <h3 className="nutrition-title mb-3">{title}</h3>
                        
                        <div className="nutrition-values mb-3">
                            <span className={`current-value ${colorClass}`}>
                                {current}
                            </span>
                            <span className="target-value">
                                / {target}
                            </span>
                            <small className="unit">
                                {title === "Calories" ? "kcal" : "g"}
                            </small>
                        </div>
                        
                        <div className="chart-wrapper">
                            <NutritionChart
                                consumed={current}
                                target={target}
                                colorClass={chartColorClass}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

NutritionCard.propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    current: PropTypes.number.isRequired,
    target: PropTypes.number.isRequired,
    colorClass: PropTypes.string.isRequired
};