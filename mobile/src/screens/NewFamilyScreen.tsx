import { Button, Input, Layout, Text } from "@ui-kitten/components";
import { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { pb } from "../lib";

export default function NewFamilyScreen() {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    const code = ""; // TODO: import crypto and generate a code
    pb.collection("families").create({
      name,
      code,
      createdBy: "", // TODO: figure out how to populate this
      members: [], // TODO: this too
    });
  };

  return (
    <Layout style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 16 }}>
        <View style={{ flex: 1 }}>
          <Text category="h1">New Family</Text>
          <Input placeholder="Name" value={name} onChangeText={setName} />
          <Button>Create</Button>
        </View>
      </SafeAreaView>
    </Layout>
  );
}
