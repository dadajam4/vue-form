<style lang="scss" scoped>
.navbar {
  border-bottom: 1px solid #eaecef;
}
</style>

<template>
  <nav class="navbar is-fixed-top" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <nuxt-link class="navbar-item" to="/" active-class="router-link-active">VueForm</nuxt-link>

      <a
        role="button"
        class="navbar-burger burger"
        :class="menuIsActive && 'is-active'"
        aria-label="menu"
        aria-expanded="false"
        data-target="navbarBasicExample"
        @click="menuIsActive = !menuIsActive"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div class="navbar-menu" :class="menuIsActive && 'is-active'">
      <!--
      <div class="navbar-start">
      </div>
      -->
      <div class="navbar-end">
        <nuxt-link class="navbar-item" to="/guide">Guide</nuxt-link>
        <div class="navbar-item has-dropdown is-hoverable">
          <nuxt-link class="navbar-link" to="/playground">Playground</nuxt-link>
          <!--
          <a class="navbar-link">Playground</a>
          -->
          <div class="navbar-dropdown is-boxed">
            <nuxt-link class="navbar-item" to="/playground/debuging">Debuging</nuxt-link>
            <!--
            <a class="navbar-item">Jobs</a>
            <a class="navbar-item">Contact</a>
            <hr class="navbar-divider">
            <a class="navbar-item">Report an issue</a>
            -->
          </div>
        </div>
        <a class="navbar-item">Docs</a>
        <a class="navbar-item" href="https://github.com/dadajam4/dd-vue-form" target="_blank">
          <span>GitHub</span>
          <span class="icon">
            <i class="fab fa-github"></i>
          </span>
        </a>
      </div>
    </div>
  </nav>
</template>
<script lang="ts">
import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';

@Component({
  name: 'v-header',
})
export default class Header extends Vue {
  menuIsActive = false;

  @Watch('$route')
  protected routeChangeHandler() {
    this.menuIsActive = false;
  }
}
</script>
