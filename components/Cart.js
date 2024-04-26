import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, Image, StyleSheet } from "react-native";
import axios from "axios";
import { useUserIdDecoder } from "./UserIdDecoder";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const userId = useUserIdDecoder();
    const [from,setFrom] = useState('Sakarya');
    const [to,setTo] = useState('İstanbul');

    
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
            // console.log(item.productId.producerId); // Üretici ID'lerini konsola yazdır
           
        });
    };

    const handleOrder = async () => {
        try {
            const groupedProducts = {};
            const orderIds = [];
    
            // Sepetteki her ürün için
            for (const cartItem of cartItems) {
                const productId = cartItem.productId._id;
                const producerId = cartItem.productId.producerId;
    
                // Üretici bazında ürünleri grupla
                if (!groupedProducts[producerId]) {
                    // Üretici ID'si henüz gruplanmamışsa, yeni bir grup oluştur
                    groupedProducts[producerId] = [];
                }
    
                // Ürünü ilgili üretici grubuna ekle
                groupedProducts[producerId].push({
                    productId: productId,
                    quantity: cartItem.quantity, // Dropdown'dan alınan sipariş miktarını kullan
                    price: cartItem.productId.price,
                });
    
                // Ürün miktarını azalt
                await decreaseProductQuantity(productId, cartItem.quantity);
            }
    
            // Her bir üretici için ayrı sipariş oluştur
            for (const producerId of Object.keys(groupedProducts)) {
                const products = groupedProducts[producerId];
                const totalPrice = products.reduce((total, item) => total + (item.price * item.quantity), 0);
    
                // Sipariş veri modeli
                const orderData = {
                    userId: userId,
                    producerId: producerId,
                    products: products,
                    totalPrice: totalPrice,
                    from: from,
                    to: to
                };
    
                // Sipariş oluştur
                const response = await axios.post('http://localhost:8000/orders/create', orderData);
                console.log('Order placed successfully for producer', producerId, ':', response.data);
                orderIds.push({ orderId: response.data._id });
            }
    
            // SingleOrder oluşturma ve her bir orderId'yi ekleyerek kaydetme
            console.log(orderIds)
            await handleSingleOrder(orderIds);
    
            // İşlem tamamlandıktan sonra uygun bir şekilde yönlendirme veya bildirim yapılabilir
            await axios.delete(`http://localhost:8000/cart/${userId}`);
            setCartItems([]);
        } catch (error) {
            console.error('Error placing order:', error);
        }
    };
    

    // Ürün miktarını azaltan yardımcı fonksiyon
    const decreaseProductQuantity = async (productId, quantityToDecrease) => {
        try {
            // Ürün miktarını azaltmak için istek gönder
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
            // Tüm ürünleri ve toplam fiyatı içeren bir liste oluştur
            const products = cartItems.map(item => ({
                productId: item.productId._id,
                quantity: item.quantity,
                price: item.productId.price // Ürün fiyatını cartItems içinden alıyoruz
            }));
    
            const totalPrice = cartItems.reduce((total, item) => total + (item.productId.price * item.quantity), 0);

            // Sipariş veri modeli
            const orderData = {
                userId: userId,
                producerId: cartItems[0].productId.producerId, // İlk ürünün üreticisinin ID'si
                orderIds: orderIds,
                products: products,
                totalPrice: totalPrice, // Sepetin toplam fiyatını hesapla
                from: from,
                to: to
            };
        
            // Sipariş oluştur
            const response = await axios.post('http://localhost:8000/singleOrders/create', orderData);
            console.log('singleOrder placed successfully:', response.data);
        } catch (error) {
            console.error('Error placing singleOrder:', error);
        }
    };

    cartItems.length > 0 && cartItems.map((cartItem, index) => {
        return (
            <View key={index}>
                <Text>Ürün Adı: {cartItem.productId.name}</Text>
                <Text>Miktar: {cartItem.quantity}</Text>
                {/* Diğer ürün bilgilerini buraya ekleyebilirsiniz */}
            </View>
        );
    })

    const handleDeleteCartItem = async (productId) => {
        try {
            const existingCartItem = cartItems.find(item => item.productId._id === productId);
            console.log("Existing Cart Item : "+existingCartItem.productId._id)
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
    const uniqueProductsInCart = [...new Set(cartItems.map(item => item.productId._id))];
    const totalUniqueProductsInCart = uniqueProductsInCart.length;
    
    return (
        <View>
            <Text style={{ margin:'3%' ,textAlign: 'center', fontWeight: 800, fontSize: 30, fontStyle: 'normal' }}>Sepet ({totalUniqueProductsInCart})</Text>
            <View>
                {cartItems.length > 0 ? (
                    cartItems.map((cartItem, index) => (
                        <View style={{flexDirection:'row', borderWidth:1, borderRadius:20, marginHorizontal:'3%', marginVertical:'2%',backgroundColor:'#f9fbe5'}}>
                             <View style={{borderWidth:1, borderRadius:15, backgroundColor:'white', padding:5, margin: 5}}>
                            <Image source={{ uri: cartItem.productId.images[0] }} style={styles.productImage} />
                        </View>
                        <View key={index} style={{ margin: '3%' ,flex:0.90, padding:9}}>
               
                            <Text style={{ fontWeight: 'bold', fontSize:22 }}>{cartItem.productId.name}</Text>
                            <Text style={{  fontSize:18 }}>Miktar: {cartItem.quantity} {cartItem.quantityFormat}</Text>
                            {/* Her bir cartItem içindeki ürünleri döngü kullanarak listeleyin */}
                            {cartItem.products && cartItem.products.map((product, productIndex) => (
                                <View key={productIndex} >

                                    <Text>Ürün Adı: {product.name}</Text>
                                    
                                    {/* Diğer ürün bilgilerini buraya ekleyin */}
                                </View>
                            ))}
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
 })

export default Cart;
