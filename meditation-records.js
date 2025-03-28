document.addEventListener('DOMContentLoaded', () => {
    const recordsContainer = document.getElementById('records-container');
    const clearRecordsButton = document.getElementById('clear-records');
    const ctx = document.getElementById('meditation-chart').getContext('2d');

    // Function to fetch meditation records from the server
    const fetchRecords = async () => {
        try {
            const response = await fetch('/meditation-records');
            const data = await response.json();

            if (data.status === 'success') {
                displayRecords(data.records);
                renderChart(data.records);
            } else {
                recordsContainer.innerText = data.message;
            }
        } catch (error) {
            console.error('Error fetching meditation records:', error);
        }
    };

    // Function to display records in card format
    const displayRecords = (records) => {
        if (records.length === 0) {
            recordsContainer.innerHTML = '<p>No records found.</p>';
            return;
        }

        recordsContainer.innerHTML = records.map(record => `
            <div class="record-card">
                <p><strong>Date:</strong> ${new Date(record.date).toLocaleDateString()}</p>
                <p><strong>Session Type:</strong> ${record.session_type}</p>
                <p><strong>Duration:</strong> ${record.duration} minutes</p>
                <p><strong>Notes:</strong> ${record.notes || 'N/A'}</p>
            </div>
        `).join('');
    };

    // Function to render a chart
    const renderChart = (records) => {
        const dates = records.map(record => new Date(record.date).toLocaleDateString());
        const durations = records.map(record => record.duration);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Meditation Duration (minutes)',
                    data: durations,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 1,
                }]
            },
            options: {
                scales: {
                    x: {
                        beginAtZero: true
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    };

    // Handle Clear Records button click
    clearRecordsButton.addEventListener('click', () => {
        recordsContainer.innerHTML = '<p>No records found.</p>';
    });

    fetchRecords();
});
