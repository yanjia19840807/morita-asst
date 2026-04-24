import React from 'react'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from './ui/alert-dialog'

type DialogAction = {
  label: string
  onClick: () => void
  className?: string
}

export default function ConfirmDialog({
  description,
  title,
  actions,
  children
}: {
  description: string
  title: string
  actions: DialogAction | DialogAction[]
  children: React.ReactNode
}) {
  const actionList = Array.isArray(actions) ? actions : [actions]
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          {actionList.map(action => (
            <AlertDialogAction
              key={action.label}
              className={action.className}
              onClick={action.onClick}
            >
              {action.label}
            </AlertDialogAction>
          ))}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
