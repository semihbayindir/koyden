import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useUserIdDecoder } from './UserIdDecoder';

const Orders = () => {
  const navigation = useNavigation();
  const [singleOrders, setSingleOrders] = useState([]);
  const userId = useUserIdDecoder();

  useEffect(() => {
    if (userId) {
      axios.get(`http://localhost:8000/singleOrders/${userId}`)
        .then(response => {
          setSingleOrders(response.data);
        })
        .catch(error => {
          console.error('Error fetching orders:', error);
        });   
    }
  }, [userId]);

  const renderSingleOrderItem = ({ item }) => {
    let statusColor = '';
  
    switch (item.status) {
      case 'Hazırlanıyor':
        statusColor = '#2285a1'; // Yeşil renk
        break;
      case 'Kargoya Verildi':
        statusColor = 'orange'; // Mavi renk
        break;
      case 'Teslim Edildi':
        statusColor = 'green'; // Yeşil renk
        break;
      default:
        statusColor = 'black'; // Varsayılan olarak siyah renk
    }
  

    const formatOrderDate = (date) => {
      const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' };
      return new Date(date).toLocaleDateString('tr-TR', options);
    };
    return (
      <TouchableOpacity style={styles.order} onPress={() => handleSingleOrderPress(item)}>
        
        <Text style={styles.orderText }>Sepet Tutarı: {item.totalPrice} ₺</Text>
        <Text style={styles.orderText}>Sipariş Tarihi: {formatOrderDate(item.orderDate)}</Text>
        
        <View style={{flexDirection:'row'}}>
        {item.products.map((product, index) => (
          <View style={{flexDirection:'row', borderWidth:1, borderRadius:5, backgroundColor:'white', padding:5, marginBottom:10, marginRight: 10}}>
          <Image source={{ uri: product.productId.images[0] }} style={{ width: 60, height: 60}} />
          </View>
          ))}
          </View>
          <Text style={[styles.orderText, { color: statusColor }]}>{item.status}</Text>
      </TouchableOpacity>
    );
  };
  
  const handleSingleOrderPress = async (singleOrder) => {
    try {
      const orderDetails = await Promise.all(singleOrder.orderIds.map(orderId => axios.get(`http://localhost:8000/orders/${orderId.orderId}`)));
      console.log('Order details:', orderDetails);
      navigation.navigate('OrderDetails', { orderDetails: orderDetails });
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Siparişlerim</Text> */}
      {singleOrders.length === 0 ? (
        <Text style={styles.noOrders}>Henüz sipariş vermemişsiniz.</Text>
      ) : (
        <>
        <FlatList
          data={singleOrders}
          renderItem={renderSingleOrderItem}
          keyExtractor={item => item._id.toString()}
        />
        </>     
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
    borderRadius:15,
    borderColor: 'lightgrey',
    backgroundColor:'#f9fbe5',
    padding: 10,
    marginBottom: 10,
  },
  orderText: {
    fontSize: 20,
    marginBottom: 5,
  },
});

export default Orders;