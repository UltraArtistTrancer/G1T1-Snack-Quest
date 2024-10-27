function createDonutChart(ctx, data, backgroundColors) {
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Consumed', 'Remaining'],
      datasets: [{
        data: data,
        backgroundColor: backgroundColors
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  createDonutChart(document.getElementById('caloriesChart').getContext('2d'), [1800, 700], ['#FF6384', '#CCCCCC']);
  createDonutChart(document.getElementById('carbsChart').getContext('2d'), [125, 175], ['#36A2EB', '#CCCCCC']);
  createDonutChart(document.getElementById('proteinChart').getContext('2d'), [35, 15], ['#FFCE56', '#CCCCCC']);
  createDonutChart(document.getElementById('fatsChart').getContext('2d'), [55, 15], ['#4BC0C0', '#CCCCCC']);
});