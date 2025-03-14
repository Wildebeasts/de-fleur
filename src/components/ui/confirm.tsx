import * as React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

interface ConfirmOptions {
  title: string
  description: string
  cancelText?: string
  confirmText?: string
}

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  options: ConfirmOptions
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmDialog = ({
  open,
  onOpenChange,
  options,
  onConfirm,
  onCancel
}: ConfirmDialogProps) => {
  const {
    title,
    description,
    cancelText = 'Cancel',
    confirmText = 'Confirm'
  } = options

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function useConfirm() {
  const [open, setOpen] = React.useState(false)
  const [options, setOptions] = React.useState<ConfirmOptions>({
    title: '',
    description: ''
  })
  const [resolveRef, setResolveRef] = React.useState<(value: boolean) => void>()

  const confirm = React.useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setOptions(options)
      setResolveRef(() => resolve)
      setOpen(true)
    })
  }, [])

  const handleConfirm = React.useCallback(() => {
    if (resolveRef) {
      resolveRef(true)
      setOpen(false)
    }
  }, [resolveRef])

  const handleCancel = React.useCallback(() => {
    if (resolveRef) {
      resolveRef(false)
      setOpen(false)
    }
  }, [resolveRef])

  const confirmDialog = (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      options={options}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  )

  return [confirm, confirmDialog] as const
}
