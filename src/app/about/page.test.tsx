import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import About from '@/app/about/page'

describe('About page', () => {
  it('describes the project evolution', () => {
    render(<About />)

    expect(
      screen.getByRole('heading', { name: /from school profile to global data explorer/i })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/started as a graphql student-profile project/i)
    ).toBeInTheDocument()
  })

  it('lists core dashboard capabilities', () => {
    render(<About />)

    expect(screen.getByText(/search countries by name or capital/i)).toBeInTheDocument()
    expect(screen.getByText(/compare two countries side-by-side with visual index bars/i)).toBeInTheDocument()
    expect(screen.getByText(/explore regional snapshots and top population rankings/i)).toBeInTheDocument()
  })

  it('links to the REST Countries API', () => {
    render(<About />)

    const link = screen.getByRole('link', { name: /restcountries.com/i })
    expect(link).toHaveAttribute('href', 'https://restcountries.com/')
    expect(link).toHaveAttribute('target', '_blank')
  })
})
