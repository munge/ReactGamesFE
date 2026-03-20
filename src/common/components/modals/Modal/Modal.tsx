import React, { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@common/utils/cn'
import Button from '@common/components/ui/Button/Button'
import styles from './Modal.module.scss'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  /** Override max-width (default 480px) */
  maxWidth?: number | string
  /** Show X close button in header */
  showCloseButton?: boolean
  className?: string
}

/**
 * Shared Modal — used across the Lobby and all game routes.
 * Renders via a React portal into document.body.
 * Closes on backdrop click or Escape key.
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 480,
  showCloseButton = true,
  className,
}) => {
  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (!isOpen) return

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return createPortal(
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={title}>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />

      {/* Panel */}
      <div
        className={cn(styles.panel, className)}
        style={{ maxWidth }}
        role="document"
      >
        {(title || showCloseButton) && (
          <div className={styles.header}>
            {title && <h2 className={styles.title}>{title}</h2>}
            {showCloseButton && (
              <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
                ✕
              </button>
            )}
          </div>
        )}

        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.body,
  )
}

export { Modal }
export type { ModalProps }
