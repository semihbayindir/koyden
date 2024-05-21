import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, Image, StyleSheet } from "react-native";
import axios from "axios";
import { useUserIdDecoder } from "./UserIdDecoder";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Cart = () => {
    const [cartItems, setCartItems] = useState({});
    const userId = useUserIdDecoder();
    const [quantities, setQuantities] = useState({});
    const [userCity, setUserCity] = useState(null);
    const [transportFee, setTransportFee] = useState(null);

    const GOOGLE_API_KEY = "AIzaSyD1-czL9crUVUOlVOa4z5-iDKAKgdUMegs";

    const calculateTransportFeeForProducers = async (groupedCartItemsByProducer) => {
        try {
            let totalTransportFee = 0;
            for (const producerId in groupedCartItemsByProducer) {
                const cartItemsForProducer = groupedCartItemsByProducer[producerId];
                if (userCity) {
                    const userCoordinates = await getCoordinatesFromAddress(userCity);
                    const producerCity = await fetchProducerCity(producerId);
                    const producerCoordinates = await getCoordinatesFromAddress(producerCity);

                    const itemTransportFee = calculateTransportFee(userCoordinates, producerCoordinates, cartItemsForProducer);
                    totalTransportFee += itemTransportFee;
                } else {
                    // console.error('User city is missing.');
                }
            }
            setTransportFee(totalTransportFee);
        } catch (error) {
            console.error('Error calculating transport fee:', error);
        }
    };

    useEffect(() => {
        if (userId) {
            const fetchCartItems = async () => {
                try {
                    const response = await axios.get(`http://localhost:8000/cart/${userId}`);
                    if (response.data && response.data.products) {
                        const groupedCartItems = groupCartItemsByProducer(response.data.products);
                        setCartItems(groupedCartItems);
                        initializeQuantities(response.data.products);
                        calculateTransportFeeForProducers(groupedCartItems);
                    } else {
                        setCartItems({});
                    }
                } catch (error) {
                    console.error('Error fetching cart items:', error);
                }
            };
            fetchCartItems();
        }
    }, [userId, userCity]);

    const groupCartItemsByProducer = (items) => {
        const groupedItems = {};
        items.forEach((item) => {
            const producerId = item.productId.producerId;
            if (!groupedItems[producerId]) {
                groupedItems[producerId] = [];
            }
            groupedItems[producerId].push(item);
        });
        return groupedItems;
    };

    const initializeQuantities = (items) => {
        const initialQuantities = {};
        items.forEach(item => {
            initialQuantities[item.productId._id] = item.quantity;
        });
        setQuantities(initialQuantities);
    };

    const handleOrder = async () => {
        try {
            const groupedProducts = {};
            const orderIds = [];
            for (const producerId in cartItems) {
                const products = cartItems[producerId];
                const totalPrice = products.reduce((total, item) => total + (item.productId.price * item.quantity), 0);
                const userCoordinates = await getCoordinatesFromAddress(userCity);
                const producerCity = await fetchProducerCity(producerId);
                const producerCoordinates = await getCoordinatesFromAddress(producerCity);
                const transportFee = calculateTransportFee(userCoordinates, producerCoordinates, products);

                const orderData = {
                    userId: userId,
                    producerId: producerId,
                    products: products.map(item => ({
                        productId: item.productId._id,
                        quantity: quantities[item.productId._id],
                        price: item.productId.price,
                    })),
                    totalPrice: totalPrice,
                    from: producerCity,
                    to: userCity,
                    transportFee: transportFee
                };

                const response = await axios.post('http://localhost:8000/orders/create', orderData);
                console.log('Order placed successfully for producer', producerId, ':', response.data);
                orderIds.push({ orderId: response.data._id });
            }
            await handleSingleOrder(orderIds);
            await axios.delete(`http://localhost:8000/cart/${userId}`);
            setCartItems({});
        } catch (error) {
            console.error('Error placing order:', error);
        }
    };

    const handleSingleOrder = async (orderIds) => {
        try {
            const products = Object.values(cartItems).flat().map(item => ({
                productId: item.productId._id,
                quantity: quantities[item.productId._id],
                price: item.productId.price
            }));
    
            const totalPrice = products.reduce((total, item) => total + (item.price * item.quantity), 0);
            const orderData = {
                userId: userId,
                producerId: Object.keys(cartItems)[0], // İlk üreticiyi kullanarak siparişi oluştur
                orderIds: orderIds,
                products: products,
                totalPrice: totalPrice,
                from: userCity,
                to: userCity
            };
        
            const response = await axios.post('http://localhost:8000/singleOrders/create', orderData);
            console.log('singleOrder placed successfully:', response.data);
        } catch (error) {
            console.error('Error placing singleOrder:', error);
        }
    };

    const handleQuantityChange = (productId, quantityChange) => {
        setQuantities(prevQuantities => ({
            ...prevQuantities,
            [productId]: prevQuantities[productId] + quantityChange
        }));
    };

    const handleDeleteCartItem = async (productId) => {
        try {
            const existingCartItem = Object.values(cartItems).flat().find(item => item.productId._id === productId);
            if (!existingCartItem) {
                console.error('Error deleting product: Product not found in cart');
                return;
            }
            await axios.delete(`http://localhost:8000/cart/${userId}/product/${productId}`);
            const updatedCartItems = Object.keys(cartItems).reduce((acc, producerId) => {
                const updatedItems = cartItems[producerId].filter(item => item.productId._id !== productId);
                if (updatedItems.length > 0) {
                    acc[producerId] = updatedItems;
                }
                return acc;
            }, {});
            setCartItems(updatedCartItems);
            calculateTransportFeeForProducers(updatedCartItems);
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const fetchProducerCity = async (producerId) => {
        try {
            const response = await axios.get(`http://localhost:8000/producer/${producerId}`);
            return response.data.producer.verification.producerAddress.city;
        } catch (error) {
            console.error('Error fetching producer city:', error);
            throw error;
        }
    };

    const fetchUserCity = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/users/${userId}/verification`);
            const userCity = response.data.producerAddress.city;
            setUserCity(userCity);
        } catch (error) {
            console.error('Error fetching user city:', error);
        }
    };

    useEffect(() => {
        if (Object.keys(cartItems).length > 0) {
            fetchUserCity();
        }
    }, [cartItems]);

    const uniqueProductsInCart = Object.values(cartItems).flat().map(item => item.productId._id);
    const totalUniqueProductsInCart = uniqueProductsInCart.length;

    async function getCoordinatesFromAddress(address) {
        try {
            const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
                params: {
                    address: address,
                    key: GOOGLE_API_KEY,
                },
            });
            if (response.data && response.data.results && response.data.results.length > 0) {
                const { lat, lng } = response.data.results[0].geometry.location;
                return { latitude: lat, longitude: lng };
            } else {
                throw new Error('No coordinates found for the address');
            }
        } catch (error) {
            console.error('Error fetching coordinates from address:', error);
            return null;
        }
    }

    function calculateTransportFee(userCoordinates, producerCoordinates, cartItems) {
        if (!Array.isArray(cartItems)) {
            cartItems = [cartItems];
        }
    
        let totalTransportFee = 0;
    
        for (const cartItem of cartItems) {
            const weight = cartItem.quantity;
            const price = cartItem.productId.price; // Her bir ürünün fiyatını burada alıyoruz
            const distance = Math.floor(calculateDistance(userCoordinates, producerCoordinates));
            const distanceInKm = distance / 1000;
            let itemTransportFee = 0;
    
            if (distanceInKm === 0) {
                itemTransportFee = Math.floor(weight * price / 10);
            }else if(distanceInKm > 300){
                const baseFee = (distanceInKm * weight * price) / 1000;
                itemTransportFee = Math.floor(baseFee);
            } 
            else {
                const baseFee = (distanceInKm * weight * price) / 1000;
                itemTransportFee = Math.floor(baseFee * 2);
            }
    
            totalTransportFee += itemTransportFee;
        }
    
        return totalTransportFee;
    }
    

    function calculateDistance(coord1, coord2) {
        const R = 6371e3;
        const lat1 = (coord1.latitude * Math.PI) / 180;
        const lat2 = (coord2.latitude * Math.PI) / 180;
        const deltaLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
        const deltaLng = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    }

    return (
        <View>
            <Text style={{ margin: '3%', textAlign: 'center', fontWeight: 'bold', fontSize: 30, fontStyle: 'normal' }}>Sepet ({totalUniqueProductsInCart})</Text>
            <View>
                {Object.values(cartItems).flat().length > 0 ? (
                    Object.values(cartItems).flat().map((cartItem, index) => (
                        <View style={{ flexDirection: 'row', borderRadius: 20, marginHorizontal: '3%', marginVertical: '2%', backgroundColor: '#f9fbe5' }} key={index}>
                            <View style={{borderWidth:1,borderColor:'lightgray', borderRadius: 15, backgroundColor: 'white', padding: 5, margin: 5 }}>
                                <Image source={{ uri: cartItem.productId.images[0] }} style={styles.productImage} />
                            </View>
                            <View style={{ margin: '3%', flex: 0.90, padding: 5 }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 22 }}>{cartItem.productId.name}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <TouchableOpacity onPress={() => handleQuantityChange(cartItem.productId._id, -1)} style={{ padding: 5 }}>
                                        <MaterialCommunityIcons name="minus-circle-outline" size={25} />
                                    </TouchableOpacity>
                                    <Text style={{ fontSize: 20 }}>{quantities[cartItem.productId._id]} {cartItem.qtyFormat}</Text>
                                    <TouchableOpacity onPress={() => handleQuantityChange(cartItem.productId._id, 1)} style={{ padding: 5 }}>
                                        <MaterialCommunityIcons name="plus-circle-outline" size={25} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{ flex: 0.25, margin: '8%' }}>
                                <TouchableOpacity onPress={() => handleDeleteCartItem(cartItem.productId._id)}>
                                    <MaterialCommunityIcons name='delete' size={30} color={'red'} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={{ textAlign: 'center', fontSize: 20, marginBottom: 20 }}>Sepetiniz Boş</Text>
                )}
            </View>
            {transportFee !== null && Object.values(cartItems).flat().length > 0 && (
                <Text style={{ margin: '3%', textAlign: 'center', fontWeight: 'bold', fontSize: 20 }}>
                    Toplam Taşıma Ücreti: {transportFee} TL
                </Text>
            )}
            <TouchableOpacity style={{ backgroundColor: '#729c44', padding: 10, marginHorizontal: 50, marginTop: 10, borderRadius: 5, alignContent: 'center' }} onPress={handleOrder}>
                <Text style={{ textAlign: 'center', color: 'white', fontSize: 22 }}>Sipariş Ver</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    productImage: {
        width: 70,
        height: 70,
        borderRadius: 5,
        alignSelf: 'center',
    },
});

export default Cart;