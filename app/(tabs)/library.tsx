import React, { useState, useEffect } from 'react';
import { View, Text, Alert, Image, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Modal from 'react-native-modal';
import axios from 'axios';
import { Sheet, useSheetRef } from '@/components/nativewindui/Sheet';
import { BottomSheetView } from '@gorhom/bottom-sheet';

type Book = {
    _id: string;
    title: string;
    author: string;
    image: string;
    available: boolean;
    count: number;
    requestDate?: Date;
    deadline?: Date;
};

const Library = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [userBooks, setUserBooks] = useState<Book[]>([]);

    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchBooks = async () => {
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/books`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            console.log(data);
            setBooks(data);
        } catch (err) {
            console.error("Error fetching books:", err);
        }
    };


    useEffect(() => {
        console.log("sumanth");
        fetchBooks();
        console.log("sumanth");
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
            const response = await axios.post(process.env.EXPO_PUBLIC_API_URL + `/books/borrow/${book._id}`);
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
        setModalVisible(true);
    };

    const closeModal = () => {
        setSelectedBook(null);
        setModalVisible(false);
    };
    const bottomSheetModalRef = useSheetRef();

    React.useEffect(() => {
        bottomSheetModalRef.current?.present();
    }, []);
    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={
                    <RefreshControl
                        refreshing={false}
                        onRefresh={fetchBooks}
                    />
                }
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
                                    {/* <Image source={{ uri: item.image }} className="w-20 h-20 mt-2 rounded-lg" /> */}
                                </View>
                            ))
                        )}
                    </View>

                    <Text className="text-xl font-bold mb-2 text-black">Available Books:</Text>
                    <View className="flex flex-wrap flex-row justify-between">
                        {books.map((item) => (
                            <View key={item._id} className="w-1/3 p-2">
                                <View className="border border-gray-300 rounded-lg bg-gray-100 p-2">
                                    <Image source={{ uri: item.image }} className="w-full h-40 rounded-lg" />
                                    <Text className="text-lg font-semibold text-black mt-2">{item.title}</Text>
                                    <TouchableOpacity
                                        onPress={() => openModal(item)}
                                        className="mt-2 px-4 py-2 rounded-lg bg-green-600"
                                    >
                                        <Text className="text-white font-semibold">Details</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {selectedBook && (
                <Sheet ref={bottomSheetModalRef} snapPoints={[200]}>
                    <BottomSheetView>
                        <View className="bg-white p-4 rounded-t-lg">
                            <Image source={{ uri: selectedBook.image }} className="w-full h-40 rounded-lg" />
                            <Text className="text-xl font-bold text-black mt-2">{selectedBook.title}</Text>
                            <Text className="text-lg text-gray-600 mt-1">by {selectedBook.author}</Text>
                            <Text className="text-sm text-gray-600 mt-1">Available: {selectedBook.available ? 'Yes' : 'No'}</Text>
                            <Text className="text-sm text-gray-600 mt-1">Count: {selectedBook.count}</Text>
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
                    </BottomSheetView>
                </Sheet>
            )}
        </SafeAreaView>
    );
};

export default Library;
