window.addEventListener('DOMContentLoaded', (event) => {
    fetch('/fitness-records')
    .then(response => response.json())
    .then(result => {
        const container = document.getElementById('records-container');
        if (result.status === 'success' && result.records.length > 0) {
            let exerciseDurations = {};
            let caloriesBurned = {};
            
            result.records.forEach(record => {
                // Create Exercise Duration Breakdown
                if (!exerciseDurations[record.exercise]) {
                    exerciseDurations[record.exercise] = 0;
                }
                exerciseDurations[record.exercise] += record.duration;

                // Create Calories Burned Breakdown
                if (!caloriesBurned[record.exercise]) {
                    caloriesBurned[record.exercise] = 0;
                }
                caloriesBurned[record.exercise] += record.calories_burned;

                const recordDiv = document.createElement('div');
                recordDiv.className = 'record';
                recordDiv.innerHTML = `
                    <p class="date">${new Date(record.date).toLocaleDateString()}</p>
                    <p><strong>Exercise:</strong> ${record.exercise}</p>
                    <p><strong>Duration:</strong> ${record.duration} minutes</p>
                    <p><strong>Calories Burned:</strong> ${record.calories_burned}</p>
                    <p class="notes"><strong>Notes:</strong> ${record.notes || 'No notes'}</p>
                `;
                container.appendChild(recordDiv);
            });
            
            // Generate Charts
            generateCharts(exerciseDurations, caloriesBurned);
        } else {
            container.innerHTML = '<p>No records found.</p>';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        const container = document.getElementById('records-container');
        container.innerHTML = '<p>An error occurred while fetching records.</p>';
    });
});

function generateCharts(exerciseDurations, caloriesBurned) {
    const durationCtx = document.getElementById('durationChart').getContext('2d');
    const caloriesCtx = document.getElementById('caloriesChart').getContext('2d');

    const durationLabels = Object.keys(exerciseDurations);
    const durationData = Object.values(exerciseDurations);

    const caloriesLabels = Object.keys(caloriesBurned);
    const caloriesData = Object.values(caloriesBurned);

    new Chart(durationCtx, {
        type: 'bar',
        data: {
            labels: durationLabels,
            datasets: [{
                label: 'Total Duration (minutes)',
                data: durationData,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    new Chart(caloriesCtx, {
        type: 'pie',
        data: {
            labels: caloriesLabels,
            datasets: [{
                label: 'Calories Burned',
                data: caloriesData,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 205, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true
        }
    });
}
