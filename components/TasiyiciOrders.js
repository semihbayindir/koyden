import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import axios from 'axios';
import { useUserIdDecoder } from './UserIdDecoder';

const TasiyiciOrders = () => {
  const [transportDetails, setTransportDetails] = useState([]);
  const userId = useUserIdDecoder();
  const [orders, setOrders] = useState([]);
  

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

  const renderOrderItem = ({ item, index }) => (
    <View>
      <Text>orderId: {item.userId}</Text>
{console.log(item)}
      <Text>Order Id: {transportDetails[index].orderId}</Text>
      {/* Diğer sipariş bilgilerini buraya ekleyebilirsiniz */}
    </View>
  );

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
