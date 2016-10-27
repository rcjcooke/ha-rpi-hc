FROM hypriot/rpi-node:latest
MAINTAINER rcjcooke

# Check to see if Raspbian needs updating, update it and cleanout the apt-get cache afterwards
# to keep image size down
RUN apt-get update && apt-get dist-upgrade && apt-get clean

# Install the wiring-pi Node.js module we need to be able to access GPIO from Node.js
RUN sudo npm install wiring-pi

# Retrieve and clone the latest version of the Node.js HomeKit Accessory Server
RUN cd \
      && git clone https://github.com/KhaosT/HAP-NodeJS

# Copy across our heater controller accessory definition
