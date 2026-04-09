import {
  Button,
  Divider,
  Input,
  Layout,
  Text,
  TopNavigation,
  TopNavigationAction,
  useTheme,
} from "@ui-kitten/components";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useState } from "react";
import { useToast } from "../views/contexts/Toast";
import * as ImagePicker from "expo-image-picker";
import BackArrowIcon from "../views/components/BackArrowIcon";
import { Image } from "expo-image";
import { getUser, updateUser } from "../models/user";
import { useLiveQuery } from "../db/liveQuery";
import * as SecureStore from "expo-secure-store";
import api from "../services/api";
import { toTitleCase } from "../utils/strings";

const AVATAR_SIZE = 200;

export default function ProfileEditScreen() {
  const router = useRouter();
  const theme = useTheme();
  const toast = useToast();
  const { bottom } = useSafeAreaInsets();
  const [avatar, setAvatar] = useState<string | undefined>();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const query = useLiveQuery(async () => {
    const userId = await SecureStore.getItemAsync("MY_USER_ID");
    if (!userId) {
      toast.danger("Failed to get my user ID.");
      return null;
    }

    const storedUser = await getUser(userId);
    if (storedUser) {
      setAvatar(storedUser.avatar);
      setFirstName(storedUser.firstName);
      setLastName(storedUser.lastName);
    }

    return storedUser;
  });

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      mediaTypes: ["images"],
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.assets) {
      return;
    }

    const [{ uri }] = result.assets;
    setAvatar(uri);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      if (query.isLoading) {
        toast.danger("User not yet loading. Try again in a few seconds.");
        return;
      }

      const myUserId = await SecureStore.getItemAsync("MY_USER_ID");
      if (!myUserId) {
        toast.danger("Failed to get user ID.");
        return;
      }

      let avatarUri = undefined;
      if (avatar) {
        const uploadRes = await api.uploadMedia(avatar);
        if (!uploadRes.ok) {
          toast.danger("Failed to upload image: " + uploadRes.error.message);
          return;
        }

        avatarUri = uploadRes.url;
      }

      const res = await api.updateMe({
        firstName: firstName.trim().toLowerCase(),
        lastName: lastName.trim().toLowerCase(),
        avatar: avatarUri,
      });

      if (!res.ok) {
        toast.danger(res.error.message);
        return;
      }

      const { success } = await updateUser(myUserId, res.user);
      if (!success) {
        toast.danger("Failed to update local user. Please re-sync.");
        return;
      }

      router.back();
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBackAction = () => (
    <TopNavigationAction icon={BackArrowIcon} onPress={() => router.back()} />
  );

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: theme["background-basic-color-1"],
          paddingBottom: bottom,
        },
      ]}
    >
      <TopNavigation
        title="Edit Profile"
        alignment="center"
        accessoryLeft={renderBackAction}
      />
      <Divider />
      <Layout style={styles.layout}>
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.form}>
              <View
                style={[
                  styles.imageContainer,
                  {
                    backgroundColor: theme["color-primary-500"],
                  },
                ]}
              >
                {!avatar ? (
                  <Text category="h1" style={styles.text}>
                    {`${firstName[0] + lastName[0]}`.toUpperCase()}
                  </Text>
                ) : (
                  <Image
                    alt="user avatar"
                    source={avatar}
                    contentFit="cover"
                    style={styles.image}
                  />
                )}
              </View>
              <Pressable onPress={handlePickImage}>
                {({ pressed }) => (
                  <Text
                    category="p1"
                    appearance="hint"
                    style={[
                      styles.imageChangeText,
                      {
                        color: !pressed
                          ? theme["text-hint-color"]
                          : theme["color-primary-default"],
                      },
                    ]}
                  >
                    Change Photo
                  </Text>
                )}
              </Pressable>
              <Input
                placeholder="First Name"
                value={toTitleCase(firstName)}
                onChangeText={setFirstName}
                autoCorrect={false}
                autoComplete="name-given"
              />
              <Input
                placeholder="Last Name"
                value={toTitleCase(lastName)}
                onChangeText={setLastName}
                autoCorrect={false}
                autoComplete="name-family"
              />
            </View>
          </View>
          <Button
            disabled={isSubmitting}
            style={styles.button}
            onPress={handleSubmit}
          >
            Save
          </Button>
        </View>
      </Layout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  layout: {
    flex: 1,
  },
  text: {
    textAlign: "center",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    justifyContent: "space-between",
    height: "100%",
  },
  form: {
    gap: 8,
  },
  imageContainer: {
    aspectRatio: 1,
    borderRadius: 100,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  image: {
    aspectRatio: 1,
    borderRadius: 100,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  imageChangeText: {
    textDecorationLine: "underline",
    textAlign: "center",
    marginBottom: 8,
  },
  button: {
    width: "100%",
  },
});
