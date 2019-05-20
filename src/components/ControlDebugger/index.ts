import { CreateElement, VNode } from 'vue/types';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import {
  AbstractControl,
  ValidatorProp,
  ValidateTiming,
  ValidateCondition,
} from '~/lib';
// import { AbstractControl } from 'classes';
// import './control-debugger.scss';

const TABS = ['info', 'value', 'errors'];
const INFO_PROPS = [
  { key: 'isDisabled', label: 'isDisabled' },
  { key: 'isReadonly', label: 'isReadonly' },
  { key: 'multiple', label: 'multiple' },
  { key: 'pristine', label: 'pristine' },
  { key: 'touched', label: 'touched' },
  { key: 'validateState', label: 'validateState' },
  { key: 'computedValidateDebounce', label: 'validateDebounce' },
  { key: 'computedValidateOn', label: 'validateOn' },
  { key: 'computedRules', label: 'rules' },
];

function j(value: any) {
  return JSON.stringify(value, replacer);

  function replacer(k: any, v: any) {
    if (typeof v === 'function') {
      if (v.name) return `function ${v.name}(...){ ... }`;
      const str = v.toString();
      if (str.length > 20) {
        return str.substring(0, 20) + '...';
      } else {
        return str;
      }
    }
    return v;
  }
}

const SWITCHERS: {
  key: keyof AbstractControl | string;
  label: string;
  model: keyof ControlDebugger;
}[] = [
  // { key: 'multiple', label: 'multiple', model: 'isMultiple' },
  { key: 'disabled', label: 'disabled', model: 'isDisabled' },
  { key: 'readonly', label: 'readonly', model: 'isReadonly' },
];

@Component({
  name: 'v-control-debugger',
})
export default class ControlDebugger extends Vue {
  $refs!: {
    control: AbstractControl;
  };

  control: AbstractControl | null = null;

  @Prop({ type: Boolean, default: true })
  choiceInControl!: boolean;

  @Prop({ type: String })
  tag!: string;

  @Prop({ type: String })
  name!: string;

  @Prop({ type: Boolean })
  multiple!: boolean;
  @Watch('multiple')
  onChangeMultiple(multiple: boolean) {
    this.innerMultiple = multiple;
  }
  innerMultiple: boolean = this.multiple;
  get isMultiple(): boolean {
    return this.innerMultiple;
  }
  set isMultiple(isMultiple: boolean) {
    if (this.innerMultiple !== isMultiple) {
      this.innerMultiple = isMultiple;
    }
  }

  @Prop({ type: Boolean })
  disabled!: boolean;
  @Watch('disabled')
  onChangeDisabled(disabled: boolean) {
    this.isDisabled = disabled;
  }
  innerDisabled: boolean = this.disabled;
  get isDisabled(): boolean {
    return this.innerDisabled;
  }
  set isDisabled(isDisabled: boolean) {
    if (this.innerDisabled !== isDisabled) {
      this.innerDisabled = isDisabled;
    }
  }

  @Prop({ type: Boolean })
  'readonly'!: boolean;
  @Watch('readonly')
  onChangeReadonly(readonly: boolean) {
    this.isReadonly = readonly;
  }
  innerReadonly: boolean = this.readonly;
  get isReadonly(): boolean {
    return this.innerReadonly;
  }
  set isReadonly(isReadonly: boolean) {
    if (this.innerReadonly !== isReadonly) {
      this.innerReadonly = isReadonly;
    }
  }

  @Prop() value!: any;
  innerValue: any = this.value === undefined ? null : this.value;
  @Watch('value')
  onChangeValue(value: any = null) {
    this.innerValue = value;
  }
  get valueIs(): any {
    return this.innerValue;
  }
  set valueIs(value: any) {
    value = value === undefined ? null : value;
    if (this.innerValue !== value) {
      this.innerValue = value;
      this.$emit('input', value);
    }
  }

  @Prop({ type: Boolean })
  required!: boolean;
  @Watch('required')
  onChangeRequired(required: boolean) {
    this.isRequired = required;
  }
  innerRequired: boolean = this.required;
  get isRequired(): boolean {
    return this.innerRequired;
  }
  set isRequired(isRequired: boolean) {
    if (this.innerRequired !== isRequired) {
      this.innerRequired = isRequired;
    }
  }

  @Prop({ type: String })
  type!: string | null;
  @Watch('type')
  onChangeType(type: string) {
    this.innerType = type || null;
  }
  innerType: string | null = this.type || null;
  get typeIs(): string | null {
    return this.innerType;
  }
  set typeIs(typeIs: string | null) {
    if (this.innerType !== typeIs) {
      this.innerType = typeIs;
    }
  }

  @Prop({ type: [String, Function, Array] })
  rules?: ValidatorProp;

  @Prop({
    type: [String, Array],
  })
  validateOn?: ValidateTiming | ValidateTiming[];

  @Prop({
    type: [String, Function, Array],
  })
  validateConditions?: ValidateCondition | ValidateCondition[];

  @Prop({ type: Array })
  choices!: any[];

  get computedName(): string {
    return this.control
      ? this.control.$_formNodeId +
          ' - ' +
          this.control.name +
          ` (${this.control.keyFromParentControl})`
      : '---';
  }

  private genControl(children?: VNode[], h = this.$createElement): VNode {
    const props: { [key: string]: any } = {
      name: this.name,
      value: this.valueIs,
      multiple: this.isMultiple,
      disabled: this.isDisabled,
      readonly: this.isReadonly,
      required: this.isRequired,
      rules: this.rules,
      validateOn: this.validateOn,
      validateConditions: this.validateConditions,
    };
    if (this.typeIs) {
      props.type = this.typeIs;
    }

    return h(
      'v-' + this.tag,
      {
        props,
        ref: 'control',
        on: {
          created: (vm: AbstractControl) => {
            this.control = vm;
          },
        },
      },
      children,
    );
  }

  private genChoices(h = this.$createElement): VNode[] {
    if (!this.choices) return [];
    return this.choices.map((c, index) => {
      return h(
        'v-' + c.tag,
        {
          props: { ...c.props },
          attrs: { ...c.attrs },
          domProps: { ...c.domProps },
          key: index,
        },
        c.content,
      );
    });
  }

  private genBlock(
    children?: VNode | VNode[],
    isActive: boolean = false,
    h = this.$createElement,
  ) {
    if (children && !Array.isArray(children)) {
      children = [children];
    }
    return h(
      'div',
      {
        staticClass: 'panel-block',
        class: {
          'is-active': isActive,
        },
        style: {
          overflowX: 'auto',
        },
      },
      children,
    );
  }

  private genSwitchers(h = this.$createElement): VNode {
    const children: VNode[] = SWITCHERS.map(c =>
      h(
        'span',
        {
          staticClass: 'button is-small',
          class: {
            'is-selected': this[c.model],
            'is-info': this[c.model],
          },
          on: {
            click: (e: MouseEvent) => {
              e.preventDefault();
              (this as any)[c.model] = !this[c.model];
            },
          },
        },
        c.label,
      ),
    );
    return this.genBlock(
      h(
        'div',
        {
          staticClass: 'buttons has-addons',
        },
        children,
      ),
    );
  }

  private genActions(h = this.$createElement): VNode {
    const children: VNode[] = [];
    this.control &&
      children.push(
        h(
          'a',
          {
            staticClass: 'button is-small',
            on: {
              click: (e: MouseEvent) => {
                e.preventDefault();
                console.log(this.control);
              },
            },
            key: 'log',
          },
          'Log',
        ),
        h(
          'a',
          {
            staticClass: 'button is-small',
            on: {
              click: (e: MouseEvent) => {
                e.preventDefault();
                this.control && this.control.reset();
              },
            },
            key: 'reset',
          },
          'Reset',
        ),
        h(
          'a',
          {
            staticClass: 'button is-small',
            on: {
              click: (e: MouseEvent) => {
                e.preventDefault();
                this.control && this.control.clear();
              },
            },
            key: 'clear',
          },
          'Clear',
        ),
        h(
          'a',
          {
            staticClass: 'button is-small',
            on: {
              click: (e: MouseEvent) => {
                e.preventDefault();
                this.control && this.control.validateSelf();
              },
            },
            key: 'validate',
          },
          'Validate',
        ),
        h(
          'a',
          {
            staticClass: 'button is-small',
            on: {
              click: (e: MouseEvent) => {
                e.preventDefault();
                this.$destroy();
              },
            },
            key: 'destroy',
          },
          'Destroy',
        ),
      );
    return this.genBlock(
      h(
        'div',
        {
          staticClass: 'buttons',
        },
        children,
      ),
    );
  }

  private genTabs(h = this.$createElement): VNode {
    return h(
      'div',
      {
        staticClass: 'panel-tabs',
      },
      TABS.map(key =>
        h(
          'a',
          {
            class: {
              'is-active': this.currentTab === key,
            },
            on: {
              click: (e: MouseEvent) => {
                e.preventDefault();
                this.currentTab = key;
              },
            },
          },
          key,
        ),
      ),
    );
  }

  currentTab: string = TABS[0];

  private genTabBody(h = this.$createElement): VNode {
    const children: VNode[] = [];
    if (this.currentTab === 'info') {
      children.push(this.genInfoTab());
    } else if (this.currentTab === 'value') {
      children.push(this.genValueTab());
    } else if (this.currentTab === 'errors') {
      children.push(this.genErrorsTab());
    }
    return this.genBlock(
      h(
        'div',
        {
          style: {
            fontSize: '10px',
          },
        },
        children,
      ),
    );
  }

  private genInfoTab(h = this.$createElement): VNode {
    const children: VNode[] = [];
    this.control &&
      INFO_PROPS.forEach(prop => {
        const $label = h(
          'dt',
          {
            staticClass: 'dev-control-debugger__tab-info__prop__label',
            key: prop.key + '-label',
          },
          prop.label,
        );
        const value: any = (this.control as any)[prop.key];
        const color: string =
          typeof value === 'boolean' && !value
            ? 'has-text-grey'
            : 'has-text-primary';

        const $value = h(
          'dd',
          {
            staticClass: 'dev-control-debugger__tab-info__prop__value ' + color,
            key: prop.key + '-value',
          },
          j(value),
        );

        children.push(
          h(
            'dl',
            {
              staticClass: 'dev-control-debugger__tab-info__prop',
            },
            [$label, $value],
          ),
        );
      });
    return h(
      'div',
      {
        staticClass: 'dev-control-debugger__tab-info',
      },
      children,
    );
  }

  private genValueTab(h = this.$createElement): VNode {
    const $value = h(
      'pre',
      undefined,
      this.control ? 'value:\n' + j(this.control.value) : undefined,
    );
    const $formValue = h(
      'pre',
      undefined,
      this.control ? 'formValue:\n' + j(this.control.formValue) : undefined,
    );

    return h('div', undefined, [$value, $formValue]);
  }

  private genErrorsTab(h = this.$createElement): VNode {
    return h(
      'pre',
      undefined,
      this.control ? j(this.control.errors) : undefined,
    );
  }

  protected created() {
    this.$on('vf_autoCreateChoiceControll', (control: AbstractControl) => {
      if (!this.control) {
        this.control = control;
      }
    });
  }

  protected render(h: CreateElement): VNode {
    const children: VNode[] = [];

    const choices = this.genChoices();
    if (this.tag)
      children.push(
        this.genControl(this.choiceInControl ? choices : undefined),
      );
    if (!this.choiceInControl) children.push(...choices);
    return h(
      'div',
      {
        staticClass: 'panel',
      },
      [
        h(
          'div',
          {
            staticClass: 'panel-heading',
            class: {
              'has-background-danger': this.control
                ? this.control.hasError
                : false,
            },
          },
          this.computedName,
        ),
        this.genBlock(children, true),
        this.genActions(),
        this.genSwitchers(),
        this.genTabs(),
        this.genTabBody(),
      ],
      // children,
    );
  }
}
