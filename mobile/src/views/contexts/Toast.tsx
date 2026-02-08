import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Card, Text } from "@ui-kitten/components";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";

const DELAY = 5_000;

type Mode = "info" | "warn" | "danger";

type Toast = {
  mode: Mode;
  message: string;
};

const ToastContext = createContext<{
  danger: (message: string) => void;
}>({
  danger: () => {
    throw new Error("Uninitialized.");
  },
});

export const useToast = () => useContext(ToastContext);

type ToastProviderProps = {
  children: ReactNode;
};

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const { top } = useSafeAreaInsets();
  const [toast, setToast] = useState<Toast | null>(null);

  const danger = (message: string) => {
    setToast({ mode: "danger", message });
  };

  useEffect(() => {
    if (!toast) return;

    const tmt = setTimeout(() => setToast(null), DELAY);

    return () => {
      clearTimeout(tmt);
    };
  }, [toast]);

  return (
    <ToastContext.Provider value={{ danger }}>
      {!!toast && (
        <Card
          onPress={() => setToast(null)}
          status={toast.mode}
          style={[
            styles.card,
            {
              top,
            },
          ]}
        >
          <Text>{toast.message}</Text>
        </Card>
      )}
      {children}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 1,
  },
});
