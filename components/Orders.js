import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useUserIdDecoder } from './UserIdDecoder';
import SearchBar from './SearchBar';
import { fuzzySearch } from './FuzzySearch';

const Orders = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const userId = useUserIdDecoder();

  useEffect(() => {
    if (userId) {
      axios.get(`http://localhost:8000/orders/${userId}`)
        .then(response => {
          setOrders(response.data);
        })
        .catch(error => {
          console.error('Error fetching orders:', error);
        });
    }
  }, [userId]);

  const renderOrderItem = ({ item }) => {
    return (
      <TouchableOpacity style={styles.order} onPress={() => handleOrderPress(item._id)}>
        <Text style={styles.orderText}>{item.totalPrice} ₺</Text>
        <Text style={styles.orderText}>{item.orderDate}</Text>
        <Text style={styles.orderText}>{item.status}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Siparişlerim</Text>
      {orders.length === 0 ? (
        <Text style={styles.noOrders}>Henüz sipariş vermemişsiniz.</Text>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={item => item._id.toString()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  noOrders: {
    fontSize: 18,
  },
  order: {
    borderWidth: 1,
    borderColor: 'lightgrey',
    padding: 10,
    marginBottom: 10,
  },
  orderText: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default Orders;
