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

  it('credits the data sources', () => {
    render(<About />)

    for (const [name, href] of [
      [/mledoze\/countries/i, 'https://github.com/mledoze/countries'],
      [/world bank/i, 'https://data.worldbank.org/indicator/SP.POP.TOTL'],
    ] as const) {
      const link = screen.getByRole('link', { name })
      expect(link).toHaveAttribute('href', href)
      expect(link).toHaveAttribute('target', '_blank')
    }
  })
})
