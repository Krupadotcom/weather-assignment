require("dotenv").config();
const axios = require("axios");
const fs = require("fs");

const API_KEY = process.env.API_KEY;

let orders = JSON.parse(fs.readFileSync("orders.json", "utf-8"));

async function getWeather(city) {
  try {
    const res = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`
    );
    return res.data.weather[0].main;
  } catch (err) {
    console.log(`❌ Error fetching weather for ${city}`);
    return null;
  }
}

function generateApology(name, city, weather) {
  return `Hi ${name}, your order to ${city} is delayed due to ${weather}. We appreciate your patience!`;
}

async function processOrders() {
  const promises = orders.map(async (order) => {
    const weather = await getWeather(order.city);

    if (!weather) return order;

    if (["Rain", "Snow", "Extreme"].includes(weather)) {
      order.status = "Delayed";

      const firstName = order.customer.split(" ")[0];

      const message = generateApology(firstName, order.city, weather);
      console.log("📢", message);
    }

    return order;
  });

  const updatedOrders = await Promise.all(promises);

  fs.writeFileSync(
    "orders_updated.json",
    JSON.stringify(updatedOrders, null, 2)
  );

  console.log("✅ Orders processed successfully!");
}

processOrders();