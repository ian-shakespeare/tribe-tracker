import type { User } from "../../models/user";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "@ui-kitten/components";
import { Image } from "expo-image";

type AvatarHeroProps = Pick<User, "avatar" | "firstName" | "lastName"> & {
  size: number;
};

export default function AvatarHero({
  avatar,
  firstName,
  lastName,
  size,
}: AvatarHeroProps) {
  const theme = useTheme();

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
      {!avatar ? (
        <Text category="h1" style={[styles.text, { fontSize: size * 0.375 }]}>
          {`${firstName[0] + lastName[0]}`.toUpperCase()}
        </Text>
      ) : (
        <Image
          alt="user avatar"
          source={avatar}
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
  },
  image: {
    aspectRatio: 1,
    borderRadius: 100,
  },
});
