import { CreateElement, VNode } from 'vue/types';
import { Component, Mixins, Prop } from 'vue-property-decorator';
import {
  FormControl,
  validateOnValidator,
  ValidateTiming,
  TouchOn,
} from '~/lib';

@Component({
  name: 'v-text-field',
})
export default class TextField extends Mixins<FormControl>(FormControl) {
  $refs!: {
    node: HTMLInputElement;
  };

  @Prop({
    type: [String, Array],
    default(): ValidateTiming[] {
      return ['input', 'blur'];
    },
    validator: validateOnValidator,
  })
  validateOn!: ValidateTiming | ValidateTiming[];

  @Prop({ type: String, default: 'blur' })
  touchOn!: TouchOn;

  @Prop({ type: String, default: 'text' })
  type!: string;

  protected render(h: CreateElement): VNode {
    return h('input', {
      attrs: {
        type: this.type,
        tabindex: this.tabindex,
        disabled: this.isDisabled,
        readonly: this.isReadonly,
      },
      domProps: {
        value: this.value,
      },
      on: {
        input: (e: Event) => {
          this.value = this.$refs.node.value;
          this.$emit('input', e);
        },
        change: (e: Event) => {
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
}
