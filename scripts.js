function register() {
    const form = document.getElementById('registerForm');
    const formData = new FormData(form);

    fetch('/register', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(formData)),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Registration successful!');
            window.location.href = '/login.html';
        } else {
            alert('Registration failed: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during registration');
    });
}

function login() {
    const form = document.getElementById('loginForm');
    const formData = new FormData(form);

    fetch('/login', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(formData)),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Login successful!');
            window.location.href = '/welcome'; // Redirect to welcome page
        } else {
            alert('Login failed: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during login');
    });
}
function logout() {
    fetch('/logout', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Logout successful!');
            window.location.href = '/login.html';
        } else {
            alert('Logout failed: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during logout');
    });
}