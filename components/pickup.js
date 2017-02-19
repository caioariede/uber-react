import React from 'react'

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableHighlight,
} from 'react-native'

import MapView from 'react-native-maps'
import MapMixin from '../mixins/map'
import * as firebase from 'firebase'
import styles from '../styles'


export default class SetPickupPosition extends MapMixin {
  constructor(props) {
    super(props)

    this.onSubmit = this._onSubmit.bind(this)
    this.onDragEnd = this._onDragEnd.bind(this)

    this.state.pickupPosition = null
  }

  writePickupPosition() {
    const pickupPosition = this.state.pickupPosition || this.state.passengerPosition

    firebase.database().ref('users/' + this.userId).update({pickupPosition})
  }

  _onSubmit(e) {
    this.writePickupPosition()

    this.props.navigator.push({
      id: 'SetDestination',
      title: 'Set destination',
      passProps: {
        passengerPosition: this.state.passengerPosition,
        pickupPosition: this.state.pickupPosition || this.state.passengerPosition,
      },
    })
  }

  _onDragEnd(e) {
    this.setState({pickupPosition: e.nativeEvent.coordinate})
    this.updateAddress()
  }

  renderSearchBar() {
    const searchBarStyle = StyleSheet.flatten([styles.searchBar, {
      top: this.layout.height - 120,
      width: this.layout.width - 30,
    }])

    return (
      <View style={searchBarStyle}>
        <TextInput
          style={styles.searchInput}
          onChangeText={(text) => this.setState({text})}
          value={this.state.address}
        />
        <TouchableHighlight onPress={this.onSubmit}>
          <Text style={styles.setPickupButton}>Set pickup location</Text>
        </TouchableHighlight>
      </View>
    )
  }

  render() {
    if (!this.state.isReady)
      return null
    
    return (
      <View style={styles.container}>
        <MapView style={styles.map} region={this.state.region}
                 onRegionChange={this.onRegionChange}
                 onPress={this.onDragEnd}>

          {this.renderPassengerPosition()}
          {this.renderPickupPosition()}
          {this.renderDrivers()}

        </MapView>

        {this.renderSearchBar()}
      </View>
    )
  }
}
