import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
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


    // {products[product.productId].name}


    return (
      <View style={[styles.order ,{marginHorizontal:20, marginVertical:10}]}>
        
        
        <View style={styles.order}>
            {producerInfo && (
              <View>
                <Text style={styles.orderText}>Üretici: {producerInfo.name}</Text>
                <Text style={styles.orderText}>Telefpn Numarası: {producerInfo.phone}</Text>
                <Text style={styles.orderText}>{producerInfo.verification.producerAddress.city + " " +
                  producerInfo.verification.producerAddress.district + " " 
                  + producerInfo.verification.producerAddress.street}</Text>
              </View>
            )}
          
        </View>
        <View>
        {order.products.map((product, index) => (
          
          <View key={index}>
            {products[product.productId] && (
              <View style={{flexDirection:'row'}} >
                <View style={{ borderWidth: 1, borderColor:'lightgray', borderRadius: 15, backgroundColor: 'white', padding: 5, marginBottom:45 }}>
                <Image source={{ uri: products[product.productId].images[0] }} style={{ width: 100, height: 100}} />
                </View>
                <View style={{marginLeft:'5%', marginTop:'5%'}}>
                  <Text style={[styles.orderText, { fontWeight:'bold',fontSize:20}]}>{products[product.productId].name}</Text>
                  <Text style={[styles.orderText, ]}>Başlangıç: {order.from}</Text>
                  <Text style={[styles.orderText, ]}>Varış: {order.to}</Text>
                  <Text style={[styles.orderText,{color:'#729c44', marginLeft:'50%', marginTop:30}]}>{offerAcceptStatus}</Text>
                </View>
              </View>

            )}
          </View>
        ))}
          
        </View>
      </View>
    );
  };

  return (
    <View>
      <TouchableOpacity style={{backgroundColor:'#de510b', borderRadius:15, margin:20, padding:10}} onPress={() => navigation.navigate("Route")}>
        <Text style={{fontSize:20, color:'#fff', textAlign:'center'}}>ROTA</Text>
      </TouchableOpacity>      
      {transportDetails.length === 0 ? (
        <Text style={{ textAlign: 'center' }}>Henüz siparişiniz bulunmamaktadır.</Text>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item._id.toString()}
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  order: {
        
    borderRadius:20,
    borderColor: 'lightgrey',
    backgroundColor:'#f9fbe5',
    padding: 10,
    
  },
  orderText: {
    fontSize: 18,
    marginBottom: 5,
    
  },

  productDetailText: {
    fontSize: 18,
    marginBottom: 5,
  },
})

export default TasiyiciOrders;
