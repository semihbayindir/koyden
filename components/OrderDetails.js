import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';

const OrderDetails = ({ route }) => {
  const { orderDetails } = route.params;
  const [productDetails, setProductDetails] = useState([]);
  const [transporterIds, setTransporterIds] = useState([]);
  const [transporterInfos, setTransporterInfos] = useState([]);
//  Tüm siparişlerin durumlarını kontrol et
// {console.log(productDetails[0].order.status)}
// {console.log(productDetails[1].order.status)}

useEffect(() => {
    let isMounted = true;

    const fetchProductDetails = async () => {
      try {
        const details = await Promise.all(orderDetails.map(async (order) => {
          const products = await Promise.all(order.data.products.map(async (product) => {
            const response = await axios.get(`http://localhost:8000/products/${product.productId}`);
            return response.data;
          }));
          return { order: order.data, products: products };
        }));
        if (isMounted) setProductDetails(details);
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    };

    fetchProductDetails();

    return () => {
      isMounted = false;
    };
  }, [orderDetails]);

  useEffect(() => {
    let isMounted = true;

    const fetchTransportDetails = async (transportDetailsId, index) => {
      try {
        const response = await axios.get(`http://localhost:8000/transportDetails/id/${transportDetailsId}`);
        const transportDetails = response.data.transportDetails;

        const transporterResponse = await axios.get(`http://localhost:8000/user/${transportDetails.transporterId}`);
        const transporterInfo = transporterResponse.data;

        if (isMounted) {
          setProductDetails(prevDetails => {
            const updatedDetails = [...prevDetails];
            updatedDetails[index].order.offer = transportDetails.offer;
            updatedDetails[index].order.isOfferAccept = transportDetails.isOfferAccept;
            updatedDetails[index].order.transporterInfo = transporterInfo;
            return updatedDetails;
          });
        }
      } catch (error) {
        console.error('Error fetching transport details:', error);
      }
    };
    productDetails.forEach((item, index) => {
      if (item.order.transportDetailsId) {
        fetchTransportDetails(item.order.transportDetailsId, index);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [productDetails]);

  useEffect(() => {
    let isMounted = true;

    const fetchTransporterInfos = async () => {
      try {
        const transporterInfos = await Promise.all(transporterIds.map(async (id) => {
          const response = await axios.get(`http://localhost:8000/user/${id}`);
          return response.data;
        }));
        if (isMounted) setTransporterInfos(transporterInfos);
      } catch (error) {
        console.error('Error fetching transporter infos:', error);
      }
    };

    if (transporterIds.length > 0) {
      fetchTransporterInfos();
    }

    return () => {
      isMounted = false;
    };
  }, [transporterIds]);

  const updateSingleOrderStatus = async (orderId) => {
    try {
      const response = await axios.put(`http://localhost:8000/singleOrder/${orderId}/status`);
      console.log('SingleOrder status changed', response.data);
    } catch (error) {
      console.error('Error updating single order status:', error);
    }
  };
  

  useEffect(() => {
    const updateOrderStatus = async () => {
      // Tüm siparişlerin durumlarını al
      const statuses = productDetails.map(item => item.order.status);
      // Tüm durumların aynı olup olmadığını kontrol et
      const allSameStatus = statuses.every(status => status === statuses[0]);
      // Eğer tüm durumlar aynı ise, singleOrder status'u güncelle
      if (allSameStatus) {
        const orderId = productDetails[0].order._id; // Herhangi bir order ID'sini alabiliriz, çünkü tüm siparişlerin durumları aynı
        await updateSingleOrderStatus(orderId);
      }
    };
  
    // Sadece productDetails değiştiğinde updateOrderStatus'u çağır
    updateOrderStatus();
  }, [productDetails]);
  
  
  const handleAcceptOffer = async (transportDetailsId, orderId) => {
    try {
      // Önce taşıyıcı teklifini kabul et
      const response = await axios.put(`http://localhost:8000/transportDetails/update/isOfferAccept/${transportDetailsId}`, { isOfferAccept: true });
      alert('Offer accepted', response.data);
  
      // Ardından sipariş durumunu güncelle
      await axios.put(`http://localhost:8000/orders/${orderId}/status`);
  
      // Güncellenmiş sipariş durumunu bileşen durumuna yansıt
      setProductDetails(prevDetails => {
        const updatedDetails = prevDetails.map(item => {
          if (item.order._id === orderId) {
            return {
              ...item,
              order: {
                ...item.order,
                status: 'Kargoya Verildi',
                isOfferAccept: true,
              }
            };
          }
          return item;
        });
  
        // Tüm siparişlerin durumlarını kontrol et
        const allSameStatus = updatedDetails.every((item, index, array) => item.order.status === array[0].order.status);
        
        if (allSameStatus) {
          updateSingleOrderStatus(orderId);
        }
  
        return updatedDetails;
      });

    } catch (error) {
      console.error('Error accepting offer:', error);
    }
  };

  const handleRejectOffer = async (orderId, transportDetailsId) => {
    try {
      await axios.delete(`http://localhost:8000/orders/${orderId}/removeTransportDetailsId`);

      const response = await axios.put(`http://localhost:8000/transportDetails/update/isOfferAccept/${transportDetailsId}`, { isOfferAccept: false });
      console.log('Offer rejected:', response.data);

      setProductDetails(prevDetails => {
        const updatedDetails = prevDetails.map(item => {
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
    } catch (error) {
      console.error('Error rejecting offer:', error);
    }
  };

  const handleCancelOrder = async (orderId) => {
    console.log('Order ID to cancel:', orderId);
    try {
      const response = await axios.delete(`http://localhost:8000/orders/${orderId}`);
      console.log('Order cancelled:', response.data);
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const formatOrderDate = (date) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return new Date(date).toLocaleDateString('tr-TR', options);
  };

  return (
    <View style={styles.container}>
      {productDetails.length > 0 && (
        <View style={{ borderRadius: 20, backgroundColor: '#f9fbe5', padding: 7, marginBottom: 10 }}>
          <Text style={{ fontSize: 18 }}>Sipariş Tarihi: {formatOrderDate(productDetails[0].order.orderDate)}</Text>
          <Text style={{ fontSize: 18 }}>Sipariş Durumu: {productDetails[0].order.status}</Text>
          <Text style={{ fontSize: 18 }}>Toplam Tutarı: {productDetails.reduce((total, item) => total + item.order.totalPrice, 0)} ₺</Text>
        </View>
      )}
      <FlatList
        data={productDetails}
        renderItem={({ item }) => (
          <View style={styles.orderDetail}>
            <Text style={[styles.productDetailText, { fontSize: 22, fontWeight: '800', marginBottom: 10 }]}>Sipariş Detayları</Text>
            {item.products.map((product, index) => (
              <View key={index}>
                <Text style={[styles.productDetailText, { fontSize: 22, fontWeight: '800', marginBottom: 10 }]}>{product.name}</Text>
                <View style={styles.productDetail}>
                  <View style={{ borderWidth: 1, borderColor: 'lightgray', borderRadius: 15, backgroundColor: 'white', padding: 5 }}>
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
                    <Text style={styles.orderInfoText}>TAŞIYICI BİLGİLERİ</Text>

                    {item.order.transporterInfo && (
                      <Text style={styles.orderInfoText}>{item.order.transporterInfo.name}</Text>
                    )}
                    {item.order.isOfferAccept !== true && item.order.transportDetailsId && (
                      <View>
                        <TouchableOpacity style={styles.button} onPress={() => handleAcceptOffer(item.order.transportDetailsId, item.order._id)}>

                          <Text style={{ color: 'white', fontSize: 17 }}>Taşıyıcıyı Kabul Et</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button1} onPress={() => handleRejectOffer(item.order._id, item.order.transportDetailsId)}>
                          <Text style={{ color: 'white', fontSize: 17 }}>Taşıyıcı Reddet</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    {item.order.isOfferAccept === true && (
                      <View>
                        <Text style={[styles.orderInfoText, { color: item.order.status === 'Hazırlanıyor' ? '#2285a1' : 'green' }]}>{item.order.status}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
            {item.order.isOfferAccept !== true && (
              <TouchableOpacity style={styles.button1} onPress={() => handleCancelOrder(item.order._id)}>
                <Text style={{ color: 'white', fontSize: 17 }}>Siparişi İptal Et</Text>
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
    borderRadius: 20,
    backgroundColor: '#f9fbe5',
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
    marginBottom: 10,
  },
  productImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    alignSelf: 'center',
  },
  productDetailText: {
    fontSize: 18,
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#2285a1',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  button1: {
    backgroundColor: '#ff5252',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
});

export default OrderDetails;
