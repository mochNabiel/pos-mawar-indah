import { View, Text } from 'react-native';
import { logout } from '@/utils/auth';
import { useRouter } from 'expo-router';
import { Button, ButtonText } from '@/components/ui/button';

const Setting = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold mb-4">Pengaturan</Text>
      <Button
        onPress={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        <ButtonText>Logout</ButtonText>
      </Button>
    </View>
  );
}

export default Setting;
