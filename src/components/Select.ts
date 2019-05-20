import { CreateElement, VNode } from 'vue/types';
import { Component, Mixins } from 'vue-property-decorator';
import { FormChoiceControl } from '~/lib/classes';
import Option from './Option';

@Component({
  name: 'v-select',
})
export default class Select extends Mixins<FormChoiceControl>(
  FormChoiceControl,
) {
  $refs!: {
    node: HTMLSelectElement;
  };

  choices!: Option[];

  protected render(h: CreateElement): VNode {
    return h(
      'select',
      {
        attrs: {
          multiple: this.multiple,
          tabindex: this.tabindex,
          disabled: this.isDisabled,
          readonly: this.isReadonly,
        },
        on: {
          input: (e: Event) => {
            this.$emit('input', e);
          },
          change: (e: Event) => {
            // if (!this.isOperationable) {
            //   e.preventDefault();
            //   return;
            // }
            const selectedOptions = this.choices.filter(
              c => c.value !== null && c.$refs.node.selected,
            );

            if (this.multiple) {
              this.value = selectedOptions.map(c => c.value);
            } else {
              this.value = selectedOptions[0]
                ? selectedOptions[0].value
                : this.defaultValue;
            }

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
      },
      this.$slots.default,
    );
  }
}
