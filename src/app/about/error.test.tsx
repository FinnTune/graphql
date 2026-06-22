import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import AboutError from '@/app/about/error'

describe('About error boundary', () => {
  it('shows the error message and retry action', () => {
    const reset = vi.fn()
    render(<AboutError error={new Error('Network timeout')} reset={reset} />)

    expect(screen.getByRole('heading', { name: /about page failed to load/i })).toBeInTheDocument()
    expect(screen.getByText('Network timeout')).toBeInTheDocument()
  })

  it('calls reset when retry is clicked', async () => {
    const user = userEvent.setup()
    const reset = vi.fn()
    render(<AboutError error={new Error('Boom')} reset={reset} />)

    await user.click(screen.getByRole('button', { name: /retry/i }))
    expect(reset).toHaveBeenCalledOnce()
  })

  it('falls back to a generic message when error text is empty', () => {
    render(<AboutError error={new Error('')} reset={vi.fn()} />)

    expect(screen.getByText('Unexpected error')).toBeInTheDocument()
  })
})
