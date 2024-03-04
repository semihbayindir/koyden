import React, { useState, useEffect } from "react";
import { Text, View, FlatList, Button, TouchableOpacity } from "react-native";
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
    



    // const handleDeleteCartItem = async (productId) => {
    //     try {
    //         // Ürünü sepetten silmeden önce, önce sepetin içinde olup olmadığını kontrol edin
    //         const existingCartItemIndex = cartItems.findIndex(item => item.productId._id === productId);
    //         if (existingCartItemIndex === -1) {
    //             console.error('Error deleting product: Product not found in cart');
    //             return; // Ürün sepet içinde bulunamadığı için işlemi durdur
    //         }
    
    //         // Ürünü sepetten silme isteği gönder
    //         const response = await axios.delete(`http://localhost:8000/cart/${userId}/product/${productId}`);
    //         console.log('Product deleted successfully:', response.data);
    
    //         // Sepet öğelerini yeniden yükleme veya güncelleme işlemi burada yapılabilir
    //     } catch (error) {
    //         if (error.response && error.response.status === 404) {
    //             console.error('Error deleting product: Product not found in cart');
    //         } else {
    //             console.error('Error deleting product:', error);
    //         }
    //     }
    // };




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
            <Text style={{fontSize:18}}>Ürün Adı: {item.productId.name}</Text>
            <Text style={{fontSize:18}}>Miktar: {item.quantity}</Text>
            {/* Diğer ürün bilgilerini buraya ekleyebilirsiniz */}
        </View>
    );
    const handleOrder = async () => {
        try {
            const orders = {}; // Her üretici için bir sipariş nesnesi oluşturmak için kullanılacak bir nesne
    
            // Sepetteki her ürün için döngü
            cartItems.forEach(item => {
                const producerId = item.productId.producerId;
    
                // Eğer bu üretici için bir sipariş nesnesi yoksa oluştur
                if (!orders[producerId]) {
                    orders[producerId] = {
                        userId: userId,
                        producerId: producerId,
                        products: [],
                        totalPrice: 0, // Başlangıçta toplam fiyatı sıfır olarak ayarla
                        from: from,
                        to: to
                    };
                }
    
                // Ürünü bu üreticiye ait siparişe ekle
                orders[producerId].products.push({
                    productId: item.productId._id,
                    quantity: item.quantity,
                    price: item.productId.price
                });
    
                // Toplam fiyata ürünün fiyatını ekle
                orders[producerId].totalPrice += item.quantity * item.productId.price;
            });
    
            // Oluşturulan siparişleri gönder
            for (const producerId in orders) {
                const orderData = orders[producerId];
                const response = await axios.post('http://localhost:8000/orders/create', orderData);
                console.log('Order placed successfully:', response.data);
            }
            handleSingleOrder();
            // Sepeti temizle
            await axios.delete(`http://localhost:8000/cart/${userId}`);
            setCartItems([]);
        } catch (error) {
            console.error('Error placing order:', error);
        }
    };

    const handleSingleOrder = async () => {
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
    
    return (
        <View>
            <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }}>Sepet</Text>
            <View>
                {cartItems.length > 0 ? (
                    cartItems.map((cartItem, index) => (
                        <View key={index} style={{ marginBottom: 20 }}>
                            <Text style={{ fontWeight: 'bold' }}>Ürün Adı: {cartItem.productId.name}</Text>
                            <Text>Miktar: {cartItem.quantity}</Text>
                            {/* Her bir cartItem içindeki ürünleri döngü kullanarak listeleyin */}
                            {cartItem.products && cartItem.products.map((product, productIndex) => (
                                <View key={productIndex} style={{ marginLeft: 20 }}>
                                    <Text>Ürün Adı: {product.name}</Text>
                                    {/* Diğer ürün bilgilerini buraya ekleyin */}
                                </View>
                            ))}
                            <TouchableOpacity onPress={() => handleDeleteCartItem(cartItem.productId._id)}>
                                <Text style={{ color: 'red', marginLeft: 20, marginTop: 10 }}>Sepetten Kaldır</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                ) : (
                    <Text style={{ textAlign: 'center' }}>Sepetiniz Boş</Text>
                )}
            </View>
            <TouchableOpacity style={{ backgroundColor: '#729c44', padding: 10, marginHorizontal: 50, marginTop: 10, borderRadius: 5, alignContent: 'center' }} onPress={handleOrder}>
                <Text style={{ textAlign: 'center', color: 'white', fontSize: 18 }}>Sipariş Ver</Text>
            </TouchableOpacity>
        </View>
    );
    
    
    
    
//     return (
//         <View>
            
//             <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }}>Sepet</Text>
          
//             {cartItems.length === 0 ? (
//                 <Text style={{ textAlign: 'center' }}>Sepetiniz Boş</Text>
//             ) : (
//                 <View style={{flexDirection:'row'}}>
//                 <FlatList
//                     data={cartItems}
//                     renderItem={renderCartItem}
//                     keyExtractor={(item, index) => index.toString()} // veya unique bir değeri kullanabilirsiniz
//                     style={{margin:10}}
//                 >
            
//                 </FlatList>
//                 <MaterialCommunityIcons style={{marginRight:20,marginTop:20}} name='delete' color={'red'} size={30} onPress={handleDeleteCartItem} />

//                 </View>
//             )}
          
//             <TouchableOpacity style={{backgroundColor:'#729c44',padding:10, marginHorizontal:50, marginTop:10,borderRadius:5, alignContent:'center'}} onPress={handleOrder}>
//                 <Text style={{textAlign:'center',color:'white', fontSize:18}}>Sipariş Ver</Text>
//             </TouchableOpacity>

//         </View>
//     );
 };

export default Cart;
