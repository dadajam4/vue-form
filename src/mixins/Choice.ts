import { CreateElement, VNode } from 'vue/types';
import { Component, Mixins } from 'vue-mixin-decorator';
import { FormChoice } from '~/lib';

@Component
export default class Choice extends Mixins<FormChoice>(FormChoice) {
  $refs!: {
    node: HTMLInputElement;
  };

  type!: string;

  protected genInputNode(type: string, h = this.$createElement): VNode {
    return h('input', {
      attrs: {
        type,
        value: this.value,
        name: this.name,
        tabindex: this.tabindex,
        disabled: this.isDisabled,
        // checked: this.choiced,
      },
      domProps: {
        checked: this.choiced,
      },
      on: {
        input: (e: Event) => {
          this.$emit('input', e);
        },
        change: (e: Event) => {
          if (!this.isOperationable) {
            this.$refs.node.checked = !this.$refs.node.checked;
            return;
          }
          this.choiced = this.$refs.node.checked;
          this.$emit('change', e);
        },
        focus: (e: FocusEvent) => {
          this.$emit('focus', e);
        },
        blur: (e: FocusEvent) => {
          this.$emit('blur', e);
        },
      },
      ref: 'node',
    });
  }

  protected render(h: CreateElement): VNode {
    const children: VNode[] = [this.genInputNode(this.type)];

    if (this.$slots.default) {
      children.push(...this.$slots.default);
    }

    return h(
      'label',
      {
        staticClass: 'v-choice',
        class: {
          ['v-choice--' + this.type]: true,
        },
      },
      children,
    );
  }
}
