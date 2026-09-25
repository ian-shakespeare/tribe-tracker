import { Card, Divider, Text } from "@ui-kitten/components";
import { StyleSheet, View } from "react-native";
import AvatarHero from "./AvatarHero";
import { UserLocation } from "../../models/user";
import { formatTimeDelta, toTitleCase } from "../../utils/strings";

type LocationHighlightProps = {
  userLocations: UserLocation[];
  onPress?: () => void;
};

export default function LocationHighlight({
  userLocations,
  onPress,
}: LocationHighlightProps) {
  return (
    <Card onPress={onPress} disabled={!onPress}>
      {userLocations.map(
        ({ id, firstName, lastName, avatar, recordedAt }, index) => (
          <View key={id}>
            {index > 0 && <Divider style={styles.divider} />}
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
                <Text category="h6">
                  {toTitleCase(`${firstName} ${lastName}`)}
                </Text>
                <Text category="s2">Updated {formatTimeDelta(recordedAt)}</Text>
              </View>
            </View>
          </View>
        ),
      )}
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
  divider: {
    marginVertical: 12,
  },
});
