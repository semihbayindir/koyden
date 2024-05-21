import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
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
    <View style={{margin:20}}>
      <TouchableOpacity style={styles.order}>
            <View>
              <Text style={styles.orderText}>Sipariş Tarihi: {new Date(item.orderDate).toLocaleDateString("tr-TR")}</Text>
              <Text style={styles.orderText}>Gönderen: {item.from}</Text>
              <Text style={styles.orderText}>Alıcı: {item.to}</Text>
          </View>
          {item.products.map((product, index) => (
            <View style={{flexDirection:'row'}} key={`${product.productId}-${index}`}>
                <View style={{paddingVertical:5}}>
                    <View style={{ borderWidth: 1, borderColor:'lightgray', borderRadius: 15, backgroundColor: 'white', padding: 5 }}>
                        <Image style={styles.productImage}  source={{ uri: product.productId.images[0] }} />
                    </View>
                </View>
                <View style={{ marginLeft: 10 }}>
                    <Text style={[styles.productDetailText, { fontSize: 22, fontWeight: 800, marginBottom: 10 }]}>{product.productId.name}</Text>
                    <Text style={styles.orderText}>Ağırlık: {product.quantity} kg</Text>
                </View>
            </View>
        ))}
      </TouchableOpacity>
    </View>
  );

  return (
    <View>
  
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

const styles = StyleSheet.create({
  orderInfoText: {
    fontSize: 18,
    marginBottom: 5,
  },
  productDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 5,
    alignSelf: 'center',
  },
  productDetailText: {
    fontSize: 18,
    marginBottom: 5,
  },
   order: {
        
          borderRadius:20,
          borderColor: 'lightgrey',
          backgroundColor:'#f9fbe5',
          padding: 10,
          marginBottom: 10,
        },
        orderText: {
          fontSize: 20,
          marginBottom: 5,
        },

        productDetailText: {
          fontSize: 18,
          marginBottom: 5,
        },
})

export default UreticiOrders;
