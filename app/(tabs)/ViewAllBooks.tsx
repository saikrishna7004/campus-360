// ViewAllBooks.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

type Book = {
  _id: string;
  title: string;
  author: string;
  image: string;
  count: number;
  tags?: string[];
};

const ViewAllBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/books`);
      const data = await res.json();
      setBooks(data);
      setFilteredBooks(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    if (text.trim() === '') {
      setFilteredBooks(books);
    } else {
      const lower = text.toLowerCase();
      const filtered = books.filter(book =>
        book.tags?.some(tag => tag.toLowerCase().includes(lower))
      );
      setFilteredBooks(filtered);
    }
  };

  const renderBook = ({ item }: { item: Book }) => (
    <View className="flex-row mb-4 bg-gray-100 p-2 rounded-xl">
      <Image source={{ uri: item.image }} style={{ width: 70, height: 100 }} className="rounded-lg" />
      <View className="ml-4 flex-1 justify-center">
        <Text className="font-bold text-lg text-black">{item.title}</Text>
        <Text className="text-gray-700">by {item.author}</Text>
        <Text className="text-gray-600">Tags: {item.tags?.join(', ') || 'N/A'}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <Text className="text-2xl font-bold mb-4 text-black">All Books</Text>
      <TextInput
        value={search}
        onChangeText={handleSearch}
        placeholder="Search by tag (e.g. Fiction)"
        className="border border-gray-300 p-2 mb-4 rounded-lg"
      />
      <FlatList
        data={filteredBooks}
        renderItem={renderBook}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
};

export default ViewAllBooks;
