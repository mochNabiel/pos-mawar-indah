import React from "react"
import { ViewStyle, ColorValue } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

interface GradientCardProps {
  colors?: readonly [ColorValue, ColorValue, ...ColorValue[]] // Accepts at least two colors
  style?: ViewStyle // Optional style for the gradient container
  children: React.ReactNode // Children can be any React node (icon, text, etc.)
}

const GradientCard: React.FC<GradientCardProps> = ({
  colors = [
    "rgba(168, 85, 247, 0.8)",
    "rgba(219, 39, 119, 0.8)"
  ],
  style,
  children,
}) => {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[{ padding: 12, borderRadius: 8 }, style]} // Merge default style with custom style
    >
      {children}
    </LinearGradient>
  )
}

export default GradientCard
