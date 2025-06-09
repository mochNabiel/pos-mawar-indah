import React from "react";
import { View } from "react-native";
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { CloseIcon } from "@/components/ui/icon";
import { Feather } from "@expo/vector-icons";
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
        <ModalHeader>
          <Heading size="xl">Detail Customer</Heading>
          <ModalCloseButton>
            <Icon as={CloseIcon} size="lg" />
          </ModalCloseButton>
        </ModalHeader>

        <ModalBody>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-semibold">Nama:</Text>
            <Text className="text-lg">{customer.name}</Text>
          </View>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-semibold">Nomor Telepon:</Text>
            <Text className="text-lg">{customer.phone || "-"}</Text>
          </View>
        </ModalBody>

      </ModalContent>
    </Modal>
  );
};

export default CustomerDetailModal;
