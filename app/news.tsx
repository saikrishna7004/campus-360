import { View, Text, Image, ScrollView, Linking } from 'react-native';
import React, { useEffect, useState } from 'react';
import { NewsItem } from '@/types/news';
import { useSearchParams } from 'expo-router/build/hooks';


export default function NewsDetail() {
    const search = useSearchParams();
    const id = search.get('id');
    const [news, setNews] = useState<NewsItem | null>(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/news/${id}`);
                const data = await response.json();
                setNews(data);
            } catch (error) {
                console.error('Failed to fetch news:', error);
            }
        };
        fetchNews();
    }, [id]);

    if (!news) return null;

    const handleTextWithLinks = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);
        
        return parts.map((part, index) => {
            if (part.match(urlRegex)) {
                return (
                    <Text 
                        key={index}
                        className="text-blue-600"
                        onPress={() => Linking.openURL(part)}
                    >
                        {part}
                    </Text>
                );
            }
            return <Text key={index}>{part}</Text>;
        });
    };

    return (
        <ScrollView className="flex-1 bg-white">
            {news.image && (
                <Image 
                    source={{ uri: news.image }} 
                    style={{ width: '100%', height: 300 }}
                    resizeMode="cover"
                />
            )}
            <View className="p-4">
                <Text className="text-2xl font-bold mb-4">{news.title}</Text>
                <Text className="text-gray-500 mb-4">
                    {new Date(news.createdAt).toLocaleDateString()}
                </Text>
                <Text className="text-base leading-6 text-gray-800">
                    {handleTextWithLinks(news.content)}
                </Text>
            </View>
        </ScrollView>
    );
}
