import {
  Icon,
  type IconProps,
  Input,
  type InputProps,
} from "@ui-kitten/components";
import { useState } from "react";
import { TouchableWithoutFeedback } from "react-native";

type SecureInputProps = Omit<InputProps, "renderIcon" | "secureTextEntry">;

export default function SecureInput(props: SecureInputProps) {
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const renderIcon = (props: IconProps) => (
    <TouchableWithoutFeedback
      onPress={() => setSecureTextEntry((prev) => !prev)}
    >
      <Icon {...props} name={secureTextEntry ? "eye-off" : "eye"} />
    </TouchableWithoutFeedback>
  );

  return (
    <Input
      {...props}
      secureTextEntry={secureTextEntry}
      accessoryRight={renderIcon}
    />
  );
}
