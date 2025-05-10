import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { getTransactionByInvCode } from "@/lib/firestore/transaction";
import { TransactionWithId } from "@/types/transaction";
import { Center } from "@/components/ui/center";
import { Spinner } from "@/components/ui/spinner";

const TransactionDetailScreen = () => {
  const { invCode } = useLocalSearchParams();

  const invCodeParam = Array.isArray(invCode) ? invCode[0] : invCode;
  const [transaction, setTransaction] = useState<TransactionWithId | null>(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchTransaction = async () => {
      setLoading(true); // Set loading to true before fetching
      const transactionData = await getTransactionByInvCode(invCodeParam); // Await the async function
      setTransaction(transactionData);
      setLoading(false); // Set loading to false after fetching
    };

    fetchTransaction();
  }, [invCodeParam]);

  if (loading) {
    return (
      <Center>
        <Spinner size="large" />
        <Text>Loading...</Text>
      </Center>
    );
  }

  if (!transaction) {
    return (
      <Center>
        <Text>Transaction not found.</Text>
      </Center>
    );
  }

  return (
    <View className="flex-1 bg-white p-5">
      <Text>Transaction Detail Screen</Text>
      <Text>Invoice Code: {transaction.invCode}</Text>
      <Text>Customer Name: {transaction.customerName}</Text>
      <Text>Admin Name: {transaction.adminName}</Text>
      <Text>Transaction SubTotal: {transaction.subTotal}</Text>
      <Text>Transaction Total Diskon: {transaction.totalDiscount}</Text>
      <Text>Transaction Total Transaksi: {transaction.totalTransaction}</Text>
    </View>
  );
};

export default TransactionDetailScreen;
