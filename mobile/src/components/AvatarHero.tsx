import type { User } from "../lib/models";
import { getAvatarUri } from "../lib";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "@ui-kitten/components";
import { Image } from "expo-image";

type AvatarHeroProps = {
  user: User;
  size: number;
};

export default function AvatarHero({ user, size }: AvatarHeroProps) {
  const theme = useTheme();
  const uri = getAvatarUri(user);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme["color-primary-500"],
          width: size,
          height: size,
        },
      ]}
    >
      {!user.avatar ? (
        <Text category="h1" style={styles.text}>
          {`${user.firstName[0] + user.lastName[0]}`.toUpperCase()}
        </Text>
      ) : (
        <Image
          alt="user avatar"
          source={uri}
          contentFit="cover"
          style={[
            styles.image,
            {
              width: size,
              height: size,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    aspectRatio: 1,
    borderRadius: 100,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    textAlign: "center",
    fontSize: 72,
  },
  image: {
    aspectRatio: 1,
    borderRadius: 100,
    backgroundColor: "purple",
  },
});
