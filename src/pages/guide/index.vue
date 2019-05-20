<template>
  <div>ガイド</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'nuxt-property-decorator';

@Component
export default class IndexRoute extends Vue {
  // hoge = 'fuga';
  // asyncData() {
  //   return new Promise(resolve => {
  //     setTimeout(() => {
  //       resolve({
  //         fuga: 'hoge',
  //       });
  //     }, 2000);
  //   });
  // }
}
</script>
