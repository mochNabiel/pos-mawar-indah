import React, { useState } from "react"
import { useRouter } from "expo-router"
import { signInWithEmailAndPassword } from "firebase/auth"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"

import { auth } from "@/utils/firebase"
import { Button, ButtonText } from "@/components/ui/button"
import { FormControl } from "@/components/ui/form-control"
import { Heading } from "@/components/ui/heading"
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input"
import { Text } from "@/components/ui/text"
import { EyeIcon, EyeOffIcon } from "@/components/ui/icon"
import { Image, View } from "react-native"
import { Center } from "@/components/ui/center"
import { Spinner } from "@/components/ui/spinner"
import useToastMessage from "@/lib/hooks/useToastMessage"

// Schema validasi pakai Zod
const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
})

type LoginForm = z.infer<typeof loginSchema>

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [firebaseError, setFirebaseError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const handleTogglePassword = () => setShowPassword((prev) => !prev)

  const onSubmit = async (data: LoginForm) => {
    setFirebaseError("")
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password)
      router.push("/(tabs)")
    } catch (err: any) {
      console.log("Login error:", err.message)
      setFirebaseError("Email atau password salah.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-white p-5">
      <Center>
        <Image
          source={require("@/assets/images/mawarindah.png")}
          style={{ width: 150, height: 150 }}
        />
      </Center>

      <FormControl className="gap-5">
        <Heading size="2xl" className="text-center">
          Login Sistem POS
        </Heading>

        {/* Email */}
        <View className="gap-1">
          <Text className="text-lg font-semibold">Email</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input size="xl" className="rounded-lg">
                <InputField
                  type="text"
                  autoCapitalize="none"
                  placeholder="Masukkan email admin"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              </Input>
            )}
          />
          {errors.email && (
            <Text className="text-red-500 text-sm">{errors.email.message}</Text>
          )}
        </View>

        {/* Password */}
        <View className="gap-1">
          <Text className="text-lg font-semibold">Password</Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input size="xl" className="rounded-lg">
                <InputField
                  autoCapitalize="none"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password admin"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
                <InputSlot className="pr-3" onPress={handleTogglePassword}>
                  <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
                </InputSlot>
              </Input>
            )}
          />
          {errors.password && (
            <Text className="text-red-500 text-sm">
              {errors.password.message}
            </Text>
          )}
        </View>

        {/* Error Login Firebase */}
        {firebaseError ? (
          <Text className="text-red-500">{firebaseError}</Text>
        ) : null}

        {/* Tombol Login */}
        <Button
          isDisabled={loading}
          size="xl"
          className="rounded-lg mt-3"
          onPress={handleSubmit(onSubmit)}
        >
          {loading ? (
            <View className="flex-row items-center gap-2">
              <Spinner color="white" />
              <ButtonText>Memproses...</ButtonText>
            </View>
          ) : (
            <ButtonText>Login</ButtonText>
          )}
        </Button>
      </FormControl>
    </View>
  )
}

export default Login
