const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'google',
  apiKey: 'AIzaSyCAa8ZgPpTBMcCV7lrNJXvE70JoRs9Wl8I', // for Mapquest, OpenCage, Google Premier
  formatter: null // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);