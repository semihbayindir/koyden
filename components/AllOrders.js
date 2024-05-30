

import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const AllOrders = () => {
    const [orders,setOrders] = useState([]);
    const navigation = useNavigation();
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
        <View>
        {item.transportDetailsId == undefined && (
          <TouchableOpacity style={styles.order}>
                <View>
                  <Text style={styles.orderText}>Sipariş Tarihi: {new Date(item.orderDate).toLocaleDateString("tr-TR")}</Text>
                  <Text style={styles.orderText}>Gönderen: {item.from}</Text>
                  <Text style={styles.orderText}>Alıcı: {item.to}</Text>
              </View>
              {item.products.map((product, index) => (
                <View style={{flexDirection:'row'}} key={`${product.productId}-${index}`}>
                    <View style={{paddingVertical:5}}>
                        <View style={{ borderWidth: 1, borderRadius: 15,borderColor: 'lightgrey', backgroundColor: 'white', padding: 5 }}>
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
          )}
        </View>

      );
  }

    return (
        <View style={styles.welcome}>
          <Text style={{textAlign:'left', fontWeight:200, fontSize:30, fontStyle:'italic'}}>Hoşgeldin
            <Text style={{textAlign:'left', fontWeight:800, fontSize:30, fontStyle:'normal'}}>  TAŞIYICI,</Text>
          </Text>
          <View style={{flexDirection:'row', alignItems:'center', marginTop:5, marginBottom:10 }}>
            <TouchableOpacity style={styles.buttons} onPress={() => navigation.navigate('TasiyiciOrders')}>
              <Text style={{fontSize:20}}>Siparişlerim</Text>
            </TouchableOpacity>
          </View>
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
        order: {
          borderRadius:20,
          
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
      
        container: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        welcome:{
          flex:1,
          marginTop:15,
          marginHorizontal:15
        },
        buttons:{
          marginHorizontal: 10,
          marginVertical:10,
          backgroundColor: '#fff',
          borderRadius: 12,
          paddingHorizontal: 10,
          paddingVertical: 8,
        },


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


      });
export default AllOrders

