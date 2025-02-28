import React, { useState } from 'react'
import { View, Text, Button, FlatList, Alert } from 'react-native'

const Library = () => {
    const [books, setBooks] = useState([
        { id: 1, title: 'Book 1', author: 'Author A' },
        { id: 2, title: 'Book 2', author: 'Author B' },
        { id: 3, title: 'Book 3', author: 'Author C' },
    ])

    const borrowBook = (book: any) => {
        Alert.alert('Success', `You borrowed ${book.title}`)
    }

    return (
        <View className="flex-1 p-4">
            <Text className="text-2xl font-bold mb-4">Library</Text>
            <FlatList
                data={books}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View className="flex-row justify-between mb-4">
                        <Text className="text-lg">{item.title} by {item.author}</Text>
                        <Button title="Borrow" onPress={() => borrowBook(item)} />
                    </View>
                )}
            />
        </View>
    )
}

export default Library
