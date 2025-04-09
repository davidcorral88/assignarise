
import * as React from "react";
import { Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatHoursToTimeFormat, parseTimeFormatToHours } from "@/utils/timeUtils";

interface TimePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value?: number | string;
  onChange?: (value: number) => void;
  onChangeTimeString?: (value: string) => void;
  showAsDecimal?: boolean;
}

const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(
  ({ className, onChange, onChangeTimeString, value, showAsDecimal = false, ...props }, ref) => {
    // Convert initial value to time string if it's a number
    const initialTimeString = typeof value === 'number' 
      ? formatHoursToTimeFormat(value)
      : typeof value === 'string' && !value.includes(':') && !isNaN(Number(value))
        ? formatHoursToTimeFormat(Number(value))
        : value as string || '';

    const [timeString, setTimeString] = React.useState(initialTimeString);
    
    // Update timeString when value changes from props
    React.useEffect(() => {
      if (typeof value === 'number' && value !== parseTimeFormatToHours(timeString)) {
        setTimeString(formatHoursToTimeFormat(value));
      } else if (typeof value === 'string' && value !== timeString) {
        if (value.includes(':')) {
          setTimeString(value);
        } else if (!isNaN(Number(value))) {
          setTimeString(formatHoursToTimeFormat(Number(value)));
        }
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTimeValue = e.target.value;
      setTimeString(newTimeValue);
      
      if (onChangeTimeString) {
        onChangeTimeString(newTimeValue);
      }
      
      if (onChange) {
        // Convert HH:MM to decimal hours
        const hours = parseTimeFormatToHours(newTimeValue);
        onChange(hours);
      }
    };

    return (
      <div className="relative">
        <Input
          type={showAsDecimal ? "number" : "time"}
          ref={ref}
          className={cn("pl-8", className)}
          onChange={handleChange}
          value={timeString}
          step={showAsDecimal ? "0.25" : "300"}
          min="0"
          {...props}
        />
        <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      </div>
    );
  }
);

TimePicker.displayName = "TimePicker";

export { TimePicker };
