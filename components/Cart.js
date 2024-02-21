import React, { useState, useEffect } from "react";
import { Text, View, FlatList, Button } from "react-native";
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
                        logProducerIds(groupedCartItems); // Üretici ID'lerini konsola yazdır
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

    const logProducerIds = (items) => {
        items.forEach(item => {
            console.log(item.productId.producerId); // Üretici ID'lerini konsola yazdır
        });
    };

    const renderCartItem = ({ item }) => (
        <View style={{ borderBottomWidth: 1, padding: 10 }}>
            <Text>Ürün Adı: {item.productId.name}</Text>
            <Text>Miktar: {item.quantity}</Text>
            {/* Diğer ürün bilgilerini buraya ekleyebilirsiniz */}
        </View>
    );
    const handleOrder = async () => {
        try {
            // Tüm ürünleri ve toplam fiyatı içeren bir liste oluştur
            const products = cartItems.map(item => ({
                productId: item.productId._id,
                quantity: item.quantity,
                price: item.productId.price // Ürün fiyatını cartItems içinden alıyoruz
            }));
    
            // Sipariş veri modeli
            const orderData = {
                userId: userId,
                producerId: cartItems[0].productId.producerId, // İlk ürünün üreticisinin ID'si
                products: products,
                totalPrice: 1 // Sepetin toplam fiyatını hesapla
            };
        
            // Sipariş oluştur
            const response = await axios.post('http://localhost:8000/orders/create', orderData);
            console.log('Order placed successfully:', response.data);
            // İşlem tamamlandıktan sonra uygun bir şekilde yönlendirme veya bildirim yapılabilir
        } catch (error) {
            console.error('Error placing order:', error);
        }
    };
    
    

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
                                <Button title="Sipariş Ver" onPress={handleOrder} />

        </View>
    );
};

export default Cart;
