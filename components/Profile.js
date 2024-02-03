import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode as atob } from 'base-64';


const Profile = () => {
  
    const [userId,setUserId] = useState('');
    // const userIdNew = '6581ada8c6efa70eab90197b'
  
    const [userInfo, setUserInfo] = useState(null);
  
    const base64UrlDecode = (input) => {
        const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(base64);
      return JSON.parse(decoded);
      };
    
      useEffect(() => {
          const fetchUsers = async () => {
              try{
                const token = await AsyncStorage.getItem('authToken');   
                console.log(token)
                if (token !== null){
                  const [header, payload, signature] = token.split('.');
                  const decodedHeader = base64UrlDecode(header);
                  const decodedPayload = base64UrlDecode(payload);
                  setUserId(decodedPayload.userId)

                  console.log('Decoded Header:', decodedHeader);
                  console.log('Decoded Payload:', decodedPayload);
                  console.log('Signature:', signature);
                        }        
              }catch (error) {
                console.error('Token alınamadı veya decode edilemedi:', error);
              }
            }
          fetchUsers();
      },[]);

      useEffect(() => {
        // Fetch user information from the server
        const fetchUserInfo = async () => {
          try {
            const response = await axios.get(`http://localhost:8000/api/users/${userId}`);
            const userData = response.data;
            setUserInfo(userData);
          } catch (error) {
            console.error('Error fetching user information:', error);
          }
        };
    
        fetchUserInfo();
    }, [userId]);
  
    const signOut = () => {
      // Çıkış işlemlerini gerçekleştir
      console.log('Sign out logic');
    };
  
    return (
      <View style={styles.container}>
        <View style={styles.profileHeader}>
          {/* <Image style={styles.avatar} source={{ uri: userInfo?.avatarUrl || 'default_avatar_url' }} /> */}
          <Text style={styles.username}>{userInfo?.name + userInfo?.password || 'Guest'}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text>Email: {userInfo?.email || 'N/A'}</Text>
          {/* Diğer kullanıcı bilgilerini ihtiyaca göre ekleyin */}
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

  export default Profile;