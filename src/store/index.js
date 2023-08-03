import { createStore } from "vuex";

export default createStore({
  state: {
    isLoggedIn: false,
    isJoined: false,
    loader: false,
    hostStatus: {
      id: null,
      flag: false,
    },
  },
  getters: {
    getState(state) {
      return state.isLoggedIn;
    },
  },
  mutations: {
    setLogin(state) {
      state.isLoggedIn = true;
    },
    setlogout(state) {
      state.isLoggedIn = false;
    },
    joined(state) {
      state.isJoined = true;
    },
    remove(state) {
      state.isJoined = false;
    },
    setLoader(state) {
      state.loader = true;
    },
    removeLoader(state) {
      state.loader = false;
    },
    hostStatus(state, data) {
      state.hostStatus = data;
    },
  },
  actions: {
    login({ commit }) {
      commit("setLogin");
    },
    logout({ commit }) {
      commit("setlogout");
    },
    joinToChannel({ commit }) {
      commit("joined");
    },
    leftFromCgannel({ commit }) {
      commit("remove");
    },
    startLoader({ commit }) {
      commit("setLoader");
    },
    stopLoader({ commit }) {
      commit("removeLoader");
    },
    setHostStatus({ commit }, payload) {
      commit("hostStatus", payload);
    },
  },
  modules: {},
});
