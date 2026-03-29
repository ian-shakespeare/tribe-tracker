import { Card, Text } from "@ui-kitten/components";
import { StyleSheet, View } from "react-native";
import AvatarHero from "./AvatarHero";
import { UserLocation } from "../../models/user";
import { formatTimeDelta, toTitleCase } from "../../utils/strings";

type UserHighlightProps = {
  userLocation: UserLocation;
  onPress?: () => void;
};

export default function UserHighlight({
  userLocation,
  onPress,
}: UserHighlightProps) {
  const { firstName, lastName, avatar, recordedAt } = userLocation;

  return (
    <Card onPress={onPress}>
      <View style={styles.container}>
        <View>
          <AvatarHero
            firstName={firstName}
            lastName={lastName}
            avatar={avatar}
            size={56}
          />
        </View>
        <View style={styles.textSection}>
          <Text category="h6">{toTitleCase(`${firstName} ${lastName}`)}</Text>
          <Text category="s2">Updated {formatTimeDelta(recordedAt)}</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 16,
  },
  textSection: {
    justifyContent: "center",
  },
});
