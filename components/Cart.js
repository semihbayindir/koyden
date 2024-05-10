import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, Image, StyleSheet } from "react-native";
import axios from "axios";
import { useUserIdDecoder } from "./UserIdDecoder";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const userId = useUserIdDecoder();
    const [quantities, setQuantities] = useState({});
    const [producerCity, setProducerCity] = useState('');
    const [userCity, setUserCity] = useState('');

    useEffect(() => {
        if (userId) {
            const fetchCartItems = async () => {
                try {
                    const response = await axios.get(`http://localhost:8000/cart/${userId}`);
                    if (response.data && response.data.products) {
                        const groupedCartItems = groupCartItems(response.data.products);
                        setCartItems(groupedCartItems);
                        initializeQuantities(groupedCartItems);
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
            const producerCities = {}; // Her bir üreticinin şehir bilgisini depolamak için bir nesne oluşturun
    
            for (const cartItem of cartItems) {
                const productId = cartItem.productId._id;
                const producerId = cartItem.productId.producerId;
    
                if (!groupedProducts[producerId]) {
                    groupedProducts[producerId] = [];
                }
    
                groupedProducts[producerId].push({
                    productId: productId,
                    quantity: quantities[productId],
                    price: cartItem.productId.price,
                });
    
                await decreaseProductQuantity(productId, quantities[productId]);
            }
    
            // Her bir üretici için ayrı ayrı işlem yapın
            for (const producerId of Object.keys(groupedProducts)) {
                const products = groupedProducts[producerId];
                const totalPrice = products.reduce((total, item) => total + (item.price * item.quantity), 0);
    
                // Üretici şehir bilgisini önce kontrol edin, daha önce alınmışsa tekrar sormayın
                const producerCity = producerCities[producerId] || await fetchProducerCity(producerId);
                producerCities[producerId] = producerCity;

                const orderData = {
                    userId: userId,
                    producerId: producerId,
                    products: products,
                    totalPrice: totalPrice,
                    from: producerCity,
                    to: userCity,
                };
    
                const response = await axios.post('http://localhost:8000/orders/create', orderData);
                console.log('Order placed successfully for producer', producerId, ':', response.data);
                orderIds.push({ orderId: response.data._id });
            }
    
            await handleSingleOrder(orderIds);
    
            await axios.delete(`http://localhost:8000/cart/${userId}`);
            setCartItems([]);
        } catch (error) {
            console.error('Error placing order:', error);
        }
    };
    
    
    const decreaseProductQuantity = async (productId, quantityToDecrease) => {
        try {
            const response = await axios.put(`http://localhost:8000/products/${productId}/decreaseQuantity`, {
                quantityToDecrease: quantityToDecrease
            });
            console.log('Product quantity decreased successfully:', response.data);
        } catch (error) {
            console.error('Error decreasing product quantity:', error);
        }
    };

    const handleSingleOrder = async (orderIds) => {
        try {
            const products = cartItems.map(item => ({
                productId: item.productId._id,
                quantity: quantities[item.productId._id],
                price: item.productId.price
            }));
    
            const totalPrice = cartItems.reduce((total, item) => total + (item.productId.price * quantities[item.productId._id]), 0);

            const orderData = {
                userId: userId,
                producerId: cartItems[0].productId.producerId,
                orderIds: orderIds,
                products: products,
                totalPrice: totalPrice,
                from: producerCity,
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
            const existingCartItem = cartItems.find(item => item.productId._id === productId);
            if (!existingCartItem) {
                console.error('Error deleting product: Product not found in cart');
                return;
            }
         
            const response = await axios.delete(`http://localhost:8000/cart/${userId}/product/${productId}`);
            console.log('Product deleted successfully:', response.data);
    
            const updatedCartItems = cartItems.filter(item => item.productId._id !== productId);
            setCartItems(updatedCartItems);
    
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.error('Error deleting product: Product not found in cart');
            } else {
                console.error('Error deleting product:', error);
            }
        }
    };
    
    const fetchProducerCity = async (producerId) => {
        try {
            const response = await axios.get(`http://localhost:8000/producer/${producerId}`);
            const producerCity = response.data.producer.verification.producerAddress.city;
            setProducerCity(producerCity);
            return producerCity;
        } catch (error) {
            console.error('Error fetching producer city:', error);
            throw error; // Hata olduğunda dışarıya fırlatın
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
        if (cartItems.length > 0) {
            const producerId = cartItems[0].productId.producerId;
            fetchProducerCity(producerId);
           
            fetchUserCity();
        }
    }, [cartItems]);

    const uniqueProductsInCart = [...new Set(cartItems.map(item => item.productId._id))];
    const totalUniqueProductsInCart = uniqueProductsInCart.length;
    
    return (
        <View>
            <Text style={{ margin:'3%' ,textAlign: 'center', fontWeight: 800, fontSize: 30, fontStyle: 'normal' }}>Sepet ({totalUniqueProductsInCart})</Text>
            <View>
                {cartItems.length > 0 ? (
                    cartItems.map((cartItem, index) => (
                        <View style={{flexDirection:'row', borderWidth:1, borderRadius:20, marginHorizontal:'3%', marginVertical:'2%',backgroundColor:'#f9fbe5'}} key={index}>
                            <View style={{borderWidth:1, borderRadius:15, backgroundColor:'white', padding:5, margin: 5}}>
                                <Image source={{ uri: cartItem.productId.images[0] }} style={styles.productImage} />
                            </View>
                            <View style={{ margin: '3%' ,flex:0.90, padding:5}}>
                                <Text style={{ fontWeight: 'bold', fontSize:22 }}>{cartItem.productId.name}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <TouchableOpacity onPress={() => handleQuantityChange(cartItem.productId._id, -1)} style={{ padding: 5 }}>
                                        <MaterialCommunityIcons name="minus-circle-outline" size={25} />
                                    </TouchableOpacity>
                                    <Text style={{  fontSize:20 }}>{quantities[cartItem.productId._id]} {cartItem.qtyFormat}</Text>
                                    <TouchableOpacity onPress={() => handleQuantityChange(cartItem.productId._id, 1)} style={{ padding: 5 }}>
                                        <MaterialCommunityIcons name="plus-circle-outline" size={25} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{flex:0.25,margin: '8%'}}>
                                <TouchableOpacity onPress={() => handleDeleteCartItem(cartItem.productId._id)}>
                                    <MaterialCommunityIcons name='delete' size={30} color={'red'}/>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={{ textAlign: 'center', fontSize:20, marginBottom:20 }}>Sepetiniz Boş</Text>
                )}
            </View>
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
        borderRadius:5,
        alignSelf:'center',
      },
 });

export default Cart;
