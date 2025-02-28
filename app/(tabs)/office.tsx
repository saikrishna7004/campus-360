import React, { useState } from 'react'
import { View, Text, Button, FlatList, Alert } from 'react-native'

const Office = () => {
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Task 1', description: 'Complete office setup' },
        { id: 2, title: 'Task 2', description: 'Attend meeting' },
        { id: 3, title: 'Task 3', description: 'Prepare presentation' },
    ])

    const completeTask = (task: any) => {
        Alert.alert('Task Completed', `${task.title} has been completed!`)
    }

    return (
        <View className="flex-1 p-4">
            <Text className="text-2xl font-bold mb-4">Office Tasks</Text>
            <FlatList
                data={tasks}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View className="flex-row justify-between mb-4">
                        <Text className="text-lg">{item.title}</Text>
                        <Button title="Complete" onPress={() => completeTask(item)} />
                    </View>
                )}
            />
        </View>
    )
}

export default Office
