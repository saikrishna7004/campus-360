import React, { useState } from 'react';
import { View, Text, Alert, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Modal from 'react-native-modal';

type Book = {
    id: number;
    title: string;
    author: string;
    image: string;
    available: boolean;
    count: number;
    requestDate?: Date;
    deadline?: Date;
};

const Library = () => {
    const [books, setBooks] = useState<Book[]>([
        { id: 1, title: 'Book 1', author: 'Author A', image: 'https://picsum.photos/200/300', available: true, count: 10 },
        { id: 2, title: 'Book 2', author: 'Author B', image: 'https://picsum.photos/200/300', available: true, count: 5 },
        { id: 3, title: 'Book 3', author: 'Author C', image: 'https://picsum.photos/200/300', available: true, count: 2 },
        // Add more books to make a total of 30
        { id: 4, title: 'Book 4', author: 'Author D', image: 'https://picsum.photos/200/300', available: true, count: 7 },
        { id: 5, title: 'Book 5', author: 'Author E', image: 'https://picsum.photos/200/300', available: true, count: 3 },
        { id: 6, title: 'Book 6', author: 'Author F', image: 'https://picsum.photos/200/300', available: true, count: 8 },
        { id: 7, title: 'Book 7', author: 'Author G', image: 'https://picsum.photos/200/300', available: true, count: 6 },
        { id: 8, title: 'Book 8', author: 'Author H', image: 'https://picsum.photos/200/300', available: true, count: 4 },
        { id: 9, title: 'Book 9', author: 'Author I', image: 'https://picsum.photos/200/300', available: true, count: 9 },
        { id: 10, title: 'Book 10', author: 'Author J', image: 'https://picsum.photos/200/300', available: true, count: 1 },
        { id: 11, title: 'Book 11', author: 'Author K', image: 'https://picsum.photos/200/300', available: true, count: 5 },
        { id: 12, title: 'Book 12', author: 'Author L', image: 'https://picsum.photos/200/300', available: true, count: 2 },
        { id: 13, title: 'Book 13', author: 'Author M', image: 'https://picsum.photos/200/300', available: true, count: 7 },
        { id: 14, title: 'Book 14', author: 'Author N', image: 'https://picsum.photos/200/300', available: true, count: 3 },
        { id: 15, title: 'Book 15', author: 'Author O', image: 'https://picsum.photos/200/300', available: true, count: 8 },
        { id: 16, title: 'Book 16', author: 'Author P', image: 'https://picsum.photos/200/300', available: true, count: 6 },
        { id: 17, title: 'Book 17', author: 'Author Q', image: 'https://picsum.photos/200/300', available: true, count: 4 },
        { id: 18, title: 'Book 18', author: 'Author R', image: 'https://picsum.photos/200/300', available: true, count: 9 },
        { id: 19, title: 'Book 19', author: 'Author S', image: 'https://picsum.photos/200/300', available: true, count: 1 },
        { id: 20, title: 'Book 20', author: 'Author T', image: 'https://picsum.photos/200/300', available: true, count: 5 },
        { id: 21, title: 'Book 21', author: 'Author U', image: 'https://picsum.photos/200/300', available: true, count: 2 },
        { id: 22, title: 'Book 22', author: 'Author V', image: 'https://picsum.photos/200/300', available: true, count: 7 },
        { id: 23, title: 'Book 23', author: 'Author W', image: 'https://picsum.photos/200/300', available: true, count: 3 },
        { id: 24, title: 'Book 24', author: 'Author X', image: 'https://picsum.photos/200/300', available: true, count: 8 },
        { id: 25, title: 'Book 25', author: 'Author Y', image: 'https://picsum.photos/200/300', available: true, count: 6 },
        { id: 26, title: 'Book 26', author: 'Author Z', image: 'https://picsum.photos/200/300', available: true, count: 4 },
        { id: 27, title: 'Book 27', author: 'Author AA', image: 'https://picsum.photos/200/300', available: true, count: 9 },
        { id: 28, title: 'Book 28', author: 'Author BB', image: 'https://picsum.photos/200/300', available: true, count: 1 },
        { id: 29, title: 'Book 29', author: 'Author CC', image: 'https://picsum.photos/200/300', available: true, count: 5 },
        { id: 30, title: 'Book 30', author: 'Author DD', image: 'https://picsum.photos/200/300', available: true, count: 2 },
    ]);

    const [userBooks, setUserBooks] = useState<Book[]>([]);

    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const borrowBook = (book: Book) => {
        if (userBooks.length >= 2) {
            Alert.alert('Error', 'You can only hold 2 books at a time.');
            return;
        }

        if (book.count <= 0) {
            Alert.alert('Error', `${book.title} is not available.`);
            return;
        }

        const newBook = { ...book, requestDate: new Date(), deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) };
        setUserBooks([...userBooks, newBook]);

        setBooks(books.map(b => (b.id === book.id ? { ...b, count: b.count - 1, available: b.count > 1 } : b)));

        Alert.alert('Success', `You borrowed ${book.title}`);
    };

    const openModal = (book: Book) => {
        setSelectedBook(book);
        setModalVisible(true);
    };

    const closeModal = () => {
        setSelectedBook(null);
        setModalVisible(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                <View className="p-4">
                    <Text className="text-2xl font-bold mb-4 text-black">Library</Text>

                    <Text className="text-xl font-bold mb-2 text-black">Books I'm Holding:</Text>
                    <View className="mb-4">
                        {userBooks.length === 0 ? (
                            <Text className="text-lg text-gray-600">None</Text>
                        ) : (
                            userBooks.map((item) => (
                                <View key={item.id} className="mb-4 p-4 border border-gray-300 rounded-lg bg-gray-100">
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
                            <View key={item.id} className="w-1/3 p-2">
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
                <Modal
                    isVisible={modalVisible}
                    onBackdropPress={closeModal}
                    onSwipeComplete={closeModal}
                    swipeDirection="down"
                    style={{ justifyContent: 'flex-end', margin: 0 }}
                >
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
                </Modal>
            )}
        </SafeAreaView>
    );
};

export default Library;
