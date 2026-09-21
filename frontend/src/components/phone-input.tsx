import * as React from "react"
import PhoneNumberInput from "react-phone-number-input"
import "react-phone-number-input/style.css"
import { Input } from "./ui/input"
import { cn } from "../lib/utils"

type Props = Omit<React.ComponentProps<typeof Input>, 'onChange' | 'value'> & {
  value?: string
  onChange?: (value: string) => void
}

const InputComponent = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>(
  ({ className, ...props }, ref) => (
    <Input ref={ref} className={cn("rounded-e-md rounded-s-none", className)} {...props} />
  )
)
InputComponent.displayName = "PhoneInput.InternalInput"

export const PhoneInput = React.forwardRef<HTMLInputElement, Props>(
  ({ value, onChange, disabled, id, className, ...rest }, _ref) => {
    const handleChange = React.useCallback((v: any) => {
      if (onChange) onChange((v as string) ?? "")
    }, [onChange])
    return (
      <PhoneNumberInput
        countries={["ET"]}
        defaultCountry="ET"
        countrySelectProps={{ disabled: true, onChange: () => {} }}
        international={false}
        disabled={disabled}
        id={id}
        className={cn("flex", className)}
        inputComponent={InputComponent as any}
        value={(value as any) ?? undefined}
        onChange={handleChange}
        {...rest}
      />
    )
  }
)

PhoneInput.displayName = "PhoneInput"


