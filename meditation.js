document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('meditation-form');
    const messageEl = document.getElementById('meditation-message');
    const recordsContainer = document.getElementById('records-container');
    const clearRecordsButton = document.getElementById('clear-records');

    // Fetch existing meditation records
    fetch('/meditation-records')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                renderRecords(data.records);
            } else {
                console.error('Error fetching records:', data.message);
            }
        });

    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        fetch('/submit-meditation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.status === 'success') {
                messageEl.textContent = 'Record submitted successfully!';
                form.reset();
                fetch('/meditation-records')
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 'success') {
                            renderRecords(data.records);
                        }
                    });
            } else {
                messageEl.textContent = 'Error submitting record.';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            messageEl.textContent = 'Error submitting record.';
        });
    });

    // Handle Clear All Records button click
    clearRecordsButton.addEventListener('click', () => {
        fetch('/clear-meditation-records', {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(result => {
            if (result.status === 'success') {
                messageEl.textContent = 'All records cleared successfully!';
                recordsContainer.innerHTML = '';
            } else {
                messageEl.textContent = 'Error clearing records.';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            messageEl.textContent = 'Error clearing records.';
        });
    });

    function renderRecords(records) {
        recordsContainer.innerHTML = '';
        records.forEach(record => {
            const recordDiv = document.createElement('div');
            recordDiv.innerHTML = `
                <p><strong>Date:</strong> ${record.date}</p>
                <p><strong>Session Type:</strong> ${record.session_type}</p>
                <p><strong>Duration:</strong> ${record.duration} minutes</p>
                <p><strong>Notes:</strong> ${record.notes}</p>
                <hr>
            `;
            recordsContainer.appendChild(recordDiv);
        });
    }
});
