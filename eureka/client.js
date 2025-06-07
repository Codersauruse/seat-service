const axios = require("axios");
require("dotenv").config();
const Eureka = require("eureka-js-client").Eureka;

const { PORT, EUREKA_HOST } = process.env;
const APP_NAME = "SEAT_SERVICE";

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
const client = new Eureka({
  // application instance information
  instance: {
    app: APP_NAME,
    hostName: getHostname(),
    ipAddr: getIpAddress(),
    port: { $: parseInt(PORT), "@enabled": "true" },
    vipAddress: APP_NAME,
    dataCenterInfo: {
      "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
      name: "MyOwn",
    },
  },
  eureka: {
    host: EUREKA_HOST,
    port: 8761,
    servicePath: "/eureka/apps/",
    maxRetries: 50, // total attempts (default 0 = no retry)
    requestRetryDelay: 5000,
  },
});

// const instance = {
//   instance: {
//     instanceId: INSTANCE_ID,
//     hostName: getHostname(),
//     app: "SEAT_SERVICE",
//     ipAddr: getIpAddress(),
//     status: "UP",
//     port: { $: parseInt(PORT), "@enabled": true },
//     vipAddress: APP_NAME,
//     dataCenterInfo: {
//       "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
//       name: "MyOwn",
//     },
//     healthCheckUrl: `http://${getHostname()}:${PORT}/health`,
//     statusPageUrl: `http://${getHostname()}:${PORT}/info`,
//   },
// };

const register = async () => {
  try {
    await client.start();
    console.log("Registered with Eureka");
  } catch (err) {
    console.error(" Registration failed:", err.message);
  }
};

// const heartbeat = () => {
//   setInterval(async () => {
//     try {
//       await axios.put(`${EUREKA_HOST}/apps/${APP_NAME}/${INSTANCE_ID}`);
//       console.log("Heartbeat sent");
//     } catch (err) {
//       console.error(" Heartbeat failed:", err.message);
//     }
//   }, 30000);
// };

const deregister = async () => {
  try {
    await client.stop();
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
};
