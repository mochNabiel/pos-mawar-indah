import React from "react";
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const CustomerDeleteModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onDelete,
  isDeleting,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="md" className="text-typography-950">
            Yakin ingin menghapus Data Customer ini?
          </Heading>
        </ModalHeader>
        <ModalBody>
          <Text size="sm" className="text-typography-500">
            Dengan menghapus data customer ini, semua data yang terkait dengan customer
            ini akan dihapus secara permanen.
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            action="secondary"
            size="lg"
            onPress={onClose}
            className="flex-1 rounded-lg"
          >
            <ButtonText>Kembali</ButtonText>
          </Button>
          <Button
            variant="solid"
            action="negative"
            size="lg"
            onPress={onDelete}
            className="flex-1 rounded-lg"
            isDisabled={isDeleting}
          >
            <ButtonText>Hapus</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CustomerDeleteModal;
