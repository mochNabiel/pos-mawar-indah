import React, { useState } from "react"
import { View, Text, ScrollView } from "react-native"
import { useRouter } from "expo-router"

import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { UserSchema, userSchema } from "@/schema/userSchema"

import useToastMessage from "@/lib/hooks/useToastMessage"

import { Button, ButtonText } from "@/components/ui/button"
import { Input, InputField, InputIcon } from "@/components/ui/input"
import { Pressable } from "@/components/ui/pressable"
import { EyeIcon, EyeOffIcon } from "@/components/ui/icon"
import { createUser, isUserEmailUnique } from "@/lib/firestore/users"
import { Spinner } from "@/components/ui/spinner"
import DropdownSelector from "@/components/DropdownSelector"
import { Heading } from "@/components/ui/heading"

const RegisterScreen = () => {
  const router = useRouter()
  const { showToast } = useToastMessage()
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirm, setShowConfirm] = useState<boolean>(false)

  const [loading, setLoading] = useState<boolean>(false)
  const [checkingEmail, setCheckingEmail] = useState<boolean>(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserSchema>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: undefined,
    },
  })

  const handleCheckEmail = async (email: string) => {
    setCheckingEmail(true)
    if (!email) {
      showToast("Masukkan email admin terlebih dahulu", "error")
      setCheckingEmail(false)
      return
    }

    try {
      const isUnique = await isUserEmailUnique(email)
      if (isUnique) {
        showToast("Email tersedia dan dapat digunakan", "success")
      } else {
        showToast("Email sudah dipakai, gunakan email lain", "error")
      }
      setCheckingEmail(false)
    } catch (err) {
      showToast("Terjadi kesalahan saat mengecek email", "error")
      setCheckingEmail(false)
    } finally {
      setCheckingEmail(false)
    }
  }

  const onSubmit = async (data: UserSchema) => {
    setLoading(true)

    // Cek apakah email user sudah ada di database
    const isUnique = await isUserEmailUnique(data.email)
    if (!isUnique) {
      showToast("Email admin sudah terpakai, coba gunakan email lain", "error")
      setLoading(false)
      return
    }

    try {
      await createUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role!,
        createdAt: new Date(),
      })

      showToast(
        `Berhasil mendaftarkan admin baru. Beralih ke akun ${data.email}`,
        "success"
      )
      setLoading(false)
      router.push("/(protected)/admins")
    } catch (error) {
      showToast("Gagal mendaftarkan admin baru", "error")
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView className="flex-1 bg-white p-5">
      <Heading size="2xl" className="text-center mb-5">Mendaftar Admin Baru</Heading>
      <View className="mb-3">
        <Text className="text-lg text-self-army font-medium mb-1">Email</Text>
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <View className="flex flex-row justify-between items-center gap-5 w-full">
              <Input variant="outline" size="lg" className="flex-1 rounded-lg">
                <InputField
                  placeholder="Masukkan email admin"
                  autoCapitalize="none"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                />
              </Input>
              <Button
                onPress={() => handleCheckEmail(field.value)}
                disabled={checkingEmail}
                className="h-full rounded-lg"
              >
                <ButtonText>
                  {checkingEmail ? "Mengecek..." : "Cek Email"}
                </ButtonText>
              </Button>
            </View>
          )}
        />
        {errors.email && (
          <Text className="text-red-500 mt-2">{errors.email.message}</Text>
        )}
      </View>

      <View className="mb-3">
        <Text className="text-lg text-self-army font-medium mb-1">
          Nama Admin
        </Text>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input variant="outline" size="lg" className="rounded-lg">
              <InputField
                placeholder="Masukkan nama admin"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
              />
            </Input>
          )}
        />
        {errors.name && (
          <Text className="text-red-500 mt-2">{errors.name.message}</Text>
        )}
      </View>

      <View className="mb-3">
        <Text className="text-lg text-self-army font-medium mb-1">
          Password
        </Text>
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <Input variant="outline" size="lg" className="rounded-lg">
              <InputField
                placeholder="Masukkan Password"
                autoCapitalize="none"
                secureTextEntry={!showPassword}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
              />
              <Pressable
                onPress={() => setShowPassword((prev) => !prev)}
                className="mr-2"
              >
                <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
              </Pressable>
            </Input>
          )}
        />
        {errors.password && (
          <Text className="text-red-500 mt-2">{errors.password.message}</Text>
        )}
      </View>

      <View className="mb-3">
        <Text className="text-lg text-self-army font-medium mb-1">
          Konfirmasi Password
        </Text>
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field }) => (
            <Input variant="outline" size="lg" className="rounded-lg">
              <InputField
                placeholder="Masukkan Konfirmasi Password"
                autoCapitalize="none"
                secureTextEntry={!showConfirm}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
              />
              <Pressable
                onPress={() => setShowConfirm((prev) => !prev)}
                className="mr-2"
              >
                <InputIcon as={showConfirm ? EyeIcon : EyeOffIcon} />
              </Pressable>
            </Input>
          )}
        />
        {errors.confirmPassword && (
          <Text className="text-red-500 mt-2">
            {errors.confirmPassword.message}
          </Text>
        )}
      </View>

      <View className="mb-3">
        <Text className="text-lg text-self-army font-medium mb-1">Role</Text>
        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <DropdownSelector
              label="Role"
              options={["admin", "superadmin"]}
              placeholder="Pilih Role"
              value={field.value || ""}
              onChange={(value) => field.onChange(value)}
            />
          )}
        />
        {errors.role && (
          <Text className="text-red-500 mt-2">{errors.role.message}</Text>
        )}
      </View>

      <Button
        onPress={handleSubmit(onSubmit)}
        size="lg"
        className="rounded-lg mt-3"
        isDisabled={loading}
      >
        {loading ? (
          <>
            <Spinner size="small" color="#3D8B37" />
            <ButtonText>
              <Text>Memproses...</Text>
            </ButtonText>
          </>
        ) : (
          <ButtonText>Daftar</ButtonText>
        )}
      </Button>
    </ScrollView>
  )
}

export default RegisterScreen
