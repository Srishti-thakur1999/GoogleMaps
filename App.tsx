import React, {Component} from 'react';
import {View, Text, PermissionsAndroid} from 'react-native';

import MapScreen from './src/Mapscreen';
class App extends Component {
  render() {
    return (
      <View style={{flex:1}}>
        <MapScreen />
      </View>
    );
  }
}
export default App;
