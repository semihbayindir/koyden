import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

const AllOrders = () => {
    const [orders, setOrders] = useState([]);
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('');
    const [citiesFrom, setFromCities] = useState([]);
    const [citiesTo, setToCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState('');

    useEffect(() => {
        axios.get(`http://localhost:8000/orders`)
            .then(response => {
                const fetchedOrders = response.data;
                setOrders(fetchedOrders);

                const ordersWithoutTransporter = fetchedOrders.filter(order => order.transportDetailsId === undefined);

                const cityFromSet = new Set(ordersWithoutTransporter.map(order => order.from));
                setFromCities(Array.from(cityFromSet));

                const cityToSet = new Set(ordersWithoutTransporter.map(order => order.to));
                setToCities(Array.from(cityToSet));
            })
            .catch(error => {
                console.error('Error fetching orders:', error);
            });
    }, []);

    const filterOrders = (orders, filter) => {
        switch (filter) {
            case 'city':
                return orders.filter(order => order.from === selectedCity || order.to === selectedCity);
            default:
                return orders;
        }
    };

    const filteredOrders = filterOrders(orders.filter(order => order.transportDetailsId === undefined || order.transportDetailsId === null ), selectedFilter);

    const renderOrderItem = ({ item }) => {
        return (
            <View>
                {item && (
                    <TouchableOpacity style={styles.order}>
                        <View>
                            <Text style={styles.orderText}>Sipariş Tarihi: {new Date(item.orderDate).toLocaleDateString("tr-TR")}</Text>
                            <Text style={styles.orderText}>Gönderen: {item.from}</Text>
                            <Text style={styles.orderText}>Alıcı: {item.to}</Text>
                            <Text style={styles.orderText}>Taşıma Ücreti: {Math.floor(item.adjustedTransportFee)} TL</Text>
                        </View>
                        {item.products.map((product, index) => (
                            <View style={{ flexDirection: 'row' }} key={`${product.productId}-${index}`}>
                                <View style={{ paddingVertical: 5 }}>
                                    <View style={{ borderWidth: 1, borderRadius: 15, borderColor: 'lightgrey', backgroundColor: 'white', padding: 5 }}>
                                        <Image style={styles.productImage} source={{ uri: product.productId.images[0] }} />
                                    </View>
                                </View>
                                <View style={{ marginLeft: 10 }}>
                                    <Text style={[styles.productDetailText, { fontSize: 22, fontWeight: '800', marginBottom: 10 }]}>{product.productId.name}</Text>
                                    <Text style={styles.orderText}>Ağırlık: {product.quantity} kg</Text>
                                </View>
                            </View>
                        ))}
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={styles.welcome}>
            <Text style={{ textAlign: 'left', fontWeight: '200', fontSize: 30, fontStyle: 'italic' }}>Hoşgeldin
                <Text style={{ textAlign: 'left', fontWeight: '800', fontSize: 30, fontStyle: 'normal' }}>  TAŞIYICI,</Text>
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5, marginBottom: 10 }}>
                <TouchableOpacity style={styles.buttons} onPress={() => navigation.navigate('TasiyiciOrders')}>
                    <Text style={{ fontSize: 20 }}>Siparişlerim</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.buttons, { flexDirection: 'row' }]} onPress={() => setModalVisible(true)}>
                    <Text style={styles.buttonText}>Filtrele</Text>
                    <MaterialCommunityIcons style={{ marginTop: 3, marginLeft: 3 }} name='filter-menu' size={20} color={'gray'}></MaterialCommunityIcons>
                </TouchableOpacity>
            </View>
            {filteredOrders.length > 0 ? (
                <FlatList
                    data={filteredOrders}
                    renderItem={renderOrderItem}
                    keyExtractor={item => item._id.toString()}
                />
            ) : (
                <View>
                    <Image style={{ height: 200, width: 200, alignSelf: 'center', marginTop: '40%' }} source={require('../assets/üretici/aa.png')} />
                </View>
            )}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Filtre Seçenekleri</Text>
                        <Picker
                            selectedValue={selectedFilter}
                            onValueChange={(itemValue) => setSelectedFilter(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Filtre Seçin" value="" />
                            <Picker.Item label="Nereden" value="city" />
                            <Picker.Item label="Nereye" value="destinationCity" />
                        </Picker>
                        {selectedFilter === 'city' && (
                            <Picker
                                selectedValue={selectedCity}
                                onValueChange={(itemValue) => setSelectedCity(itemValue)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Şehir Seçin" value="" />
                                {citiesFrom.map(city => (
                                    <Picker.Item key={city} label={city} value={city} />
                                ))}
                            </Picker>
                        )}
                        {selectedFilter === 'destinationCity' && (
                            <Picker
                                selectedValue={selectedCity}
                                onValueChange={(itemValue) => setSelectedCity(itemValue)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Şehir Seçin" value="" />
                                {citiesTo.map(city => (
                                    <Picker.Item key={city} label={city} value={city} />
                                ))}
                            </Picker>
                        )}
                        <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.modalButtonText}>Uygula</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    order: {
        borderRadius: 20,
        backgroundColor: '#f9fbe5',
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
    welcome: {
        flex: 1,
        marginTop: 15,
        marginHorizontal: 15
    },
    buttons: {
        marginHorizontal: 10,
        marginVertical: 10,
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
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 30,
        width: '80%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    picker: {
        width: '100%',
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: '#de510b',
        padding: 10,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    buttonText: {
      fontSize: 20,
    },
});
export default AllOrders;
