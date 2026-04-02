/**
 * Name: Jeethesh Pallinti
 * Date: 04.02.2026
 * Logic for handling joke data from the database.
 */
let db = require('./db');

/** Gets all unique categories */
async function getCategories(req, res) {
    try {
        let result = await db.query('SELECT DISTINCT category FROM jokes');
        let categories = result.rows.map(row => row.category);
        res.json(categories);
    } catch (err) {
        res.status(500).send("Database error");
    }
}

/** Gets jokes by category with optional limit */
async function getJokesByCategory(req, res) {
    let category = req.params.category;
    let limit = req.query.limit;
    try {
        let query = 'SELECT setup, delivery FROM jokes WHERE category = $1';
        if (limit) query += ` LIMIT ${parseInt(limit)}`;
        
        let result = await db.query(query, [category]);
        if (result.rows.length === 0) {
            res.status(404).send("Category not found");
        } else {
            res.json(result.rows);
        }
    } catch (err) {
        res.status(500).send("Database error");
    }
}

/** Adds a new joke */
async function addJoke(req, res) {
    let { category, setup, delivery } = req.body;
    if (!category || !setup || !delivery) {
        return res.status(400).send("Missing parameters");
    }
    try {
        await db.query('INSERT INTO jokes (category, setup, delivery) VALUES ($1, $2, $3)', [category, setup, delivery]);
        let result = await db.query('SELECT setup, delivery FROM jokes WHERE category = $1', [category]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).send("Database error");
    }
}

module.exports = { getCategories, getJokesByCategory, addJoke };