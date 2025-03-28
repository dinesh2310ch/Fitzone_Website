document.getElementById('nutritionForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    const food = document.getElementById('foodInput').value;

    // Fetch data from both APIs
    fetch(`/api/nutrition?food=${encodeURIComponent(food)}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('result').innerHTML = `<p>${data.error}</p>`;
            } else {
                document.getElementById('result').innerHTML = `
                    <h2>Nutrition Details</h2>
                    <p><strong>Food:</strong> ${data.name || 'N/A'}</p>
                    <p><strong>Fat:</strong> ${data.fat || 'N/A'} g</p>
                    <p><strong>Protein:</strong> ${data.protein || 'N/A'} g</p>
                    <p><strong>Carbs:</strong> ${data.carbs || 'N/A'} g</p>
                    <p><strong>Calories:</strong> ${data.calories || 'N/A'} kcal</p>
                `;
            }
        })
        .catch(error => {
            document.getElementById('result').innerHTML = `<p>Error fetching data. Please try again later.</p>`;
            console.error('Error:', error);
        });

    fetch(`/api/gemini?query=${encodeURIComponent(food)}`)
        .then(response => response.json())
        .then(data => {
            // Process Gemini API data if needed
            console.log('Gemini API data:', data);
        })
        .catch(error => {
            console.error('Error fetching data from Gemini API:', error);
        });
});
