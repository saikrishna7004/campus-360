import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, PanResponder } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useState, useEffect } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { FontAwesome } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { PDFDocument } from 'pdf-lib';

export interface PrintingOptions {
    numberOfCopies: number;
    colorType: 'bw' | 'color';
    printSides: 'single' | 'double';
    pageSize: string;
    documentUrl?: string;
    documentName?: string;
    numberOfPages?: number;
    additionalInfo?: string;
}

interface Props {
    isVisible: boolean;
    onClose: () => void;
    onSubmit: (options: PrintingOptions) => void;
    pricePerPageBW?: number;
    pricePerPageColor?: number;
    supportedSizes?: string[];
}

export default function PrintingOptionsModal({ 
    isVisible, 
    onClose, 
    onSubmit,
    pricePerPageBW = 2,
    pricePerPageColor = 5,
    supportedSizes = ['A4', 'A3', 'Letter']
}: Props) {
    const [options, setOptions] = useState<PrintingOptions>({
        numberOfCopies: 1,
        colorType: 'bw',
        printSides: 'single',
        pageSize: 'A4',
        additionalInfo: ''
    });
    const [error, setError] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
            return gestureState.dy > 20;
        },
        onPanResponderRelease: (_, gestureState) => {
            if (gestureState.dy > 50) {
                onClose();
            }
        },
    });

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true
            });

            if (!result.canceled && result.assets?.[0]) {
                const file = result.assets[0];
                const fileUri = file.uri;
                const base64 = await FileSystem.readAsStringAsync(fileUri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                const pdfDoc = await PDFDocument.load(base64);
                const pageCount = pdfDoc.getPageCount();

                setOptions({
                    ...options,
                    documentUrl: file.uri,
                    documentName: file.name,
                    numberOfPages: pageCount
                });
                updateTotalPrice({
                    ...options,
                    documentUrl: file.uri,
                    numberOfPages: pageCount
                });
            }
        } catch (err) {
            console.error('Error picking document:', err);
        }
    };

    const handleSubmit = () => {
        if (!options.documentUrl) {
            setError('Please select a document');
            return;
        }
        if (!options.numberOfCopies || options.numberOfCopies < 1) {
            setError('Number of copies must be at least 1');
            return;
        }
        setError('');
        onSubmit(options);
    };

    const updateTotalPrice = (currentOptions: Partial<PrintingOptions>) => {
        const pricePerPage = currentOptions.colorType === 'bw' ? pricePerPageBW : pricePerPageColor;
        const pages = currentOptions.numberOfPages || 0;
        const copies = currentOptions.numberOfCopies || 0;
        const total = pricePerPage * pages * copies;
        setTotalPrice(total);
    };

    const handleCopiesChange = (increment: boolean) => {
        setOptions(prev => ({
            ...prev,
            numberOfCopies: increment 
                ? prev.numberOfCopies + 1 
                : Math.max(1, prev.numberOfCopies - 1)
        }));
        setError('');
    };

    useEffect(() => {
        updateTotalPrice(options);
    }, [options]);

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity 
                activeOpacity={1} 
                onPress={onClose}
                className="flex-1 bg-black/50"
            >
                <View className="flex-1 justify-end">
                    <TouchableOpacity 
                        activeOpacity={1}
                        onPress={e => e.stopPropagation()}
                    >
                        <View 
                            className="bg-white rounded-t-3xl p-4 pb-8"
                            {...panResponder.panHandlers}
                        >
                            <View className="w-16 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
                            
                            <Text className="text-xl font-bold mb-4">Print Document</Text>

                            <ScrollView className="max-h-[70vh]">
                                <TouchableOpacity 
                                    onPress={pickDocument}
                                    className="bg-blue-500 p-4 rounded-xl mb-2 flex-row items-center justify-center space-x-2"
                                >
                                    <FontAwesome name="file-pdf-o" size={20} color="white" />
                                    <Text className="text-white ms-2 text-center font-semibold">Select PDF Document</Text>
                                </TouchableOpacity>

                                {options.documentName && (
                                    <View className="mb-6 p-3 bg-blue-50 rounded-lg">
                                        <Text className="text-blue-800 font-medium">
                                            Selected: {options.documentName}
                                        </Text>
                                    </View>
                                )}

                                <View className="gap-y-4">
                                    <View className="flex flex-row items-center justify-between mb-2">
                                        <Text className="text-gray-700 font-medium mb-2">Number of Copies</Text>
                                        <View className="flex-row items-center justify-between border border-gray-300 rounded-xl px-3 bg-gray-50">
                                            <TouchableOpacity
                                                onPress={() => handleCopiesChange(false)}
                                                className="pe-2"
                                            >
                                                <Text className="text-xl text-gray-700 font-bold">-</Text>
                                            </TouchableOpacity>
                                            <Text className="text-lg text-gray-700">{options.numberOfCopies}</Text>
                                            <TouchableOpacity
                                                onPress={() => handleCopiesChange(true)}
                                                className="ps-2"
                                            >
                                                <Text className="text-xl text-gray-700 font-bold">+</Text>
                                            </TouchableOpacity>
                                        </View>
                                        {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
                                    </View>

                                    <View>
                                        <Text className="text-gray-700 font-medium mb-2">Print Type</Text>
                                        <Picker
                                            selectedValue={options.colorType}
                                            onValueChange={(val) => setOptions({...options, colorType: val})}
                                        >
                                            <Picker.Item label="Black & White" value="bw" />
                                            <Picker.Item label="Color" value="color" />
                                        </Picker>
                                    </View>

                                    <View>
                                        <Text className="text-gray-700 font-medium mb-2">Print Sides</Text>
                                        <Picker
                                            selectedValue={options.printSides}
                                            onValueChange={(val) => setOptions({...options, printSides: val})}
                                        >
                                            <Picker.Item label="Single Sided" value="single" />
                                            <Picker.Item label="Double Sided" value="double" />
                                        </Picker>
                                    </View>

                                    <View>
                                        <Text className="text-gray-700 font-medium mb-2">Page Size</Text>
                                        <Picker
                                            selectedValue={options.pageSize}
                                            onValueChange={(val) => setOptions({...options, pageSize: val})}
                                        >
                                            {supportedSizes.map(size => (
                                                <Picker.Item key={size} label={size} value={size} />
                                            ))}
                                        </Picker>
                                    </View>

                                    <View>
                                        <Text className="text-gray-700 font-medium mb-2">Additional Instructions</Text>
                                        <TextInput
                                            value={options.additionalInfo}
                                            onChangeText={(val) => setOptions({...options, additionalInfo: val})}
                                            multiline
                                            numberOfLines={3}
                                            className="border border-gray-300 rounded-xl p-3 bg-gray-50"
                                        />
                                    </View>

                                    <View className="bg-gray-100 p-4 rounded-xl mb-4">
                                        <Text className="text-xl font-bold">Total Price: ₹{totalPrice}</Text>
                                        <Text className="text-sm text-gray-600">
                                            {options.colorType === 'bw' ? `₹${pricePerPageBW}` : `₹${pricePerPageColor}`} per page
                                        </Text>
                                    </View>
                                </View>
                            </ScrollView>

                            <View className="flex-row justify-end gap-4 mt-6 pt-4 border-t border-gray-200">
                                <TouchableOpacity onPress={onClose} className="px-6 py-3">
                                    <Text className="text-gray-600 font-medium">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={handleSubmit}
                                    className="bg-green-700 px-6 py-3 rounded-xl"
                                >
                                    <Text className="text-white font-medium">Submit</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}
