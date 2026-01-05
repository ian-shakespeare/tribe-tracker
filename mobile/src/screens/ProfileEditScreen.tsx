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
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackParamList } from "../AppNavigator";
import { Pressable, StyleSheet, View } from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { getAvatarUri, getMe, updateMe } from "../lib";
import { useToast } from "../contexts/Toast";
import { User } from "../lib/models";
import { toTitleCase } from "../lib/strings";
import * as ImagePicker from "expo-image-picker";
import BackArrowIcon from "../components/BackArrowIcon";
import { Image } from "expo-image";

const AVATAR_SIZE = 200;

type ProfileEditScreenProps = NativeStackScreenProps<
  StackParamList,
  "profileedit"
>;

export default function ProfileEditScreen({
  navigation,
}: ProfileEditScreenProps) {
  const theme = useTheme();
  const toast = useToast();
  const { bottom } = useSafeAreaInsets();
  const [user, setUser] = useState<User | undefined>();
  const [avatar, setAvatar] = useState<string | undefined>();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useFocusEffect(
    useCallback(() => {
      getMe()
        .then((u) => {
          setUser(u);
          setFirstName(u.firstName);
          setLastName(u.lastName);

          if (u.avatar) {
            setAvatar(getAvatarUri(u.avatar));
          }
        })
        .catch((e: Error) => toast.danger(e.message));
    }, []),
  );

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
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
    try {
      await updateMe({
        firstName: firstName.trim().toLowerCase(),
        lastName: lastName.trim().toLowerCase(),
        avatar: avatar === user?.avatar ? undefined : avatar,
      });
      navigation.pop();
    } catch (e) {
      if (e instanceof Error) {
        toast.danger(e.message);
      }
    }
  };

  const renderBackAction = () => (
    <TopNavigationAction
      icon={BackArrowIcon}
      onPress={() => navigation.pop()}
    />
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
          <Button style={styles.button} onPress={handleSubmit}>
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
