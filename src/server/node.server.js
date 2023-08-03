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
      console.log(error);
    }
  },
  async addHost() {
    console.log(Store)
    try {
      const response = await axios.post(
        "https://livestream-backend-8mme.onrender.com/register",
        {
          flag: true,
          id: 1,
        }
      );
      console.log(response)
      var data = {
        id: response.data.id,
        flag: response.data.flag,
      };
      console.log(data)
     await Store.dispatch("setHostStatus", data);
    } catch (error) {
      console.log(error);
    }
  },
  async deleteHost() {
    try {
      await axios.delete(
        `https://livestream-backend-8mme.onrender.com/deleteStatus/${Store.state.hostStatus.id}`
      );
    } catch (error) {
      console.log(error);
    }
  },
  updateHost() {},
};

// .then((res) => {
//     console.log("HELLLLLLO");
//     var data = res.data[0];
//     console.log(data);

//     if (data) {
//       this.mongodb.id = data.id;
//       this.mongodb.flag = data.flag;
//       console.log(res.data[0]);
//     }
//   });
