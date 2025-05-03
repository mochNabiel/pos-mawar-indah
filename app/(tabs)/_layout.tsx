import { Tabs } from "expo-router"
import { Feather } from "@expo/vector-icons"
import { Pressable } from "react-native"
import { useQuickActions } from "@/components/QuickActionSheet"

export default function TabsLayout() {
  const { openSheet, sheet } = useQuickActions()

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "semibold",
          },
          tabBarActiveTintColor: "#FF9800",
          tabBarStyle: {
            height: 75,
            position: "absolute",
            paddingTop: 10,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Beranda",
            tabBarIcon: ({ color, size }) => (
              <Feather name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: "Riwayat",
            tabBarIcon: ({ color, size }) => (
              <Feather name="clock" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="quick"
          options={{
            tabBarButton: () => (
              <Pressable
                onPress={openSheet}
                style={{
                  top: -35,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#FF9800",
                  width: 65,
                  height: 65,
                  borderRadius: 35,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4.65,
                  elevation: 8,
                }}
              >
                <Feather name="plus" size={28} color="white" />
              </Pressable>
            ),
          }}
        />
        <Tabs.Screen
          name="data"
          options={{
            title: "Data",
            tabBarIcon: ({ color, size }) => (
              <Feather name="folder" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Pengaturan",
            tabBarIcon: ({ color, size }) => (
              <Feather name="settings" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
      {sheet}
    </>
  )
}
