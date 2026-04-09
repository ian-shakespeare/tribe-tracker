import { Text, useTheme } from "@ui-kitten/components";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import CameraIcon from "./CameraIcon";

type QRScannerProps = {
  onScan: (data: string) => void;
};

export default function QRScanner({ onScan }: QRScannerProps) {
  const theme = useTheme();
  const { height } = useWindowDimensions();
  const [, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);

  const handleStartScanning = async () => {
    const { granted } = await requestPermission();
    if (!granted) {
      Alert.alert(
        "Camera Permission Required",
        "Scanning requires camera permissions. Update app permissions in your settings.",
      );
      return;
    }

    setIsScanning(true);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme["background-basic-color-2"],
          height: height * 0.2,
        },
      ]}
    >
      {isScanning ? (
        <CameraView
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={({ data }) => onScan(data)}
          style={[{ height: height * 0.2 }, styles.camera]}
        />
      ) : (
        <Pressable
          onPress={handleStartScanning}
          style={[
            styles.pressable,
            {
              paddingTop: height * 0.03,
            },
          ]}
        >
          <CameraIcon
            fill={theme["text-disabled-color"]}
            style={{ width: height * 0.1, height: height * 0.1 }}
          />
          <Text category="h6" appearance="hint" style={styles.text}>
            Scan QR Code
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
  },
  camera: {
    borderRadius: 8,
  },
  pressable: {
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    textDecorationLine: "underline",
  },
});
