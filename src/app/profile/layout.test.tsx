import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ProfileLayout from '@/app/profile/layout'

describe('Profile layout', () => {
  it('renders navigation and child content', () => {
    render(
      <ProfileLayout>
        <p>Dashboard content</p>
      </ProfileLayout>
    )

    expect(screen.getByText('World Explorer')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back home/i })).toHaveAttribute('href', '/')
    expect(screen.getByText('Dashboard content')).toBeInTheDocument()
  })
})
