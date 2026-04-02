/**
 * Name: Jeethesh Pallinti
 * Date: 04.02.2026
 * Main server file to start the Node/Express application.
 */
let express = require('express');
let cors = require('cors');
let controller = require('./jokes-controller');

let app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Put your index.html, styles.css, script.js in a folder named 'public'

// Endpoints
app.get('/jokebook/categories', controller.getCategories);
app.get('/jokebook/category/:category', controller.getJokesByCategory);
app.post('/jokebook/joke/add', controller.addJoke);

// Random joke logic (simplified for example)
app.get('/jokebook/random', async (req, res) => {
    let db = require('./db');
    let result = await db.query('SELECT setup, delivery FROM jokes ORDER BY RANDOM() LIMIT 1');
    res.json(result.rows[0]);
});

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});