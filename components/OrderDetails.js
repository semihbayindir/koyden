import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';

const OrderDetails = ({ route }) => {
  const { orderDetails } = route.params;
  const [productDetails, setProductDetails] = useState([]);


  let totalOrderPrice = 0;

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const details = await Promise.all(orderDetails.map(async (order) => {
          const products = await Promise.all(order.data.products.map(async (product) => {
            const response = await axios.get(`http://localhost:8000/products/${product.productId}`);
            return response.data;
          }));
          return { order: order.data, products: products };
        }));
        setProductDetails(details);
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    };

    fetchProductDetails();
  }, [orderDetails]);


  const formatOrderDate = (date) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return new Date(date).toLocaleDateString('tr-TR', options);
  };

  const renderItem = ({ item }) => (
    <View style={styles.orderDetail}>
      {item.products.map((product, index) => (
        <View key={index}>
          
          <Text style={[styles.productDetailText,{fontSize:22, fontWeight:800, marginBottom:10}]}> {product.name}    </Text>
          <View style={styles.productDetail}>
            <View style={{borderWidth:1, borderRadius:15, backgroundColor:'white', padding:5}}>
            <Image source={{ uri: product.images[0] }} style={styles.productImage} />
            </View>
            <View style={{marginLeft:10}}>
              <Text style={styles.productDetailText}>Miktar: {product.qty} {product.qtyFormat}   </Text>
              <Text style={styles.productDetailText}>Fiyat: {item.order.totalPrice} ₺ </Text>
              <Text style={styles.orderInfoText}>Gönderen: {item.order.from}</Text>
              <Text style={[styles.orderInfoText, { color: item.order.status === 'Hazırlanıyor' ? '#2285a1' : 'green' }]}> {item.order.status}</Text>

            </View>
          </View>
        </View>
      ))}
      {/* <View style={styles.orderInfo}>
        <Text style={styles.orderInfoText}>Sipariş Tarihi: {item.order.orderDate}</Text>
        
        <Text style={styles.orderInfoText}>Alıcı: {item.order.to}</Text>
        <Text style={styles.orderInfoText}>Teklif: {item.order.offer}</Text>
        <Text style={styles.orderInfoText}>Tutar: {item.order.totalPrice} ₺</Text>
      </View> */}
    
      {item.order.offer > 0 && ( // Teklif 0'dan büyükse, kabul et ve reddet butonlarını göster
        <View>
          <TouchableOpacity style={styles.button} onPress={() => handleAcceptOffer(item.order._id)}>
            <Text style={{ color: 'green' }}>Kabul Et</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleRejectOffer(item.order._id)}>
            <Text style={{ color: 'red' }}>Reddet</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const handleAcceptOffer = async (orderId) => {
    const isOfferAccept = true;
    try {
        const response = await axios.put(`http://localhost:8000/orders/update/isOfferAccept/${orderId}`, { isOfferAccept });
        console.log('Offer updated successfully:', response.data);
      } catch (error) {
      console.error('Error updating offer:', error);
    }
  };

  return (
    
    <View style={styles.container}>
      
      {/* <Text style={styles.title}>Sipariş Detayları</Text> */}
      
        {productDetails.length > 0 && (
          <View style={{borderWidth:1, borderRadius:15, borderColor:'#ccc', backgroundColor:'#f9fbe5', padding:7, marginBottom:10}}>
            <Text style={{fontSize:18}}>Sipariş Tarihi:{formatOrderDate(productDetails[0].order.orderDate)}</Text>
            <Text style={{fontSize:18}}>Sipariş Durumu: {productDetails[0].order.status}</Text>
            <Text style={{fontSize:18}}>Toplam Tutarı: {productDetails.reduce((total, item) => total + item.order.totalPrice, 0)} ₺</Text>
          </View>
        )}
          
      <FlatList
        data={productDetails}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  orderDetail: {
    marginBottom: 20,
    borderWidth: 1,
    borderRadius:15,
    backgroundColor:'#f9fbe5',
    borderColor: '#ccc',
    padding: 10,
  },
  orderInfo: {
    marginBottom: 10,
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
    borderRadius:5,
    alignSelf:'center',
  },
  productDetailText: {
    fontSize: 18,
    marginBottom: 5,
  },
});

export default OrderDetails;
