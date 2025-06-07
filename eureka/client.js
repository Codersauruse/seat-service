// eureka/client.js
const axios = require("axios");
require("dotenv").config();

const { PORT, EUREKA_HOST } = process.env;
const APP_NAME = "seat-service";
const INSTANCE_ID = "seat-service-8084";

// Get the actual hostname/IP for containerized environments
const getHostname = () => {
  // In Docker, you might want to use the container's IP or hostname
  return process.env.HOSTNAME || process.env.HOST || "localhost";
};

const getIpAddress = () => {
  // In Docker, you might want to get the actual container IP
  const os = require("os");
  const networkInterfaces = os.networkInterfaces();

  // Try to get the first non-loopback IPv4 address
  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const iface of interfaces) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }

  return "127.0.0.1"; // fallback
};

const instance = {
  instance: {
    instanceId: INSTANCE_ID,
    hostName: getHostname(),
    app: "SEAT_SERVICE",
    ipAddr: getIpAddress(),
    status: "UP",
    port: { $: parseInt(PORT), "@enabled": true },
    vipAddress: APP_NAME,
    dataCenterInfo: {
      "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
      name: "MyOwn",
    },
    healthCheckUrl: `http://${getHostname()}:${PORT}/health`,
    statusPageUrl: `http://${getHostname()}:${PORT}/info`,
  },
};

const register = async () => {
  try {
    await axios.post(`${EUREKA_HOST}/apps/${APP_NAME}`, instance);
    console.log("Registered with Eureka");
  } catch (err) {
    console.error(" Registration failed:", err.message);
  }
};

const heartbeat = () => {
  setInterval(async () => {
    try {
      await axios.put(`${EUREKA_HOST}/apps/${APP_NAME}/${INSTANCE_ID}`);
      console.log("Heartbeat sent");
    } catch (err) {
      console.error(" Heartbeat failed:", err.message);
    }
  }, 30000);
};

const deregister = async () => {
  try {
    await axios.delete(`${EUREKA_HOST}/apps/${APP_NAME}/${INSTANCE_ID}`);
    console.log("Deregistered from Eureka");
    process.exit();
  } catch (err) {
    console.error(" Deregister failed:", err.message);
    process.exit(1);
  }
};

process.on("SIGINT", deregister);
process.on("SIGTERM", deregister);

module.exports = async function startEureka() {
  await register();
  heartbeat();
};
