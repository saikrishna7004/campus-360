import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, Alert, Image, TouchableOpacity, ScrollView, RefreshControl, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useAuthStore from '@/store/authStore';

type Book = {
    _id: string;
    title: string;
    author: string;
    image: string;
    available: boolean;
    count: number;
    borrowedDate?: Date;
    returnDate?: Date;
    deadline?: Date;
    pdfUrl?: string;
};

const Library = () => {
    const { getAuthHeader } = useAuthStore();
    const [books, setBooks] = useState<Book[]>([]);
    const [userBooks, setUserBooks] = useState<Book[]>([]);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['50%', '75%'], []);

    const fetchBooks = async () => {
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/books`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setBooks(data);
        } catch (err) {
            console.error("Error fetching books:", err);
        }
    };

    const fetchUserBooks = async () => {
        try {
            const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/books/borrowed`, { headers: getAuthHeader() });
            setUserBooks(response.data);
        } catch (err) {
            console.error('Error fetching user books:', err);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchBooks();
            await fetchUserBooks();
            setLoading(false);
        };
        loadData();
    }, []);

    const borrowBook = async (book: Book) => {
        if (userBooks.length >= 2) {
            Alert.alert('Error', 'You can only hold 2 books at a time.');
            return;
        }

        const alreadyBorrowed = userBooks.find((borrowedBook) => borrowedBook._id === book._id);
        if (alreadyBorrowed) {
            Alert.alert('Error', 'You have already borrowed this book.');
            return;
        }

        if (book.count <= 0) {
            Alert.alert('Error', `${book.title} is not available.`);
            return;
        }

        try {
            const response = await axios.post(
                `${process.env.EXPO_PUBLIC_API_URL}/books/borrow/${book._id}`,
                {},
                { headers: getAuthHeader() }
            );
            const updatedBook = response.data;

            const newBook = { ...updatedBook, requestDate: new Date(), deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) };
            setUserBooks([...userBooks, newBook]);
            setBooks(books.map(b => (b._id === updatedBook._id ? updatedBook : b)));

            Alert.alert('Success', `You borrowed ${book.title}`);
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to borrow the book.');
        }
    };

    const openModal = (book: Book) => {
        setSelectedBook(book);
        bottomSheetRef.current?.expand();
    };

    const closeModal = () => {
        setSelectedBook(null);
        bottomSheetRef.current?.close();
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchBooks();
        await fetchUserBooks();
        setRefreshing(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 40 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    <View className="px-4">
                        <Text className="text-2xl font-bold mb-4 text-black">Library</Text>

                        <Text className="text-xl font-bold mb-2 text-black">Books I'm Holding:</Text>
                        <View className="mb-4">
                            {userBooks.length === 0 ? (
                                <Text className="text-lg text-gray-600">None</Text>
                            ) : (
                                userBooks.map((item) => (
                                    <View key={item._id} className="flex flex-row mb-4 border border-gray-300 rounded-lg bg-gray-100">
                                        <View className="object-contain h-25 w-20 rounded-lg">
                                            <Image source={{ uri: item.image }} style={{ height: 100, width: 75 }} className="rounded-lg" />
                                        </View>
                                        <View className="justify-center ml-1 mb-1" style={{ flex: 1 }}>
                                            <Text className="text-lg font-semibold text-black" numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
                                            <Text className="text-sm text-gray-600" numberOfLines={1} ellipsizeMode="tail">by {item.author}</Text>
                                            <Text className="text-sm text-gray-600">Date Issued: {item.borrowedDate ? new Date(item.borrowedDate).toLocaleDateString() : 'N/A'}</Text>
                                            <Text className="text-sm text-gray-600">Deadline: {item.deadline ? new Date(item.deadline).toLocaleDateString() : 'N/A'}</Text>
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>

                        <Text className="text-xl font-bold mb-2 text-black">Available Books:</Text>
                        <View className="flex flex-wrap flex-row justify-between">
                            {books.map((item) => (
                                <View key={item._id} className="w-1/2 p-2">
                                    <View className="border border-gray-300 rounded-lg bg-gray-50">
                                        <TouchableOpacity onPress={() => openModal(item)} className="object-contain">
                                            <Image source={{ uri: item.image }} className="h-40 rounded-lg" />
                                        </TouchableOpacity>
                                        <View className="px-3">
                                            <Text className="text-[14px] font-semibold text-black mt-2">{item.title}</Text>
                                            <TouchableOpacity
                                                onPress={() => openModal(item)}
                                                className="flex flex-row py-2"
                                            >
                                                <Text className="text-green-700 font-semibold">Details</Text>
                                                <MaterialCommunityIcons name="chevron-right" size={24} color="green" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            )}

            <BottomSheet
                ref={bottomSheetRef}
                snapPoints={snapPoints}
                enablePanDownToClose
                index={-1}
                onClose={closeModal}
                backdropComponent={({ style }) => (
                    selectedBook && <View style={[style, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]} />
                )}
            >
                {selectedBook && (
                    <BottomSheetView className="p-5">
                        <Image source={{ uri: selectedBook.image }} style={{ height: 160, width: 125 }} className="rounded-lg self-center" />
                        <Text className="text-xl font-bold text-black mt-2">{selectedBook.title}</Text>
                        <Text className="text-lg text-gray-600 mt-1">by {selectedBook.author}</Text>
                        <Text className="text-sm text-gray-600 mt-1">Available: {selectedBook.count > 0 ? 'Yes' : 'No'}</Text>
                        <Text className="text-sm text-gray-600 mt-1">Count: {selectedBook.count}</Text>
                        <View className="flex flex-row gap-2 items-center mt-4">
                            {selectedBook.pdfUrl && (
                                <TouchableOpacity
                                    onPress={() => Alert.alert(
                                        'External Link',
                                        `You are about to visit an external link: \n\n${selectedBook.pdfUrl}. \n\nDo you want to continue?`,
                                        [
                                            { text: 'Cancel', style: 'cancel' },
                                            { text: 'OK', onPress: () => Linking.openURL(selectedBook.pdfUrl as string) },
                                        ]
                                    )}
                                    className="px-4 py-2 rounded-lg bg-blue-600"
                                >
                                    <Text className="text-white font-semibold">View PDF</Text>
                                </TouchableOpacity>
                            )}
                            {selectedBook.count > 0 ? (
                                <TouchableOpacity
                                    onPress={() => {
                                        borrowBook(selectedBook);
                                        closeModal();
                                    }}
                                    className="px-4 py-2 rounded-lg bg-green-600"
                                >
                                    <Text className="text-white font-semibold">Borrow</Text>
                                </TouchableOpacity>
                            ) : (
                                <Text className="text-red-600 font-semibold">Out of Stock</Text>
                            )}
                            <TouchableOpacity
                                onPress={closeModal}
                                className="px-4 py-2 rounded-lg bg-gray-600"
                            >
                                <Text className="text-white font-semibold">Close</Text>
                            </TouchableOpacity>
                        </View>
                    </BottomSheetView>
                )}
        </BottomSheet>
        </SafeAreaView >
    );
};

export default Library;
