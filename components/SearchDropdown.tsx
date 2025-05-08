import { Dropdown } from "react-native-element-dropdown"
import { StyleSheet, StyleProp, ViewStyle, TextStyle } from "react-native"
import React from "react"

type SizeType = "sm" | "md" | "lg" | "xl"

interface SearchDropdownProps {
  data: any[]
  placeholder?: string
  search: boolean
  maxHeight: number
  labelField: string
  valueField: string
  searchPlaceholder?: string
  value: string
  onChange: (item: any) => void
  size?: SizeType
}

const sizeMap: Record<SizeType, { height: number; fontSize: number }> = {
  sm: { height: 40, fontSize: 14 },
  md: { height: 50, fontSize: 16 },
  lg: { height: 60, fontSize: 18 },
  xl: { height: 70, fontSize: 20 },
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  data,
  placeholder = "Pilih item",
  searchPlaceholder = "Cari...",
  value,
  onChange,
  size = "md",
}) => {
  const { height, fontSize } = sizeMap[size]

  const dynamicStyles: {
    dropdown: StyleProp<ViewStyle>
    text: StyleProp<TextStyle>
    inputSearch: StyleProp<TextStyle>
  } = {
    dropdown: [{ height }, styles.dropdown],
    text: { fontSize },
    inputSearch: { height, fontSize },
  }

  return (
    <Dropdown
      style={dynamicStyles.dropdown}
      placeholderStyle={dynamicStyles.text}
      selectedTextStyle={dynamicStyles.text}
      inputSearchStyle={dynamicStyles.inputSearch}
      iconStyle={styles.iconStyle}
      data={data}
      search
      maxHeight={300}
      labelField="label"
      valueField="value"
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      value={value}
      onChange={onChange}
    />
  )
}

export default SearchDropdown

const styles = StyleSheet.create({
  dropdown: {
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
})
