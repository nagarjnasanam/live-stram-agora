import axios from "axios";
import Store from "../store/index.js";
export default {
  async getHostStatus() {
    try {
      const response = await axios.get(
        `https://livestream-backend-8mme.onrender.com/getStatus`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data[0]) {
        var data = {
          id: response.data[0].id,
          flag: response.data[0].flag,
        };
       Store.dispatch("setHostStatus", data);
      }
    } catch (error) {
        return error
    }
  },
  async addHost() {
    try {
      const response = await axios.post(
        "https://livestream-backend-8mme.onrender.com/register",
        {
          flag: true,
          id: 1,
        }
      );
      var data = {
        id: response.data.id,
        flag: response.data.flag,
      };
     await Store.dispatch("setHostStatus", data);
    } catch (error) {
        return error
    }
  },
  async deleteHost() {
    try {
      await axios.delete(
        `https://livestream-backend-8mme.onrender.com/deleteStatus/${Store.state.hostStatus.id}`
      );
    } catch (error) {
        return error
    }
  },
  updateHost() {},
};

