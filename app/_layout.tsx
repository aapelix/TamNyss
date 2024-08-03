import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Index from "./index";
import Map from "./map";
import Ionicons from "@expo/vector-icons/Ionicons";

const Tab = createBottomTabNavigator();

export default function RootLayout() {
  return (
    <GestureHandlerRootView>
      <NavigationContainer independent>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarStyle: {
              borderTopRightRadius: 20,
              borderTopLeftRadius: 20,
              position: "absolute",
              backgroundColor: "black",
              overflow: "hidden",
              left: 0,
              bottom: 0,
              right: 0,
            },
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === "Home") {
                iconName = focused ? "home" : "home-outline";
              } else if (route.name === "Map (beta)") {
                iconName = focused ? "map" : "map-outline";
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: "white",
            tabBarInactiveTintColor: "gray",
          })}
        >
          <Tab.Screen
            name="Home"
            options={{ headerShown: false }}
            component={Index}
          />
          <Tab.Screen
            name="Map (beta)"
            options={{ headerShown: false }}
            component={Map}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
