import { PluginObject } from 'vue/types';
import { Validators, ValidatorFactories } from './validators';
import FormService from './service';
import { CoreMixin } from './mixin';
import * as classes from './classes';
export * from './classes';

declare module 'vue/types/vue' {
  export interface VueConstructor {
    $form: FormService;
  }

  export interface Vue {
    $form: FormService;
    $rules: ValidatorFactories;
  }
}

const defaultComponentsSettings = {
  FormService: 'v-form-service',
  FormControl: 'v-form-control',
  FormChoiceControl: 'v-form-choice-control',
  FormArray: 'v-form-array',
  FormGroup: 'v-form-group',
  Form: 'v-form',
};

type ComponentName = keyof (typeof defaultComponentsSettings);
type VueFormPluginComponentSettings = {
  [P in ComponentName]?: string | boolean
};

export interface VueFormPluginOptions {
  components?: VueFormPluginComponentSettings | boolean;
}

const VueFormPlugin: PluginObject<VueFormPluginOptions> = {
  installed: false,

  install(Vue, options: VueFormPluginOptions = {}) {
    if (this.installed) return;
    this.installed = true;

    if (Vue.$form) {
      // already setuped...
      Vue.$form.$destroy();
    } else {
      let { components } = options;
      if (components === undefined || components === true) {
        components = defaultComponentsSettings;
      }

      if (components) {
        const names = <ComponentName[]>Object.keys(components);
        names.forEach(name => {
          let value = (components as VueFormPluginComponentSettings)[name];
          if (!value) return;
          if (value === true) {
            value = defaultComponentsSettings[name];
          }
          Vue.component(value, classes[name]);
        });
      }

      Vue.mixin(CoreMixin);
    }

    const service = new FormService();

    Vue.$form = service;
    Vue.prototype.$form = service;
    Vue.prototype.$rules = Validators;
  },
};

export default VueFormPlugin;
