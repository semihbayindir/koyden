import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import axios from 'axios';
import { useUserIdDecoder } from './UserIdDecoder';

const UreticiOrders = () => {
  const [orders, setOrders] = useState([]);
  const userId = useUserIdDecoder();

  useEffect(() => {
    if (userId) {
      axios.get(`http://localhost:8000/orders/producer/${userId}`)
        .then(response => {
          setOrders(response.data);
        })
        .catch(error => {
          console.error('Error fetching orders:', error);
        });
    }
  }, [userId]);

  const renderOrderItem = ({ item }) => (
    <View>
      <Text>Sipariş ID: {item._id}</Text>
      {/* Diğer sipariş bilgilerini buraya ekleyebilirsiniz */}
    </View>
  );

  return (
    <View>
      <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }}>Siparişlerim</Text>
      {orders.length === 0 ? (
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

export default UreticiOrders;
