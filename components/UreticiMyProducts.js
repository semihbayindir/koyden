import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useUserIdDecoder } from './UserIdDecoder';



const UreticiMyProducts = () => {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const userId = useUserIdDecoder();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      axios.get(`http://localhost:8000/products/producer/${userId}`)
        .then(response => {
          setProducts(response.data);
        })
        .catch(error => {
          console.error('Error fetching products:', error);
        })
        .finally(() => {
          // Ürünler yüklendiğinde bekleme süresini başlat
          setTimeout(() => {
            setLoading(false);
          }, 3000);
        });
    }
  }, [userId]);

  const handleProductPress = (productId) => {
    navigation.navigate('SingleProduct', { productId: productId });
  };


  const renderProductItem = ({ item }) => (
    <TouchableOpacity style={styles.urunler} onPress={() => handleProductPress(item._id)}>
        <Image style={styles.images} source={{ uri: item.images[0] }} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <View style={styles.productDet}>
          <Text style={styles.productQty}>{item.qty} {item.qtyFormat}</Text>
          <Text style={styles.productPrice}>{item.price} ₺</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  

  return (
    <View style={styles.welcome}>
      
          <Text style={{ textAlign: 'left', fontWeight: 200, fontSize: 30, fontStyle: 'italic' }}>Hoşgeldin
            <Text style={{ textAlign: 'left', fontWeight: 800, fontSize: 30, fontStyle: 'normal' }}>  ÜRETİCİ,</Text>
          </Text>
          <View style={{ flexDirection: 'row', alignItems:'center', marginTop: 10 }}>
            <TouchableOpacity style={styles.buttons}>
              <Text style={{ fontSize: 20 }}>Ürünlerim</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttons} onPress={() => navigation.navigate('UreticiOrders')}>
              <Text style={{ fontSize: 20 }}>Siparişlerim</Text>
            </TouchableOpacity>
          </View>
          <FlatList // Ürünler yüklendikten sonra
            data={products}
            renderItem={renderProductItem}
            keyExtractor={(item) => item._id.toString()}
            numColumns={2}
          />
      
    </View>
  );
}

const styles = StyleSheet.create({
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
  buttons: {
    marginHorizontal: 10,
    backgroundColor:'#fff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical:8,
    marginBottom:15,
  },
  urunler:{
    backgroundColor:'#fff',
    marginHorizontal:10,
    borderRadius:20,
    width: '45%',
    justifyContent:'center',
    marginBottom:10,
  },
  images: {
    width: '100%',
    height: 140,
    marginBottom:10,
    borderRadius:20
  },
  input: {
    borderWidth:1,
    borderRadius:10,
    marginTop:15,
    padding:9,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    borderRadius: 15,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  productName:{
    fontSize:18, 
    padding:5,
    flex:0.7
  },
  productQty:{
    fontSize:18, 
    paddingLeft:5, 
    paddingBottom:10,
    color:'green',
    flex:0.7
  },
  productPrice:{
    fontSize:18, 
    flex:0.3,
    paddingBottom:10,

  },
  productDet:{
    flexDirection:'row',
    flex:1
  },



  profileHeader: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    marginTop: 20,
  },
  signOutButton: {
    marginTop: 20,
    backgroundColor: '#FF0000', // Customize the color as needed
    padding: 10,
    borderRadius: 5,
  },
  signOutText: {
    color: '#FFFFFF', // Customize the color as needed
    fontWeight: 'bold',
  },
});

export default UreticiMyProducts;
