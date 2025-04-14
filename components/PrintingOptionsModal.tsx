import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useState, useEffect, useRef, useMemo } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { FontAwesome } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { PDFDocument } from 'pdf-lib';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

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
    pricePerPageColor = 10,
    supportedSizes = ['A4', 'A3', 'Letter']
}: Props) {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['85%'], []);

    const [options, setOptions] = useState<PrintingOptions>({
        numberOfCopies: 1,
        colorType: 'bw',
        printSides: 'single',
        pageSize: 'A4',
        additionalInfo: ''
    });
    const [error, setError] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);

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

    useEffect(() => {
        if (isVisible) {
            bottomSheetRef.current?.expand();
        } else {
            bottomSheetRef.current?.close();
        }
    }, [isVisible]);

    return (
        <BottomSheet
            ref={bottomSheetRef}
            snapPoints={snapPoints}
            enablePanDownToClose
            index={isVisible ? 0 : -1}
            onClose={onClose}
            backdropComponent={({ style }) => (
                isVisible ? <View style={[style, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]} /> : null
            )}
        >
            <BottomSheetView className="flex-1 p-4 pb-8">
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-xl font-bold mb-4">Print Document</Text>
                    <View className="bg-green-50 p-4 rounded-xl">
                        <Text className="text-green-800">Price: ₹{totalPrice} ({options.numberOfCopies} x {options.numberOfCopies} pgs x {options.colorType === 'bw' ? `₹${pricePerPageBW}` : `₹${pricePerPageColor}`})</Text>
                    </View>
                </View>

                <ScrollView className="flex-1">
                    <TouchableOpacity
                        onPress={pickDocument}
                        className="bg-blue-500 p-4 rounded-xl mb-4 flex-row items-center justify-center"
                    >
                        <FontAwesome name="file-pdf-o" size={20} color="white" />
                        <Text className="text-white ms-2 text-center font-semibold">Select PDF Document</Text>
                    </TouchableOpacity>

                    {options.documentName && (
                        <View className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <Text className="text-blue-800 font-medium">
                                Selected: {options.documentName}
                            </Text>
                            <Text className="text-blue-800 font-medium">
                                No. of pages: {options.numberOfPages}
                            </Text>
                        </View>
                    )}

                    <View className="gap-y-4">
                        <View className="flex-row justify-between gap-x-4">
                            <View className="flex-1">
                                <Text className="text-gray-700 font-medium mb-2">Number of Copies</Text>
                                <View className="flex-row items-center justify-between border border-gray-300 rounded-xl px-3 py-2 bg-gray-50">
                                    <TouchableOpacity onPress={() => handleCopiesChange(false)}>
                                        <Text className="text-xl text-gray-700 px-2 font-bold">-</Text>
                                    </TouchableOpacity>
                                    <Text className="text-lg text-gray-700">{options.numberOfCopies}</Text>
                                    <TouchableOpacity onPress={() => handleCopiesChange(true)}>
                                        <Text className="text-xl text-gray-700 px-2 font-bold">+</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-700 font-medium mb-2">Print Type</Text>
                                <View className="border border-gray-300 rounded-xl bg-gray-50">
                                    <Picker
                                        selectedValue={options.colorType}
                                        onValueChange={(val) => setOptions({ ...options, colorType: val })}
                                    >
                                        <Picker.Item label="Black & White" value="bw" />
                                        <Picker.Item label="Color" value="color" />
                                    </Picker>
                                </View>
                            </View>
                        </View>

                        <View className="flex-row justify-between gap-x-4">
                            <View className="flex-1">
                                <Text className="text-gray-700 font-medium mb-2">Print Sides</Text>
                                <View className="border border-gray-300 rounded-xl bg-gray-50">
                                    <Picker
                                        selectedValue={options.printSides}
                                        onValueChange={(val) => setOptions({ ...options, printSides: val })}
                                    >
                                        <Picker.Item label="Single Sided" value="single" />
                                        <Picker.Item label="Double Sided" value="double" />
                                    </Picker>
                                </View>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-700 font-medium mb-2">Page Size</Text>
                                <View className="border border-gray-300 rounded-xl bg-gray-50">
                                    <Picker
                                        selectedValue={options.pageSize}
                                        onValueChange={(val) => setOptions({ ...options, pageSize: val })}
                                    >
                                        {supportedSizes.map(size => (
                                            <Picker.Item key={size} label={size} value={size} />
                                        ))}
                                    </Picker>
                                </View>
                            </View>
                        </View>

                        {error && (
                            <Text className="text-red-500 text-sm">{error}</Text>
                        )}

                        <View>
                            <Text className="text-gray-700 font-medium mb-2">Additional Instructions</Text>
                            <TextInput
                                value={options.additionalInfo}
                                onChangeText={(val) => setOptions({ ...options, additionalInfo: val })}
                                multiline
                                numberOfLines={3}
                                className="border border-gray-300 rounded-xl p-3 bg-gray-50"
                                placeholder="Any special instructions..."
                            />
                        </View>
                    </View>
                </ScrollView>

                <View className="flex-row justify-end gap-4 mt-6 pt-4 border-t border-gray-200">
                    <TouchableOpacity
                        onPress={onClose}
                        className="px-6 py-3 bg-gray-100 rounded-xl"
                    >
                        <Text className="text-gray-600 font-medium">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleSubmit}
                        className="bg-green-600 px-6 py-3 rounded-xl"
                    >
                        <Text className="text-white font-medium">Submit</Text>
                    </TouchableOpacity>
                </View>
            </BottomSheetView>
        </BottomSheet>
    );
}
