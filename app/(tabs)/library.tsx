import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Alert, Image, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useAuthStore from '@/store/authStore';

type Book = {
    _id: string;
    title: string;
    author: string;
    image: string;
    available: boolean;
    count: number;
    requestDate?: Date;
    deadline?: Date;
    pdfUrl?: string;
};

const Library = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [userBooks, setUserBooks] = useState<Book[]>([]);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const { getAuthHeader } = useAuthStore();

    const bottomSheetRef = React.useRef<BottomSheetModal>(null);

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

    useEffect(() => {
        fetchBooks();
    }, []);

    const borrowBook = async (book: Book) => {
        if (userBooks.length >= 2) {
            Alert.alert('Error', 'You can only hold 2 books at a time.');
            return;
        }

        if (book.count <= 0) {
            Alert.alert('Error', `${book.title} is not available.`);
            return;
        }

        try {
            const response = await axios.post(process.env.EXPO_PUBLIC_API_URL + `/books/borrow/${book._id}`, {
                headers: getAuthHeader(),
            });
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
        bottomSheetRef.current?.present();
    };

    const closeModal = () => {
        setSelectedBook(null);
        bottomSheetRef.current?.dismiss();
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchBooks();
        setRefreshing(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
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
                                <View key={item._id} className="mb-4 p-4 border border-gray-300 rounded-lg bg-gray-100">
                                    <Text className="text-lg font-semibold text-black">{item.title} by {item.author}</Text>
                                    <Text className="text-sm text-gray-600">Deadline: {item.deadline ? new Date(item.deadline).toLocaleDateString() : 'N/A'}</Text>
                                    <Image source={{ uri: item.image }} className="w-20 h-20 mt-2 rounded-lg" />
                                </View>
                            ))
                        )}
                    </View>

                    <Text className="text-xl font-bold mb-2 text-black">Available Books:</Text>
                    <View className="flex flex-wrap flex-row justify-between">
                        {books.map((item) => (
                            <View key={item._id} className="w-1/2 p-2">
                                <View className="border border-gray-300 rounded-lg bg-gray-100 p-2">
                                    <View className="object-contain h-40">
                                        <Image source={{ uri: item.image }} className="h-40 rounded-lg" />
                                    </View>
                                    <Text className="text-lg font-semibold text-black mt-2">{item.title}</Text>
                                    <TouchableOpacity
                                        onPress={() => openModal(item)}
                                        className="flex flex-row mt-2 px-4 py-2"
                                    >
                                        <Text className="text-green-700 font-semibold">Details</Text>
                                        <MaterialCommunityIcons name="chevron-right" size={24} color="green" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {selectedBook && (
                <BottomSheetModal
                    ref={bottomSheetRef}
                    index={0} 
                    snapPoints={[450]} 
                    onDismiss={closeModal}
                >
                    <View className="bg-white p-4 rounded-t-lg">
                        <Image source={{ uri: selectedBook.image }} className="w-full h-40 rounded-lg" />
                        <Text className="text-xl font-bold text-black mt-2">{selectedBook.title}</Text>
                        <Text className="text-lg text-gray-600 mt-1">by {selectedBook.author}</Text>
                        <Text className="text-sm text-gray-600 mt-1">Available: {selectedBook.available ? 'Yes' : 'No'}</Text>
                        <Text className="text-sm text-gray-600 mt-1">Count: {selectedBook.count}</Text>
                        {selectedBook.pdfUrl && (
                            <TouchableOpacity
                                onPress={() => Alert.alert('PDF Link', selectedBook.pdfUrl)}
                                className="mt-4 px-4 py-2 rounded-lg bg-blue-600"
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
                                className="mt-4 px-4 py-2 rounded-lg bg-green-600"
                            >
                                <Text className="text-white font-semibold">Borrow</Text>
                            </TouchableOpacity>
                        ) : (
                            <Text className="mt-4 text-red-600 font-semibold">Out of Stock</Text>
                        )}
                        <TouchableOpacity
                            onPress={closeModal}
                            className="mt-2 px-4 py-2 rounded-lg bg-gray-600"
                        >
                            <Text className="text-white font-semibold">Close</Text>
                        </TouchableOpacity>
                    </View>
                </BottomSheetModal>
            )}
        </SafeAreaView>
    );
};

export default Library;
