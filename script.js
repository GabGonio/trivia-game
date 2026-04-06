/**
 * Initializes the Trivia Game when the DOM is fully loaded.
 */
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("trivia-form");
    const questionContainer = document.getElementById("question-container");
    const newPlayerButton = document.getElementById("new-player");
    const usernameInput = document.getElementById("username");

    // Initialize the game
    checkUsername();
    fetchQuestions();
    displayScores();

    /**
     * Fetches trivia questions from the API and displays them.
     */
    function fetchQuestions() {
        showLoading(true); // Show loading state

        fetch("https://opentdb.com/api.php?amount=10&type=multiple")
            .then((response) => response.json())
            .then((data) => {
                displayQuestions(data.results);
                showLoading(false); // Hide loading state
            })
            .catch((error) => {
                console.error("Error fetching questions:", error);
                showLoading(false); // Hide loading state on error
            });
    }

    /**
     * Toggles the display of the loading state and question container.
     *
     * @param {boolean} isLoading - Indicates whether the loading state should be shown.
     */
    function showLoading(isLoading) {
        document.getElementById("loading-container").classList = isLoading
            ? ""
            : "hidden";
        document.getElementById("question-container").classList = isLoading
            ? "hidden"
            : "";
    }

    /**
     * Displays fetched trivia questions.
     * @param {Object[]} questions - Array of trivia questions.
     */
    function displayQuestions(questions) {
        questionContainer.innerHTML = ""; // Clear existing questions
        questions.forEach((question, index) => {
            const questionDiv = document.createElement("div");
            questionDiv.innerHTML = `
                <p>${question.question}</p>
                ${createAnswerOptions(
                    question.correct_answer,
                    question.incorrect_answers,
                    index
                )}
            `;
            questionContainer.appendChild(questionDiv);
        });
    }

    /**
     * Creates HTML for answer options.
     * @param {string} correctAnswer - The correct answer for the question.
     * @param {string[]} incorrectAnswers - Array of incorrect answers.
     * @param {number} questionIndex - The index of the current question.
     * @returns {string} HTML string of answer options.
     */
    function createAnswerOptions(
        correctAnswer,
        incorrectAnswers,
        questionIndex
    ) {
        const allAnswers = [correctAnswer, ...incorrectAnswers].sort(
            () => Math.random() - 0.5
        );
        return allAnswers
            .map(
                (answer) => `
            <label>
                <input type="radio" name="answer${questionIndex}" value="${answer}" ${
                    answer === correctAnswer ? 'data-correct="true"' : ""
                }>
                ${answer}
            </label>
        `
            )
            .join("");
    }

    /**
     * Stores a cookie with an expiry date.
     *
     * @param {string} name - The cookie key.
     * @param {string} value - The cookie value.
     * @param {number} [days=7] - Number of days until expiry.
     */
    function setCookie(name, value, days = 7) {
        const expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + days * 24 * 60 * 60 * 1000);
        const expires = `expires=${expiryDate.toUTCString()}`;

        document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; ${expires}; path=/`;
    }

    /**
     * Retrieves a cookie value by key.
     *
     * @param {string} name - The cookie key to read.
     * @returns {string|null} The cookie value, or null if not found.
     */
    function getCookie(name) {
        const encodedName = `${encodeURIComponent(name)}=`;
        const cookieParts = document.cookie.split("; ");

        for (const part of cookieParts) {
            if (part.startsWith(encodedName)) {
                return decodeURIComponent(part.substring(encodedName.length));
            }
        }

        return null;
    }

    /**
     * Checks whether a username cookie exists and updates the UI state.
     * Returning players have their username shown and can switch users with
     * the New Player button.
     */
    function checkUsername() {
        const cookieUsername = getCookie("username");

        if (cookieUsername) {
            usernameInput.value = cookieUsername;
            usernameInput.disabled = true;
            newPlayerButton.classList.remove("hidden");
        } else {
            usernameInput.value = "";
            usernameInput.disabled = false;
            newPlayerButton.classList.add("hidden");
        }
    }

    /**
     * Placeholder for future score table rendering logic.
     */
    function displayScores() {
        // Implemented in score persistence step.
    }

    /**
     * Placeholder for score calculation logic.
     *
     * @returns {number} The calculated score.
     */
    function calculateScore() {
        const selectedAnswers = form.querySelectorAll('input[type="radio"]:checked');
        let score = 0;

        selectedAnswers.forEach((input) => {
            if (input.dataset.correct === "true") {
                score += 1;
            }
        });

        return score;
    }

    /**
     * Placeholder for score persistence logic.
     *
     * @param {string} username - Active player username.
     * @param {number} score - Calculated score for the round.
     */
    function saveScore(username, score) {
        // Implemented in score persistence step.
    }

    /**
     * Placeholder for future new player logic.
     */
    function newPlayer() {
        // Implemented in session enhancement step.
    }

    // Event listeners for form submission and new player button
    form.addEventListener("submit", handleFormSubmit);
    newPlayerButton.addEventListener("click", newPlayer);

    /**
     * Handles the trivia form submission.
     * @param {Event} event - The submit event.
     */
    function handleFormSubmit(event) {
        event.preventDefault();
        const enteredName = usernameInput.value.trim();
        const storedUsername = getCookie("username");

        if (!enteredName && !storedUsername) {
            alert("Please enter a username before submitting.");
            usernameInput.focus();
            return;
        }

        if (enteredName && !storedUsername) {
            setCookie("username", enteredName);
        }

        const activeUsername = getCookie("username") || enteredName;

        checkUsername();

        // Placeholder flow for upcoming steps.
        const score = calculateScore();
        saveScore(activeUsername, score);
        displayScores();

        // Prepare next round.
        fetchQuestions();
    }
});