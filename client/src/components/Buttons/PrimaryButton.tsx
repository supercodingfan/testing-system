import React from 'react'
import { Button } from '@material-ui/core'

interface IPrimaryButtonProps {
  onClick?: any
  children?: React.ReactNode
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export const PrimaryButton = (props: IPrimaryButtonProps) => {
  return (
    <Button
      disabled={props.disabled}
      variant='outlined'
      color='primary'
      onClick={props.onClick}
      type={props.type}
    >
      {props.children}
    </Button>
  )
}
