import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { Typeahead } from './components/Typeahead.jsx'

createRoot(document.getElementById('root')).render(<App />)

function App() {
  return <main className="shell">
    <section className="hero">
      <span className="eyebrow">EXPERT LISTING · FRONTEND SCREENING</span>
      <h1>Find a country.<br /><em>Fast.</em></h1>
      <p className="intro">A production-minded autocomplete built around responsive interaction, resilient async state, and accessible keyboard navigation.</p>
      <Typeahead />
      <p className="hint">Try typing <strong>nig</strong>, <strong>can</strong>, or <strong>uni</strong>.</p>
    </section>
    <footer><span>React + Vite</span><span>REST Countries API</span><span>Debounced + race-safe</span></footer>
  </main>
}
