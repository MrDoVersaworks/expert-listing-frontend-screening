# Expert Listing Frontend Screening Task

A polished React typeahead/autocomplete implementation for the Expert Listing Limited Frontend Engineer screening task.

## What it demonstrates

- 300ms debounced API requests
- AbortController cancellation for superseded requests
- Request sequence guards so stale responses cannot overwrite current state
- Loading, empty, error, and idle states
- Arrow Up/Down, Enter, and Escape keyboard interactions
- ARIA combobox/listbox/option semantics
- Responsive, mobile-first UI
- Focus-visible interaction and lightweight result rendering
- Automated tests for debounce, keyboard selection, race safety, and errors

## Run

```bash
npm install
npm run dev
npm test
npm run build
```

The component uses the public REST Countries API and only requests the fields needed by the UI.

## Engineering notes

The implementation intentionally avoids introducing a state-management library or data-fetching framework for a single input. The async boundary is isolated in `src/lib/api.js`, while the component owns interaction state. `AbortController` prevents unnecessary work for superseded requests, while a monotonically increasing request sequence provides a second correctness guard because cancellation cannot guarantee that an already-resolved response will not reach application code.

For production traffic, I would move the API behind a server-side route or edge cache, add rate limiting and observability, cache common queries, enforce result-size limits, and consider a search service once product requirements justify it. I would also add browser-level accessibility checks and performance measurements against realistic mobile devices.
