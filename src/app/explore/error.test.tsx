import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ExploreError from '@/app/explore/error'

describe('Explore error boundary', () => {
  it('shows the message, a support reference, and a working retry', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const user = userEvent.setup()
    const reset = vi.fn()
    const error = Object.assign(new Error('Render failed'), { digest: 'abc123' })

    render(<ExploreError error={error} reset={reset} />)

    expect(screen.getByRole('alert')).toHaveTextContent('The explorer failed to load')
    expect(screen.getByText('Render failed')).toBeInTheDocument()
    expect(screen.getByText('Reference: abc123')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /retry/i }))
    expect(reset).toHaveBeenCalledOnce()
  })

  it('falls back to a generic message and omits the reference when there is none', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    render(<ExploreError error={new Error('')} reset={vi.fn()} />)

    expect(screen.getByText('Unexpected error')).toBeInTheDocument()
    expect(screen.queryByText(/reference:/i)).not.toBeInTheDocument()
  })
})
