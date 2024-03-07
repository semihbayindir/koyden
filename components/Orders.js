import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useUserIdDecoder } from './UserIdDecoder';

const Orders = () => {
  const navigation = useNavigation();
  // const [orders, setOrders] = useState([]);
  const [singleOrders, setSingleOrders] = useState([]);
  const userId = useUserIdDecoder();
  const [producerInfo, setProducerInfo] = useState(null);

  // useEffect(() => {
  //   if (userId) {
  //     axios.get(`http://localhost:8000/orders/${userId}`)
  //       .then(response => {
  //         setOrders(response.data);
  //       })
  //       .catch(error => {
  //         console.error('Error fetching orders:', error);
  //       });   
  //   }
  // }, [userId]);

  useEffect(() => {
    if (userId) {
      axios.get(`http://localhost:8000/singleOrders/${userId}`)
        .then(response => {
          setSingleOrders(response.data);
        })
        .catch(error => {
          console.error('Error fetching orders:', error);
        });   
    }
  }, [userId]);

  // useEffect to fetch producer information
  // useEffect(() => {
  //   const fetchProducerInfo = async () => {
  //     try {
  //       if (orders && orders.length > 0) {
  //         // Tüm siparişlerde döngü yap
  //         for (let i = 0; i < orders.length; i++) {
  //           const order = orders[i];
  //           // Her bir siparişin ürünlerinde döngü yap
  //           for (let j = 0; j < order.products.length; j++) {
  //             const product = order.products[j];
  //             // Her bir ürünün üreticisine ait bilgiyi getir
  //             const response = await axios.get(`http://localhost:8000/api/users/${product.productId.producerId}`);
  //             setProducerInfo(response.data);
  //             // console.log(producerInfo.verification.producerAddress.city)
  //           }
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Error fetching producer information:', error);
  //     }
  //   };
  //   fetchProducerInfo();
  // }, [orders]);

  const renderOrderItem = ({ item }) => {
    return (
      <TouchableOpacity style={styles.order}>
        <Text style={styles.orderText}>Total Price: {item.totalPrice} ₺</Text>
        <Text style={styles.orderText}>Order Date: {item.orderDate}</Text>
        <Text style={styles.orderText}>Status: {item.status}</Text>
        <Text style={styles.orderText}>Offer: {item.offer}</Text>
      
        {item.products.map((product, index) => (
          <View key={`${product.productId}-${index}`}>
          <Text style={styles.orderText}>Ürün adı: {product.productId.name}</Text>
          <Image source={{ uri: product.productId.images[0] }} style={{ width: 100, height: 100}} />
            <Text style={styles.orderText}>Quantity: {product.quantity}</Text>
            <Text style={styles.orderText}>Price: {product.price}</Text>
            <Text style={styles.orderText}>Producer Id: {product.productId.producerId}</Text>
          </View>
        ))}

        {item.offer > 0 && ( // Teklif 0'dan büyükse, kabul et ve reddet butonlarını göster
        <View>
          <TouchableOpacity style={styles.button} onPress={() => handleAcceptOffer(item._id)}>
            <Text style={{ color: 'green' }}>Kabul Et</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleRejectOffer(item._id)}>
            <Text style={{ color: 'red' }}>Reddet</Text>
          </TouchableOpacity>
        </View>
      )}
      </TouchableOpacity>
    );
  };

  const renderSingleOrderItem = ({ item }) => {
    return (
      <TouchableOpacity style={styles.order} onPress={() => handleSingleOrderPress(item)}>
        <Text style={styles.orderText}>Total Price: {item.totalPrice} ₺</Text>
        <Text style={styles.orderText}>Order Date: {item.orderDate}</Text>
        <Text style={styles.orderText}>Status: {item.status}</Text>
      </TouchableOpacity>
    );
  };

  const renderOrderDetails = (orderDetails) => {
    return orderDetails.map((orderDetail, index) => {
      const orderData = orderDetail.data;
      return (
        <View key={index} style={styles.orderDetail}>
          <Text style={styles.orderDetailText}>Order ID: {orderData._id}</Text>
          <Text style={styles.orderDetailText}>Total Price: {orderData.totalPrice} ₺</Text>
          <Text style={styles.orderDetailText}>Order Date: {orderData.orderDate}</Text>
          <Text style={styles.orderDetailText}>Status: {orderData.status}</Text>
          <Text style={styles.orderDetailText}>From: {orderData.from}</Text>
          <Text style={styles.orderDetailText}>To: {orderData.to}</Text>
          <Text style={styles.orderDetailText}>Products:</Text>
          {orderData.products.map((product, productIndex) => (
            <View key={productIndex} style={styles.productDetail}>
              <Image source={{ uri: product.productId.images[0] }} style={styles.productImage} />
              <Text style={styles.productDetailText}>Ürün Adı: {product.productId.name}</Text>
              <Text style={styles.productDetailText}>Miktar: {product.quantity}</Text>
              <Text style={styles.productDetailText}>Fiyat: {product.price}</Text>
            </View>
          ))}
        </View>
      );
    });
  };
  

  const handleSingleOrderPress = async (singleOrder) => {
    try {
      const orderDetails = await Promise.all(singleOrder.orderIds.map(orderId => axios.get(`http://localhost:8000/orders/${orderId.orderId}`)));
      console.log('Order details:', orderDetails);
      navigation.navigate('OrderDetails', { orderDetails: orderDetails });
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  // const renderSingleOrderItem = ({ item }) => {
  //   return (
  //     <TouchableOpacity style={styles.order} onPress={changeOrders}>
  //       <Text style={styles.orderText}>Total Price: {item.totalPrice} ₺</Text>
  //       <Text style={styles.orderText}>Order Date: {item.orderDate}</Text>
  //       <Text style={styles.orderText}>Status: {item.status}</Text>

  //       {item.orderIds.map((orderId, index) => (
  //         <View key={`${orderId.orderId}-${index}`}>
  //         <Text style={styles.orderText}>OrderId: {orderId.orderId}</Text>
  //         </View>
  //       ))}

  //       {item.products.map((product, index) => (
  //         <View key={`${product.productId}-${index}`}>
  //         <Image source={{ uri: product.productId.images[0] }} style={{ width: 100, height: 100}} />
  //         </View>
  //       ))}
  //     </TouchableOpacity>
  //   );
  // };

  const handleAcceptOffer = async (orderId) => {
    const isOfferAccept = true;
    try {
        const response = await axios.put(`http://localhost:8000/orders/update/isOfferAccept/${orderId}`, { isOfferAccept });
        console.log('Offer updated successfully:', response.data);
      } catch (error) {
      console.error('Error updating offer:', error);
    }
  };

  const changeOrders = () => {

  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Siparişlerim</Text>
      {singleOrders.length === 0 ? (
        <Text style={styles.noOrders}>Henüz sipariş vermemişsiniz.</Text>
      ) : (
        <>
        <FlatList
          data={singleOrders}
          renderItem={renderSingleOrderItem}
          keyExtractor={item => item._id.toString()}
        />
        </>
        
      )}
    </View>
  );
};
  
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Siparişlerim</Text>
//       {orders.length === 0 ? (
//         <Text style={styles.noOrders}>Henüz sipariş vermemişsiniz.</Text>
//       ) : (
//         <>
//         {/* <FlatList
//           data={orders}
//           renderItem={renderOrderItem}
//           keyExtractor={item => item._id.toString()}
//         /> */}
//         <FlatList
//           data={singleOrders}
//           renderItem={renderSingleOrderItem}
//           keyExtractor={item => item._id.toString()}
//         />
//         </>
//       )}
//     </View>
//   );
// };

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

export default Orders;
