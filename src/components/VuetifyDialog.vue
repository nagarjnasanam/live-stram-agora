<template>
    <div class="text-center">
        <v-dialog v-model="dialog1" width="auto">
            <v-card>
                <v-card-text>
                    {{ this.alertText1 }}
                </v-card-text>
                <v-card-actions>
                    <v-btn color="primary" block @click="$emit('closeDialog')">Close
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>
  
<script>
export default {
    name: "HelloWorld",
    props: {
        dialog: Boolean,
        alertText: String,
    },
    emits: ['closeDialog'],
    mounted() {
        console.log(this.$props.dialog);

    },
    data() {
        return {
            dialog1: this.$props.dialog,
            alertText1: this.$props.alertText,
        };
    },
};
</script>