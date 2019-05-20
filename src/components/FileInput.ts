import { CreateElement, VNode } from 'vue/types';
import { Component, Prop, Mixins } from 'vue-property-decorator';
import { FormControl } from '~/lib';

@Component({
  name: 'v-file-input',
})
export default class FileInput extends Mixins<FormControl>(FormControl) {
  $refs!: {
    node: HTMLInputElement;
  };

  @Prop(String) accept!: string;

  @Prop(String) capture!: string;

  protected render(h: CreateElement): VNode {
    const attrs: { [key: string]: any } = {
      type: 'file',
      tabindex: this.tabindex,
      disabled: this.isDisabled,
    };

    if (this.accept) attrs.accept = this.accept;
    if (this.capture) attrs.capture = this.capture;
    if (this.multiple) attrs.multiple = this.multiple;

    const $node = h('input', {
      attrs,
      on: {
        input: (e: Event) => {
          this.$emit('input', e);
        },
        change: (e: Event) => {
          this.value = this.$refs.node.files;
          this.$emit('change', e);
          // this.getImageFileInformations().then(res => {
          //   console.log(res);
          // });
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

    const $info = h(
      'ul',
      undefined,
      this.fileInformations.map(file => {
        return h(
          'li',
          {
            style: {
              fontSize: '10px',
              lineHeight: '1',
            },
          },
          [
            h('p', undefined, 'name: ' + file.name),
            h('p', undefined, 'type: ' + file.type),
            h('p', undefined, 'size: ' + file.size),
          ],
        );
      }),
    );

    return h('div', undefined, [$node, $info]);
  }
}
