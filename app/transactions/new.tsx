import React, { useEffect, useState } from "react"
import { View, ScrollView } from "react-native"
import { useRouter } from "expo-router"

import { Controller, useFieldArray, useForm } from "react-hook-form"
import { useCurrentUser } from "@/lib/hooks/useCurrentUser"

import { Text } from "@/components/ui/text"
import { Card } from "@/components/ui/card"
import { Button, ButtonText } from "@/components/ui/button"

import { Feather } from "@expo/vector-icons"

import DateTimeDisplay from "@/components/DateTimeDisplay"
import TransactionSummary from "@/components/TransactionSummary"
import TransactionCardItem from "@/components/TransactionCard"
import DropdownSelector from "@/components/DropdownSelector"

import { useCustomerStore } from "@/lib/zustand/useCustomerStore"
import { useFabricStore } from "@/lib/zustand/useFabricStore"

import useToastMessage from "@/lib/hooks/useToastMessage"
import useGenerateInvoice from "@/lib/hooks/useGenerateInvoice"

import { TTransactionSchema } from "@/schema/transactionSchema"
import { createTransaction } from "@/lib/firestore/transaction"
import { Spinner } from "@/components/ui/spinner"
import DateTimePicker from "react-native-ui-datepicker"

import { useDefaultClassNames } from "react-native-ui-datepicker"
import { Timestamp } from "firebase/firestore"

const NewTransactionScreen = () => {
  const { user } = useCurrentUser()
  const router = useRouter()

  const { showToast } = useToastMessage()

  const { customers, fetchAllCustomers } = useCustomerStore()
  const { fabrics, fetchAllFabrics } = useFabricStore()

  const [invoiceCode, setInvoiceCode] = useState<string>()
  const [loading, setLoading] = useState<boolean>(false)

  const [date, setDate] = useState(undefined)
  const defaultClassNames = useDefaultClassNames()

  useEffect(() => {
    fetchAllCustomers()
    fetchAllFabrics()
    setInvoiceCode(useGenerateInvoice())
  }, [])

  const {
    control,
    watch,
    setValue,
    getValues,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<TTransactionSchema>({
    mode: "onChange",
    defaultValues: {
      customerName: "",
      cards: [
        {
          fabricName: "",
          quantityType: "",
          weight: "",
          pricePerKg: 0,
          discountPerKg: 0,
          discount: 0,
          totalPrice: 0,
          useDiscount: false,
        },
      ],
      subTotal: 0,
      totalDiscount: 0,
      totalTransaction: 0,
      createdAt: undefined,
    },
  })

  useEffect(() => {
    if (user) {
      reset((prevValues) => ({
        ...prevValues,
        adminName: user.name,
      }))
    }
  }, [user, reset])

  const { fields, append, remove } = useFieldArray({
    control,
    name: "cards",
  })

  const handleAddCard = () => {
    append({
      fabricName: "",
      quantityType: "",
      weight: "",
      pricePerKg: 0,
      discountPerKg: 0,
      discount: 0,
      totalPrice: 0,
      useDiscount: false,
    })
  }

  const updateTransactionTotals = () => {
    const cards = getValues("cards")

    const subTotal = cards.reduce(
      (sum, card) => sum + (card.totalPrice || 0),
      0
    )
    setValue("subTotal", subTotal)

    const totalDiscount = cards.reduce(
      (sum, card) => sum + (card.discount || 0),
      0
    )
    setValue("totalDiscount", totalDiscount)

    setValue("totalTransaction", subTotal - totalDiscount)
  }

  const watchedCards = watch("cards")

  useEffect(() => {
    updateTransactionTotals()
  }, [watchedCards])

  const onSubmit = async (data: TTransactionSchema) => {
    // Ambil tanggal dari date picker (user memilihnya)
    // dan ambil waktu sekarang
    const selectedDate = date || new Date()
    const now = new Date()

    // Gabungkan: ambil tanggal dari DatePicker, waktu dari sekarang
    const combinedDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds()
    )

    setLoading(true)
    const transactionData = {
      ...data,
      invCode: invoiceCode || "",
      cards: data.cards.map((card: any) => ({
        ...card,
        discountPerKg: parseFloat(card.discountPerKg) || 0, // Pastikan Type nya number, bukan string
      })),
      createdAt: Timestamp.fromDate(combinedDate),
    }

    try {
      await createTransaction(transactionData)
      showToast("Transaksi berhasil dibuat", "success")
      reset()
      setLoading(false)
      router.push(`/transactions/${invoiceCode}`)
    } catch (error) {
      showToast("Gagal membuat transaksi", "error")
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView className="flex-1 bg-white p-5">
      {/* Section No transaksi */}
      <Card variant="filled" className="flex flex-row items-center gap-3 mb-3">
        <Feather name="file" size={24} color="#BF40BF" />
        <Text size="lg" className="flex-1 font-semibold text-self-purple">
          {invoiceCode}
        </Text>
      </Card>

      {/* Section Info Admin dan Waktu */}
      <View>
        <Card
          variant="outline"
          className="flex flex-row items-center gap-3 mb-3"
        >
          <Feather name="user" size={24} color="#BF40BF" />
          <Text size="lg" className="flex-1 font-semibold text-self-purple">
            Admin {user?.name}
          </Text>
        </Card>
        <DateTimeDisplay />
      </View>

      <DateTimePicker
        mode="single"
        date={date}
        onChange={({ date }: any) => {
          setDate(date)
        }}
        classNames={{
          ...defaultClassNames,
          today: "border-self-purple border-1",
          selected: "bg-self-purple",
          selected_label: "text-white",
          range_end_label: "text-white",
          range_start_label: "text-white",
          range_fill: "bg-self-purple/20",
        }}
      />

      {/* Section Field Nama Customer */}
      <View className="mb-5 flex gap-1">
        <Text className="text-lg font-semibold text-self-purple">
          Nama Customer
        </Text>
        <Controller
          control={control}
          name="customerName"
          rules={{ required: true }}
          render={({ field }) => (
            <DropdownSelector
              label="Customer"
              options={customers.map((c) => c.name)}
              searchable={true}
              placeholder="Pilih Customer"
              searchPlaceholder="Cari nama customer..."
              value={field.value || ""}
              addDataLink="/customers/new"
              onChange={(value) => field.onChange(value)}
            />
          )}
        />
      </View>

      {/* Section Card */}
      <View className="mb-1">
        <Text className="text-lg font-semibold mb-1 text-self-purple">
          Item Transaksi
        </Text>
        {fields.map((field, index) => (
          <TransactionCardItem
            key={field.id}
            index={index}
            control={control}
            watch={watch}
            setValue={setValue}
            getValues={getValues}
            cardData={field}
            fabrics={fabrics}
            onRemove={() => remove(index)}
            isRemovable={fields.length > 1}
          />
        ))}
      </View>

      {/* Button tambah card baru */}
      <Button
        onPress={handleAddCard}
        size="xl"
        variant="link"
        className="mb-5 rounded-lg border border-dashed border-self-purple"
      >
        <Feather name="plus" size={24} color="#BF40BF" />
        <ButtonText className="text-xl text-self-purple">
          Tambah Item Baru
        </ButtonText>
      </Button>

      <TransactionSummary getValues={getValues} />

      {/* Button Submit */}
      <Button
        onPress={handleSubmit(onSubmit)}
        size="xl"
        variant="solid"
        disabled={!isValid || loading}
        className={`rounded-lg mb-24 ${
          !isValid ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? (
          <View className="flex-row gap-1">
            <Spinner color="white" />
            <ButtonText>Memproses Invoice...</ButtonText>
          </View>
        ) : (
          <ButtonText>Buat Transaksi</ButtonText>
        )}
      </Button>
    </ScrollView>
  )
}

export default NewTransactionScreen
