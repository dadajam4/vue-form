<template>
  <div>
    <v-header></v-header>
    <div class="section">
      <div class="app container is-fluid">
        <nuxt/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'nuxt-property-decorator';

@Component
export default class DefaultLayout extends Vue {
  head() {
    return {
      htmlAttrs: {
        class: 'has-navbar-fixed-top',
      },
    };
  }
}
</script>
