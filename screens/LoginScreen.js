import {
    KeyboardAvoidingView,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
  } from "react-native";
  import React, { useState ,useEffect} from "react";
  import { useNavigation } from "@react-navigation/native";
  import axios from "axios";
  import AsyncStorage from "@react-native-async-storage/async-storage";

  const LoginScreen = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigation = useNavigation();
    useEffect(() => {
      const checkLoginStatus = async () => {
        try {
          const token = await AsyncStorage.getItem("authToken");
  
          if (token) {
            navigation.replace("Home");
          } else {
            // token not found , show the login screen itself
          }
        } catch (error) {
          console.log("error", error);
        }
      };
  
      checkLoginStatus();
    }, []);
    const handleLogin = () => {
      const user = {
        email: email,
        password: password,
      };
  
      axios
        .post("http://172.20.10.3:8000/login", user)
        .then((response) => {
          console.log(response);
          const token = response.data.token;
          AsyncStorage.setItem("authToken", token);
  
          navigation.replace("Home");
        })
        .catch((error) => {
          Alert.alert("Login Error", "Invalid email or password");
          console.log("Login Error", error);
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
          <View
            style={{
              marginTop: 100,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#304D30", fontSize: 17, fontWeight: "600" }}>
              TEKRAR
            </Text>  
            
            <Text style={{ color: "#304D30", fontSize: 28, fontWeight: "600" }} >Hoşgeldiniz</Text>
            <Text style={{ fontSize: 15, fontWeight: "600", marginTop: 15 }}>
              Hesabınıza giriş yapın
            </Text>
          </View>
  
          <View style={{ marginTop: 50 }}>
            <View>
              <Text style={{ fontSize: 18, fontWeight: "600", color: "gray" }}>
                Email
              </Text>
  
              <TextInput
                value={email}
                onChangeText={(text) => setEmail(text)}
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
              <Text style={{ fontSize: 18, fontWeight: "600", color: "gray" }}>
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
              onPress={handleLogin}
              style={{
                width: 200,
                backgroundColor: "#304D30",
                padding: 15,
                marginTop: 50,
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
                Giriş Yap
              </Text>
            </Pressable>
  
            <Pressable
              onPress={() => navigation.navigate("Register")}
              style={{ marginTop: 15 }}
            >
              <Text style={{ textAlign: "center", color: "gray", fontSize: 16 }}>
                Hesabın yok mu? Kayıt ol
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  };
  
  export default LoginScreen;
  
  const styles = StyleSheet.create({});