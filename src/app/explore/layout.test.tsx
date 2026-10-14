import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ExplorerLayout from '@/app/explore/layout'

describe('Explorer layout', () => {
  it('renders navigation and child content', () => {
    render(
      <ExplorerLayout>
        <p>Dashboard content</p>
      </ExplorerLayout>
    )

    expect(screen.getByText('World Explorer')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back home/i })).toHaveAttribute('href', '/')
    expect(screen.getByText('Dashboard content')).toBeInTheDocument()
  })
})
