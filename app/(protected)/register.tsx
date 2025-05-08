import React, { useState } from "react"
import { Text, ScrollView } from "react-native"
import { useRouter } from "expo-router"

import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/utils/firebase"

import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { RegisterSchema, registerSchema } from "@/schema/registerSchema"

import useToastMessage from "@/lib/hooks/useToastMessage"

import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control"
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectItem,
  SelectIcon,
} from "@/components/ui/select"
import { Button, ButtonText } from "@/components/ui/button"
import { Input, InputField } from "@/components/ui/input"
import { Pressable } from "@/components/ui/pressable"
import { Feather } from "@expo/vector-icons"
import { ChevronDownIcon } from "@/components/ui/icon"

const RegisterScreen = () => {
  const router = useRouter()
  const { showToast } = useToastMessage()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: undefined,
    },
  })

  const onSubmit = async (data: RegisterSchema) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      )

      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: data.name,
        email: data.email,
        role: data.role,
        createdAt: new Date(),
      })

      showToast("Berhasil mendaftarkan admin baru", "success")
      router.push("/(tabs)/settings")
    } catch (err: any) {
      showToast("Gagal mendaftarkan admin baru", "error")
      console.error(err)
    }
  }

  return (
    <ScrollView className="flex-1 bg-white p-5">
      <FormControl className="mb-5">
        <FormControlLabel>
          <FormControlLabelText className="text-lg">
            Nama Admin
          </FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input size="lg" variant="underlined">
              <InputField
                placeholder="Masukkan nama admin"
                autoCapitalize="characters"
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
      </FormControl>

      <FormControl className="mb-5">
        <FormControlLabel>
          <FormControlLabelText className="text-lg">Email</FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <Input size="lg" variant="underlined">
              <InputField
                placeholder="Masukkan email admin"
                autoCapitalize="characters"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
              />
            </Input>
          )}
        />
        {errors.email && (
          <Text className="text-red-500 mt-2">{errors.email.message}</Text>
        )}
      </FormControl>

      <FormControl className="mb-5">
        <FormControlLabel>
          <FormControlLabelText className="text-lg">
            Password
          </FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <Input size="lg" variant="underlined">
              <InputField
                placeholder="Masukkan Password"
                secureTextEntry={!showPassword}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
              />
              <Pressable onPress={() => setShowPassword((prev) => !prev)}>
                <Feather name={showPassword ? "eye" : "eye-off"} />
              </Pressable>
            </Input>
          )}
        />
        {errors.password && (
          <Text className="text-red-500 mt-2">{errors.password.message}</Text>
        )}
      </FormControl>

      <FormControl className="mb-5">
        <FormControlLabel>
          <FormControlLabelText className="text-lg">
            Konfirmasi Password
          </FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field }) => (
            <Input size="lg" variant="underlined">
              <InputField
                placeholder="Masukkan Konfirmasi Password"
                secureTextEntry={!showConfirm}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
              />
              <Pressable onPress={() => setShowConfirm((prev) => !prev)}>
                <Feather name={showConfirm ? "eye" : "eye-off"} />
              </Pressable>
            </Input>
          )}
        />
        {errors.confirmPassword && (
          <Text className="text-red-500 mt-2">{errors.confirmPassword.message}</Text>
        )}
      </FormControl>

      <FormControl className="mb-5">
        <FormControlLabel>
          <FormControlLabelText className="text-lg">Role</FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="role"
          render={({ field: { value, onChange } }) => (
            <Select selectedValue={value} onValueChange={onChange}>
              <SelectTrigger size="lg" variant="underlined">
                <SelectInput placeholder="Pilih Role" />
                <SelectIcon className="ml-auto" as={ChevronDownIcon} />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  <SelectItem label="Admin" value="admin" />
                  <SelectItem label="Super Admin" value="superadmin" />
                </SelectContent>
              </SelectPortal>
            </Select>
          )}
        />
        {errors.role && (
          <Text className="text-red-500 mt-2">{errors.role.message}</Text>
        )}
      </FormControl>

      <Button onPress={handleSubmit(onSubmit)} className="rounded-full mb-5">
        <ButtonText>Daftar</ButtonText>
      </Button>
    </ScrollView>
  )
}

export default RegisterScreen
