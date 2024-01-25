import LottieView from "lottie-react-native"
import { StyleSheet, View } from "react-native"



const Loading =()=>{
    return(
        <View>
            <LottieView
                autoPlay
                style={{
                    width:300,
                    height:300,
                }}
                source={require('../assets/loading/Animation - 1706197142779.json')}
            />
        </View>

    )
}

const styles = StyleSheet.create({
    container:{
        height:'90%',
        justifyContent:'center',
        alignItems:'center',
    }
})
export default Loading();