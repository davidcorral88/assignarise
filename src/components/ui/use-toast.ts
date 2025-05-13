
import { useToast as useToastHook, toast as toastFunc } from "@/hooks/use-toast";

// Enhanced toast with email-specific feedback
const toast = Object.assign(
  // Make the base toast function directly callable
  (props: Parameters<typeof toastFunc>[0]) => toastFunc(props),
  {
    // Add our specialized methods
    emailSuccess: (message: string) => {
      return toastFunc({
        title: "Email enviado",
        description: message,
        duration: 5000
      });
    },
    emailFailure: (message: string) => {
      return toastFunc({
        title: "Fallo ao enviar email",
        description: message,
        variant: "destructive",
        duration: 8000
      });
    },
    emailWarning: (message: string) => {
      return toastFunc({
        title: "Aviso de email",
        description: message,
        variant: "default",
        duration: 5000
      });
    }
  }
);

// Re-export the useToast hook with our enhanced toast function
const useToast = () => {
  const hookResult = useToastHook();
  return { ...hookResult, toast };
};

export { useToast, toast };
