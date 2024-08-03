import { useState } from "react";
import { View, Text, Image, TextInput } from "react-native";

export default function Index() {
  const [input, setInput] = useState("");

  return (
    <View className="bg-[#111111] w-screen h-screen pt-12 flex items-center">
      <View className="flex-row items-center justify-center gap-3">
        <Image source={require("../assets/images/icon.png")} />
        <Text className="text-white font-black text-5xl translate-y-1">
          TamNyss
        </Text>
      </View>
      <Text className="text-[#3f3f3f]">by aapelix</Text>

      <View>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Hae pysäkkejä (Mannakorpi/0001)"
        />
      </View>
    </View>
  );
}
