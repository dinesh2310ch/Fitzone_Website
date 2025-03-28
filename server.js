const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const session = require('express-session');
require('dotenv').config();
const axios = require('axios'); // Ensure this line is present




const { GoogleGenerativeAI } = require('@google/generative-ai');
// Your API key
const apiKey = 'eqeUuMMBbFYc9Tm4AZXPP4Z4CD3mIPAs3RnDiGPv';


const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/search', async (req, res) => {
  const query = req.body.query;
  try {
    const prompt = query;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    res.json({ text });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error occurred while generating content' });
  }

  
});


const nutritionApiId = '52ce433c'; // Your Nutritionix API ID
const nutritionApiKey = '3a57dffeda18a5e4e43b2f7ddc5259ec'; // Your Nutritionix API Key
const nutritionApiUrl = 'https://trackapi.nutritionix.com/v2/natural/nutrients'; // Nutritionix API URL for natural nutrients

// Route for Nutrition API
app.get('/api/nutrition', async (req, res) => {
    const food = req.query.food;
    if (!food) {
        return res.status(400).send('Food parameter is required');
    }

    try {
        const response = await axios.post(nutritionApiUrl, {
            query: food
        }, {
            headers: {
                'x-app-id': nutritionApiId,
                'x-app-key': nutritionApiKey
            }
        });

        const nutritionData = response.data;
        res.json({
            nutrition: {
                carbs: nutritionData.foods[0].nf_total_carbohydrate,
                protein: nutritionData.foods[0].nf_protein,
                fat: nutritionData.foods[0].nf_total_fat
            }
        });
    } catch (error) {
        console.error('Error fetching nutrition data:', error);
        res.status(500).send('Error fetching nutrition data');
    }
});

// Create a MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '231002', // Update with your MySQL password
    database: 'info_db' // Make sure your database name is correct
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});



// Middleware
app.post('/register', (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400).json({ status: 'error', message: 'All fields are required' });
        return;
    }

    const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkUserQuery, [email], (err, results) => {
        if (err) {
            console.error('Error checking user:', err);
            res.status(500).json({ status: 'error', message: 'Error checking user' });
            return;
        }
        if (results.length > 0) {
            res.status(400).json({ status: 'error', message: 'User already exists' });
            return;
        }

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Error hashing password:', err);
                res.status(500).json({ status: 'error', message: 'Error hashing password' });
                return;
            }

            const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
            db.query(query, [name, email, hashedPassword], (err, result) => {
                if (err) {
                    console.error('Error during registration:', err);
                    res.status(500).json({ status: 'error', message: 'Error during registration' });
                    return;
                }
                res.json({ status: 'success', message: 'Registration successful' });
            });
        });
    });
});

// Login endpoint
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error during login:', err);
            res.status(500).json({ status: 'error', message: 'Error during login' });
            return;
        }
        if (results.length === 0) {
            res.status(401).json({ status: 'error', message: 'Invalid credentials' });
            return;
        }
        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Error comparing password:', err);
                res.status(500).json({ status: 'error', message: 'Error comparing password' });
                return;
            }
            if (!isMatch) {
                res.status(401).json({ status: 'error', message: 'Invalid credentials' });
                return;
            }

            req.session.userId = user.id;
            req.session.userEmail = email;
            res.json({ status: 'success', message: 'Login successful' });
        });
    });
});

// Logout endpoint
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error logging out:', err);
            res.status(500).json({ status: 'error', message: 'Error logging out' });
            return;
        }
        res.json({ status: 'success', message: 'Logout successful' });
    });
});

app.get('/welcome', (req, res) => {
    if (!req.session.userId) {
        res.redirect('/login.html');
    } else {
        res.sendFile(path.join(__dirname, 'public', 'welcome.html'));
    }
});

// Fetch user data endpoint
app.get('/user', (req, res) => {
    if (!req.session.userId) {
        res.status(401).json({ status: 'error', message: 'Not authenticated' });
        return;
    }

    const query = 'SELECT name FROM users WHERE id = ?';
    db.query(query, [req.session.userId], (err, results) => {
        if (err) {
            console.error('Error querying data:', err);
            res.status(500).json({ status: 'error', message: 'Error querying data' });
            return;
        }
        
        if (results.length === 0) {
            res.status(404).json({ status: 'error', message: 'User not found' });
            return;
        }
        
        res.json({ status: 'success', name: results[0].name });
    });
});

// Serve the login page
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve the information form page
app.get('/information.html', (req, res) => {
    if (!req.session.userId) {
        res.redirect('/login.html');
        return;
    }
    res.sendFile(path.join(__dirname, 'public', 'information.html'));
});

// Handle the information form submission
app.post('/submit-info', (req, res) => {
    const { name, gender, phone, email, dob, address, weight, height, bloodGroup, medicalInjuries, fitnessGoals } = req.body;

    if (!req.session.userId) {
        res.status(401).json({ status: 'error', message: 'Not authenticated' });
        return;
    }

    const query = `INSERT INTO personal_details (name, gender, phone, email, dob, address, weight, height, bloodGroup, medicalInjuries, fitnessGoals, user_id) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [name, gender, phone, email, dob, address, weight, height, bloodGroup, medicalInjuries, fitnessGoals, req.session.userId], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            res.status(500).json({ status: 'error', message: 'Error inserting data' });
            return;
        }
        res.json({ status: 'success', message: 'Data saved' });
    });
});
// Endpoint to get diet records
// Fetch diet records endpoint
app.get('/diet-records', (req, res) => {
    if (!req.session.userId) {
        // If the user is not authenticated, redirect to login page
        return res.status(401).json({ status: 'error', message: 'Please log in to access this resource' });
    }

    // If authenticated, fetch diet records
    const query = 'SELECT * FROM diet_records WHERE user_id = ? ORDER BY date DESC';
    db.query(query, [req.session.userId], (err, results) => {
        if (err) {
            console.error('Error fetching diet records:', err);
            res.status(500).json({ status: 'error', message: 'Error fetching diet records' });
            return;
        }
        res.json({ status: 'success', records: results });
    });
});


app.post('/submit-diet', (req, res) => {
    // Ensure user is logged in
    if (!req.session.userId) {
        return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    // Extract data from the request body
    const {
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
    } = req.body;

    // Calculate total calories
    const totalCalories = 
        (parseInt(breakfastCalories) || 0) +
        (parseInt(lunchCalories) || 0) +
        (parseInt(dinnerCalories) || 0) +
        (parseInt(snacksCalories) || 0);

    // Prepare SQL query to insert diet record
    const query = `
        INSERT INTO diet_records (
            user_id, date, breakfast, breakfast_calories, lunch, lunch_calories,
            dinner, dinner_calories, snacks, snacks_calories,
            hydration_goal, hydration_actual, protein, fats, carbs,
            calories_burned, mood, energy, total_calories
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
        req.session.userId, // Use userId from session
        date, breakfast, breakfastCalories, lunch, lunchCalories,
        dinner, dinnerCalories, snacks, snacksCalories,
        hydrationGoal, hydrationActual, protein, fats, carbs,
        caloriesBurned, mood, energy, totalCalories
    ];

    // Insert data into the database
    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error inserting diet record:', err);
            return res.status(500).json({ status: 'error', message: 'Error inserting diet record' });
        }
        res.json({ status: 'success', message: 'Diet record saved successfully' });
    });
});



app.get('/user-details', (req, res) => {
    if (!req.session.userId) {
        res.status(401).json({ status: 'error', message: 'Not authenticated' });
        return;
    }

    const query = `SELECT * FROM personal_details WHERE user_id = ?`;
    db.query(query, [req.session.userId], (err, results) => {
        if (err) {
            console.error('Error fetching user details:', err);
            res.status(500).json({ status: 'error', message: 'Error fetching user details' });
            return;
        }
        if (results.length > 0) {
            res.json({ status: 'success', data: results[0] });
        } else {
            res.json({ status: 'success', data: null });
        }
    });
});

// Submit fitness record endpoint
app.post('/submit-fitness', (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const { date, exercise, duration, calories_burned, notes } = req.body;
    const query = 'INSERT INTO fitness_records (user_id, date, exercise, duration, calories_burned, notes) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [userId, date, exercise, duration, calories_burned, notes], (err, result) => {
        if (err) {
            console.error('Error submitting fitness record:', err);
            return res.status(500).json({ status: 'error', message: 'Error submitting fitness record' });
        }
        res.json({ status: 'success', message: 'Fitness record submitted successfully' });
    });
});
// Fetch fitness records endpoint
app.get('/fitness-records', (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const query = 'SELECT * FROM fitness_records WHERE user_id = ? ORDER BY date DESC';
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching fitness records:', err);
            return res.status(500).json({ status: 'error', message: 'Error fetching fitness records' });
        }
        res.json({ status: 'success', records: results });
    });
});
// Fetch meditation records endpoint
app.get('/meditation-records', (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
        return;
    }

    const query = 'SELECT * FROM meditation_records WHERE user_id = ? ORDER BY date DESC';
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching meditation records:', err);
            res.status(500).json({ status: 'error', message: 'Error fetching meditation records' });
            return;
        }
        res.json({ status: 'success', records: results });
    });
});

// Submit meditation record endpoint
app.post('/submit-meditation', (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
        return;
    }

    const { date, session_type, duration, notes } = req.body;
    const query = 'INSERT INTO meditation_records (user_id, date, session_type, duration, notes) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [userId, date, session_type, duration, notes], (err, result) => {
        if (err) {
            console.error('Error submitting meditation record:', err);
            res.status(500).json({ status: 'error', message: 'Error submitting meditation record' });
            return;
        }
        res.json({ status: 'success', message: 'Meditation record submitted successfully' });
    });
});



// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
