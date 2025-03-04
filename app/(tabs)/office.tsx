import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput, ScrollView, SafeAreaView, Animated } from 'react-native';

const Office = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Task 1', description: 'Complete office setup' },
    { id: 2, title: 'Task 2', description: 'Attend meeting' },
    { id: 3, title: 'Task 3', description: 'Prepare presentation' },
    { id: 4, title: 'Task 4', description: 'Review documents' },
    { id: 5, title: 'Task 5', description: 'Organize workspace' },
  ]);

  const [previousRequests, setPreviousRequests] = useState([
    { id: 1, title: 'Previous Task 1', description: 'Finalize reports' },
    { id: 2, title: 'Previous Task 2', description: 'Update database' },
    { id: 3, title: 'Previous Task 3', description: 'Review code' },
    { id: 4, title: 'Previous Task 4', description: 'Team meeting' },
    { id: 5, title: 'Previous Task 5', description: 'Organize event' },
  ]);

  const [isExpanded, setIsExpanded] = useState(false);
  const [previousIsExpanded, setPreviousIsExpanded] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [reason, setReason] = useState('');

  const handleShowMore = () => {
    setIsExpanded(!isExpanded);
  };

  const handlePreviousShowMore = () => {
    setPreviousIsExpanded(!previousIsExpanded);
  };

  const handleSendReason = () => {
    if (reason.trim()) {
      Alert.alert('Reason Sent', `Your reason: "${reason}" for "${selectedTask?.title}" has been sent.`);
      setReason('');
    } else {
      Alert.alert('Error', 'Please provide a reason.');
    }
  };

  const handleCloseReasonInput = () => {
    setSelectedTask(null);
    setReason('');
  };

  const renderShowMoreButton = () => {
    if (tasks.length > 2) {
      return (
        <TouchableOpacity onPress={handleShowMore} className="items-center mt-2">
          <Text className="text-blue-500 text-lg">
            {isExpanded ? 'Show Less' : 'Show More'}
          </Text>
        </TouchableOpacity>
      );
    }
  };

  const renderPreviousShowMoreButton = () => {
    if (previousRequests.length > 2) {
      return (
        <TouchableOpacity onPress={handlePreviousShowMore} className="items-center mt-2">
          <Text className="text-blue-500 text-lg">
            {previousIsExpanded ? 'Show Less' : 'Show More'}
          </Text>
        </TouchableOpacity>
      );
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text className="text-2xl font-bold mb-5">Previous Requests</Text>

        {previousIsExpanded
          ? previousRequests.map((item) => (
              <View key={item.id} className="mb-5">
                <View className="flex flex-row justify-between items-center bg-white shadow-md rounded-lg p-4">
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-left">{item.title}</Text>
                    <Text className="text-left">{item.description}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert('More Info', `Details for ${item.title}`);
                    }}
                    className="ml-4 bg-green-800 px-6 py-2 rounded-lg"
                  >
                    <Text className="text-white font-bold">More Info</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          : previousRequests.slice(0, 2).map((item) => (
              <View key={item.id} className="mb-5">
                <View className="flex flex-row justify-between items-center bg-white shadow-md rounded-lg p-4">
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-left">{item.title}</Text>
                    <Text className="text-left">{item.description}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert('More Info', `Details for ${item.title}`);
                    }}
                    className="ml-4 bg-green-800 px-6 py-2 rounded-lg"
                  >
                    <Text className="text-white font-bold">More Info</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

        {renderPreviousShowMoreButton()}

        <Text className="text-2xl font-bold my-5">Your Requests</Text>

        {isExpanded
          ? tasks.map((item) => (
              <View key={item.id} className="mb-5">
                <View className="flex flex-row justify-between items-center bg-white shadow-md rounded-lg p-4">
                  <View className="">
                    <Text className="text-xl font-bold text-left">{item.title}</Text>
                    <Text className="text-left">{item.description}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedTask(item);
                    }}
                    className="ml-4 bg-green-800 px-6 py-2 rounded-lg"
                  >
                    <Text className="text-white">Request</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          : tasks.slice(0, 2).map((item) => (
              <View key={item.id} className="mb-5">
                <View className="flex flex-row justify-between items-center bg-white shadow-md rounded-lg p-4">
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-left">{item.title}</Text>
                    <Text className="text-left">{item.description}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedTask(item);
                    }}
                    className="ml-4 bg-green-800 px-6 py-2 rounded-lg"
                  >
                    <Text className="text-white">Request</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

        {renderShowMoreButton()}

        {selectedTask && (
          <View className="mt-5 p-5 bg-gray-200 rounded-lg">
            <TouchableOpacity
              onPress={handleCloseReasonInput}
              className="absolute top-2 right-2 bg-white p-2 rounded-full z-10"
            >
              <Text className="text-xl font-bold text-red-500">×</Text>
            </TouchableOpacity>

            <Text className="text-2xl font-bold mb-3">Provide a Reason for {selectedTask?.title}</Text>

            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="Enter your reason here..."
              className="h-10 border border-gray-300 rounded-lg pl-3 mb-5"
            />

            <TouchableOpacity onPress={handleSendReason} className="bg-blue-500 px-6 py-2 rounded-lg">
              <Text className="text-white font-bold">Send</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Office;
