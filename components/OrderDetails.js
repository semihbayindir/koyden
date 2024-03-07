import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';

const OrderDetails = ({ route }) => {
  const { orderDetails } = route.params;
  const [productDetails, setProductDetails] = useState([]);

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

  const renderItem = ({ item }) => (
    <View style={styles.orderDetail}>
      <View style={styles.orderInfo}>
        <Text style={styles.orderInfoText}>Toplam Tutar: {item.order.totalPrice}</Text>
        <Text style={styles.orderInfoText}>Sipariş Tarihi: {item.order.orderDate}</Text>
        <Text style={styles.orderInfoText}>Durum: {item.order.status}</Text>
        <Text style={styles.orderInfoText}>Gönderen: {item.order.from}</Text>
        <Text style={styles.orderInfoText}>Alıcı: {item.order.to}</Text>
        <Text style={styles.orderInfoText}>Offer: {item.order.offer}</Text>
      </View>
      {item.products.map((product, index) => (
        <View key={index} style={styles.productDetail}>
          <Text style={styles.productDetailText}>Ürün Adı: {product.name}    </Text>
          <Image source={{ uri: product.images[0] }} style={styles.productImage} />
          <Text style={styles.productDetailText}>Miktar: {product.qty} {product.qtyFormat}</Text>
          <Text style={styles.productDetailText}>Fiyat: {product.price}</Text>
        </View>
      ))}
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
      <Text style={styles.title}>Sipariş Detayları</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  orderDetail: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
  },
  orderInfo: {
    marginBottom: 10,
  },
  orderInfoText: {
    fontSize: 16,
    marginBottom: 5,
  },
  productDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  productDetailText: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default OrderDetails;
