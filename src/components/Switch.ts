import { CreateElement, VNode } from 'vue/types';
import { Component, Mixins } from 'vue-property-decorator';
import { FormChoice } from '~/lib';

@Component({
  name: 'v-switch',
})
export default class Switch extends Mixins<FormChoice>(FormChoice) {
  protected genButton(h = this.$createElement): VNode {
    return h(
      'i',
      {
        staticClass: 'v-switch__btn',
        staticStyle: {
          fontStyle: 'normal',
        },
      },
      this.choiced ? '■' : '□',
    );
  }

  protected render(h: CreateElement): VNode {
    const style: { [key: string]: any } = {
      cursor: 'pointer',
      userSelect: 'none',
      outline: '0',
    };
    if (this.isDisabled) {
      style.pointerEvents = 'none';
      style.color = '#aaa';
    }

    const children: VNode[] = [this.genButton()];

    if (this.$slots.default) {
      children.push(...this.$slots.default);
    }

    return h(
      'label',
      {
        staticClass: 'v-switch',
        attrs: {
          tabindex: this.tabindex,
        },
        style,
        on: {
          click: (e: MouseEvent) => {
            if (!this.isOperationable) return;
            this.toggle();
            this.emitFormEvent('change');
          },
          blur: (e: FocusEvent) => {
            this.$emit('blur', e);
          },
        },
      },
      children,
    );
  }
}
