import { Suspense } from 'react'
import ProfileContent from '@/app/profile/ProfileContent'

export default function Profile() {
  return (
    <Suspense
      fallback={<div className="py-24 text-lg text-slate-700 dark:text-slate-200">Loading global data...</div>}
    >
      <ProfileContent />
    </Suspense>
  )
}
