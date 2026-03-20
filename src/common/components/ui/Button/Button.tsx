import React from 'react'
import { cn } from '@common/utils/cn'
import styles from './Button.module.scss'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  children: React.ReactNode
}

/**
 * Shared Button component — used across all games and the lobby.
 * Supports multiple variants, sizes, and a loading state.
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  disabled,
  children,
  ...rest
}) => {
  return (
    <button
      className={cn(
        styles.button,
        styles[`button--${variant}`],
        styles[`button--${size}`],
        fullWidth && styles['button--full'],
        loading && styles['button--loading'],
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      <span className={styles.label}>{children}</span>
    </button>
  )
}

export default Button
