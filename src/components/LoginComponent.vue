

<template>
    <div>

        <div>
            <div class="container-fluid" v-if="!isLoggedIn">
                <div class="row mt-5">
                    <div class="text-center">
                        <h3 class="display-6">
                            Join Live Event
                            <small class="text-muted">With chat room feature</small>
                        </h3>
                        <h4 class="display-6">Choose your user name</h4>
                    </div>
                </div>
                <div class="row justify-content-md-center mt-5">
                    <div class="col col-lg-3">
                        <div class="input-group">
                            <input type="text" class="form-control" v-model="userId" placeholder="Enter Username"
                                aria-label="Enter Username" />
                            <button class="btn btn-outline-secondary" type="button" @click="Login()">
                                <LoaderComponent :loader="$store.state.loader" :text="text" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import LoaderComponent from './LoaderComponent.vue';
export default {
    name: "LoginComponent",
    components: {
        LoaderComponent
    },
    props: {
        isLoggedIn: String,
        uid: String,
    },
    mounted() {


    },
    data() {
        return {
            name: "",
            isSignIn: this.$props.isLoggedIn,
            userId: "",
            text: "Sign In"
        };
    },
    methods: {
        Login() {

            this.$emit("loginEmit", this.userId);
            // this.loader=false

        },
    },
};
</script>