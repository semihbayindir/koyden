import {
    StyleSheet,
    Text,
    View,
    TextInput,
    KeyboardAvoidingView,
    Pressable,
    Alert,
    ScrollView,
  } from "react-native";
  import React, { useEffect, useState } from "react";
  import { useNavigation } from "@react-navigation/native";
  import axios from "axios";
  import * as WebBrowser from "expo-web-browser"
  import * as Google from "expo-auth-session/providers/google"
  import AsyncStorage from "@react-native-async-storage/async-storage";
  import { Button } from "react-native";
  import FontAwesome from '@expo/vector-icons/FontAwesome';

  WebBrowser.maybeCompleteAuthSession();

  const RegisterScreen = () => {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    
    const [userInfo, setUserInfo] = useState(null);
    const [token, setToken] = useState("");

    const [reques, response, promptAsync] = Google.useAuthRequest({
      androidClientId: '808671565379-2s13c97dij89bi4n0pjgf8hgbvbihp1u.apps.googleusercontent.com',
      iosClientId: '808671565379-034ci5u15jfuqg096ujp3mb9d0h86erv.apps.googleusercontent.com',
      webClientId: '808671565379-h5p3pglt3dq4pdehpv8nde2c60se9hia.apps.googleusercontent.com',
    })

      useEffect(() => {
      handleSignWithGoogle();
    }, [response]);
  
    async function handleSignWithGoogle() {
      const user = await AsyncStorage.getItem("@user");
      if (!user) {
        if (response?.type === "success") {
          getUserInfo(response.authentication.accessToken);
        }
      } else {
        setUserInfo(JSON.parse(user));
      }
    }
  
    // const getLocalUser = async () => {
    //   const data = await AsyncStorage.getItem("@user");
    //   if (!data) return null;
    //   return JSON.parse(data);
    // };

    const getUserInfo = async (token) => {
      if (!token) return;
      try {
        const response = await fetch(
          "https://www.googleapis.com/userinfo/v2/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
  
        const user = await response.json();
        await AsyncStorage.setItem("@user", JSON.stringify(user));
        setUserInfo(user);
      } catch (error) {
        // Add your own error handler here
      }
    };

    const navigation = useNavigation();
    const handleRegister = () => {
      const user = {
        name: name,
        email: email,
        password: password,
        surname: surname,
        phone: phone,
      };
  
      // send a POST  request to the backend API to register the user
      axios
        .post("http://localhost:8000/register", user)
        .then((response) => {
          console.log(response);
          Alert.alert(
            "Registration successful",
            "You have been registered Successfully"
          );
          setName("");
          setEmail("");
          setPassword("");
       
        })
        .catch((error) => {
          Alert.alert(
            "Registration Error",
            "An error occurred while registering"
          );
          console.log("registration failed", error);
        });
    };
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "white",
          padding: 10,
          alignItems: "center",
        }}
      >
        <KeyboardAvoidingView>
          <ScrollView showsVerticalScrollIndicator={false}>
          <View
            style={{
              marginTop: 45,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#304D30", fontSize: 25, fontWeight: "600" }}>
              YENİ ÜYELİK
            </Text>
  
            <Text style={{ fontSize: 17, fontWeight: "600", marginTop: 7 }}>
              Bir üyelik oluştur
            </Text>
          </View>
  
          <View style={{ marginTop: 20 }}>
            <View style={{ marginTop: 10 }}>
              <Text style={{ fontSize: 18, fontWeight: "600", color: "black" }}>
                Ad
              </Text>
  
              <TextInput
                value={name}
                onChangeText={(text) => setName(text)}
                style={{
                  fontSize: email ? 18 : 18,
                  borderColor:"black",
                  borderRadius:5,
                  padding:12,
                  borderWidth:1, borderColor:"black",
                  borderRadius:5,
                  padding:12,
                  borderWidth:1,
                  marginVertical: 10,
                  width: 300,
                }}
                placeholderTextColor={"gray"}
                
              />
            </View>

            <View>
              <Text style={{ fontSize: 18, fontWeight: "600", color: "black" }}>
                Soyadı
              </Text>
  
              <TextInput
                value={surname}
                onChangeText={(text) => setSurname(text)}
                style={{
                  fontSize: email ? 18 : 18,
                  borderColor:"black",
                  borderRadius:5,
                  padding:12,
                  borderWidth:1,
                  marginVertical: 10,
                  width: 300,
                }}
                placeholderTextColor={"gray"}
              
              />
            </View>
  
            <View>
              <Text style={{ fontSize: 18, fontWeight: "600", color: "black" }}>
                Email
              </Text>
  
              <TextInput
                value={email}
                onChangeText={(text) => setEmail(text)}
                style={{
                  fontSize: email ? 18 : 18,
                  borderBottomColor: "gray",
                  borderColor:"black",
                  borderRadius:5,
                  padding:12,
                  borderWidth:1,
                  marginVertical:10,
                  width: 300,
                }}
                placeholderTextColor={"gray"}
            
              />
            </View>

            <View>
              <Text style={{ fontSize: 18, fontWeight: "600", color: "black" }}>
                Telefon
              </Text>
  
              <TextInput
                value={phone}
                onChangeText={(text) => setPhone(text)}
                style={{
                  fontSize: email ? 18 : 18,
                  borderColor:"black",
                  borderRadius:5,
                  padding:12,
                  borderWidth:1,
                  marginVertical: 10,
                  width: 300,
                }}
                placeholderTextColor={"gray"}
      
              />
            </View>
  
            <View style={{ marginTop: 10 }}>
              <Text style={{ fontSize: 18, fontWeight: "600", color: "black" }}>
                Şifre
              </Text>
  
              <TextInput
                value={password}
                onChangeText={(text) => setPassword(text)}
                secureTextEntry={true}
                style={{
                  fontSize: email ? 18 : 18,
                  borderColor:"black",
                  borderRadius:5,
                  padding:12,
                  borderWidth:1,
                  marginVertical: 10,
                  width: 300,
                }}
                placeholderTextColor={"gray"}
               
              />
            </View>
  
            <Pressable
              onPress={handleRegister}
              style={{
                width: 200,
                backgroundColor: "#304D30",
                padding: 15,
                marginTop: 20,
                marginLeft: "auto",
                marginRight: "auto",
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Kayıt Ol
              </Text>
            </Pressable>
  
            <Pressable
              onPress={() => navigation.goBack()}
              style={{ marginTop: 5 }}
            >
              <Text style={{ textAlign: "center", color: "gray", fontSize: 16}}>
                Bir hesabın var mı? Giriş Yap
              </Text>
            </Pressable>
            {/* <Text>{JSON.stringify(userInfo,null,2)}</Text> */}
            <Pressable style={{marginTop:15}}>

  <FontAwesome.Button name="google" onPress={() => promptAsync({ redirectUri: 'http://localhost:8081' })}
  style={{
    padding: 10,
    marginBottom: 5,
    borderRadius: 6,
    textAlign:'center',
    justifyContent:'center',
  }}>
        Google ile Giriş Yap
      </FontAwesome.Button>


</Pressable>
          </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  };
  
  export default RegisterScreen;
  
  const styles = StyleSheet.create({});