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
     * Decodes HTML entities returned by the trivia API.
     *
     * @param {string} value - Encoded API text.
     * @returns {string} Decoded plain text.
     */
    function decodeHtml(value) {
        const parser = document.createElement("textarea");
        parser.innerHTML = value;
        return parser.value;
    }

    /**
     * Displays fetched trivia questions.
     * @param {Object[]} questions - Array of trivia questions.
     */
    function displayQuestions(questions) {
        questionContainer.innerHTML = ""; // Clear existing questions
        questions.forEach((question, index) => {
            const questionDiv = document.createElement("div");

            const questionText = document.createElement("p");
            questionText.textContent = decodeHtml(question.question);

            questionDiv.appendChild(questionText);
            questionDiv.appendChild(
                createAnswerOptions(
                    question.correct_answer,
                    question.incorrect_answers,
                    index
                )
            );

            questionContainer.appendChild(questionDiv);
        });
    }

    /**
     * Creates HTML for answer options.
     * @param {string} correctAnswer - The correct answer for the question.
     * @param {string[]} incorrectAnswers - Array of incorrect answers.
     * @param {number} questionIndex - The index of the current question.
     * @returns {HTMLDivElement} A container of answer option elements.
     */
    function createAnswerOptions(
        correctAnswer,
        incorrectAnswers,
        questionIndex
    ) {
        const allAnswers = [correctAnswer, ...incorrectAnswers].sort(
            () => Math.random() - 0.5
        );

        const optionsContainer = document.createElement("div");

        allAnswers.forEach((answer) => {
            const label = document.createElement("label");
            const input = document.createElement("input");

            input.type = "radio";
            input.name = `answer${questionIndex}`;
            input.value = decodeHtml(answer);

            if (answer === correctAnswer) {
                input.dataset.correct = "true";
            }

            label.appendChild(input);
            label.append(` ${decodeHtml(answer)}`);
            optionsContainer.appendChild(label);
        });

        return optionsContainer;
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
     * Deletes a cookie by setting its expiry date in the past.
     *
     * @param {string} name - The cookie key to delete.
     */
    function deleteCookie(name) {
        document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
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
     * Retrieves and renders saved scores from localStorage.
     */
    function displayScores() {
        const scoreTableBody = document.querySelector("#score-table tbody");
        const savedScores = JSON.parse(localStorage.getItem("triviaScores")) || [];

        scoreTableBody.innerHTML = "";

        savedScores.forEach((entry) => {
            const row = document.createElement("tr");
            const userCell = document.createElement("td");
            const scoreCell = document.createElement("td");

            userCell.textContent = entry.username;
            scoreCell.textContent = entry.score;

            row.appendChild(userCell);
            row.appendChild(scoreCell);
            scoreTableBody.appendChild(row);
        });
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
     * Saves a new score entry in localStorage without overwriting existing data.
     *
     * @param {string} username - Active player username.
     * @param {number} score - Calculated score for the round.
     */
    function saveScore(username, score) {
        const savedScores = JSON.parse(localStorage.getItem("triviaScores")) || [];
        savedScores.push({ username, score });
        localStorage.setItem("triviaScores", JSON.stringify(savedScores));
    }

    function newPlayer() {
        deleteCookie("username");
        form.reset();
        checkUsername();
        fetchQuestions();
        usernameInput.focus();
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

        const score = calculateScore();
        saveScore(activeUsername, score);
        displayScores();

        alert(`${activeUsername}, you scored ${score} out of 10.`);

        // Prepare next round.
        fetchQuestions();
    }
});