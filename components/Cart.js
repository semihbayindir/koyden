import React, { useState, useEffect } from "react";
import { Text, View, FlatList } from "react-native";
import axios from "axios";
import { useUserIdDecoder } from "./UserIdDecoder";

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const userId = useUserIdDecoder();

    useEffect(() => {
        if (userId) {
            const fetchCartItems = async () => {
                try {
                    const response = await axios.get(`http://localhost:8000/cart/${userId}`);
                    if (response.data && response.data.products) {
                        const groupedCartItems = groupCartItems(response.data.products);
                        setCartItems(groupedCartItems);
                    } else {
                        setCartItems([]);
                    }
                } catch (error) {
                    console.error('Error fetching cart items:', error);
                }
            };
    
            fetchCartItems();
        }
    }, [userId]);
    

    const groupCartItems = (items) => {
        const groupedItems = {};
        items.forEach((item) => {
            if (groupedItems[item.productId._id]) {
                groupedItems[item.productId._id].quantity += item.quantity;
            } else {
                groupedItems[item.productId._id] = item;
            }
        });
        return Object.values(groupedItems);
    };

    const renderCartItem = ({ item }) => (
        <View style={{ borderBottomWidth: 1, padding: 10 }}>
            <Text>Ürün Adı: {item.productId.name}</Text>
            <Text>Miktar: {item.quantity}</Text>
            {/* Diğer ürün bilgilerini buraya ekleyebilirsiniz */}
        </View>
    );

    return (
        <View>
            <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }}>Sepet</Text>
            {cartItems.length === 0 ? (
                <Text style={{ textAlign: 'center' }}>Sepetiniz Boş</Text>
            ) : (
                <FlatList
                    data={cartItems}
                    renderItem={renderCartItem}
                    keyExtractor={(item, index) => index.toString()} // veya unique bir değeri kullanabilirsiniz
                />
            )}
        </View>
    );
};

export default Cart;
