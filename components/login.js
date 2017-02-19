import React, { Component } from 'react'
import * as firebase from 'firebase'
import styles from '../styles'

import {
  StyleSheet,
  TouchableHighlight,
  Text,
  Image,
  View,
} from 'react-native'

const FBSDK = require('react-native-fbsdk')
const {
  LoginManager, AccessToken
} = FBSDK

// Images
const redDotIcon = require('../assets/img/dot-red.png')
const facebookLoginIcon = require('../assets/img/facebook-login.png')


export default class Login extends Component {
  state = {
    isLoading: false,
  }

  constructor(props) {
    super(props)

    this.onClick = this._onClick.bind(this)
  }

  componentDidMount() {
    //firebase.auth().signOut()
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.props.navigator.push({
          id: 'SetPickupPosition',
          title: 'Set pickup location',
        })
      }
    })
  }

  _onClick() {
    this.setState({isLoading: true})

    const auth = firebase.auth()
    const facebook = firebase.auth.FacebookAuthProvider

    LoginManager.logInWithReadPermissions(['public_profile']).then(res => {
      if (!res.isCancelled) {
        AccessToken.getCurrentAccessToken().then(tokenRes => {
          const credential = facebook.credential(tokenRes.accessToken)
          return auth.signInWithCredential(credential)
        }).catch(err => {
          this.setState({isLoading: false})
          console.log('login error: ' + err)
        })
      } else {
        this.setState({isLoading: false})
        console.log('login: user cancelled')
      }
    })
  }

  render() {
    const style = StyleSheet.flatten([styles.container, {
      padding: 20,
      alignItems: 'center',
      marginTop: 100,
    }])

    return <View style={style}>
      <TouchableHighlight onPress={this.onClick}>
        {this.state.isLoading ?
          <Text>Loading...</Text>
        :
          <Image source={facebookLoginIcon} style={{width:200, height: 80}}></Image>
        }
      </TouchableHighlight>
    </View>
  }
}
