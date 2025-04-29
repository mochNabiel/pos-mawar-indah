import React from "react";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/utils/firebase"; 

import { Button, ButtonText } from "@/components/ui/button";
import { FormControl } from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icon";

const Login = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");

  const router = useRouter();

  const handleTogglePassword = () => setShowPassword(prev => !prev);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/(tabs)"); // redirect ke beranda/tab utama
    } catch (err: any) {
      console.log("Login Error:", err.message);
      setError("Email atau password salah.");
    }
  };

  return (
    <FormControl className="p-4 border rounded-lg border-outline-300 mt-20 mx-4">
      <VStack space="xl">
        <Heading className="text-typography-900">Login</Heading>

        <VStack space="xs">
          <Text className="text-typography-500">Email</Text>
          <Input className="min-w-[250px]">
            <InputField
              type="text"
              value={email}
              onChangeText={setEmail}
              placeholder="email"
            />
          </Input>
        </VStack>

        <VStack space="xs">
          <Text className="text-typography-500">Password</Text>
          <Input className="text-center">
            <InputField
              type={showPassword ? "text" : "password"}
              value={password}
              onChangeText={setPassword}
              placeholder="password"
            />
            <InputSlot className="pr-3" onPress={handleTogglePassword}>
              <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
            </InputSlot>
          </Input>
        </VStack>

        {error ? (
          <Text className="text-red-500 text-sm">{error}</Text>
        ) : null}

        <Button className="ml-auto mt-2" onPress={handleLogin}>
          <ButtonText className="text-white">Login</ButtonText>
        </Button>
      </VStack>
    </FormControl>
  );
};

export default Login;
