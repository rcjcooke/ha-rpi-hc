// HomeKit dependencies
var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
// Raspberry Pi GPIO access dependencies
var gpio = require('rpi-gpio');

/** ************************ **/
/** Hardware interface       **/
/** ************************ **/
var HEATER = {
  powerOn: false,
  gpioPin: 0,
  initialise: function(pinNum) {
    console.log("Initialising Raspbery PI Heater HomeKit Interface");
    // Set up the pin numbering format we're going to use
    gpio.setMode(gpio.MODE_RPI);
    // Set up the GPIO pin
    HEATER.gpioPin = pinNum;
    gpio.setup(HEATER.gpioPin, gpio.DIR_OUT);
    // Make sure it's off to start off with
    HEATER.setPowerOn(false);
  }
  setPowerOn: function(on) {
    console.log("Turning the heater %s", on ? "on" : "off");
    gpio.write(HEATER.gpioPin, on, function(err) {
      if (err) throw err;
    });
    HEATER.powerOn = on;
  }
  identify: function() {
    // Identify the garage heater this device is referring to - switch it on and off 3 times
    console.log("Identifying heater - on/off 1 second 3 times");
    for (i = 0; i < 6; i++) {
      setTimeout(setPowerOn(!HEATER.powerOn), 1000);
    }
  }
};

/** ************************ **/
/** HomeKit Service Setup    **/
/** ************************ **/
// Initialise the hardware
var pinArg = process.argv[2];
if isNaN(pinArg) {
  console.error("Expected usage: node Core.js <heater Raspberry Pi GPIO pin number>");
  return new Error("Invalid pin number specified: %s", pinArg);
}
HEATER.initialise(pinArg);
// Create the heater identifier
var heaterUUID = uuid.generate('hap-nodejs:accessories:'+'Heater');
// Create the accessory
var heater = exports.accessory = new Accessory('Heater', garageUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
heater.username = "heaterUser"; //edit this if you use Core.js
heater.pincode = "010808";

// Set up some characteristics
heater
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "rcjcooke")
  .setCharacteristic(Characteristic.Model, "1");

/** ************************ **/
/** HomeKit Events           **/
/** ************************ **/
// Note: Complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`

// Listen for the identify event
heater.on('identify', function(paired, callback) {
  HEATER.identify();
  callback();
});

// Turn the heater on/off
heater
  .addService(Service.Switch, "Heater")
  .getCharacteristic(Characteristic.On)
  .on('set', function(value, callback) {
    HEATER.setPowerOn(value);
    callback();
});

// Find out whether the heater is on or not
heater
  .addService(Service.Switch, "Heater")
  .getCharacteristic(Characteristic.On)
  .on('get', function(callback) {
    // Find out whether the heater is turned on or not
    console.log("Heating on or off? %s", HEATER.powerOn ? "on" : "off");
    var err = null; // In case there were any problems
    callback(err, HEATER.powerOn);
});
