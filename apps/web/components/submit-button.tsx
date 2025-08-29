import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps extends ButtonProps {
  isPending: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  isPending,
  children,
  ...props
}) => {
  return (
    <Button type="submit" disabled={isPending} {...props}>
      {isPending ? (
        <div className="flex items-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait...
        </div>
      ) : (
        children
      )}
    </Button>
  );
};

export default SubmitButton;
