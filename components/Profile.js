import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode as atob } from 'base-64';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';


const Profile = () => {
    const navigation = useNavigation();
    const [userId, setUserId] = useState('');
    const [userInfo, setUserInfo] = useState(null);
    const [userImage, setUserImage] = useState();

    const base64UrlDecode = (input) => {
        const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = atob(base64);
        return JSON.parse(decoded);
    };

    const handleImagePick = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (permissionResult.granted === false) {
                alert('Permission to access gallery is required!');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.cancelled) {
                // Fotoğrafı yükleme işlemi
                handleAddProfileImage(result.uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
        }
    };

    const handleAddProfileImage = async (uri) => {
        try {
            // AWS S3'ye fotoğrafı yükleme
            const formData = new FormData();
            // Tarih ve saat bilgisini kullanarak dosya adını oluştur
            const timestamp = new Date().toISOString().replace(/:/g, '_');
            const fileName = `profile_image_${timestamp}.jpg`;

            formData.append('image', {
                name: fileName,
                type: 'image/jpg',
                uri: uri,
            });

            const s3Response = await axios.post('http://localhost:8000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const imageUrl = s3Response.data.imageUrl;

            // Veritabanına fotoğraf URL'sini kaydetme
            await axios.put(`http://localhost:8000/users/${userId}/image`, { image: imageUrl });

            // Kullanıcının profil fotoğrafını güncelleme
            setUserImage(imageUrl);
        } catch (error) {
            console.error('Error adding profile image:', error);
        }
    };


    const handleImagePress = () => {
      if (userImage) {
          // Profil fotoğrafını kaldırma işlemi
          setUserImage(null);
      } else {
          // Profil fotoğrafını değiştirme işlemi
          handleImagePick();
      }
  };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = await AsyncStorage.getItem('authToken');
                if (token !== null) {
                    const [header, payload, signature] = token.split('.');
                    const decodedPayload = base64UrlDecode(payload);
                    setUserId(decodedPayload.userId);
                }
            } catch (error) {
                console.error('Token alınamadı veya decode edilemedi:', error);
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        if (userId) {
            const fetchUserInfo = async () => {
                try {
                    const response = await axios.get(`http://localhost:8000/api/users/${userId}`);
                    const userData = response.data;
                    setUserInfo(userData);
                    setUserImage(userData.image)
                } catch (error) {
                    console.error('Error fetching user information:', error);
                }
            };

            fetchUserInfo();
        }
    }, [userId]);

    const signOut = async () => {
        try {
            await AsyncStorage.removeItem('authToken');
            console.log('Çıkış işlemi başarılı.');
            navigation.navigate('Login');
        } catch (error) {
            console.error('Çıkış işlemi sırasında bir hata oluştu:', error);
        }
    };

    return (
        <View>
            <View>
              <TouchableOpacity style={{ marginHorizontal: '32%' }} onPress={handleImagePress}>
                  {userImage ? (
                      <Image source={{ uri: userImage }} style={styles.avatar} />
                  ) : (
                      <MaterialCommunityIcons name='account-circle' color='#729c44' size={150} style={{ alignSelf: 'center', marginTop: 30 }} />
                  )}
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 26, fontWeight: 'bold', padding: 10, textAlign: 'center' }}>{userInfo?.name + " " + userInfo?.surname || 'Guest'}</Text>
            <View style={styles.profileHeader}>
                <Text style={styles.username}>{userInfo?.verification?.producerAddress?.city + " " + userInfo?.verification?.producerAddress?.district || 'Guest'}</Text>
                <Text style={styles.username}>{userInfo?.verification?.description || 'Guest'}</Text>
                <Text style={styles.username}>{"account no : " + userInfo?.verification?.paymentInfo?.accountNumber || 'Guest'}</Text>
                <Text style={styles.username}>{"iban : " + userInfo?.verification?.paymentInfo?.iban || 'Guest'}</Text>
                <Text style={styles.username}>Email: {userInfo?.email || 'N/A'}</Text>
            </View>
            <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
                <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileHeader: {
        margin: 15,
    },
    avatar: {
        width: 150,
        height: 150,
        margin:30,
        borderRadius: 75,
        marginBottom: 10,
        alignSelf: 'center',
    },
    username: {
        fontSize: 20,
        fontWeight: 'bold',
        
        padding: 10,
    },
    signOutButton: {
        marginTop: 20,
        backgroundColor: '#FF0000',
        padding: 10,
        borderRadius: 5,
        marginHorizontal: '30%',
    },
    signOutText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
    },
});

export default Profile;
