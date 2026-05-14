import React from 'react'
import clsx from 'clsx'

export default function Card({ className, children }) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm',
        className
      )}
    >
      {children}
    </div>
  )
}
