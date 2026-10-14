import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Home from '@/app/page'

describe('Home page', () => {
  it('renders the dashboard title and description', () => {
    render(<Home />)

    expect(screen.getByRole('heading', { name: /world explorer dashboard/i })).toBeInTheDocument()
    expect(
      screen.getByText(/uses public country data, served through its own graphql api, to power an interactive dashboard/i)
    ).toBeInTheDocument()
  })

  it('links to the explorer dashboard and about page', () => {
    render(<Home />)

    expect(screen.getByRole('link', { name: /open dashboard/i })).toHaveAttribute('href', '/explore')
    expect(screen.getByRole('link', { name: /about/i })).toHaveAttribute('href', '/about')
  })

  it('renders the GraphQL logo image', () => {
    render(<Home />)

    expect(screen.getByAltText('GraphQL Logo')).toHaveAttribute('src', '/GraphQL_Logo.svg.png')
  })
})
