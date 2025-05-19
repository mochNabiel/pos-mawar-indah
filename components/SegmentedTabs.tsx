import React, { useState } from "react"
import { View, Text, Animated } from "react-native"
import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"

export type TabItem = {
  key: string
  title: string
  content: React.ReactNode
}

type TabsProps = {
  tabs: TabItem[]
  defaultTabKey?: string
}

const SegmentedTabs: React.FC<TabsProps> = ({ tabs, defaultTabKey }) => {
  const [activeTab, setActiveTab] = useState<string>(
    defaultTabKey || tabs[0]?.key
  )
  const fadeAnim = useRef(new Animated.Value(0)).current
  const translateYAnim = useRef(new Animated.Value(10)).current

  const currentTab = tabs.find((tab) => tab.key === activeTab)

  useEffect(() => {
    fadeAnim.setValue(0)
    translateYAnim.setValue(10)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start()
  }, [activeTab])

  return (
    <View className="mb-4">
      {/* Tab Headers */}
      <View className="flex-row gap-3 mb-2 bg-secondary-100 p-2 rounded-lg">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            size="sm"
            onPress={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-lg ${
              activeTab === tab.key ? "bg-black" : "bg-white"
            }`}
          >
            <Text
              className={
                activeTab === tab.key ? "text-white font-medium" : "text-black"
              }
            >
              {tab.title}
            </Text>
          </Button>
        ))}
      </View>

      {/* Tab Content */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }],
        }}
      >
        {currentTab?.content}
      </Animated.View>
    </View>
  )
}

export default SegmentedTabs
