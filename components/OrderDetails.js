import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';

const OrderDetails = ({ route }) => {
  const { orderDetails } = route.params;
  const [productDetails, setProductDetails] = useState([]);
  const [transporterIds, setTransporterIds] = useState([]);
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

  const fetchTransportDetails = async (transportDetailsId, index) => {
    try {
      const response = await axios.get(`http://localhost:8000/transportDetails/id/${transportDetailsId}`);
      const transportDetails = response.data.transportDetails;
      // console.log(transportDetails.transporterId)
      setTransporterIds(transportDetails.transporterId);
      // Update productDetails state with fetched transportDetails
      setProductDetails(prevDetails => {
        const updatedDetails = [...prevDetails];
        updatedDetails[index].order.offer = transportDetails.offer;
        updatedDetails[index].order.isOfferAccept = transportDetails.isOfferAccept;
        return updatedDetails;
      });
    } catch (error) {
      console.error('Error fetching transport details:', error);
    }
  };

  useEffect(() => {
    // Fetch transport details for each productDetails item
    productDetails.forEach((item, index) => {
      if (item.order.transportDetailsId) {
        fetchTransportDetails(item.order.transportDetailsId, index);
      }
    });
  }, [productDetails]);

  const handleAcceptOffer = async (transportDetailsId) => {
    try {
      const response = await axios.put(`http://localhost:8000/transportDetails/update/isOfferAccept/${transportDetailsId}`, { isOfferAccept: true });
      // console.log('Offer accepted:', response.data);
      alert('Offer accepted', response.data);
      // Handle UI update if needed
    } catch (error) {
      console.error('Error accepting offer:', error);
      // Handle error if needed
    }
  };
  
  const handleRejectOffer = async (orderId, transportDetailsId) => {
    try {
      // Teklifi reddetmeden önce transportDetailsId'yi null olarak güncelle
      await axios.delete(`http://localhost:8000/orders/${orderId}/removeTransportDetailsId`);
      
      // Teklifi reddet
      const response = await axios.put(`http://localhost:8000/transportDetails/update/isOfferAccept/${transportDetailsId}`, { isOfferAccept: false });
      console.log('Offer rejected:', response.data);
      
      // State'i güncelle
      setProductDetails(prevDetails => {
        const updatedDetails = prevDetails.map(item => {
          // İlgili siparişin transportDetailsId özelliğini null olarak güncelle
          if (item.order._id === orderId) {
            return {
              ...item,
              order: {
                ...item.order,
                transportDetailsId: null
              }
            };
          }
          return item;
        });
        return updatedDetails;
      });
      
      // Handle UI update if needed
    } catch (error) {
      console.error('Error rejecting offer:', error);
      // Handle error if needed
    }
  };

  const handleCancelOrder = async (orderId) => {
    console.log('Order ID to cancel:', orderId);
    try {
      const response = await axios.delete(`http://localhost:8000/orders/${orderId}`);
      console.log('Order cancelled:', response.data);
      // Handle UI update if needed
    } catch (error) {
      console.error('Error cancelling order:', error);
      // Handle error if needed
    }
  };
  
  return (
    <View style={styles.container}>
      {productDetails.length > 0 && (
        <View style={{ borderWidth: 1, borderRadius: 15, borderColor: '#ccc', backgroundColor: '#f9fbe5', padding: 7, marginBottom: 10 }}>
          <Text style={{ fontSize: 18 }}>Sipariş Tarihi: {formatOrderDate(productDetails[0].order.orderDate)}</Text>
          <Text style={{ fontSize: 18 }}>Sipariş Durumu: {productDetails[0].order.status}</Text>
          <Text style={{ fontSize: 18 }}>Toplam Tutarı: {productDetails.reduce((total, item) => total + item.order.totalPrice, 0)} ₺</Text>
        </View>
      )}
      <FlatList
        data={productDetails}
        renderItem={({ item }) => (
          <View style={styles.orderDetail}>
            <Text style={[styles.productDetailText, { fontSize: 22, fontWeight: 800, marginBottom: 10 }]}>Sipariş Detayları</Text>  
            {item.products.map((product, index) => (
              <View key={index}>
                <Text style={[styles.productDetailText, { fontSize: 22, fontWeight: 800, marginBottom: 10 }]}> {product.name}</Text>
                <View style={styles.productDetail}>
                  <View style={{ borderWidth: 1, borderRadius: 15, backgroundColor: 'white', padding: 5 }}>
                    <Image source={{ uri: product.images[0] }} style={styles.productImage} />
                  </View>
                  <View style={{ marginLeft: 10 }}>
                    {item.order.products.map((newProduct, index) => (
                      <View key={index}>
                        <Text style={styles.productDetailText}>Miktar: {newProduct.quantity} {product.qtyFormat}</Text>
                      </View>
                    ))} 
                    <Text style={styles.productDetailText}>Fiyat: {item.order.totalPrice} ₺</Text>
                    <Text style={styles.orderInfoText}>Gönderen: {item.order.from}</Text>
                    {item.order.isOfferAccept!==true && item.order.transportDetailsId &&(
                      <View>
                        <TouchableOpacity style={styles.button} onPress={() => handleAcceptOffer(item.order.transportDetailsId)}>
                          <Text style={{ color: 'blue' }}>Teklifi Kabul Et</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={() => handleRejectOffer(item.order.transportDetailsId)}>
                          <Text style={{ color: 'red' }}>Teklifi Reddet</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    {item.order.isOfferAccept==true && (
                      <View>
                      <Text>Teklifiniz taşıyıcıya iletildi.</Text>
                      <Text style={[styles.orderInfoText, { color: item.order.status === 'Hazırlanıyor' ? '#2285a1' : 'green' }]}>{item.order.status}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
            {item.order.isOfferAccept !== true && (
      <TouchableOpacity  style={styles.button} onPress={() => handleCancelOrder(item.order._id)}>
        <Text style={{ color: 'red' }}>Siparişi iptal et</Text>
      </TouchableOpacity>
      )}
          </View>
          
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  orderDetail: {
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 15,
    backgroundColor: '#f9fbe5',
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
    borderRadius: 5,
    alignSelf: 'center',
  },
  productDetailText: {
    fontSize: 18,
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
});

export default OrderDetails;
