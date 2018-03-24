var Service, Characteristic;
const gpio = require('rpi-gpio');
gpio.setMode(gpio.MODE_BCM);
gpio.setup(26, gpio.DIR_HIGH);

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-centralfan", "CentralFan", CentralFan);
}

class CentralFan {

  constructor(log, config) {
    this.log = log;
    this.pin = config.pin
    this.fanState = false;
  }

  getServices() {
    let informationService = new Service.AccessoryInformation();
    informationService
      .setCharacteristic(Characteristic.Manufacturer, "David Jackman")
      .setCharacteristic(Characteristic.Model, "Central Fan")
      .setCharacteristic(Characteristic.SerialNumber, "000-000-001");
  
    let fanService = new Service.Fan("Central Fan");
    fanService
      .getCharacteristic(Characteristic.On)
        .on('get', this.getFanOnCharacteristic.bind(this))
        .on('set', this.setFanOnCharacteristic.bind(this));
    
    this.informationService = informationService;
    this.fanService = fanService;
    return [informationService, fanService];
  }

  getFanOnCharacteristic(next) {
    this.log("Current Fan State: ", !this.fanState);
    return next(null, !this.fanState);
  }
  
  setFanOnCharacteristic(state, next) {
    this.fanState = !state;
    this.log("This thing wants:", state);
    gpio.write(this.pin, this.fanState, function(err) {
        if (err) throw err;
        console.log('Written to pin');
    });
    return next(null);
  }
};
