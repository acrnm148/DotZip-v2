import jwtDecode from "jwt-decode";
import {
  signinAPI,
  signupAPI,
  findByEmail,
  tokenRegeneration,
  logout,
  getUsers
} from "@/apis/user.js";
import { adminRoot } from "@/constants/config";

export default {
  state: {
    // currentUser: isAuthGuardActive ? getCurrentUser() : currentUser,
    loginError: null,
    processing: false,
    isValidToken: false,
    userList: [],
    // forgotMailSuccess: null,
    // resetPasswordSuccess: null
    isLogin: false,
    isKakao: false,
    currentUser: {
      userSeq: 0,
      userName: "",
      userPassword: "",
      userEmail: "",
      userProfileImageUrl: "",
      userRegisterDate: "",
      userClsf: ""
    }
  },
  getters: {
    userList: state => state.userList,
    isLogin: state => state.isLogin,
    currentUser: state => state.currentUser,
    processing: state => state.processing,
    loginError: state => state.loginError
  },
  mutations: {
    SET_USER_LIST(state, payload) {
      state.userList = [...payload];
    },
    SET_LOGIN(state) {
      state.isLogin = true;
      state.processing = false;
      state.loginError = null;
    },
    SET_IS_LOGIN(state, payload) {
      state.isLogin = payload;
    },
    SET_IS_VALID_TOKEN: (state, isValidToken) => {
      state.isValidToken = isValidToken;
    },
    SET_PROCESSING(state, payload) {
      state.processing = payload;
    },
    SET_LOGOUT(state) {
      state.currentUser.userSeq = 0;
      state.isLogin = false;
      state.isKakao = false;
      state.currentUser.userPassword = "";
      state.currentUser.userName = "";
      state.currentUser.userEmail = "";
      state.currentUser.userClsf = "";
      state.currentUser.userProfileImageUrl = "";
      state.currentUser.userRegisterDate = "";
    },
    SET_USER_INFO(state, payload) {
      state.currentUser = { ...payload };
      state.isLogin = true;
    },
    SET_KAKAO(state) {
      state.info.isKakao = true;
      state.info.isLogin = true;
    },
    SET_ERROR(state, payload) {
      state.loginError = payload;
      state.currentUser = null;
      state.processing = false;
    },
    // setForgotMailSuccess(state) {
    //   state.loginError = null;
    //   state.currentUser = null;
    //   state.processing = false;
    //   state.forgotMailSuccess = true;
    // },
    // setResetPasswordSuccess(state) {
    //   state.loginError = null;
    //   state.currentUser = null;
    //   state.processing = false;
    //   state.resetPasswordSuccess = true;
    // },
    SET_CLEAR_ERROR(state) {
      state.loginError = null;
    }
  },
  actions: {
    async getUsersAction({ commit }, userSeq) {
      await getUsers(
        userSeq,
        ({ data }) => {
          commit("SET_USER_LIST", data);
        },
        error => {
          console.log(error);
        }
      );
    },
    async login({ commit }, { email, password }) {
      commit("SET_CLEAR_ERROR");
      commit("SET_PROCESSING", true);
      await signinAPI(
        {
          userEmail: email,
          userPassword: password
        },
        ({ data, status }) => {
          if (data.message === "success") {
            let accessToken = data["access-token"];
            let refreshToken = data["refresh-token"];
            commit("SET_LOGIN");
            commit("SET_IS_VALID_TOKEN", true);
            sessionStorage.setItem("access-token", accessToken);
            sessionStorage.setItem("refresh-token", refreshToken);
          } else {
            if (status === 202) {
              commit("SET_ERROR", "????????? ?????? ??????????????? ???????????????.");
            } else {
              commit("SET_ERROR", "????????? ????????? ??????????????????.");
            }
            commit("SET_IS_VALID_TOKEN", false);
            setTimeout(() => {
              commit("SET_CLEAR_ERROR");
            }, 3000);
          }
        }
      );
    },
    async getUserInfo({ commit, dispatch }, token) {
      let decodeToken = jwtDecode(token);
      // console.log("2. getUserInfo() decodeToken :: ", decodeToken);
      await findByEmail(
        decodeToken.userEmail,
        ({ data }) => {
          if (data.message === "success") {
            console.log(data);
            commit("SET_USER_INFO", data.userInfo);
            // console.log("3. getUserInfo data >> ", data);
          } else {
            console.log("?????? ?????? ??????!!!!");
          }
        },
        async error => {
          console.log(
            "getUserInfo() error code [?????? ???????????? ?????? ?????????.] ::: ",
            error.response.status
          );
          commit("SET_IS_VALID_TOKEN", false);
          await dispatch("tokenRegeneration");
        }
      );
    },
    async tokenRegeneration({ commit, state }) {
      console.log(
        "?????? ????????? >> ?????? ?????? ?????? : {}",
        sessionStorage.getItem("access-token")
      );
      await tokenRegeneration(
        JSON.stringify(state.userInfo),
        ({ data }) => {
          if (data.message === "success") {
            let accessToken = data["access-token"];
            console.log("????????? ?????? >> ????????? ?????? : {}", accessToken);
            sessionStorage.setItem("access-token", accessToken);
            commit("SET_IS_VALID_TOKEN", true);
          }
        },
        async error => {
          // HttpStatus.UNAUTHORIZE(401) : RefreshToken ?????? ?????? >> ?????? ?????????!!!!
          if (error.response.status === 401) {
            console.log("?????? ??????");
            // ?????? ????????? ??? DB??? ????????? RefreshToken ??????.
            await logout(
              state.userInfo.userEmail,
              ({ data }) => {
                if (data.message === "success") {
                  console.log("???????????? ?????? ?????? ??????");
                } else {
                  console.log("???????????? ?????? ?????? ??????");
                }
                alert("RefreshToken ?????? ??????!!! ?????? ???????????? ?????????.");
                commit("SET_LOGOUT");
                commit("SET_IS_VALID_TOKEN", false);
                router.push(`${adminRoot}/user/login`);
              },
              error => {
                console.log(error);
                commit("SET_IS_LOGIN", false);
                commit("SET_USER_INFO", null);
              }
            );
          }
        }
      );
    },
    async userLogout({ commit }, { userEmail }) {
      await logout(
        userEmail,
        ({ data }) => {
          if (data.message === "success") {
            commit("SET_LOGOUT");
            commit("SET_IS_VALID_TOKEN", false);
            sessionStorage.removeItem("access-token");
            sessionStorage.removeItem("refresh-token");
          } else {
            console.log("?????? ?????? ??????!!!!");
          }
        },
        error => {
          console.log(error);
        }
      );
    }
  }
  // logout({ commit }) {
  //   commit('SET_LOGOUT');
  // },
  // forgotPassword({ commit }, payload) {
  //   commit("clearError");
  //   commit("setProcessing", true);
  // firebase
  //   .auth()
  //   .sendPasswordResetEmail(payload.email)
  //   .then(
  //     user => {
  //       commit('clearError')
  //       commit('setForgotMailSuccess')
  //     },
  //     err => {
  //       commit('setError', err.message)
  //       setTimeout(() => {
  //         commit('clearError')
  //       }, 3000)
  //     }
  //   )
  // },
  // resetPassword({ commit }, payload) {
  // commit("clearError");
  // commit("setProcessing", true);
  // firebase
  //   .auth()
  //   .confirmPasswordReset(payload.resetPasswordCode, payloa. d.newPassword)
  //   .then(
  //     user => {
  //       commit('clearError')
  //       commit('setResetPasswordSuccess')
  //     },
  //     err => {
  //       commit('setError', err.message)
  //       setTimeout(() => {
  //         commit('clearError')
  //       }, 3000)
  //     }
  //   )
  // },
  // signOut({ commit }) {
  // firebase
  //   .auth()
  //   .signOut()
  //   .then(() => {
  //     setCurrentUser(null);
  //     commit('setLogout')
  //   }, _error => { })
  // }
};
