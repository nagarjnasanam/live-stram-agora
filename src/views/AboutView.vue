<template>
  <div class="about">
    <input placeholder="enter username" v-model="uid" />
    <button @click="initRtmInstance()">Sign In</button>
    

    <div v-if="isLoggedIn">
      <input
        @click="Host()"
        type="radio"
        id="host"
        name="joinAs"
        value="host"
      />
      <label>Host</label><br />
      <input
        @click="Audience()"
        type="radio"
        id="Audience"
        name="joinAs"
        value="audience"
      />
      <label>Audience</label><br />
      <button @click="Join()" type="button" id="join">Join</button>
      <button @click="Leave()" type="button" id="leave">Leave</button>
    </div>
    <div v-if="joined">
      <button @click="sendChannelMessage()">sendChannelMessage</button>
      <ul class="list-group">
        <li class="list-group-item" v-for="msg in messages" :key="msg">{{ msg.memberId }} : {{ msg.message.text }}</li>
      
      </ul>
    </div>
  </div>
</template>
<script>
import AgoraRTC from "agora-rtc-sdk-ng";
import AgoraRTM from "agora-rtm-sdk";
import axios from "axios";
const agoraEngine = AgoraRTC.createClient({ mode: "live", codec: "vp9" });

export default {
  data() {
    return {
      audience: "audience",
      joined: false,
      remotePlayerContainer: null,
      localPlayerContainer: null,
      options: {
        // Pass your App ID here.
        appId: "6fa37398a5be49d187db7c4f060d8530",
        // Set the channel name.
        channel: "cricket",
        // Pass your temp token here.
        token:
          "007eJxTYPhz3u7dx8XSUY8XaEVob77It83gva1Uu3TCr+jO1ybeZ40VGMzSEo3NjS0tEk2TUk0sUwwtzFOSzJNN0gzMDFIsTI0N/kvtSmkIZGR4bHaRhZEBAkF8dobkoszk7NQSBgYACLchzw==",
        // Set the user ID.
        uid: 0,
        // Set the user role
        role: "",
      },
      channelParameters: {
        // A variable to hold a local audio track.
        localAudioTrack: null,
        // A variable to hold a local video track.
        localVideoTrack: null,
        // A variable to hold a remote audio track.
        remoteAudioTrack: null,
        // A variable to hold a remote video track.
        remoteVideoTrack: null,
        // A variable to hold the remote user id.s
        remoteUid: null,
      },
      rtmChannelInstance: null,
      rtcClient: null,
      updatedOnlineStatus: {},
      rtmChannelName: null,
      onlineUsers: [],
      isLoggedIn: false,
      uid: null,
      messages: [],
    };
  },
  async mounted() {
    await this.startBasicCall();
  },
  methods: {
    removeVideoDiv(elementId) {
      console.log("Removing " + elementId + "Div");
      let Div = document.getElementById(elementId);
      if (Div) {
        Div.remove();
      }
    },
    startBasicCall() {
      // Dynamically create a container in the form of a DIV element to play the remote video track.

      this.remotePlayerContainer = document.createElement("div");
      // Dynamically create a container in the form of a DIV element to play the local video track.
      this.localPlayerContainer = document.createElement("div");
      // Specify the ID of the DIV container. You can use the uid of the local user.
      this.localPlayerContainer.id = this.options.uid;
      // Set the textContent property of the local video container to the local user id.
      this.localPlayerContainer.textContent = "Local user " + this.options.uid;
      // Set the local video container size.
      this.localPlayerContainer.style.width = "640px";
      this.localPlayerContainer.style.height = "480px";
      this.localPlayerContainer.style.padding = "15px 5px 5px 5px";
      // Set the remote video container size.
      this.remotePlayerContainer.style.width = "640px";
      this.remotePlayerContainer.style.height = "480px";
      this.remotePlayerContainer.style.padding = "15px 5px 5px 5px";

      // Listen for the "user-published" event to retrieve a AgoraRTCRemoteUser object
      agoraEngine.on("user-published", async (user, mediaType) => {
        // Subscribe to the remote user when the SDK triggers the "user-published" event.
        await agoraEngine.subscribe(user, mediaType);
        console.log("subscribe success");
        // Subscribe and play the remote video in the container If the remote user publishes a video track.
        if (mediaType == "video") {
          // Retrieve the remote video track.
          this.channelParameters.remoteVideoTrack = user.videoTrack;
          // Retrieve the remote audio track.
          this.channelParameters.remoteAudioTrack = user.audioTrack;
          // Save the remote user id for reuse.
          this.channelParameters.remoteUid = user.uid.toString();
          console.log(user);
          alert(user.uid);
          // Specify the ID of the DIV container. You can use the uid of the remote user.
          this.remotePlayerContainer.id = user.uid.toString();
          this.channelParameters.remoteUid = user.uid.toString();
          this.remotePlayerContainer.textContent =
            "Remote user " + user.uid.toString();
          // Append the remote container to the page body.
          document.body.append(this.remotePlayerContainer);
          if (this.options.role != "host") {
            // Play the remote video track.
            this.channelParameters.remoteVideoTrack.play(
              this.remotePlayerContainer
            );
          }
        }
        // Subscribe and play the remote audio track If the remote user publishes the audio track only.
        if (mediaType == "audio") {
          // Get the RemoteAudioTrack object in the AgoraRTCRemoteUser object.
          this.channelParameters.remoteAudioTrack = user.audioTrack;
          // Play the remote audio track. No need to pass any DOM element.
          this.channelParameters.remoteAudioTrack.play();
        }
        // Listen for the "user-unpublished" event.
        agoraEngine.on("user-unpublished", (user) => {
          console.log(user.uid + "has left the channel");
        });
      });
    },
    async Join() {
      const { data } = await this.generateToken(
        this.options.channel,
        this.uid
      );
      if (this.options.role == "") {
        window.alert("Select a user role first!");
        return;
      }
      // Join a channel.
      await agoraEngine.join(
        this.options.appId,
        this.options.channel,
        data.token,
        this.uid
      );
      // Create a local audio track from the audio sampled by a microphone.
      this.channelParameters.localAudioTrack =
        await AgoraRTC.createMicrophoneAudioTrack();
      // Create a local video track from the video captured by a camera.
      this.channelParameters.localVideoTrack =
        await AgoraRTC.createCameraVideoTrack();
      // Append the local video container to the page body.
      document.body.append(this.localPlayerContainer);

      // Publish the local audio and video track if the user joins as a host.
      if (this.options.role == "host") {
        // Publish the local audio and video tracks in the channel.
        await agoraEngine.publish([
          this.channelParameters.localAudioTrack,
          this.channelParameters.localVideoTrack,
        ]);
        // Play the local video track.
        this.channelParameters.localVideoTrack.play(this.localPlayerContainer);
        console.log("publish success!");
      }
      this.joined = true;
    },
    async Leave() {
      // Destroy the local audio and video tracks.
      this.channelParameters.localAudioTrack.close();
      this.channelParameters.localVideoTrack.close();
      // Remove the containers you created for the local video and remote video.
      this.removeVideoDiv(this.remotePlayerContainer.id);
      this.removeVideoDiv(this.localPlayerContainer.id);
      // Leave the channel
      await agoraEngine.leave();
      console.log("You left the channel");
      // Refresh the page for reuse
      window.location.reload();
    },
    async Audience() {
      console.log("Audience");

      // Save the selected role in a variable for reuse.
      this.options.role = "audience";
      if (
        this.channelParameters.localAudioTrack != null &&
        this.channelParameters.localVideoTrack != null
      ) {
        if (this.channelParameters.remoteVideoTrack != null) {
          // Replace the current video track with remote video track
          await this.channelParamaters.localVideoTrack.replaceTrack(
            this.channelParamaters.remoteVideoTrack,
            true
          );
        }
      }
      // Call the method to set the role as Audience.
      await agoraEngine.setClientRole(this.options.role);
    },
    async Host() {
      // Save the selected role in a variable for reuse.
      console.log("selected host");
      this.options.role = "host";
      // Call the method to set the role as Host.
      await agoraEngine.setClientRole(this.options.role);
      if (this.channelParameters.localVideoTrack != null) {
        // Publish the local audio and video track in the channel.
        await agoraEngine.publish([
          this.channelParameters.localAudioTrack,
          this.channelParameters.localVideoTrack,
        ]);
        // Stop playing the remote video.
        this.channelParameters.remoteVideoTrack.stop();
        // Start playing the local video.
        this.channelParameters.localVideoTrack.play(this.localPlayerContainer);
      }
    },
    async initRtmInstance() {
      // initialize an Agora RTM instance
      this.rtmClient = AgoraRTM.createInstance(
        "6fa37398a5be49d187db7c4f060d8530"
      );

      // RTM Channel to be used
      this.rtmChannelName = this.options.channel;

      // Generate the RTM token
      const { data } = await this.generateToken(this.rtmChannelName, this.uid);
      console.log(data);

      // Login when it mounts
      await this.rtmClient
        .login({
          uid: this.uid,
          token: data.rtm_token,
        })
        .then(() => {
          console.log("RTM client logged in success ");
        });

      this.isLoggedIn = true;

      // RTM Message Listeners
      this.rtmClient.on("MessageFromPeer", (message, peerId) => {
        console.log("MessageFromPeer");
        console.log("message: ", message);
        console.log("peerId: ", peerId);
      });

      // Display connection state changes
      this.rtmClient.on("ConnectionStateChanged", (state, reason) => {
        console.log("ConnectionStateChanged");
        console.log("state: ", state);
        console.log("reason: ", reason);
      });
      // Emitted when a Call Invitation is sent from Remote User
      // this.rtmClient.on("RemoteInvitationReceived", (data) => {
      //   this.remoteInvitation = data;
      //   this.incomingCall = true;
      //   this.incomingCaller = data.callerId;
      //   this.incomingCallNotification = `Incoming Call From ${data.callerId}`;

      //   data.on("RemoteInvitationCanceled", () => {
      //     console.log("RemoteInvitationCanceled: ");
      //     this.incomingCallNotification = "Call has been cancelled";
      //     setTimeout(() => {
      //       this.incomingCall = false;
      //     }, 5000);
      //   });
      //   data.on("RemoteInvitationAccepted", (data) => {
      //     console.log("REMOTE INVITATION ACCEPTED: ", data);
      //   });
      //   data.on("RemoteInvitationRefused", (data) => {
      //     console.log("REMOTE INVITATION REFUSED: ", data);
      //   });
      //   data.on("RemoteInvitationFailure", (data) => {
      //     console.log("REMOTE INVITATION FAILURE: ", data);
      //   });
      // });

      // Subscribes to the online statuses of all users apart from
      // the currently authenticated user
      // this.rtmClient.subscribePeersOnlineStatus(
      //   this.users
      //     .map((user) => user.account)
      //     .filter((user) => user !== this.uid)
      // );

      // this.rtmClient.on("PeersOnlineStatusChanged", (data) => {
      //   this.updatedOnlineStatus = data;
      //   console.log("PeersOnlineStatusChanged", data);
      // });

      // Create a channel and listen to messages
      this.rtmChannelInstance = this.rtmClient.createChannel(
        this.rtmChannelName
      );

      // Join the RTM Channel
      this.rtmChannelInstance.join();

      this.rtmChannelInstance.on("ChannelMessage", (message, memberId) => {
        console.log("ChannelMessage");
        alert("received channel message");
        console.log("message: ", message);
        console.log("memberId: ", memberId);
        this.messages.push({ memberId: memberId, message: message });
      });

      this.rtmChannelInstance.on("MemberJoined", (memberId) => {
        console.log("MemberJoined");

        // check whether user exists before you add them to the online user list
        const joiningUserIndex = this.onlineUsers.findIndex(
          (member) => member === memberId
        );
        if (joiningUserIndex < 0) {
          this.onlineUsers.push(memberId);
        }
      });

      this.rtmChannelInstance.on("MemberLeft", (memberId) => {
        console.log("MemberLeft");
        console.log("memberId: ", memberId);
        const leavingUserIndex = this.onlineUsers.findIndex(
          (member) => member === memberId
        );
        this.onlineUsers.splice(leavingUserIndex, 1);
      });

      this.rtmChannelInstance.on("MemberCountUpdated", (data) => {
        console.log(data);
        console.log("MemberCountUpdated");
        // console.log(this);
      });
    },
    async generateToken(channelName, uid) {
      return await axios.get(
        `https://agora-rtm-rtc-tokens.onrender.com/tokens?channelName=${channelName}&uid=${uid}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    },
    async sendChannelMessage() {
      this.rtmChannelInstance
        .sendMessage({ text: "test channel message" })
        .then(() => {
          console.log("message sent");
        })
        .catch((error) => {
          console.log(error);
          // Your code for handling the event when the channel message fails to be sent.
        });
    },
  },
};
</script>
