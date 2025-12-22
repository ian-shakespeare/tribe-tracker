import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Card, Text, useTheme } from "@ui-kitten/components";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";

const DELAY = 8_000;

type Mode = "info" | "warn" | "error";

type Toast = {
  mode: Mode;
  message: string;
};

const ToastContext = createContext<{
  error: (message: string) => void;
}>({
  error: () => {
    throw new Error("Uninitialized.");
  },
});

export const useToast = () => useContext(ToastContext);

type ToastProviderProps = {
  children: ReactNode;
};

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const { top } = useSafeAreaInsets();
  const theme = useTheme();
  const [toast, setToast] = useState<Toast | null>(null);

  const error = useCallback(
    (message: string) => {
      setToast({ mode: "error", message });
    },
    [setToast],
  );

  useEffect(() => {
    if (!toast) return;

    const tmt = setTimeout(() => {
      setToast(null);
    }, DELAY);

    return () => clearTimeout(tmt);
  }, [setToast]);

  const value = {
    error,
  };

  return (
    <ToastContext.Provider value={value}>
      {!!toast && (
        <Card
          onPress={() => setToast(null)}
          style={[
            styles.card,
            {
              backgroundColor: theme["color-danger-500"],
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
