import type { ReactNode } from 'react'

const CARD_CLASSES =
  'rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'

type CardProps = {
  as?: 'section' | 'article'
  className?: string
  children: ReactNode
}

export default function Card({ as: Tag = 'section', className = 'p-6', children }: CardProps) {
  return <Tag className={`${CARD_CLASSES} ${className}`}>{children}</Tag>
}
