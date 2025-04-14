import { Modal, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import useCartStore from '@/store/cartStore';
import { PrintingOptions } from './PrintingOptionsModal';

interface DocumentDetails {
    id: string;
    name: string;
    url: string;
    printingOptions: PrintingOptions;
    orderId?: string;
}

export default function DocumentManagementModal({ isVisible, onClose }: {
    isVisible: boolean;
    onClose: () => void;
}) {
    const { documents, removeDocument } = useCartStore();

    return (
        <Modal visible={isVisible} transparent animationType="slide">
            <View className="flex-1 justify-end">
                <View className="bg-white rounded-t-xl p-4 h-[80%]">
                    <Text className="text-xl font-bold mb-4">Printing Documents</Text>
                    <ScrollView>
                        {documents.map((doc) => (
                            <View key={doc.id} className="border-b border-gray-200 py-3">
                                <Text className="font-semibold">{doc.name}</Text>
                                <Text className="text-sm text-gray-600 mt-1">
                                    {doc.printingOptions.colorType === 'bw' ? 'Black & White' : 'Color'} •
                                    {doc.printingOptions.printSides === 'single' ? 'Single Sided' : 'Double Sided'} •
                                    {doc.printingOptions.numberOfCopies} copies
                                </Text>
                                <TouchableOpacity
                                    onPress={() => removeDocument(doc.id)}
                                    className="bg-red-50 p-2 rounded mt-2"
                                >
                                    <Text className="text-red-600 text-center">Remove</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                    <TouchableOpacity
                        onPress={onClose}
                        className="bg-gray-200 p-3 rounded-lg mt-4"
                    >
                        <Text className="text-center">Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

export type { DocumentDetails };
