import React from 'react'
import { View, Text } from 'react-native'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'

const Home = () => {
  const {user} = useCurrentUser()
  return (
    <View className='flex-1 bg-white p-5'>
      <Text>Hello {user?.name}</Text>
      <Text>Your role {user?.role}</Text>
      <Text>Your Email {user?.email}</Text>
    </View>
  )
}

export default Home