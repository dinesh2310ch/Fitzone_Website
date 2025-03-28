document.getElementById('fitness-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = {
        date: formData.get('date'),
        exercise: formData.get('exercise'),
        duration: formData.get('duration'),
        calories_burned: formData.get('calories_burned'),
        notes: formData.get('notes')
    };

    try {
        const response = await fetch('/submit-fitness', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        document.getElementById('fitness-message').textContent = result.message;
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('fitness-message').textContent = 'An error occurred. Please try again.';
    }
});
