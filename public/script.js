/**
 * Name: Jeethesh Pallinti
 * Date: 04.02.2026
 * CSC 372-01
 * Client-side logic for the Jokebook application. Handles API calls to 
 * the local Node/Express backend and the external JokeAPI for extra credit.
 */

"use strict";

(function() {
    const BASE_URL = "http://localhost:3000/jokebook";

    /**
     * Initializes the page by loading a random joke, the category list,
     * and setting up event listeners.
     */
    function init() {
        loadRandomJoke();
        loadCategories();

        document.getElementById("search-button").addEventListener("click", handleSearch);
        document.getElementById("add-joke-form").addEventListener("submit", addNewJoke);
    }

    /**
     * Fetches a random joke from the backend and displays it.
     */
    async function loadRandomJoke() {
        try {
            let response = await fetch(`${BASE_URL}/random`);
            let joke = await response.json();
            
            let display = document.getElementById("random-joke-display");
            display.innerHTML = ""; // Clear existing content
            
            display.appendChild(createJokeElement(joke));
        } catch (error) {
            console.error("Error fetching random joke:", error);
        }
    }

    /**
     * Fetches all joke categories and displays them as clickable items.
     */
    async function loadCategories() {
        try {
            let response = await fetch(`${BASE_URL}/categories`);
            let categories = await response.json();
            
            let list = document.getElementById("category-list");
            list.innerHTML = "";

            categories.forEach(category => {
                let li = document.createElement("li");
                li.textContent = category;
                li.classList.add("category-item");
                li.addEventListener("click", () => {
                    loadJokesByCategory(category);
                });
                list.appendChild(li);
            });
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }

    /**
     * Fetches jokes for a specific category. If not found locally, 
     * attempts to fetch from external JokeAPI (Extra Credit).
     * @param {string} categoryName - The name of the category to search.
     */
    async function loadJokesByCategory(categoryName) {
        try {
            let response = await fetch(`${BASE_URL}/category/${categoryName}`);
            
            if (!response.ok) {
                // If local search fails, try external API (Extra Credit)
                await fetchFromExternalAPI(categoryName);
            } else {
                let jokes = await response.json();
                displayJokeList(categoryName, jokes);
            }
        } catch (error) {
            console.error("Error fetching category jokes:", error);
        }
    }

    /**
     * Handles the search input field logic.
     */
    function handleSearch() {
        let query = document.getElementById("category-search").value.trim();
        if (query) {
            loadJokesByCategory(query);
        }
    }

    /**
     * Fetches up to 3 two-part jokes from an external API if not found locally,
     * and saves them to the local database.
     * @param {string} category - The category string to search for.
     */
    async function fetchFromExternalAPI(category) {
        try {
            // Added &safe-mode to comply with "No inappropriate jokes" rule
            const EXTERNAL_URL = `https://sv443.net/jokeapi/v2/joke/${category}?type=twopart&amount=3&safe-mode`;
            let response = await fetch(EXTERNAL_URL);
            let data = await response.json();

            if (data.error) {
                alert("Category not found locally or externally.");
            } else {
                // Requirement: Add these jokes to your own database
                for (let j of data.jokes) {
                    await saveExternalJoke(category, j.setup, j.delivery);
                }
                // After saving all, refresh the view
                loadJokesByCategory(category);
                loadCategories(); 
            }
        } catch (error) {
            console.error("External API error:", error);
        }
    }

    /**
     * Helper to POST an external joke to the local backend.
     * @param {string} category - Joke category.
     * @param {string} setup - Joke setup.
     * @param {string} delivery - Joke delivery.
     */
    async function saveExternalJoke(category, setup, delivery) {
        await fetch(`${BASE_URL}/joke/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category, setup, delivery })
        });
    }

    /**
     * Submits a new joke via POST and refreshes the display.
     * @param {Event} event - The form submission event.
     */
    async function addNewJoke(event) {
        event.preventDefault();

        let newJoke = {
            category: document.getElementById("new-category").value,
            setup: document.getElementById("new-setup").value,
            delivery: document.getElementById("new-delivery").value
        };

        try {
            let response = await fetch(`${BASE_URL}/joke/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newJoke)
            });

            if (response.ok) {
                let updatedJokes = await response.json();
                displayJokeList(newJoke.category, updatedJokes);
                document.getElementById("add-joke-form").reset();
                loadCategories(); // Refresh list in case a new category was made
            } else {
                alert("Failed to add joke. Please check all fields.");
            }
        } catch (error) {
            console.error("Error adding joke:", error);
        }
    }

    /**
     * Helper to clear and display a list of jokes in the main container.
     * @param {string} category - The category title.
     * @param {Array} jokes - The array of joke objects.
     */
    function displayJokeList(category, jokes) {
        let container = document.getElementById("jokes-container");
        let title = document.getElementById("current-category-title");
        
        container.innerHTML = "";
        title.textContent = `Jokes in "${category}"`;

        jokes.forEach(joke => {
            container.appendChild(createJokeElement(joke));
        });
    }

    /**
     * Creates a DOM element representing a joke card.
     * @param {Object} joke - The joke object containing setup and delivery.
     * @return {HTMLElement} The created joke card element.
     */
    function createJokeElement(joke) {
        let card = document.createElement("div");
        card.classList.add("joke-card");

        let setup = document.createElement("span");
        setup.classList.add("joke-setup");
        setup.textContent = joke.setup;

        let delivery = document.createElement("span");
        delivery.classList.add("joke-delivery");
        delivery.textContent = joke.delivery;

        card.appendChild(setup);
        card.appendChild(delivery);
        return card;
    }

    window.addEventListener("load", init);
})();