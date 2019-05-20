import { CreateElement, VNode } from 'vue/types';
import { Component, Mixins } from 'vue-property-decorator';
import { FormChoice } from '~/lib';

@Component({
  name: 'v-option',
  props: {
    value: {
      default: null,
    },
  },
})
export default class Option extends Mixins<FormChoice>(FormChoice) {
  $refs!: {
    node: HTMLOptionElement;
  };
  // @Prop({ default: null, validator: () => true })
  // value!: any;

  get attrs(): { [key: string]: any } {
    return {
      value: this.value,
      disabled: this.isDisabled,
    };
  }

  get styles(): { [key: string]: any } | undefined {
    return !this.isOperationable
      ? {
          userSelect: 'none',
        }
      : undefined;
  }

  get listeners(): { [key: string]: (e: any) => any } | undefined {
    return !this.isOperationable
      ? {
          selectstart: (e: Event) => {
            e.preventDefault();
          },
          contextmenu: (e: Event) => {
            e.preventDefault();
          },
          keydown: (e: Event) => {
            e.preventDefault();
          },
          mousedown: (e: Event) => {
            e.preventDefault();
          },
          touchstart: (e: Event) => {
            e.preventDefault();
          },
        }
      : undefined;
  }

  protected render(h: CreateElement): VNode {
    return h(
      'option',
      {
        attrs: this.attrs,
        style: this.styles,
        on: this.listeners,
        domProps: {
          selected: this.choiced,
        },
        ref: 'node',
      },
      this.$slots.default,
    );
  }
}
