import React, { Component } from 'react';
import { View, StyleSheet, PermissionsAndroid } from 'react-native';
import { WebView } from 'react-native-webview';

class MapScreen extends Component {
  componentDidMount() {
    // Request permission to access location
    this.requestLocationPermission();
  }

  requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // Permission granted, send message to web page to start tracking location
        this.webview.postMessage('startLocationTracking');
      } else {
        console.log('Location permission denied');
      }
    } catch (error) {
      console.log('Error requesting location permission:', error);
    }
  };

  handleMessage = (event) => {
    const message = event.nativeEvent.data;
    // Handle messages received from web page
    if (message === 'locationUpdated') {
      // Location updated, perform necessary actions
      // For example, you can access the location coordinates using event.nativeEvent object
      const { latitude, longitude } = event.nativeEvent;
      console.log('Current location:', latitude, longitude);
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <WebView
          ref={(ref) => (this.webview = ref)}
          source={{ uri: 'https://www.openstreetmap.org' }}
          style={styles.map}
          onMessage={this.handleMessage}
          injectedJavaScript={`
            // Injected JavaScript code in the web page
            window.addEventListener('message', function(event) {
              if (event.data === 'startLocationTracking') {
                // Start tracking location
                navigator.geolocation.watchPosition(
                  function(position) {
                    // Send location updates back to React Native
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'locationUpdated',
                      latitude: position.coords.latitude,
                      longitude: position.coords.longitude
                    }));
                  },
                  function(error) {
                    console.log('Error getting location:', error);
                  },
                  { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
                );
              }
            });

            // Add marker for current location
            function addMarker(latitude, longitude) {
              var marker = L.marker([latitude, longitude]).addTo(map);
              marker.bindPopup('You are here').openPopup();
            }

            // Create the map instance
            var map = L.map('map').setView([0, 0], 2);

            // Add the tile layer (OpenStreetMap)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            // Listen for location updates from React Native
            window.addEventListener('message', function(event) {
              var data = JSON.parse(event.data);
              if (data.type === 'locationUpdated') {
                // Update the map with the current location
                var latitude = data.latitude;
                var longitude = data.longitude;
                map.setView([latitude, longitude], 16);
                addMarker(latitude, longitude);
              }
            });
          `}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default MapScreen;
