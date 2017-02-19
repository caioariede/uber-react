import { StyleSheet } from 'react-native'


const styles = StyleSheet.create({
  navigator: {
    flex: 1,
    height: 100,
  },
  map: {
    flex: 1,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    position: 'relative',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'column',
    position: 'absolute',
    zIndex: 999,
    left: 15,
    height: 40,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    padding: 20,
    opacity: .9,
  },
  setPickupButton: {
    backgroundColor: 'black',
    color: 'white',
    padding: 10,
    marginTop: 2,
  },
})


export default styles
