import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Home from '@/app/page'

describe('Home page', () => {
  it('renders the dashboard title and description', () => {
    render(<Home />)

    expect(screen.getByRole('heading', { name: /world explorer dashboard/i })).toBeInTheDocument()
    expect(
      screen.getByText(/uses live public country data to power an interactive profile-style dashboard/i)
    ).toBeInTheDocument()
  })

  it('links to the profile dashboard and about page', () => {
    render(<Home />)

    expect(screen.getByRole('link', { name: /open dashboard/i })).toHaveAttribute('href', '/profile')
    expect(screen.getByRole('link', { name: /about/i })).toHaveAttribute('href', '/about')
  })

  it('renders the GraphQL logo image', () => {
    render(<Home />)

    expect(screen.getByAltText('GraphQL Logo')).toHaveAttribute('src', '/GraphQL_Logo.svg.png')
  })
})
