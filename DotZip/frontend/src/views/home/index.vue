<template>
  <home-layout>
    <div :class="{ 'landing-page': true }">
      <div class="main-container">
        <div class="content-container" id="home">
          <div class="section home" id="sectionHome">
            <div class="container">
              <div class="row home-row" id="homeRow">
                <div class="col-12 col-xl-4 col-lg-5 col-md-6">
                  <div class="home-text">
                    <div class="display-1">
                      <strong>WELCOME π‘</strong><br />
                      <span class="logo-single"></span>
                    </div>
                    <p class="white mb-5">
                      μνλ μ‘°κ±΄μ μ§μ μ°Ύμλ³΄μΈμ.<br />λλν λλ§μ μ§μ°ΎκΈ°
                      μλΉμ€ .zip
                    </p>
                    <button
                      class="btn btn-light btn-xl mr-2 mb-2"
                      @click="goSignIn"
                    >
                      SIGN IN
                      <i class="simple-icon-arrow-right"></i>
                    </button>
                    <button
                      class="btn btn-dark btn-xl mr-2 mb-2"
                      @click="goSignUp"
                    >
                      SIGN UP
                      <i class="simple-icon-arrow-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </home-layout>
</template>

<script>
import HomeLayout from "../../layouts/HomeLayout";
import GlideComponent from "../../components/Carousel/GlideComponent";

export default {
  components: {
    "home-layout": HomeLayout,
    "glide-component": GlideComponent
  },
  methods: {
    goSignIn() {
      this.$router.push("/user/login");
    },
    goSignUp() {
      this.$router.push("/user/register");
    }
  }
};
</script>
