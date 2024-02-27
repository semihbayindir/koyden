

import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios';

const AllOrders = () => {
    const [orders,setOrders] = useState([]);
    useEffect(() => {
          axios.get(`http://localhost:8000/orders`)
            .then(response => {
              setOrders(response.data);
            //   console.log(orders);
            })
            .catch(error => {
              console.error('Error fetching products:', error);
            })
    });

    renderOrderItem = ({item}) => {
        return (
            <TouchableOpacity style={styles.order}>
                <Text style={styles.orderText}>Total Price: {item.totalPrice} ₺</Text>
                <Text style={styles.orderText}>Sipariş Tarihi: {new Date(item.orderDate).toLocaleDateString("tr-TR")}</Text>
                <Text style={styles.orderText}>from: {item.from}</Text>
                <Text style={styles.orderText}>to: {item.to}</Text>
            {item.products.map((product, index) => (
            <View key={`${product.productId}-${index}`}>
            <Text style={styles.orderText}>Ürün adı: {product.productId.name}</Text>
            {/* <Image source={{ uri: product.productId.images[0] }} style={{ width: 100, height: 100}} /> */}
                <Text style={styles.orderText}>Ağırlık: {product.quantity} kg</Text>
                {/* <Text style={styles.orderText}>Price: {product.price}</Text> */}
                {/* <Text style={styles.orderText}>Producer Id: {product.productId}</Text> */}
                {/* <Text style={styles.orderText}>Şehir : {producerInfo.verification.producerAddress.street}</Text> */}
            </View>
            ))}
        </TouchableOpacity>
          );
    }
    return (
        <View style={styles.welcome}>
              {orders.length > 0 && (
                <FlatList
                  data={orders}
                  renderItem={renderOrderItem}
                  keyExtractor={item => item._id.toString()}
                  />
              )}
        </View>
      );
    }  
    
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
export default AllOrders

