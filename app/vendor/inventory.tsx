import React, { useState, useEffect } from 'react';
import { 
    View, Text, FlatList, ActivityIndicator, RefreshControl,
    TouchableOpacity, TextInput, StyleSheet, Alert, Modal, Image
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import useAuthStore from '@/store/authStore';

interface Product {
    _id: string;
    name: string;
    price: number;
    description: string;
    category: string;
    imageUrl: string;
    inStock: boolean;
    type: string;
}

export default function VendorInventory() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
    
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [image, setImage] = useState<string | null>(null);
    
    const { user } = useAuthStore();
    
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/product/${user?.type}`);
            setProducts(response.data);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            Alert.alert("Error", "Failed to load inventory. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchProducts();
    }, []);
    
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchProducts();
        setRefreshing(false);
    };
    
    const toggleInStock = async (id: string) => {
        try {
            const product = products.find(item => item._id === id);
            if (!product) return;
            
            setProducts((prevItems) =>
                prevItems.map((item) =>
                    item._id === id ? { ...item, inStock: !item.inStock } : item
                )
            );
            
            await axios.patch(`${process.env.EXPO_PUBLIC_API_URL}/product/${id}`, { 
                inStock: !product.inStock 
            });
        } catch (error) {
            Alert.alert("Error", "Failed to update product status");
            setProducts((prevItems) =>
                prevItems.map((item) =>
                    item._id === id ? { ...item, inStock: !item.inStock } : item
                )
            );
        }
    };
    
    const openAddEditModal = (product: Product | null = null) => {
        if (product) {
            setIsEditing(true);
            setCurrentProduct(product);
            setName(product.name);
            setPrice(product.price.toString());
            setDescription(product.description);
            setCategory(product.category);
            setImage(product.imageUrl);
        } else {
            setIsEditing(false);
            setCurrentProduct(null);
            setName('');
            setPrice('');
            setDescription('');
            setCategory('');
            setImage(null);
        }
        setModalVisible(true);
    };
    
    const handleImagePick = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (permissionResult.granted === false) {
            Alert.alert("Permission Required", "We need access to your photos to add product images.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled) {
            setImage(`data:image/jpg;base64,${result.assets[0].base64}`);
        }
    };
    
    const handleSaveProduct = async () => {
        if (!name || !price || !category) {
            Alert.alert("Missing Fields", "Please fill all required fields.");
            return;
        }
        
        try {
            const productData = {
                name,
                price: parseFloat(price),
                description,
                category,
                imageUrl: image,
                type: user?.type,
                inStock: true
            };
            
            if (isEditing && currentProduct) {
                await axios.put(`${process.env.EXPO_PUBLIC_API_URL}/product/${currentProduct._id}`, productData);
                setProducts(products.map(p => 
                    p._id === currentProduct._id ? { 
                        ...p, 
                        ...productData, 
                        imageUrl: productData.imageUrl || '', 
                        _id: p._id, 
                        type: productData.type || '' 
                    } : p
                ));
            } else {
                const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/product`, productData);
                setProducts([response.data, ...products]);
            }
            
            setModalVisible(false);
        } catch (error) {
            console.error("Failed to save product:", error);
            Alert.alert("Error", "Failed to save product. Please try again.");
        }
    };
    
    const handleDeleteProduct = async (id: string) => {
        Alert.alert(
            "Delete Product",
            "Are you sure you want to delete this product?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await axios.delete(`${process.env.EXPO_PUBLIC_API_URL}/product/${id}`);
                            setProducts(products.filter(p => p._id !== id));
                        } catch (error) {
                            console.error("Failed to delete product:", error);
                            Alert.alert("Error", "Failed to delete product. Please try again.");
                        }
                    }
                }
            ]
        );
    };
    
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const renderItem = ({ item }: { item: Product }) => (
        <View style={styles.productCard}>
            {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
            ) : (
                <View style={styles.noImageContainer}>
                    <FontAwesome name="image" size={32} color="#aaa" />
                </View>
            )}
            <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>₹{item.price.toFixed(2)}</Text>
                <Text style={styles.productCategory}>{item.category}</Text>
            </View>
            <View style={styles.productActions}>
                <TouchableOpacity 
                    style={[styles.stockButton, item.inStock ? styles.inStockButton : styles.outOfStockButton]}
                    onPress={() => toggleInStock(item._id)}
                >
                    <Text style={styles.stockButtonText}>{item.inStock ? 'In Stock' : 'Out of Stock'}</Text>
                </TouchableOpacity>
                <View style={styles.editDeleteButtons}>
                    <TouchableOpacity 
                        style={styles.editButton}
                        onPress={() => openAddEditModal(item)}
                    >
                        <FontAwesome name="edit" size={18} color="#2196F3" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => handleDeleteProduct(item._id)}
                    >
                        <FontAwesome name="trash" size={18} color="#F44336" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
    
    const EmptyList = () => (
        <View style={styles.emptyContainer}>
            <FontAwesome name="dropbox" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No products found</Text>
            <Text style={styles.emptySubText}>
                {searchQuery ? 'Try a different search term' : 'Add products to your inventory'}
            </Text>
        </View>
    );
    
    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search products..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => openAddEditModal()}
                >
                    <FontAwesome name="plus" size={18} color="#fff" />
                    <Text style={styles.addButtonText}>Add Product</Text>
                </TouchableOpacity>
            </View>
            
            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4A9D5B" />
                </View>
            ) : (
                <FlatList
                    data={filteredProducts}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl 
                            refreshing={refreshing} 
                            onRefresh={onRefresh} 
                            colors={["#4A9D5B"]}
                        />
                    }
                    ListEmptyComponent={<EmptyList />}
                />
            )}
            
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {isEditing ? 'Edit Product' : 'Add New Product'}
                        </Text>
                        
                        <TouchableOpacity 
                            style={styles.imagePickerButton}
                            onPress={handleImagePick}
                        >
                            {image ? (
                                <Image source={{ uri: image }} style={styles.pickedImage} />
                            ) : (
                                <>
                                    <FontAwesome name="camera" size={36} color="#aaa" />
                                    <Text style={styles.imagePickerText}>Add Product Image</Text>
                                </>
                            )}
                        </TouchableOpacity>
                        
                        <TextInput
                            style={styles.input}
                            placeholder="Product Name *"
                            value={name}
                            onChangeText={setName}
                        />
                        
                        <TextInput
                            style={styles.input}
                            placeholder="Price *"
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                        />
                        
                        <TextInput
                            style={[styles.input, styles.descriptionInput]}
                            placeholder="Description"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                        />
                        
                        <TextInput
                            style={styles.input}
                            placeholder="Category *"
                            value={category}
                            onChangeText={setCategory}
                        />
                        
                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={styles.cancelButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.saveButton}
                                onPress={handleSaveProduct}
                            >
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    searchContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        marginRight: 10,
        backgroundColor: '#f9f9f9',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4A9D5B',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600',
        marginLeft: 8,
    },
    list: {
        padding: 16,
    },
    productCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    productImage: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginBottom: 12,
    },
    noImageContainer: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    productInfo: {
        marginBottom: 12,
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 16,
        color: '#4A9D5B',
        fontWeight: '600',
        marginBottom: 4,
    },
    productCategory: {
        fontSize: 14,
        color: '#666',
    },
    productActions: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 12,
    },
    stockButton: {
        padding: 8,
        borderRadius: 6,
        alignItems: 'center',
        marginBottom: 8,
    },
    inStockButton: {
        backgroundColor: '#E8F5E9',
    },
    outOfStockButton: {
        backgroundColor: '#FFEBEE',
    },
    stockButtonText: {
        fontWeight: '600',
        color: '#333',
    },
    editDeleteButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    editButton: {
        padding: 10,
        marginRight: 10,
    },
    deleteButton: {
        padding: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#555',
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 14,
        color: '#888',
        marginTop: 8,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        width: '90%',
        maxHeight: '90%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    imagePickerButton: {
        height: 150,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
    },
    imagePickerText: {
        marginTop: 8,
        color: '#555',
    },
    pickedImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    descriptionInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancelButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        marginRight: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#555',
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        backgroundColor: '#4A9D5B',
        marginLeft: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '600',
    }
});
