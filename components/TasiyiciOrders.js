import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image } from 'react-native';
import axios from 'axios';
import { useUserIdDecoder } from './UserIdDecoder';

const TasiyiciOrders = () => {
  const [transportDetails, setTransportDetails] = useState([]);
  const userId = useUserIdDecoder();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState({}); // Ürünlerin bilgisini saklamak için bir state

  useEffect(() => {
    const fetchOrders = async () => {
      if (userId) {
        try {
          const transportResponse = await axios.get(`http://localhost:8000/transportDetails/${userId}`);
          setTransportDetails(transportResponse.data);

          const orderPromises = transportResponse.data.map(async (transportDetail) => {
            const orderResponse = await axios.get(`http://localhost:8000/orders/${transportDetail.orderId}`);
            return orderResponse.data;
          });

          const orderData = await Promise.all(orderPromises);
          setOrders(orderData);
        } catch (error) {
          console.error('Error fetching orders:', error);
        }
      }
    };

    fetchOrders();
  }, [userId]);

  const fetchProduct = async (productId) => {
    try {
      const response = await axios.get(`http://localhost:8000/products/${productId}`);
      return response.data; // Ürün verisi başarıyla alındı
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error('Error fetching product'); // Ürün alınırken bir hata oluştu
    }
  };

  useEffect(() => {
    // Tüm siparişlerin ürün bilgilerini çek ve products state'ine kaydet
    const fetchProductsForOrders = async () => {
      const productMap = {};
      for (const order of orders) {
        for (const product of order.products) {
          // Eğer bu ürünü daha önce çekmediysek, çek
          if (!productMap[product.productId]) {
            productMap[product.productId] = await fetchProduct(product.productId);
          }
        }
      }
      setProducts(productMap);
    };

    fetchProductsForOrders();
  }, [orders]);

  const renderOrderItem = ({ item, index }) => {
    const order = item;
    const offerAcceptStatus = transportDetails[index].isOfferAccept ? 'Onaylandı' : 'Beklemede'; // isOfferAccept değerine göre durumu belirle
    return (
      <View>
        <Text>Offer: {transportDetails[index].offer}</Text>
        <Text>Offer Accept Status: {offerAcceptStatus}</Text>
        {/* <Text>Order Id: {order._id}</Text> */}
        <Text>From: {order.from}</Text>
        <Text>To: {order.to}</Text>
        <Text>isOfferAccept: {transportDetails[index].isOfferAccept}</Text>

        {/* Ürünlerin bilgisini products state'inden al */}
        {order.products.map((product, index) => (
          <View key={index}>
            {/* <Text>Product Id: {product.productId}</Text> */}
            {products[product.productId] && ( // Ürün bilgisi varsa göster
              <View>
                <Text>Product Name: {products[product.productId].name}</Text>
                <Image source={{ uri: products[product.productId].images[0] }} style={{ width: 100, height: 100}} />
              </View>
            )}
          </View>
        ))}
        {/* Diğer sipariş bilgilerini buraya ekleyebilirsiniz */}
      </View>
    );
  };

  return (
    <View>
      <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }}>Siparişlerim</Text>
      {transportDetails.length === 0 ? (
        <Text style={{ textAlign: 'center' }}>Henüz siparişiniz bulunmamaktadır.</Text>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item._id.toString()}
        />
      )}
    </View>
  );
};

export default TasiyiciOrders;
