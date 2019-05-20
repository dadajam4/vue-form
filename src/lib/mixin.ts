import Vue from 'vue';
import { Component } from 'vue-property-decorator';

declare module 'vue/types/vue' {
  export interface Vue {
    form: Form;
  }
}

import { Form } from './classes';

@Component
export class CoreMixin extends Vue {
  private vf_form?: Form;

  get form(): Form {
    let form = this.vf_form;
    if (!form) {
      form = new Form({ parent: this });
      this.vf_form = form;
      this.$form.addContextFormedVm(this);
    }
    return form;
  }

  protected beforeDestroy() {
    const form = this.vf_form;
    if (form) {
      form.$destroy();
      this.$form.removeContextFormedVm(this);
      delete this.vf_form;
    }
  }
}
