import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useUserIdDecoder } from './UserIdDecoder';
import { useNavigation } from '@react-navigation/native';

const TasiyiciOrders = () => {
  const [transportDetails, setTransportDetails] = useState([]);
  const userId = useUserIdDecoder();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState({});
  const [producerInfos, setProducerInfos] = useState({});
  const navigation = useNavigation();

  useEffect(() => {
    const fetchOrders = async () => {
      if (userId) {
        try {
          const transportResponse = await axios.get(`http://localhost:8000/transportDetails/${userId}`);
          const filteredTransportDetails = transportResponse.data.filter(detail => detail.isOfferAccept);
          setTransportDetails(filteredTransportDetails);

          const orderPromises = filteredTransportDetails.map(async (transportDetail) => {
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
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error('Error fetching product');
    }
  };

  useEffect(() => {
    const fetchProductsForOrders = async () => {
      const productMap = {};
      for (const order of orders) {
        for (const product of order.products) {
          if (!productMap[product.productId]) {
            productMap[product.productId] = await fetchProduct(product.productId);
          }
        }
      }
      setProducts(productMap);
    };

    fetchProductsForOrders();
  }, [orders]);

  useEffect(() => {
    const fetchProducerInfo = async (producerId) => {
      try {
        const response = await axios.get(`http://localhost:8000/producer/${producerId}`);
        const producerInfo = response.data.producer;
        setProducerInfos(prevState => ({
          ...prevState,
          [producerId]: producerInfo
        }));
      } catch (error) {
        console.error('Error fetching producer info:', error);
      }
    };

    orders.forEach(order => {
      fetchProducerInfo(order.producerId);
    });
  }, [orders]);

  const renderOrderItem = ({ item, index }) => {
    const order = item;
    const offerAcceptStatus = 'Onaylandı';
    const producerInfo = producerInfos[order.producerId];

    return (
      <View>
        <View>
          {producerInfo && (
            <View>
              <Text>Producer Name: {producerInfo.name}</Text>
              <Text>Producer Phone : {producerInfo.phone}</Text>
              <Text>{producerInfo.verification.producerAddress.city + " " +
                producerInfo.verification.producerAddress.district + " " 
                + producerInfo.verification.producerAddress.street}</Text>
            </View>
          )}
        </View>
        <Text>Sipariş kabul durumu: {offerAcceptStatus}</Text>
        <Text>Başlangıç: {order.from}</Text>
        <Text>Varış: {order.to}</Text>

        {order.products.map((product, index) => (
          <View key={index}>
            {products[product.productId] && (
              <View>
                <Text>Ürün adı: {products[product.productId].name}</Text>
                <Image source={{ uri: products[product.productId].images[0] }} style={{ width: 100, height: 100}} />
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View>
      <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }}>Siparişlerim</Text>
      <TouchableOpacity onPress={() => navigation.navigate("Route")}>
        <Text>Rota</Text>
      </TouchableOpacity>      
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
