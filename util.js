export function randomPosition(position, meters=50) {
  var r = meters/111300 // = 100 meters
    , y0 = position.latitude
    , x0 = position.longitude
    , u = Math.random()
    , v = Math.random()
    , w = r * Math.sqrt(u)
    , t = 2 * Math.PI * v
    , x = w * Math.cos(t)
    , y1 = w * Math.sin(t)
    , x1 = x / Math.cos(y0)

  return {
    latitude: y0 + y1,
    longitude: x0 + x1,
  }
}
