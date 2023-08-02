import axios from 'axios'
export default{
    async generateToken(channelName, uid) {
        try {
            return await axios.get(
                `https://agora-rtm-rtc-tokens.onrender.com/tokens?channelName=${channelName}&uid=${uid}`,
                {
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );
        } catch (error) {
            return error
        }
       
      },
}