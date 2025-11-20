import { TextInput, type TextInputProps } from "react-native";
import { useThemeColor } from "@/src/hooks/use-theme-color";

export type ThemedTextInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedTextInput({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedTextInputProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return <TextInput style={[{ color }, style]} {...otherProps} />;
}
