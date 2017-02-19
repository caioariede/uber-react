import React, { Component } from 'react'
import * as firebase from 'firebase'

import {
  AppRegistry,
  View,
  Navigator,
} from 'react-native'

// Load configs from .env file
import {
  apiKey,
  authDomain,
  databaseURL,
  storageBucket,
  messagingSenderId,
  mapBoxAccessToken,
} from 'react-native-dotenv'

import Login from './components/login'
import SetPickupPosition from './components/pickup'
import SetDestination from './components/destination'
import styles from './styles'


export default class UberProject extends Component {
  state = {
    layout: null,
  }

  constructor(props) {
    super(props)

    firebase.initializeApp({apiKey, authDomain, databaseURL, storageBucket,
                            messagingSenderId})

    this.onLayout = this._onLayout.bind(this)
    this.renderScene = this._renderScene.bind(this)
  }

  _onLayout(e) {
    this.setState({layout: e.nativeEvent.layout})
  }

  _renderScene(route, navigator) {
    let props = {
      layout: this.state.layout,
      route,
      navigator,
    }

    Object.assign(props, route.passProps || {})

    switch (route.id) {
      case 'Login':
        return <Login {...props} />
      case 'SetPickupPosition':
        return <SetPickupPosition {...props} />
      case 'SetDestination':
        return <SetDestination {...props} />
    }
  }

  render() {
    return (
      <View onLayout={this.onLayout} style={{flex: 1}}>
        {this.state.layout ? 
          <Navigator
            initialRoute={{title: 'Login', id: 'Login'}}
            renderScene={this.renderScene}
            style={styles.navigator}
          />
          : null}
      </View>
    )
  }
}


AppRegistry.registerComponent('UberProject', () => UberProject)
