# Debugging Analysis - Trivia Game

## Breakpoint 1 - Form Submission Validation

### Why this is a logical breakpoint
This is the first executable line of form submission logic. Pausing here confirms the submit handler is firing and allows inspection of values that control validation and scoring flow.

### Screenshot A (Paused at line 254)
- Observed state:
	- event is a valid SubmitEvent
	- Execution has entered handleFormSubmit
	- No validation variables have been initialized yet

### Screenshot B (After step over to next line)
- Observed state change:
	- Execution moved to const enteredName = usernameInput.value.trim();
	- Form validation variable extraction begins as expected
	- Confirms submit flow is progressing normally

## Breakpoint 2 - API Success Callback

### Location
- Function: fetchQuestions()
- Breakpoint line: displayQuestions(data.results); (line 24)

### Why this is a logical breakpoint
This is the point where parsed API data is first used. It verifies the successful async path before UI rendering.

### Screenshot A (Paused at line 24)
- Observed state:
	- data exists in local scope
	- data.response_code is visible
	- data.results is present as Array(10)
	- Confirms trivia questions were fetched and parsed successfully

### Screenshot B (After step over to line 25)
- File: screenshots/screenshot4.png
- Observed state change:
	- Execution moved to showLoading(false);
	- Indicates displayQuestions(data.results) executed
	- Confirms transition from loading state to displayed question state

## Breakpoint 3 - Score Calculation Logic

### Location
- Function: calculateScore()
- Breakpoint line: if (input.dataset.correct === "true") (line 217)

### Why this is a logical breakpoint
This condition controls whether score increments. Pausing here verifies correctness checks for each selected answer.

### Screenshot A (Paused inside scoring condition)
- Observed state:
	- Loop is iterating selected radio inputs
	- Current input is visible in scope
	- Correctness is evaluated using dataset.correct

### Screenshot B (After stepping through loop)
- Observed state change:
	- Execution moved near loop completion
	- Score has been updated for correct selections
	- Function is close to returning final computed score

## Critical State Analysis

### Chosen state
Breakpoint 2, Screenshot A (displayQuestions(data.results) at line 24).

### Why this state is critical
This is the exact handoff point between networking and rendering:
- API call has succeeded
- JSON parsing has succeeded
- Question payload (data.results) exists and is correctly structured

If this state is valid, downstream rendering and user interaction can proceed. If it is invalid, the rest of the game flow cannot function.

### Is the state expected?
Yes. The state shows response_code: 0 and results: Array(10), which matches OpenTDB's expected successful response format.

## Notes on Debugging Process

- Initial confusion occurred when stepping over fetch(...) directly; debugger appeared to jump to later lines because async callbacks run after the current call stack.
- Correct approach was to set the breakpoint inside the .then((data) => { ... }) callback and use Resume.
- Final breakpoint set validated:
	- Form submit entry and validation flow
	- API success callback and payload structure
	- Score condition and score accumulation logic

## Conclusion

The debugging session confirms that the main gameplay path works as intended:
- Submit event enters validation logic
- API data is fetched and parsed into 10 questions
- Score calculation correctly checks selected answers and increments for correct responses

