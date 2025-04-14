import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { NewsItem } from '@/types/news';

interface NewsFormData {
    title: string;
    content: string;
    image?: string;
    isBanner?: boolean;
}

export default function NewsScreen() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState('');
    const [isBanner, setIsBanner] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const { getAuthHeader } = useAuthStore();

    const fetchNews = async () => {
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/news`);
            const data = await response.json() as NewsItem[];
            setNews(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch news');
        }
    };

    const handleSubmit = async () => {
        if (!title || !content) {
            Alert.alert('Error', 'Title and content are required');
            return;
        }

        const newsData: NewsFormData = {
            title,
            content,
            isBanner,
            ...(image && { image })
        };

        try {
            const method = editingId ? 'PUT' : 'POST';
            const url = `${process.env.EXPO_PUBLIC_API_URL}/news${editingId ? `/${editingId}` : ''}`;
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify(newsData)
            });

            if (!response.ok) {
                throw new Error('Failed to save news');
            }

            setTitle('');
            setContent('');
            setImage('');
            setIsBanner(false);
            setEditingId(null);
            fetchNews();
            Alert.alert('Success', `News ${editingId ? 'updated' : 'created'} successfully`);
        } catch (error) {
            Alert.alert('Error', (error as Error).message);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/news/${id}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            });

            if (!response.ok) {
                throw new Error('Failed to delete news');
            }

            fetchNews();
            Alert.alert('Success', 'News deleted successfully');
        } catch (error) {
            Alert.alert('Error', (error as Error).message);
        }
    };

    const handleEdit = (item: NewsItem) => {
        setTitle(item.title);
        setContent(item.content);
        setImage(item.image || '');
        setIsBanner(item.isBanner || false);
        setEditingId(item._id);
    };

    useEffect(() => {
        fetchNews();
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="p-4">
                <Text className="text-xl font-bold mb-4">Manage News</Text>
                <TextInput
                    className="border p-2 mb-2 rounded"
                    placeholder="Title"
                    value={title}
                    onChangeText={setTitle}
                />
                <TextInput
                    className="border p-2 mb-2 rounded"
                    placeholder="Content"
                    value={content}
                    onChangeText={setContent}
                    multiline
                />
                <TextInput
                    className="border p-2 mb-2 rounded"
                    placeholder="Image URL"
                    value={image}
                    onChangeText={setImage}
                />
                <View className="flex-row items-center mb-4">
                    <Text className="mr-2">Is Banner:</Text>
                    <TouchableOpacity
                        onPress={() => setIsBanner(!isBanner)}
                        className={`p-2 rounded ${isBanner ? 'bg-green-800' : 'bg-gray-300'}`}
                    >
                        <Text className="text-white">{isBanner ? 'Yes' : 'No'}</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    onPress={handleSubmit}
                    className="bg-green-800 p-3 rounded"
                >
                    <Text className="text-white text-center">
                        {editingId ? 'Update' : 'Add'} News
                    </Text>
                </TouchableOpacity>

                <FlatList
                    data={news}
                    className="mt-4"
                    keyExtractor={item => item._id}
                    renderItem={({ item }) => (
                        <View className="border p-3 mb-2 rounded flex-row justify-between items-center">
                            <View className="flex-1">
                                <Text className="font-bold">{item.title}</Text>
                                <Text numberOfLines={2}>{item.content}</Text>
                            </View>
                            <View className="flex-row">
                                <TouchableOpacity
                                    onPress={() => handleEdit(item)}
                                    className="mr-2"
                                >
                                    <Ionicons name="pencil" size={24} color="green" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleDelete(item._id)}
                                >
                                    <Ionicons name="trash" size={24} color="red" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            </View>
        </SafeAreaView>
    );
}
