import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Typeahead } from '../components/Typeahead.jsx'

const countries = (names) => names.map((name, i) => ({cca3:`T${i}`,name:{common:name},region:'Test',capital:['Capital'],flags:{svg:''}}))

describe('Typeahead', () => {
  beforeEach(() => { vi.useFakeTimers(); global.fetch = vi.fn() })
  afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks() })

  it('debounces requests', async () => {
    global.fetch.mockResolvedValue({ok:true,json:async()=>countries(['Nigeria'])})
    const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime})
    render(<Typeahead />)
    await user.type(screen.getByRole('combobox'), 'nig')
    expect(global.fetch).not.toHaveBeenCalled()
    vi.advanceTimersByTime(299)
    expect(global.fetch).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))
  })

  it('supports keyboard navigation and selection', async () => {
    global.fetch.mockResolvedValue({ok:true,json:async()=>countries(['Nigeria','Niger'])})
    const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime})
    render(<Typeahead />)
    await user.type(screen.getByRole('combobox'), 'nig')
    vi.advanceTimersByTime(300)
    await waitFor(() => expect(screen.getByText('Nigeria')).toBeInTheDocument())
    await user.keyboard('{ArrowDown}{Enter}')
    expect(screen.getByRole('combobox')).toHaveValue('Nigeria')
    expect(screen.getByText('Selected country')).toBeInTheDocument()
  })

  it('does not let a stale response overwrite newer results', async () => {
    let resolveFirst, resolveSecond
    global.fetch.mockImplementation((url) => url.includes('/first') ? new Promise(r=>{resolveFirst=r}) : new Promise(r=>{resolveSecond=r}))
    const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime})
    render(<Typeahead />)
    const input = screen.getByRole('combobox')
    await user.type(input, 'first')
    vi.advanceTimersByTime(300)
    await user.clear(input); await user.type(input, 'second')
    vi.advanceTimersByTime(300)
    resolveSecond({ok:true,json:async()=>countries(['Second Result'])})
    await waitFor(() => expect(screen.getByText('Second Result')).toBeInTheDocument())
    resolveFirst({ok:true,json:async()=>countries(['Stale Result'])})
    await new Promise(r=>setTimeout(r,0))
    expect(screen.queryByText('Stale Result')).not.toBeInTheDocument()
  })

  it('renders API errors', async () => {
    global.fetch.mockResolvedValue({ok:false,status:500})
    const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime})
    render(<Typeahead />)
    await user.type(screen.getByRole('combobox'), 'abc')
    vi.advanceTimersByTime(300)
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/couldn't reach/i))
  })
})
