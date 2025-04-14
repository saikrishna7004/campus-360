import { Modal, View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Order } from '@/store/orderStore';

interface Props {
    isVisible: boolean;
    order: Order | null;
    onClose: () => void;
}

export default function OrderDetailsModal({ isVisible, order, onClose }: Props) {
    const handleOpenDocument = async (url: string) => {
        try {
            await Linking.openURL(url);
        } catch (error) {
            console.error('Error opening document:', error);
        }
    };

    if (!order) return null;

    return (
        <Modal visible={isVisible} transparent animationType="slide">
            <View className="flex-1 bg-black/50">
                <View className="flex-1 mt-20 bg-white rounded-t-3xl">
                    <View className="p-4 border-b border-gray-200">
                        <View className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
                        <Text className="text-2xl font-bold">Order #{order.orderId}</Text>
                        <Text className="text-gray-500 mt-1">
                            {new Date(order.createdAt).toLocaleString()}
                        </Text>
                    </View>

                    <ScrollView className="p-4">
                        {order.items.map((item, index) => (
                            <View key={index} className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <Text className="font-semibold">{item.name}</Text>
                                <Text className="text-gray-600">
                                    {item.quantity}x ₹{item.price} = ₹{item.quantity * item.price}
                                </Text>
                                
                                {item.isPrintItem && item.documentDetails && (
                                    <View className="mt-2 bg-blue-50 p-3 rounded-lg">
                                        <Text className="font-medium text-blue-800">Print Details:</Text>
                                        <Text className="text-blue-700">
                                            {item.documentDetails.printingOptions.colorType === 'bw' ? 'Black & White' : 'Color'} • 
                                            {item.documentDetails.printingOptions.printSides === 'single' ? 'Single Sided' : 'Double Sided'}
                                        </Text>
                                        <Text className="text-blue-700">
                                            Copies: {item.documentDetails.printingOptions.numberOfCopies} • 
                                            Size: {item.documentDetails.printingOptions.pageSize}
                                        </Text>
                                        {item.documentDetails.printingOptions.additionalInfo && (
                                            <Text className="text-blue-700 mt-1">
                                                Note: {item.documentDetails.printingOptions.additionalInfo}
                                            </Text>
                                        )}
                                        <TouchableOpacity 
                                            onPress={() => item?.documentDetails?.url && handleOpenDocument(item.documentDetails.url)}
                                            className="flex-row items-center mt-2 bg-blue-100 p-2 rounded"
                                        >
                                            <FontAwesome name="file-pdf-o" size={16} color="#1e40af" />
                                            <Text className="text-blue-800 ml-2">View Document</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        ))}

                        <View className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <Text className="font-bold text-lg">Total: ₹{order.totalAmount}</Text>
                            <Text className="text-gray-600">Payment via {order.paymentMethod}</Text>
                        </View>
                    </ScrollView>

                    <View className="p-4 border-t border-gray-200">
                        <TouchableOpacity
                            onPress={onClose}
                            className="bg-gray-200 p-3 rounded-lg"
                        >
                            <Text className="text-center font-medium">Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
