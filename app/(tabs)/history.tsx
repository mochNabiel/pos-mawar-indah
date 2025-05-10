import { Button, ButtonText } from '@/components/ui/button'
import { useRouter } from 'expo-router'
import React from 'react'
import { View, Text } from 'react-native'

const History = () => {
  const router = useRouter()
  return (
    <View className='flex-1 bg-white p-5'>
      <Text>History</Text>
      <Button onPress={()=> (router.push("/transactions/INV-20250510-8004"))}>
        <ButtonText>Go to Transaction</ButtonText>
      </Button>
    </View>
  )
}

export default History