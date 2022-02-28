import fetch from "cross-fetch";
import { IndyCar } from "../modules/services/indycar";

console.log('Starting service...');

const connectionService = {
  fetch: async (url) => {
    const response = await fetch(url);
    const text = await response.text();
    return text;
  }
};


const service = new IndyCar(console.log, console.log);
service.start(connectionService);
