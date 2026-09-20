# Test Report

## Scope

The implementation was reviewed for the required screening-task behaviors: debouncing, loading/empty/error states, keyboard navigation, and protection against stale or out-of-order responses.

## Code-level verification

The implementation includes:

- 300 ms debounce before API requests.
- AbortController cancellation when a newer query supersedes an older request.
- A monotonically increasing request sequence so stale responses cannot update the UI.
- Request-sequence invalidation when the input is cleared.
- Loading, empty, error, and idle states.
- Arrow Up and Arrow Down navigation.
- Enter selection.
- Escape handling.
- Accessible combobox/listbox/option semantics.
- Responsive styling.
- Automated tests covering the main interaction and race-condition cases.

A review also identified and fixed two interaction issues before submission:

1. Clearing the query now invalidates the active request sequence, preventing a late response from repopulating a cleared input.
2. Selecting a result no longer immediately triggers a second search for the selected country name.

## Runtime test status

A full npm install and runtime test/build execution was attempted in the available environment. Dependency installation did not complete within the execution limit, so a completed Vitest or Vite build result is not claimed here.

The repository therefore contains the test suite and the final implementation, but the final runtime command should be run by the deployment environment or CI after dependencies are installed.

Commands:

```bash
npm install
npm test
npm run build
```
