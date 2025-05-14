
import * as React from "react";
import { Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TimePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onChange?: (value: string) => void;
  value?: string;
}

const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(
  ({ className, onChange, value, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (onChange) {
        onChange(value);
      }
    };

    return (
      <div className="relative">
        <Input
          type="time"
          ref={ref}
          className={cn("pl-8", className)}
          onChange={handleChange}
          value={value}
          {...props}
        />
        <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      </div>
    );
  }
);

TimePicker.displayName = "TimePicker";

export { TimePicker };
