import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useUserIdDecoder } from './UserIdDecoder';
import Loading from '../screens/Loading';


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
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000); // 5 saniye

    return () => clearTimeout(timer);
  }, []);

  const renderProductItem = ({ item }) => (
    <TouchableOpacity style={styles.urunler} onPress={() => handleProductPress(item._id)}>
        <Image style={styles.images} source={{ uri: item.images[0] }} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <View style={styles.productDet}>
          <Text style={styles.productQty}>{item.qty} kg</Text>
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
            <TouchableOpacity style={styles.butons}>
              <Text style={{ fontSize: 18 }}>Ürünlerim</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.butons} onPress={() => navigation.navigate('UreticiOrders')}>
              <Text style={{ fontSize: 18 }}>Siparişlerim</Text>
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
    margin:15,
  },
  butons:{
    margin:10,
    borderWidth:2,
    borderRadius:10,
    borderColor:'#9ab863',
    paddingHorizontal:10,
    padding:4
  },
  urunler:{
    backgroundColor:'#d8e3c3',
    marginHorizontal:10,
    borderWidth:2,
    borderRadius:10,
    borderColor:'#9ab863',
    width: '45%',
    justifyContent:'center',
    marginBottom:10,
  },
  images: {
    width: '100%',
    height: 140,
    marginTop:10,
    resizeMode: 'contain',
    
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
  },
  productQty:{
    fontSize:18, 
    paddingLeft:20, 
    paddingBottom:10,
  },
  productPrice:{
    fontSize:18, 
    paddingLeft:30, 
    paddingBottom:10,
  },
  productDet:{
    flexDirection:'row',
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
