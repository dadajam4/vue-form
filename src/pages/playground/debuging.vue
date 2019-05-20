<template>
  <div>
    <v-control-debugger tag="text-field" name="text1" required/>
    <v-control-debugger tag="text-field" type="date" name="dateText1" required/>

    <v-form>
      <v-control-debugger tag="text-field" type="email" name="email" rules="email"/>
      <v-control-debugger
        tag="text-field"
        type="email"
        name="email-confirm"
        :rules="[
          $rules.required(),
          $rules.email(),
          $rules.confirm('email'),
        ]"
      />
    </v-form>
    <v-control-debugger
      tag="file-input"
      name="file1"
      multiple
      :rules="$rules.dimensions({ width: '>=1026' })"
    />

    <v-control-debugger
      tag="form-choice-control"
      :choice-in-control="false"
      name="checkbox1"
      multiple
      rules="required"
      :choices="[
          { tag: 'checkbox', content: '1', props: { name: 'checkbox1', multiple: true, value: '1' } },
          { tag: 'checkbox', content: '2(readonly)', props: { name: 'checkbox1', multiple: true, readonly: true, value: '2' }, attrs: { checked: true } },
        ]"
    />

    <v-control-debugger
      tag="form-choice-control"
      :choice-in-control="false"
      name="radio1"
      required
      :choices="[
          { tag: 'radio', content: '1', props: { name: 'radio1', value: '1' } },
          { tag: 'radio', content: '2', props: { name: 'radio1', value: '2' } },
        ]"
    />

    <v-control-debugger
      tag="form-choice-control"
      :choice-in-control="false"
      name="switch1"
      multiple
      rules="required"
      :choices="[
          { tag: 'switch', content: '1(disabled)', props: { name: 'switch1', disabled: true, multiple: true, value: '1' } },
          { tag: 'switch', content: '2', props: { name: 'switch1', multiple: true, value: '2' }, attrs: { checked: true } },
        ]"
    />

    <v-control-debugger
      tag="select"
      name="select1"
      multiple
      rules="required"
      :choices="[
          { tag: 'option', content: '選択してください' },
          { tag: 'option', content: '項目1', props: { value: '1' } },
          { tag: 'option', content: '項目2', props: { value: '2', readonly: true } },
          { tag: 'option', content: '項目3', props: { value: '3' } },
        ]"
    />
    <v-control-debugger
      :choice-in-control="false"
      :choices="[
          { tag: 'checkbox', content: '同意する', props: { name: 'checkbox2', required: true } },
        ]"
    />
  </div>
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
