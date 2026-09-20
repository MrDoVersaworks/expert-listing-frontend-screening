import { useEffect, useId, useRef, useState } from 'react'
import { searchCountries } from '../lib/api.js'

const DEBOUNCE_MS = 300
const MAX_RESULTS = 8

export function Typeahead() {
  const inputId = useId()
  const listId = `${inputId}-list`
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [selected, setSelected] = useState(null)
  const requestSequence = useRef(0)
  const abortRef = useRef(null)
  const skipNextSearchRef = useRef(false)

  useEffect(() => {
    const trimmed = query.trim()
    setActiveIndex(-1)
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false
      setResults([])
      setStatus('idle')
      return undefined
    }
    if (!trimmed) {
      ++requestSequence.current
      abortRef.current?.abort()
      setResults([])
      setStatus('idle')
      return undefined
    }

    setStatus('loading')
    const sequence = ++requestSequence.current
    const controller = new AbortController()
    abortRef.current?.abort()
    abortRef.current = controller

    const timer = setTimeout(async () => {
      try {
        const data = await searchCountries(trimmed, controller.signal)
        if (sequence !== requestSequence.current) return
        setResults(data.slice(0, MAX_RESULTS))
        setStatus(data.length ? 'success' : 'empty')
      } catch (error) {
        if (controller.signal.aborted || sequence !== requestSequence.current) return
        setResults([])
        setStatus('error')
      }
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [query])

  const choose = (country) => {
    skipNextSearchRef.current = true
    setQuery(country.name.common)
    setSelected(country)
    setResults([])
    setActiveIndex(-1)
    setStatus('idle')
  }

  const onKeyDown = (event) => {
    if (!results.length) {
      if (event.key === 'Escape') setQuery('')
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % results.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => (index - 1 + results.length) % results.length)
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      choose(results[activeIndex])
    } else if (event.key === 'Escape') {
      setResults([])
      setActiveIndex(-1)
    }
  }

  const showList = results.length > 0
  return <div className="search-card">
    <label htmlFor={inputId}>Country search</label>
    <div className={`input-wrap ${status === 'error' ? 'has-error' : ''}`}>
      <span className="search-icon" aria-hidden="true">⌕</span>
      <input
        id={inputId}
        value={query}
        onChange={(event) => { setSelected(null); setQuery(event.target.value) }}
        onKeyDown={onKeyDown}
        placeholder="Search countries..."
        autoComplete="off"
        role="combobox"
        aria-expanded={showList}
        aria-controls={showList ? listId : undefined}
        aria-activedescendant={activeIndex >= 0 ? `${listId}-${results[activeIndex].cca3}` : undefined}
        aria-autocomplete="list"
      />
      {status === 'loading' && <span className="spinner" aria-label="Loading" />}
      {query && status !== 'loading' && <button className="clear" type="button" onClick={() => setQuery('')} aria-label="Clear search">×</button>}
    </div>

    {status === 'error' && <p className="state error" role="alert">We couldn't reach the country service. Please try again.</p>}
    {status === 'empty' && <p className="state" role="status">No countries matched “{query.trim()}”.</p>}
    {showList && <ul id={listId} className="results" role="listbox">
      {results.map((country, index) => <li
        id={`${listId}-${country.cca3}`}
        key={country.cca3}
        role="option"
        aria-selected={index === activeIndex}
        className={index === activeIndex ? 'active' : ''}
        onMouseDown={(event) => { event.preventDefault(); choose(country) }}
      >
        <img src={country.flags?.svg || country.flags?.png} alt="" />
        <span><strong>{country.name.common}</strong><small>{country.region}{country.capital?.[0] ? ` · ${country.capital[0]}` : ''}</small></span>
        <kbd>{index + 1}</kbd>
      </li>)}
    </ul>}

    {selected && <div className="selected" role="status">
      <span className="check">✓</span><span><small>Selected country</small><strong>{selected.name.common}</strong></span>
    </div>}
  </div>
}
