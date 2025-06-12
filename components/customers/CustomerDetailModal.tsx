import React from "react";
import { View } from "react-native";
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalBody,
} from "@/components/ui/modal";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { CloseIcon } from "@/components/ui/icon";
import { Customer } from "@/types/customer";

type Props = {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
};

const CustomerDetailModal = ({ customer, isOpen, onClose }: Props) => {
  if (!customer) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader className="mb-3">
          <Heading size="xl">Detail Customer</Heading>
          <ModalCloseButton>
            <Icon as={CloseIcon} size="lg" />
          </ModalCloseButton>
        </ModalHeader>

        <ModalBody>
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-lg font-semibold">Nama:</Text>
            <Text className="text-lg">{customer.name}</Text>
          </View>
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-lg font-semibold">Perusahaan:</Text>
            <Text className="text-lg">{customer.company || "-"}</Text>
          </View>
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-lg font-semibold">Nomor Telepon:</Text>
            <Text className="text-lg">{customer.phone || "-"}</Text>
          </View>
        </ModalBody>

      </ModalContent>
    </Modal>
  );
};

export default CustomerDetailModal;
