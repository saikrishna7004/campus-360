import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, SafeAreaView, Alert } from 'react-native';
import BottomSheet, { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import axios from 'axios';
import useAuthStore from '../../store/authStore';

const Office = () => {
    const { getAuthHeader } = useAuthStore();

    interface Task {
        id: number;
        title: string;
        type: string;
        description?: string;
    }

    interface PreviousRequest {
        _id: string;
        type: string;
        reason: string;
        status: string;
        description?: string;
    }

    const [tasks, setTasks] = useState<Task[]>([
        { id: 1, title: 'Bonafide', type: 'bonafide', description: 'Request for a bonafide certificate' },
        { id: 2, title: 'Leave Application', type: 'leave', description: 'Request for leave' },
        { id: 3, title: 'Bus Pass Approval', type: 'bus-pass', description: 'Request for bus pass approval' },
        { id: 4, title: 'TS E-pass', type: 'ts-epass', description: 'Request for TS E-pass' },
        { id: 5, title: 'Other', type: 'other', description: 'Request for other services' },
    ]);

    const [previousRequests, setPreviousRequests] = useState<PreviousRequest[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [reason, setReason] = useState('');

    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['50%', '75%'], []);

    useEffect(() => {
        const fetchRequests = async () => {
            const response = await axios.get('/api/office/user', { headers: getAuthHeader() });
            setPreviousRequests(response.data);
        };
        fetchRequests();
    }, []);

    const handleSendReason = async () => {
        if (reason.trim() && selectedTask) {
            try {
                await axios.post(process.env.EXPO_PUBLIC_API_URL + '/office/create', {
                    type: selectedTask.type,
                    reason,
                }, { headers: getAuthHeader() });
                setReason('');
                setSelectedTask(null);
                bottomSheetRef.current?.close();
                Alert.alert('Success', 'Request Submitted Successfully');
                const response = await axios.get(process.env.EXPO_PUBLIC_API_URL + '/office/user', { headers: getAuthHeader() });
                setPreviousRequests(response.data);
            } catch (error) {
                console.log('Error submitting request:', error);
                Alert.alert('Error', 'Failed to submit the request. Please try again.');
            }
        } else {
            Alert.alert('Error', 'Please provide a reason before submitting.');
        }
    };

    return (
        <SafeAreaView className="flex-1">
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Text className="text-2xl font-bold mb-5">Previous Requests</Text>
                {previousRequests.map((item) => (
                    <View key={item._id} className="mb-5">
                        <View className="flex flex-row justify-between items-center bg-white shadow-md rounded-lg p-4">
                            <View className="flex-1">
                                <Text className="text-xl font-bold text-left capitalize">{item.type}</Text>
                                <Text className="text-left">Reason: {item.reason}</Text>
                                {item.description && <Text className="text-left text-gray-500">{item.description}</Text>}

                            </View>
                            <View className="flex-1 items-end">
                                <Text className={`text-lg font-bold ${item.status === 'approved' ? 'text-green-600' : item.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>
                                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                </Text>
                            </View>
                        </View>
                    </View>
                ))}
                <Text className="text-2xl font-bold my-5">Your Requests</Text>
                {tasks.map((item) => (
                    <View key={item.id} className="mb-5">
                        <View className="flex flex-row justify-between items-center bg-white shadow-md rounded-lg p-4">
                            <View className="">
                                <Text className="text-xl font-bold text-left">{item.title}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    setSelectedTask(item);
                                    bottomSheetRef.current?.expand();
                                }}
                                className="ml-4 bg-green-800 px-6 py-2 rounded-lg"
                            >
                                <Text className="text-white">Request</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>

            <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints} enablePanDownToClose index={-1} onClose={() => setSelectedTask(null)} backdropComponent={({ style }) => (
                selectedTask && <View style={[style, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]} />
            )}>
                <BottomSheetView className="p-5">
                    <Text className="text-xl font-bold mb-3">{selectedTask?.title}</Text>
                    <Text className="text-gray-600 mb-3">{selectedTask?.description}</Text>
                    <Text className="text-xl font-bold mb-3">Provide a Reason</Text>
                    <View className="flex mb-5">
                        <TextInput
                            value={reason}
                            onChangeText={setReason}
                            placeholder="Enter your reason here..."
                            className="h-10 border border-gray-300 rounded-lg pl-3 mb-3"
                        />
                        <Text className="text-gray-600 mb-5">Students are required to meet the office staff in person in the next working day for recieving Bonafide or any other document after applying.</Text>
                        <TouchableOpacity onPress={handleSendReason} className="bg-green-700 px-4 py-2 rounded-lg w-32">
                            <Text className="text-white font-bold text-center">Place Request</Text>
                        </TouchableOpacity>
                    </View>
                </BottomSheetView>
            </BottomSheet>
        </SafeAreaView>
    );
};

export default Office;
