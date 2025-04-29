import { useToast } from "@/components/ui/toast";
import { Toast, ToastDescription } from "@/components/ui/toast";

const useToastMessage = () => {
  const toast = useToast();

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    toast.show({
      placement: "top",
      duration: 2000,
      render: () => (
        <Toast action={type} variant="solid">
          <ToastDescription>{message}</ToastDescription>
        </Toast>
      ),
    });
  };

  return { showToast };
};

export default useToastMessage;
