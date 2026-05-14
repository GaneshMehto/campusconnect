import React from 'react'
import clsx from 'clsx'

export default function Button({ className, variant = 'primary', ...props }) {
  const styles =
    variant === 'secondary'
      ? 'border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
      : 'bg-brand-600 hover:bg-brand-700 text-white'

  return (
    <button
      className={clsx(
        'px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed',
        styles,
        className
      )}
      {...props}
    />
  )
}
