<template>
  <div class="about">
    <VuetifyDialog v-if="dialog" :alertText="alertText" :dialog="dialog" @close-dialog="close()" />
    <LoginComponent :isLoggedIn="$store.state.isLoggedIn" :uid="uid" @login-emit="loginEmit" />
    <div class="container-fluid" v-if="$store.state.isLoggedIn">
      <div v-if="!joined">
        <div class="row">
          <div class="text-center mt-5 mb-2">
            <h4 class="display-6">
              {{
                $store.state.hostStatus.flag
                ? "Join as an audience to the Event"
                : "Choose your option"
              }}
            </h4>
          </div>
        </div>
        <div class="row justify-content-md-center">
          <div class="col col-lg-3 mt-2" v-if="!$store.state.hostStatus.flag">
            <div class="form-check col col-lg-10">
              <input class="form-check-input" type="radio" v-model="joinType" value="host" id="host" name="joinAs" />
              <label class="form-check-label" for="flexRadioDefault1">
                Join as Host
              </label>
            </div>
            <div class="form-check col col-lg-10">
              <input class="form-check-input" type="radio" v-model="joinType" value="audience" id="Audience" name="joinAs"
                checked />
              <label class="form-check-label" for="flexRadioDefault2">
                Join as Audience
              </label>
            </div>
          </div>
          <div class="col col-lg-10 mt-2 text-center">
            <button @click="Join()" v-if="!joined" type="button" class="btn btn-primary me-2" id="join">
              <LoaderComponent :loader="$store.state.loader" text="Join" />
            </button>
          </div>
        </div>
      </div>

      <div v-if="joined">
        <div class="row justify-content-md-center mt-5 mb-5">
          <div class="text-center">
            <h4 class="display-6">
              You Joined as a {{ joinType }} to the {{ options.channel }} Event
              as
              {{ uid }}
            </h4>
            <p>Click below button to leave the event</p>
            <button @click="Leave()" v-if="joined" type="button" class="btn btn-secondary" id="leave">
              Leave
            </button>
          </div>
        </div>

        <div class="row">
          <div class="col col-lg-8">
            <div class="row">
              <div v-if="this.joinType === 'audience'">
                <h1 v-if="isHostJoined === false">
                  Event not started yet ,so stay on call !!
                </h1>
              </div>
              <div class="col text-start float-start">
                <span class="" v-if="this.joinType === 'audience'">Host : <span class="fw-bold">{{ this.HostId
                }}</span></span>
              </div>
              <div class="col text-end float-end">
                <div>
                  <span class="" v-if="this.joinType === 'host'">Number of audience count
                    <span class="fw-bold" v-if="this.audienceCount >= 1">{{
                      this.audienceCount - 1
                    }}</span></span>
                  <span class="" v-if="this.joinType === 'audience'">Number of audience count
                    <span class="fw-bold">{{ this.audienceCount }}</span></span>
                  <button @click="handleAudioToggle()" v-if="this.joinType === 'host'" type="button" class="btn btn-info"
                    id="audioToggle">
                    <i v-if="mutedAudio" class="bi bi-mic-mute"></i>
                    <i v-else class="bi bi-mic-fill"></i>
                  </button>
                </div>
              </div>
            </div>

            <div id="live-stream-section"></div>
          </div>
          <div class="col col-lg-4">
            <section class="msger">
              <header class="msger-header">
                <div class="msger-header-title">
                  <font-awesome-icon icon="fa-solid fa-comment-alt" />
                  {{ options.channel }} Chatroom
                </div>
                <div class="msger-header-options">
                  <!-- <span><font-awesome-icon icon="fa-solid fa-cog" /></span> -->
                </div>
              </header>

              <main class="msger-chat">
                <div class="msg left-msg">
                  <div class="msg-img" style="
                      background-image: url(https://www.gravatar.com/avatar/00000000000000000000000000000000?d=retro&f=y);
                    "></div>

                  <div class="msg-bubble">
                    <div class="msg-info">
                      <div class="msg-info-name">{{ senderName }}</div>
                      <div class="msg-info-time">{{ senderTime }}</div>
                    </div>

                    <div class="msg-text">
                      Hi, welcome to {{ options.channel }} Event! Go ahead and
                      send me a message. 😄
                    </div>
                  </div>
                </div>
              </main>

              <form class="msger-inputarea" action="javascript:;" @submit="sendChannelMessage()">
                <input type="text" class="msger-input" placeholder="Enter your message..." v-model="text" />
                <button type="submit" class="msger-send-btn">Send</button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import LoaderComponent from "@/components/LoaderComponent.vue";
import AgoraRTC from "agora-rtc-sdk-ng";
import AgoraRTM from "agora-rtm-sdk";
import VuetifyDialog from "@/components/VuetifyDialog.vue";
import LoginComponent from "@/components/LoginComponent.vue";
import tokenServer from "@/server/token.server";
import nodeServer from "@/server/node.server";
const agoraEngine = AgoraRTC.createClient({ mode: "live", codec: "vp9" });
export default {
  components: {
    VuetifyDialog,
    LoginComponent,
    LoaderComponent,
  },
  data() {
    return {
      text: "",
      rtcToken: "",
      rtmToken: "",
      dialog: false,
      alertText: "",
      audienceCount: null,
      audience: "audience",
      joined: false,
      joinType: "audience",
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
      uid: null,
      senderName: "",
      senderTime: "",
      mutedAudio: false,
      isHostJoined: false,
      HostId: "",
    };
  },
  updated() {
    console.log("joinType", this.joinType);
  },
  async mounted() {
    await nodeServer.getHostStatus();

    await this.startBasicCall();

    this.options.channel = process.env.VUE_APP_CHANNEL;
  },
  methods: {
    close() {
      this.dialog = false;
    },
    removeVideoDiv(elementId) {
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
      this.localPlayerContainer.id = "localPlayer";
    },
    async Join() {
      this.$store.dispatch("startLoader");
      await nodeServer.getHostStatus();

      if (this.joinType == "audience") {
        await this.Audience();
      } else {
        await this.Host();
      }
      try {
        if (this.options.role == "") {
          window.alert("Select a user role first!");
          return;
        }

        // Append the local video container to the page body.

        // Publish the local audio and video track if the user joins as a host.
        if (this.options.role == "host") {
          if (this.$store.state.hostStatus.flag === false) {
            await nodeServer.addHost();
            agoraEngine.on("user-unpublished", async (data) => {
              return data;
            });
            // Join a channel.

            try {
              await agoraEngine.join(
                this.options.appId,
                this.options.channel,
                this.rtcToken,
                this.uid
              );
            } catch (error) {
              this.$store.dispatch("stopLoader");
              return error;
            }

            await this.initRtmInstance();

            this.joined = true;

            // Create a local audio track from the audio sampled by a microphone.
            this.channelParameters.localAudioTrack =
              await AgoraRTC.createMicrophoneAudioTrack();
            // Create a local video track from the video captured by a camera.
            this.channelParameters.localVideoTrack =
              await AgoraRTC.createCameraVideoTrack();
            // Publish the local audio and video tracks in the channel.
            await agoraEngine.publish([
              this.channelParameters.localAudioTrack,
              this.channelParameters.localVideoTrack,
            ]);

            // Play the local video track.
            this.channelParameters.localVideoTrack.play(
              this.localPlayerContainer
            );

            document
              .getElementById("live-stream-section")
              .append(this.localPlayerContainer);
          } else {
            this.dialog = true;

            this.alertText =
              "Host already Joined so you can not join as a host";
            this.joinType = "audience";
            this.$store.dispatch("stopLoader");
          }
        }
      } catch (error) {
        return error;
      }
    },
    async Leave() {
      // Destroy the local audio and video tracks.
      if (this.options.role === "host") {
        await nodeServer.deleteHost();
        this.channelParameters.localAudioTrack.removeAllListeners();
        this.channelParameters.localVideoTrack.removeAllListeners();
        agoraEngine.unpublish();
      }
      await agoraEngine.leave();
      this.rtmClient.logout();
      window.location.reload();

      // Remove the containers you created for the local video and remote video.
      this.removeVideoDiv(this.remotePlayerContainer.id);
      this.removeVideoDiv(this.localPlayerContainer.id);
      // Leave the channel

      // Refresh the page for reuse
    },
    async Audience() {
      // Listen for the "user-published" event to retrieve a AgoraRTCRemoteUser object

      if (this.$store.state.isLoggedIn) {
        agoraEngine.on("user-unpublished", async (data) => {
          return data;
        });
        agoraEngine.on("user-published", async (user, mediaType) => {
          this.isHostJoined = true;

          // Subscribe to the remote user when the SDK triggers the "user-published" event.
          await agoraEngine.subscribe(user, mediaType);
          // Subscribe and play the remote video in the container If the remote user publishes a video track.
          if (mediaType == "video") {
            // Retrieve the remote video track.
            this.channelParameters.remoteVideoTrack = user.videoTrack;
            // Retrieve the remote audio track.
            this.channelParameters.remoteAudioTrack = user.audioTrack;
            // Save the remote user id for reuse.
            this.channelParameters.remoteUid = user.uid.toString();
            // Specify the ID of the DIV container. You can use the uid of the remote user.
            this.remotePlayerContainer.id = "remotePlayer";
            // this.channelParameters.remoteUid = user.uid.toString();
            // this.remotePlayerContainer.textContent =
            //   "Host " + user.uid.toString();
            this.HostId = user.uid.toString();
            // Append the remote container to the page body.
            document
              .getElementById("live-stream-section")
              .append(this.remotePlayerContainer);
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
        });
        // Listen for the "user-unpublished" event.
      }
      this.removeVideoDiv(this.remotePlayerContainer.id);

      // Save the selected role in a variable for reuse.
      this.options.role = "audience";

      // Call the method to set the role as Audience.
      await agoraEngine.setClientRole(this.options.role);

      try {
        await agoraEngine.join(
          this.options.appId,
          this.options.channel,
          this.rtcToken,
          this.uid
        );
        this.$store.dispatch("startLoader");
        await this.initRtmInstance();
        this.joined = true;
      } catch (error) {
        this.$store.dispatch("stopLoader");
        this.joined = false;
        return error;
      }

      return true;
    },
    async Host() {
      // Save the selected role in a variable for reuse.
      agoraEngine.on("user-unpublished", async (data) => {
        return data;
      });
      this.removeVideoDiv(this.options.uid);
      this.options.role = "host";
      // Call the method to set the role as Host.
      await agoraEngine.setClientRole(this.options.role);
      if (this.channelParameters.localVideoTrack != null) {
        // Publish the local audio and video track in the channel.
        // await agoraEngine.publish([
        //   this.channelParameters.localAudioTrack,
        //   this.channelParameters.localVideoTrack,
        // ]);
        // Stop playing the remote video.
        // this.channelParameters.remoteVideoTrack.stop();
        // Start playing the local video.
        // this.channelParameters.localVideoTrack.play(this.localPlayerContainer);
      }
      return true;
    },
    async loginEmit(uid) {
      this.$store.dispatch("startLoader");

      this.uid = uid;
      await this.Login(uid);
    },
    async Login(userId) {
      await this.generateToken();
      await nodeServer.getHostStatus();
      // initialize an Agora RTM instance
      this.rtmClient = AgoraRTM.createInstance(process.env.VUE_APP_APP_ID);
      // Login when it mounts
      try {
        await this.rtmClient
          .login({
            uid: userId,
            token: this.rtmToken,
          })
          .then(() => {
            console.log("RTM client logged in success ");
          });
        this.$store.dispatch("login");
        this.$store.dispatch("stopLoader");
      } catch (error) {
        this.$store.dispatch("stopLoader");
        return error;
      }
    },
    async initRtmInstance() {
      // RTM Channel to be used
      this.rtmChannelName = this.options.channel;

      // RTM Message Listeners

      // Display connection state changes
      this.rtmClient.on("ConnectionStateChanged", (state, reason) => {
        console.log(state, reason);
      });

      // Create a channel and listen to messages
      this.rtmChannelInstance = this.rtmClient.createChannel(
        this.rtmChannelName
      );

      // Join the RTM Channel
      this.rtmChannelInstance.join();

      this.rtmChannelInstance.on("ChannelMessage", (message, memberId) => {
        this.senderName = memberId;
        this.senderName = this.formatDate(new Date());
        this.botResponse(message.text, memberId);
        this.messages.push({ memberId: memberId, message: message });
      });

      this.rtmChannelInstance.on("MemberJoined", (memberId) => {
        return memberId;
      });

      this.rtmChannelInstance.on("MemberLeft", (memberId) => {
        if (memberId === this.HostId) {
          this.dialog = true;
          this.alertText = "Livestream was ended";
          this.Leave();
        }
      });

      this.rtmChannelInstance.on("MemberCountUpdated", (data) => {
        this.audienceCount = data;
      });
    },
    async generateToken() {
      const data = await tokenServer.generateToken(
        this.options.channel,
        this.uid
      );
      if (data.data) {
        this.rtcToken = data.data.token;
        this.rtmToken = data.data.rtm_token;
      }
    },
    async sendChannelMessage() {
      this.rtmChannelInstance
        .sendMessage({ text: this.text })
        .then(() => {
          const PERSON_IMG =
            "https://image.flaticon.com/icons/svg/145/145867.svg";
          const PERSON_NAME = this.uid;

          this.appendMessage(PERSON_NAME, PERSON_IMG, "right", this.text);
          this.text = "";
        })
        .catch((error) => {
          return error;

          // Your code for handling the event when the channel message fails to be sent.
        });
    },
    appendMessage(name, img, side, text) {
      var msgerChat = document.querySelector(".msger-chat");
      const msgHTML = `
    <div class="msg ${side}-msg">
      <div class="msg-img" style="background-image: url(${img})"></div>

      <div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">${name}</div>
          <div class="msg-info-time">${this.formatDate(new Date())}</div>
        </div>

        <div class="msg-text">${text}</div>
      </div>
    </div>
  `;

      msgerChat.insertAdjacentHTML("beforeend", msgHTML);
      msgerChat.scrollTop += 500;
    },
    formatDate(date) {
      const h = "0" + date.getHours();
      const m = "0" + date.getMinutes();

      return `${h.slice(-2)}:${m.slice(-2)}`;
    },
    botResponse(msgText, BOT_NAME) {
      const BOT_IMG = "https://image.flaticon.com/icons/svg/327/327779.svg";

      this.appendMessage(BOT_NAME, BOT_IMG, "left", msgText);
    },
    async handleAudioToggle() {
      if (this.mutedAudio) {
        await this.channelParameters.localAudioTrack.setMuted(!this.mutedAudio);
        this.mutedAudio = false;
      } else {
        await this.channelParameters.localAudioTrack.setMuted(!this.mutedAudio);
        this.mutedAudio = true;
      }
    },
  },
};
</script>
<style>
@import "../assets/css/main.css";
</style>
