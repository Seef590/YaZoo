import PropTypes from 'prop-types'

function Button({
  children,
  className = '',
  type = 'button',
  variant = 'primary',
  ...props
}) {
  const variants = {
    primary:
      'bg-[linear-gradient(135deg,#7c3aed,#a855f7,#d8b4fe)] text-white shadow-[0_18px_34px_rgba(124,58,237,0.26)] hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_24px_42px_rgba(124,58,237,0.3)] focus-visible:outline-violet-600',
    secondary:
      'bg-[linear-gradient(135deg,#f5ecff,#eadbff,#ddd6fe)] text-violet-950 shadow-[0_14px_28px_rgba(139,92,246,0.16)] hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_20px_38px_rgba(139,92,246,0.2)] focus-visible:outline-violet-300 dark:bg-[linear-gradient(135deg,#31204d,#4c1d95,#6d28d9)] dark:text-violet-50 dark:shadow-[0_16px_36px_rgba(0,0,0,0.26)]',
    ghost:
      'border border-violet-200/80 bg-white/92 text-stone-700 shadow-[0_12px_26px_rgba(124,58,237,0.08)] hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50/80 hover:text-violet-950 focus-visible:outline-violet-200 dark:border-violet-300/18 dark:bg-white/8 dark:text-violet-50 dark:hover:bg-white/12',
  }

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

Button.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  type: PropTypes.string,
  variant: PropTypes.string,
}

export default Button
