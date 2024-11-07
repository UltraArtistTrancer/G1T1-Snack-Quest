import { PieChart, Pie, Cell } from 'recharts';
import PropTypes from "prop-types";

export const NutritionChart = ({ consumed, target, colorClass }) => {
    // Calculate remaining value (ensure it's not negative)
    const remaining = Math.max(target - consumed, 0);

    // Calculate percentage
    const percentage = Math.round((consumed / target) * 100);

    // Prepare data for the chart
    const data = [
        { name: 'Consumed', value: consumed },
        { name: 'Remaining', value: remaining }
    ];

    // Define colors based on the colorClass
    const getColor = () => {
        switch(colorClass) {
            case 'primary': return '#0d6efd';
            case 'success': return '#198754';
            case 'danger': return '#f00d0d';
            case 'warning': return '#ffc107';
            default: return '#0d6efd';
        }
    };

    return (
        <div style={{position: 'relative', width: 150, height: 150}}>
            <PieChart width={150} height={150}>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={60}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                >
                    <Cell fill={getColor()}/>
                    <Cell fill="#E9ECEF"/>
                </Pie>
            </PieChart>
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    color: "#000000"
                }}
            >
                {percentage}%
            </div>
        </div>
    );
};

NutritionChart.propTypes = {
    consumed: PropTypes.number.isRequired,
    target: PropTypes.number.isRequired,
    colorClass: PropTypes.string.isRequired
};