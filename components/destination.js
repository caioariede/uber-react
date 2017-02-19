import React from 'react'

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableHighlight,
  InteractionManager,
} from 'react-native'

import MapView, { Marker } from 'react-native-maps'
import MapMixin from '../mixins/map'
import { randomPosition } from '../util'
import styles from '../styles'

// Load configs from .env file
import {
  mapBoxAccessToken,
} from 'react-native-dotenv'

const polyline = require('polyline')

// Images
const markerIcon = require('../assets/img/marker.png')
const redDotIcon = require('../assets/img/dot-red.png')


export default class SetDestination extends MapMixin {
  constructor(props) {
    super(props)

    this.onSubmit = this._onSubmit.bind(this)
    this.onDragEnd = this._onDragEnd.bind(this)
    this.onRenderMap = this._onRenderMap.bind(this)

    this.state.pickupPosition = props.pickupPosition
    this.state.passengerPosition = props.passengerPosition
    this.state.destinationPosition = randomPosition(props.passengerPosition, 500)

    this.state.nearestDriver = null
    this.state.nearestDriverRadius = []

    this.state.route = null
  }

  buildLngLat(position) {
    return `${position.longitude},${position.latitude}`
  }

  buildMapBoxUrl(mode, origin, destination, accessToken) {
    return `https://api.mapbox.com/directions/v5/mapbox/${mode}/${origin};${destination}.json?access_token=${accessToken}&steps=true&overview=full&geometries=polyline`
  }

  getCoordinates(json) {
    let route = []

    if (json.routes.length > 0) {
      json.routes[0].legs.forEach(legs => {
        legs.steps.forEach(step => {
          polyline.decode(step.geometry).forEach(coord => route.push(coord))
        })
      })
    }

    return route.map(l => ({latitude: l[0], longitude: l[1]}))
  }

  calculateRoute() {
    const mode = 'driving'
    const origin = this.buildLngLat(this.state.pickupPosition)
    const destination = this.buildLngLat(this.state.destinationPosition)
    const accessToken = mapBoxAccessToken
    const url = this.buildMapBoxUrl(mode, origin, destination, accessToken)

    fetch(url).then(response => response.json()).then(json => {
      this.setState({route: this.getCoordinates(json)})
    }).catch(e => {
      console.warn(e)
    })
  }

  queryDrivers() {
    let radius = 0.1 // 100m
    let currentLocation = [
      this.state.passengerPosition.latitude,
      this.state.passengerPosition.longitude,
    ]

    let driversFound = {}

    let geoQuery = this.geoFire.query({center: currentLocation, radius})

    geoQuery.on('key_entered', (key, location, distance) => {
      if (/driver:/.test(key)) {
        driversFound[key] = {key, location, distance}
      }
    })

    let timeout = null

    geoQuery.on('ready', _ => {
      // update circle
      this.state.nearestDriverRadius.push(geoQuery.radius())
      this.setState({nearestDriverRadius: this.state.nearestDriverRadius})

      // clear previous timeout
      clearTimeout(timeout)

      timeout = setTimeout(_ => {
        if (Object.keys(driversFound).length === 0) {
          radius += 0.1
          geoQuery.updateCriteria({radius})
        } else {
          clearTimeout(timeout)
          // find nearest
          let minDistance = -1, nearestDriver = null

          Object.keys(driversFound).forEach(key => {
            const driver = driversFound[key]

            if (driver.distance < minDistance || minDistance === -1)
              minDistance = driver.distance, nearestDriver = driver
          })

          const nearestDriverKey = nearestDriver.key.split(':')[1]

          this.state.drivers.forEach(driver => {
            if (driver.id === nearestDriverKey) {
              this.setState({nearestDriver: driver})
            }
          })
        }
      }, 2000)
    })
  }

  _onSubmit(e) {
    this.queryDrivers()
  }

  _onDragEnd(e) {
    this.setState({destinationPosition: e.nativeEvent.coordinate, coords: null})
    this.updateAddress()

    InteractionManager.runAfterInteractions(_ => {
      this.calculateRoute()
    })
  }

  _onRenderMap() {
    InteractionManager.runAfterInteractions(_ => {
      setTimeout(_ => {
        this.onChangePosition(this.state.passengerPosition)
      }, 1000)
    })
  }

  renderNearestDriver() {
    if (this.state.nearestDriver === null)
      return

    return <Marker draggable image={redDotIcon} 
                   coordinate={this.state.nearestDriver.position} />
  }

  renderNearestDriverRadius() {
    return this.state.nearestDriverRadius.map((radius, i) => {
      return <MapView.Circle center={this.state.passengerPosition}
                             radius={radius * 1000}
                             key={`circle-radius-${i}`} />
    })
  }

  renderDestinationPosition() {
    const coordinate = this.state.destinationPosition

    return <Marker draggable image={markerIcon} 
                   coordinate={coordinate}
                   centerOffset={{x: 0, y: -33}}
                   onDragEnd={this.onDragEnd}
                   style={{paddingBottom: 100}} />
  }

  renderRoute() {
    if (this.state.route !== null) {
      return (
        <MapView.Polyline
            coordinates={[this.state.pickupPosition,
                          ...this.state.route,
                          this.state.destinationPosition]}
            strokeWidth={4}
        />
      )
    }
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
          <Text style={styles.setPickupButton}>Set destination</Text>
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
                 onPress={this.onDragEnd}
                 onLayout={this.onRenderMap}>

          {this.renderPassengerPosition()}
          {/*this.renderPickupPosition()*/}
          {this.renderDestinationPosition()}
          {this.renderNearestDriver()}
          {this.renderNearestDriverRadius()}
          {this.renderDrivers()}
          {this.renderRoute()}

        </MapView>

        {this.renderSearchBar()}
      </View>
    )
  }
}
