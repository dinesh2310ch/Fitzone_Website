document.addEventListener('DOMContentLoaded', function () {
    const saveBtn = document.getElementById('save-btn');
    const refreshBtn = document.getElementById('refresh-btn');

    saveBtn.addEventListener('click', function () {
        const date = document.getElementById('date').value;
        const breakfast = document.getElementById('breakfast').value;
        const breakfastCalories = document.getElementById('breakfast-calories').value;
        const lunch = document.getElementById('lunch').value;
        const lunchCalories = document.getElementById('lunch-calories').value;
        const dinner = document.getElementById('dinner').value;
        const dinnerCalories = document.getElementById('dinner-calories').value;
        const snacks = document.getElementById('snacks').value;
        const snacksCalories = document.getElementById('snacks-calories').value;
        const hydrationGoal = document.getElementById('hydration-goal').value;
        const hydrationActual = document.getElementById('hydration-actual').value;
        const protein = document.getElementById('protein').value;
        const fats = document.getElementById('fats').value;
        const carbs = document.getElementById('carbs').value;
        const caloriesBurned = document.getElementById('calories-burned').value;
        const mood = document.getElementById('mood').value;
        const energy = document.getElementById('energy').value;

        fetch('/submit-diet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                date,
                breakfast,
                breakfastCalories,
                lunch,
                lunchCalories,
                dinner,
                dinnerCalories,
                snacks,
                snacksCalories,
                hydrationGoal,
                hydrationActual,
                protein,
                fats,
                carbs,
                caloriesBurned,
                mood,
                energy
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            // Optionally fetch and display updated records
            fetchDietRecords();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });

    refreshBtn.addEventListener('click', function () {
        console.log('Refresh button clicked');
        fetchDietRecords();
        fetchAndRenderCharts();
    });

    function fetchDietRecords() {
        fetch('/diet-records')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    const tableBody = document.querySelector('#diet-records tbody');
                    tableBody.innerHTML = ''; // Clear existing records

                    data.records.forEach(record => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${record.date}</td>
                            <td>${record.breakfast}</td>
                            <td>${record.lunch}</td>
                            <td>${record.dinner}</td>
                            <td>${record.snacks}</td>
                            <td>${record.total_calories}</td>
                            
                            <td>${record.mood}</td>
                            <td>${record.energy}</td>
                        `;
                        tableBody.appendChild(row);
                    });
                } else {
                    console.error('Error fetching diet records:', data.message);
                }
            })
            .catch(error => console.error('Error:', error));
    }

    function fetchAndRenderCharts() {
        fetch('/diet-records')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    const labels = data.records.map(record => record.date);
                    
                    // Chart 1: Meal Distribution
                    const breakfastData = data.records.map(record => record.breakfast_calories || 0);
                    const lunchData = data.records.map(record => record.lunch_calories || 0);
                    const dinnerData = data.records.map(record => record.dinner_calories || 0);
                    const snacksData = data.records.map(record => record.snacks_calories || 0);

                    const mealCtx = document.getElementById('meal-chart').getContext('2d');
                    new Chart(mealCtx, {
                        type: 'bar',
                        data: {
                            labels: labels,
                            datasets: [
                                {
                                    label: 'Breakfast Calories',
                                    data: breakfastData,
                                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                    borderColor: 'rgba(255, 99, 132, 1)',
                                    borderWidth: 1
                                },
                                {
                                    label: 'Lunch Calories',
                                    data: lunchData,
                                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                    borderColor: 'rgba(54, 162, 235, 1)',
                                    borderWidth: 1
                                },
                                {
                                    label: 'Dinner Calories',
                                    data: dinnerData,
                                    backgroundColor: 'rgba(255, 206, 86, 0.2)',
                                    borderColor: 'rgba(255, 206, 86, 1)',
                                    borderWidth: 1
                                },
                                {
                                    label: 'Snacks Calories',
                                    data: snacksData,
                                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                    borderColor: 'rgba(75, 192, 192, 1)',
                                    borderWidth: 1
                                }
                            ]
                        },
                        options: {
                            scales: {
                                x: {
                                    stacked: true,
                                    beginAtZero: true
                                },
                                y: {
                                    stacked: true,
                                    beginAtZero: true
                                }
                            }
                        }
                    });

                    // Chart 2: Mood Distribution
                    const moodCounts = data.records.reduce((acc, record) => {
                        acc[record.mood] = (acc[record.mood] || 0) + 1;
                        return acc;
                    }, {});

                    const moodLabels = Object.keys(moodCounts);
                    const moodData = Object.values(moodCounts);

                    const moodCtx = document.getElementById('mood-chart').getContext('2d');
                    new Chart(moodCtx, {
                        type: 'pie',
                        data: {
                            labels: moodLabels,
                            datasets: [{
                                data: moodData,
                                backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'],
                                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
                                borderWidth: 1
                            }]
                        }
                    });

                    // Chart 3: Energy Distribution
                    const energyCounts = data.records.reduce((acc, record) => {
                        acc[record.energy] = (acc[record.energy] || 0) + 1;
                        return acc;
                    }, {});

                    const energyLabels = Object.keys(energyCounts);
                    const energyData = Object.values(energyCounts);

                    const energyCtx = document.getElementById('energy-chart').getContext('2d');
                    new Chart(energyCtx, {
                        type: 'pie',
                        data: {
                            labels: energyLabels,
                            datasets: [{
                                data: energyData,
                                backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'],
                                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
                                borderWidth: 1
                            }]
                        }
                    });

              
                } else {
                    console.error('Error fetching diet records for chart:', data.message);
                }
            })
            .catch(error => console.error('Error:', error));
    }

    
    fetchDietRecords();
    fetchAndRenderCharts();
});
