import { CreateElement, VNode } from 'vue/types';
import {
  Vue,
  Component,
  Mixins,
  Inject,
  Model,
  Prop,
  Watch,
} from 'vue-property-decorator';
import {
  Validators,
  ValidationErrors,
  ValidatorFn,
  ValidatorFactory,
  ValidationResult,
  FileInfo,
  ImageFileInfo,
  getFileInfo,
  getImageFileInfo,
  ValidatorFactoryName,
} from './validators';
import { isPromise, VueFormError } from './util';

// ==================================================
// decreatioins
// ==================================================
export type VueFormClassName =
  | 'FormArray'
  | 'FormGroup'
  | 'Form'
  | 'FormControl'
  | 'FormChoiceControl'
  | 'FormChoice';

declare module 'vue/types/vue' {
  interface VueConstructor {
    vf_className: VueFormClassName | void;
  }
}

// ==================================================
// types
// ==================================================

/**
 * バリデートの動作のきっかけとなるイベントタイプを示します
 */
export type ValidateTiming = 'input' | 'change' | 'blur';

export type TouchOn = 'input' | 'blur';

export type ValidateConditionChecker = (control: AbstractControl) => boolean;

export type ValidateCondition = 'always' | 'touched' | ValidateConditionChecker;

/**
 * バリデート結果の状態を示します
 */
export enum ValidateState {
  /**
   * バリデーションに合格している事を示します
   */
  Valid = 'VALID',

  /**
   * バリデーションに合格していない事を示します
   */
  Invalid = 'INVALID',

  /**
   * バリデーション中である事を示します。
   * 非同期バリデーション中である時にこの状態が続きます。
   */
  Pending = 'PENDING',
}

/**
 * Vue propsで注入可能なバリデータ指定のタイプです
 */
export type ValidatorProp = (string | ValidatorFn)[];

type ValidateResolver = (result: ValidationResult) => void;

/**
 * AbstractControlが保有するバリデーションエラーのタイプです
 */
export type ControlErrors = ValidationErrors[];

/**
 * FormGroupのvalueが取りうるインターフェースです
 */
export interface FormGroupValue {
  [key: string]: any;
}

// ==================================================
// constants
// ==================================================
export const FORM_PARENT_INPUT_PROP = 'inputAllErrorsBucket';
export const FORM_PARENT_UPDATE_EVENT = 'changeAllErrors';
export const FORM_VALUE_CONTROL_INPUT_PROP = 'inputValue';
export const FORM_VALUE_CONTROL_UPDATE_EVENT = 'valueUpdate';
export const FORM_CHOICE_INPUT_PROP = 'inputChoiced';
export const FORM_CHOICE_UPDATE_EVENT = 'changeChoiced';

const INITIAL_DUMMY: any = null;
const allValidateTimings: ValidateTiming[] = ['input', 'change', 'blur'];
const PATH_THROUGH_EVENTS = ['input', 'change', 'focus', 'blur'];

export function validateOnValidator(timings: any) {
  timings = Array.isArray(timings) ? timings : [timings];
  for (const timing of timings) {
    if (!allValidateTimings.includes(timing)) return false;
  }
  return true;
}

interface AbstractFormNodeInternal {
  $_formNodeId: number;
}

/**
 * dd-vue-formで利用する全クラスの基底となる抽象クラスです。
 * 自身のメンバにuidを発行します。
 */
@Component
export class AbstractFormNode extends Vue implements AbstractFormNodeInternal {
  @Inject({
    from: 'formParent',
    default: null,
  })
  injectedFormParent!: AbstractControlParent | null;

  @Prop({ type: [String, Function, Array] })
  rules?: ValidatorProp;

  @Prop({
    type: [String, Array],
    default(): ValidateTiming[] {
      return ['change'];
    },
    validator: validateOnValidator,
  })
  validateOn!: ValidateTiming | ValidateTiming[];

  @Prop({
    type: [String, Function, Array],
    default: 'touched',
  })
  validateConditions!: ValidateCondition | ValidateCondition[];

  @Prop(Boolean) required!: boolean;
  @Prop(Boolean) disabled!: boolean;
  @Prop(Boolean) 'readonly'!: boolean;
  @Prop(Boolean) alwaysValue!: boolean;

  @Prop({
    type: [String, Number],
    default: 0,
  })
  tabindex!: string | number;

  @Prop([String, Number])
  validateDebounce?: string | number;

  get isDestroyed(): boolean {
    return this.vf_destroyed;
  }
  set isDestroyed(isDestroyed: boolean) {
    this.vf_destroyed = isDestroyed;
  }

  get numberedValidateDebounce(): number | void {
    const { validateDebounce } = this;
    if (validateDebounce != null)
      return parseInt(validateDebounce as string, 10);
  }

  get enabled(): boolean {
    return !this.disabled;
  }

  get isEnabled(): boolean {
    return !this.isDisabled;
  }

  get isOperationable(): boolean {
    return this.isEnabled && !this.isReadonly;
  }

  public readonly $_formNodeId!: number;

  public isFormArray(obj: AbstractFormNode = this): obj is FormArray {
    return obj.vf_className === 'FormArray';
  }

  public isFormGroup(obj: AbstractFormNode = this): obj is FormGroup {
    return obj.vf_className === 'FormGroup';
  }

  public isForm(obj: AbstractFormNode = this): obj is Form {
    return obj.vf_className === 'Form';
  }

  public isParentControl(
    obj: AbstractFormNode = this,
  ): obj is FormGroup | FormArray {
    return obj.isFormArray() || obj.isFormGroup() || obj.isForm();
  }

  public isFormControl(obj: AbstractFormNode = this): obj is FormControl {
    return obj.vf_className === 'FormControl';
  }

  public isFormChoiceControl(
    obj: AbstractFormNode = this,
  ): obj is FormChoiceControl {
    return obj.vf_className === 'FormChoiceControl';
  }

  public isFormChoice(obj: AbstractFormNode = this): obj is FormChoice {
    return obj.vf_className === 'FormChoice';
  }

  public isControl(obj: AbstractFormNode = this): obj is AbstractControl {
    return !obj.isFormChoice();
  }

  public isValueControl(
    obj: AbstractFormNode = this,
  ): obj is FormControl | FormChoiceControl {
    return obj.isFormControl() || obj.isFormChoiceControl();
  }

  public createFormEvent(type: 'input' | 'change'): Event {
    if (typeof Event === 'function') {
      return new Event(type);
    } else {
      const event = document.createEvent('Event');
      event.initEvent(type, true, true);
      return event;
    }
  }

  public emitFormEvent(type: 'input' | 'change') {
    return this.$emit(type, this.createFormEvent(type));
  }

  private vf_destroyed: boolean = false;

  protected beforeCreate() {
    (this as AbstractFormNodeInternal).$_formNodeId = this.$form.createComponentId();
  }

  protected created() {
    this.$form.addFormNode(this);
    this.$emit('created', this);
  }

  protected beforeDestroy() {
    this.$form.removeFormNode(this);
    this.isDestroyed = true;
  }
}
// abstract members
export interface AbstractFormNode {
  readonly vf_className: VueFormClassName;
  name: string;
  value: any;
  isDisabled: boolean;
  isReadonly: boolean;
}

@Component
export class AbstractControl extends Mixins(AbstractFormNode) {
  @Prop({
    type: String,
    default(this: AbstractControl) {
      return 'form-control-' + this.$_formNodeId;
    },
  })
  name!: string;

  public readonly errors: ControlErrors = [];

  get numberedValue() {
    return this.vf_getCastedValue(val => {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? 0 : parsed;
    });
  }

  get stringValue() {
    return this.vf_getCastedValue(val => {
      val = val == null ? '' : val;
      return String(val);
    });
  }

  get files(): File[] {
    const { value } = this;
    if (!value) return [];
    return value.filter((f: any) => f instanceof File) as File[];
  }

  get fileInformations(): FileInfo[] {
    return this.files.map(f => getFileInfo(f));
  }

  get hasError(): boolean {
    return this.errors.length > 0;
  }

  get validateState(): ValidateState {
    return this.vf_validateState;
  }

  set validateState(state: ValidateState) {
    if (this.vf_validateState !== state) {
      this.vf_validateState = state;
    }
  }

  get parent(): AbstractControlParent | null {
    return this.vf_parent;
  }

  set parent(parent: AbstractControlParent | null) {
    if (this.vf_parent !== parent) {
      if (this.vf_parent) {
        this.vf_parent.removeControl(this);
      }

      this.vf_parent = parent;
      if (parent) {
        parent.addControl(this);
        PATH_THROUGH_EVENTS.forEach(type => {
          this.$on(type, this.vf_pathThroughEventForParent);
        });
      } else {
        PATH_THROUGH_EVENTS.forEach(type => {
          this.$off(type, this.vf_pathThroughEventForParent);
        });
      }
    }
  }

  get root(): AbstractControl {
    let x: AbstractControl = this;
    while (x.vf_parent) {
      x = x.vf_parent;
    }
    return x;
  }

  get valid(): boolean {
    return this.vf_validateState === ValidateState.Valid;
  }

  get invalid(): boolean {
    return this.vf_validateState === ValidateState.Invalid;
  }

  get pending(): boolean {
    return this.vf_validateState === ValidateState.Pending;
  }

  get isDisabled(): boolean {
    return this.disabled || ((this.parent && this.parent.isDisabled) || false);
  }

  get isReadonly(): boolean {
    return this.readonly || ((this.parent && this.parent.isReadonly) || false);
  }

  get dirty(): boolean {
    return !this.pristine;
  }

  get untouched(): boolean {
    return !this.touched;
  }

  get keyFromParentControl(): string | null {
    const { parent } = this;
    if (!parent) return null;
    return Array.isArray(parent.controls)
      ? `[${parent.controls.indexOf(this)}]`
      : this.name;
  }

  get computedValidateDebounce(): number {
    const numbers = this.vf_collectMergedChoicesProp(
      'numberedValidateDebounce',
    );
    return numbers.length === 0 ? 0 : Math.max(...numbers);
  }

  get computedValidateOn(): ValidateTiming[] {
    return this.vf_collectMergedChoicesProp('validateOn');
  }

  get computedValidateConditionCheckers(): ValidateConditionChecker[] {
    const validateConditions = this.vf_collectMergedChoicesProp(
      'validateConditions',
    );
    return validateConditions.map(condition => {
      if (typeof condition === 'function') return condition;
      if (condition === 'always') return (control: AbstractControl) => true;
      return (control: AbstractControl) => !!control[condition];
    });
  }

  get computedRules(): ValidatorFn[] {
    const propList = this.vf_collectMergedChoicesProp('rules');
    if (this.required) propList.push('required');
    const computedRules: ValidatorFn[] = [];
    propList.forEach(row => {
      if (typeof row === 'string') {
        const tmp = row.split('|');
        tmp.forEach(ext => {
          const matched = ext.match(/^([a-zA-Z0-9_]+)(\(.+\))?/);
          if (!matched) {
            throw new VueFormError(`rule ${ext} is illegal format.`);
          }

          const name = matched[1] as ValidatorFactoryName;
          const argStr = matched[2];

          const factory: ValidatorFactory = Validators[name];
          if (!factory)
            throw new VueFormError(`validator ${name} is not defined.`);

          if (argStr) {
            const argExt = argStr.replace(/^\(/, '[').replace(/\)$/, ']');
            const args: any[] = function() {
              return eval(argExt);
            }.call(this.$vnode.context);
            computedRules.push(factory(...args));
          } else {
            computedRules.push(factory());
          }
        });
      } else {
        computedRules.push(row);
      }
    });
    return computedRules;
  }

  public async getImageFileInformations(): Promise<ImageFileInfo[]> {
    return Promise.all(this.files.map(f => getImageFileInfo(f)));
  }

  public getPathFromAnyParentControl(
    parentControl: AbstractControlParent,
  ): string | null {
    return _getPathAtAnyParentControlToChildControl(parentControl, this);
  }

  public clearErrors(): void {
    this.vf_validateRequestId = this.vf_validateRequestId + 1;
    this.errors.splice(0, this.errors.length);
    this.validateState = ValidateState.Valid;
    this.vf_resolveValidateResolvers();
  }

  public validateSelf(): Promise<ValidationResult> {
    return new Promise(async resolve => {
      if (!this.vf_lastValidateValueChanged && !this.pending) {
        resolve(this.errors);
        return;
      }

      this.vf_validateResolvers.push(resolve);
      if (!this.vf_lastValidateValueChanged) return;
      this.vf_validateRequestId = this.vf_validateRequestId + 1;
      const requestId = this.vf_validateRequestId;
      this.validateState = ValidateState.Pending;

      const { computedRules } = this;
      const result: ControlErrors = [];
      for (const fn of computedRules) {
        if (requestId !== this.vf_validateRequestId) return;
        try {
          let rowResult = fn(this);
          if (isPromise<ValidationResult>(rowResult)) {
            rowResult = await rowResult;
          }
          if (this.isDestroyed) break;
          if (rowResult) {
            result.push(rowResult);
          }
        } catch (err) {
          const errName: string | void = err && err.name;
          result.push({
            [errName || 'exception']: err || 'exception',
          });
        }
      }
      if (this.isDestroyed) result.length = 0;
      const hasError = result.length > 0;
      if (requestId !== this.vf_validateRequestId) return;
      this.validateState = hasError
        ? ValidateState.Invalid
        : ValidateState.Valid;
      this.errors.splice(0, this.errors.length, ...result);
      this.vf_lastValidateValueChanged = false;
      this.vf_resolveValidateResolvers();
    });
  }

  private vf_validateState: ValidateState = ValidateState.Valid;
  private vf_validateRequestId: number = 0;
  private vf_validateResolvers: ValidateResolver[] = [];
  private vf_parent: AbstractControlParent | null = null;
  private vf_watchers: AbstractControl[] = [];
  private vf_watchFor: AbstractControl[] = [];
  private vf_lastValidateValueChanged: boolean = true;

  /** @private */
  vf_addWatchFor(watchFor: AbstractControl) {
    watchFor.vf_addWatcher(this);
  }

  private vf_getCastedValue(cb: (val: any) => any) {
    const { value } = this;
    if (this.isFormControl(this) && this.multiple) {
      return value.map(cb);
    }
    return cb(value);
  }

  private vf_removeWatchFor(watchFor: AbstractControl) {
    watchFor.vf_removeWatcher(this);
  }

  private vf_removeAllWatchFor() {
    this.vf_watchFor.forEach(watchFor => {
      watchFor.vf_removeWatcher(this);
    });
  }

  private vf_addWatcher(watcher: AbstractControl) {
    if (!this.vf_watchers.includes(watcher)) {
      this.vf_watchers.push(watcher);
      watcher.vf_watchFor.push(this);
    }
  }

  private vf_removeWatcher(watcher: AbstractControl) {
    const index = this.vf_watchers.indexOf(watcher);
    if (index !== -1) {
      this.vf_watchers.splice(index, 1);
      const watchForIndex = watcher.vf_watchFor.indexOf(this);
      watcher.vf_watchFor.splice(watchForIndex, 1);
    }
  }

  private vf_removeAllWatchers() {
    this.vf_watchers.forEach(watcher => {
      watcher.vf_removeWatchFor(this);
    });
  }

  private vf_collectMergedChoicesProp(
    prop: 'validateOn',
    sources?: any,
  ): ValidateTiming[];
  private vf_collectMergedChoicesProp(
    prop: 'validateConditions',
    sources?: any,
  ): ValidateCondition[];
  private vf_collectMergedChoicesProp(
    prop: 'numberedValidateDebounce',
    sources?: any,
  ): number[];
  private vf_collectMergedChoicesProp(
    prop: 'rules',
    sources?: any,
  ): ValidatorProp;
  private vf_collectMergedChoicesProp(
    prop:
      | 'validateOn'
      | 'validateConditions'
      | 'numberedValidateDebounce'
      | 'rules',
    sources: any = this[prop],
  ) {
    sources = sources ? (Array.isArray(sources) ? sources : [sources]) : [];
    if (this.isFormChoiceControl(this)) {
      const { choices } = this;
      choices.forEach(choice => {
        const value = choice[prop];
        if (value == null) return;
        if (Array.isArray(value)) {
          sources.push(...value);
        } else {
          sources.push(value);
        }
      });
    }
    return [...new Set(sources)];
  }

  private vf_clearAllValidateTimingListeners() {
    allValidateTimings.forEach(timing => {
      this.$off(timing, this.vf_validateOnHandler);
    });
  }

  private vf_validateDebounceTimerId: number | null = null;
  private vf_clearValidateDebounceTimer(): void {
    if (this.vf_validateDebounceTimerId !== null) {
      clearTimeout(this.vf_validateDebounceTimerId);
    }
  }

  private vf_setValidateDebounceTimer(
    cb: Function,
    delay: number = this.computedValidateDebounce,
  ) {
    this.vf_clearValidateDebounceTimer();
    if (delay === 0) {
      cb();
    } else {
      this.vf_validateDebounceTimerId = window.setTimeout(() => {
        if (!this.isDestroyed) cb();
      }, delay);
    }
  }

  private vf_validateOnHandler(delay: number = this.computedValidateDebounce) {
    const { computedValidateConditionCheckers } = this;
    for (const checker of computedValidateConditionCheckers) {
      if (!checker(this)) return;
    }
    this.vf_setValidateDebounceTimer(() => {
      this.validateSelf();
    }, delay);
  }

  private vf_resolveValidateResolvers() {
    this.vf_validateResolvers.forEach(resolver => resolver(this.errors));
    this.vf_clearValidateResolvers();
  }

  private vf_clearValidateResolvers() {
    this.vf_validateResolvers = [];
  }

  @Watch('validateOn', { immediate: true })
  protected vf_onChangeValidateTimings() {
    this.vf_clearAllValidateTimingListeners();
    [...this.computedValidateOn, 'vf_watchForValueChange'].forEach(timing => {
      this.$on(timing, this.vf_validateOnHandler);
    });
  }

  @Watch('touched')
  protected vf_onChangeTouched() {
    this.vf_validateOnHandler();
  }

  @Watch('pristine')
  protected vf_onChangePristine() {
    this.vf_validateOnHandler();
  }

  @Watch('value')
  protected vf_onChangeValue(value: any) {
    this.vf_lastValidateValueChanged = true;
    this.vf_emitValueChangeForWatchers(value);
  }

  private vf_pathThroughEventForParent(e: Event) {
    this.parent && this.parent.$emit(e.type, e);
  }

  private vf_emitValueChangeForWatchers(value = this.value) {
    this.vf_watchers.forEach(watcher => {
      watcher.$emit('vf_watchForValueChange', value);
    });
  }

  private vf_setupParent(): void {
    if (this.injectedFormParent) {
      this.parent = this.injectedFormParent;
    } else {
      const $context = this.$vnode && this.$vnode.context;
      if ($context) {
        this.parent = $context.form;
      }
    }
  }

  protected created() {
    this.vf_setupParent();
  }

  protected beforeDestroy() {
    this.vf_removeAllWatchFor();
    this.vf_removeAllWatchers();
    this.vf_clearAllValidateTimingListeners();
    this.vf_clearValidateResolvers();
    this.parent = null;
  }

  protected render(h: CreateElement): VNode | void {}
}
// abstract members
export interface AbstractControl {
  value: any;
  formValue: any | void;
  getValue(forceValue: boolean): any | void;

  /** ユーザーがまだUIの値を変更していない場合 true */
  pristine: boolean;

  /** ユーザーがchangeイベントを発生させると true */
  touched: boolean;

  clear(clearErrors?: boolean): void;
  reset(): void;
}

export interface AbstractControlParentAllErrors {
  [key: string]: ValidationErrors[];
}

@Component({
  provide() {
    return {
      formParent: this,
    };
  },
})
export class AbstractControlParent extends Mixins(AbstractControl) {
  @Model(FORM_PARENT_UPDATE_EVENT, {
    type: Object,
    default: null,
  })
  [FORM_PARENT_INPUT_PROP]!: AbstractControlParentAllErrors | null;

  get allErrors(): AbstractControlParentAllErrors | null {
    const { allControls } = this;
    let allErrors: { [key: string]: ValidationErrors[] } | null = null;
    allControls.forEach(c => {
      if (c.hasError) {
        allErrors = allErrors || {};
        const name = c.getPathFromAnyParentControl(this) || '_self';
        allErrors[name] = c.errors;
      }
    });
    return allErrors;
  }

  get someControlIsPending(): boolean {
    return this.allControls.some(c => c.pending);
  }

  @Prop({
    type: String,
    default(this: AbstractControlParent) {
      return (
        (this.$vnode && this.$vnode.data && this.$vnode.data.tag) || 'fieldset'
      );
    },
  })
  tag!: string;

  get pristine(): boolean {
    return this.controlList.some(c => c.pristine);
  }

  get touched(): boolean {
    return this.controlList.some(c => c.touched);
  }

  get allControls(): AbstractControl[] {
    return _getAllControls(this);
  }

  public clear(clearErrors: boolean = true): void {
    this.controlList.forEach(c => {
      c.clear(clearErrors);
    });
    clearErrors && this.clearErrors();
  }

  public reset(): void {
    this.controlList.forEach(c => {
      c.reset();
    });
  }

  public find(path: string | (string | number)[]): AbstractControl | null {
    return _find(this, path);
  }

  public async validateAll(): Promise<AbstractControlParentAllErrors | null> {
    await Promise.all(this.allControls.map(c => c.validateSelf()));
    return this.allErrors;
  }

  @Watch('allErrors', { immediate: true })
  protected vf_allErrorsUpdateHandler() {
    this.$emit(FORM_PARENT_UPDATE_EVENT, this.allErrors);
  }

  protected render(h: CreateElement): VNode | void {
    const slots = this.$slots.default;
    if (slots) return h(this.tag, undefined, slots);
  }
}
// abstract members
export interface AbstractControlParent {
  readonly controls: { [key: string]: AbstractControl } | AbstractControl[];
  readonly controlList: AbstractControl[];
  eachControl(
    cb: (control: AbstractControl, key: string | number) => any | void,
  ): void;
  addControl(control: AbstractControl): void;
  removeControl(control: AbstractControl): void;
  findByName(name: string): AbstractControl | void;
}

@Component({
  name: 'v-form-array',
})
export class FormArray extends Mixins(AbstractControlParent) {
  /** @private */
  static readonly vf_className = 'FormArray';
  readonly vf_className: VueFormClassName = 'FormArray';
  public readonly controls: AbstractControl[] = [];

  get controlList(): AbstractControl[] {
    return this.controls;
  }

  public getValue(forceValue: boolean = this.alwaysValue): any | void {
    if (!forceValue && this.isDisabled) return;
    const value: any[] = [];
    this.controls.forEach(c => {
      if (forceValue || !c.isDisabled) value.push(c.value);
    });
    return value;
  }

  get value(): any[] {
    return this.getValue(true);
  }

  get formValue(): any[] | void {
    return this.getValue();
  }

  public at(index: number): AbstractControl {
    return this.controls[index];
  }

  public eachControl(
    cb: (control: AbstractControl, key: number) => any | void,
  ) {
    this.controls.forEach(cb);
  }

  public setValue(value: any[]) {
    this.controls.forEach((c, index) => {
      c.value = value[index];
    });
  }

  public addControl(control: AbstractControl): void {
    this.controls.push(control);
  }

  public removeControl(control: AbstractControl): void {
    const index = this.controls.indexOf(control);
    if (index !== -1) {
      this.controls.splice(index, 1);
    }
  }

  public findByName(name: string): AbstractControl | void {
    return this.controls.find(c => c.name === name);
  }
}

/**
 * FormGroupは複数のコントロールをグループ化する際に利用します。
 * formやfieldsetのような位置づけで、これらのようなコンポーネントのMixinとしての利用を想定しています。
 * ※UI要素への紐付けを行うのは必須ではなく、単にバリデーションを目的としてデータのバケットとしてインスタンスを利用する事も可能です。

 */
@Component({
  name: 'v-form-group',
})
export class FormGroup extends Mixins(AbstractControlParent) {
  /** @private */
  static readonly vf_className = 'FormGroup';
  readonly vf_className: VueFormClassName = 'FormGroup';

  public readonly controls: { [key: string]: AbstractControl } = {};

  get controlList(): AbstractControl[] {
    return Object.keys(this.controls).map(key => this.controls[key]);
  }

  public getValue(forceValue: boolean = this.alwaysValue): any | void {
    if (!forceValue && this.isDisabled) return;
    const value: FormGroupValue = {};
    this.eachControl((c, key) => {
      if (forceValue || !c.isDisabled) value[key] = c.value;
    });
    return value;
  }

  get value(): FormGroupValue {
    return this.getValue(true);
  }

  get formValue(): FormGroupValue | void {
    return this.getValue();
  }

  public eachControl(
    cb: (control: AbstractControl, key: string) => any | void,
  ) {
    Object.keys(this.controls).forEach(key => cb(this.controls[key], key));
  }

  public setValue(value: FormGroupValue) {
    this.eachControl((c, key) => {
      c.value = value[key];
    });
  }

  public addControl(control: AbstractControl): void {
    this.$set(this.controls, control.name, control);
  }

  public removeControl(control: AbstractControl): void {
    this.$delete(this.controls, control.name);
  }

  public findByName(name: string): AbstractControl | void {
    return this.controls[name];
  }
}

@Component({
  name: 'v-form',
})
export class Form extends Mixins(FormGroup) {
  /** @private */
  static readonly vf_className = 'Form';
  readonly vf_className = 'Form';

  @Prop({
    type: String,
    default(this: AbstractControlParent) {
      return (
        (this.$vnode && this.$vnode.data && this.$vnode.data.tag) || 'form'
      );
    },
  })
  tag!: string;
}

@Component
export class AbstractValueControl extends Mixins(AbstractControl) {
  @Model(FORM_VALUE_CONTROL_UPDATE_EVENT) [FORM_VALUE_CONTROL_INPUT_PROP]: any;
  @Prop(Boolean) multiple!: boolean; // can't update
  @Prop({ type: String, default: 'change' })
  touchOn!: TouchOn;

  get initialValue(): any {
    return this.vf_initialValue;
  }

  set initialValue(initialValue: any) {
    this.vf_initialValue = this.vf_shallowClone(initialValue);
  }

  get defaultValue(): any {
    return this.multiple ? [] : null;
  }

  protected vf_isShallowEqual(a: any, b: any) {
    if (this.multiple) {
      if (a.length !== b.length) return false;
      for (let i = 0, l = a.length; i < l; i++) {
        if (a[i] !== b[i]) return false;
        break;
      }
      return true;
    }
    return a === b;
  }

  private vf_shallowClone(source: any) {
    return this.multiple ? source.slice() : source;
  }

  get pristine(): boolean {
    return this.vf_isShallowEqual(this.value, this.initialValue);
  }

  get touched(): boolean {
    return this.vf_touched;
  }

  set touched(touched: boolean) {
    if (this.vf_touched !== touched) {
      this.vf_touched = touched;
    }
  }

  private vf_touched: boolean = false;
  private vf_initialValue: any = this.vf_shallowClone(this.defaultValue);

  public clear(clearErrors: boolean = true) {
    this.value = this.vf_shallowClone(this.defaultValue);
    clearErrors && this.clearErrors();
  }

  public reset() {
    this.value = this.vf_shallowClone(this.initialValue);
  }

  public updateInitialValue() {
    this.initialValue = this.value;
  }

  public commit() {
    this.updateInitialValue();
  }

  protected created() {
    this.initialValue =
      this[FORM_VALUE_CONTROL_INPUT_PROP] || this.defaultValue;

    this.$on(this.touchOn, () => {
      this.touched = true;
    });
  }
}

/**
 * FormControlはdd-vue-formで管理するクラスの中で唯一v-modelに入力値を保持するクラスです。
 * input[type="text"]や、textarea、select等の「ユーザーの入力した値のターゲット」となる要素のMixinとして利用する事を想定しています。
 * ※UI要素への紐付けを行うのは必須ではなく、単にバリデーションを目的としてデータのバケットとしてインスタンスを利用する事も可能です。
 * <br>
 * ■ Mixin としての利用方法
 * 入力値の購読、変更は this.value を介して行ってください。
 * Mixin対象のコンポーネントのUI状態に応じて「input, change, focus, blur」を$emitしてください。
 * 通常、this.valueを変更した後に、テキスト入力のような要素であれば、inputイベント、
 * selectのような要素であればchangeイベントを発行する形になるはずです。
 * UIの状態制御のためにtabindexとisDisabledを利用してください。（disabledは親の状態を引き継がないため利用しない事をお勧めします）
 */
@Component({
  name: 'v-form-control',
  provide() {
    return {
      formControl: this,
    };
  },
})
export class FormControl extends Mixins(AbstractValueControl) {
  static readonly vf_className = 'FormControl';
  readonly vf_className = 'FormControl';

  public getValue(forceValue: boolean = this.alwaysValue): any | void {
    if (forceValue || !this.isDisabled) return this.vf_value;
  }

  get value(): any {
    return this.getValue(true);
  }

  get formValue(): any | void {
    return this.getValue();
  }

  set value(value: any) {
    value = value || this.defaultValue;

    if (value instanceof FileList) {
      // create new Array instance then event will be inevitably emited.
      value = Array.from(value);
    }

    if (!this.vf_isShallowEqual(this.vf_value, value)) {
      this.vf_value = value;
      this.$emit(FORM_VALUE_CONTROL_UPDATE_EVENT, value);
    }
  }

  private vf_value: any = (() => {
    return this.multiple ? [] : null;
  })();

  @Watch(FORM_VALUE_CONTROL_INPUT_PROP, { immediate: true })
  protected vf_onChangeInputProp(value: any | void) {
    this.vf_value = value || this.defaultValue;
  }
}

@Component({
  name: 'v-form-choice-control',
  provide() {
    return {
      formChoiceControl: this,
    };
  },
})
export class FormChoiceControl extends Mixins(AbstractValueControl) {
  static readonly vf_className = 'FormChoiceControl';
  readonly vf_className = 'FormChoiceControl';

  public readonly choices: FormChoice[] = [];

  /** @private */
  public vf_autoDestroyWhenChoicesLeave: boolean = false;

  get choicedChoices(): FormChoice[] {
    return this.choices.filter(c => c.choiced);
  }

  get unChoicedChoices(): FormChoice[] {
    return this.choices.filter(c => !c.choiced);
  }

  public getValue(forceValue: boolean = this.alwaysValue): any | void {
    if (!forceValue && this.isDisabled) return;
    let { choicedChoices } = this;
    if (!forceValue) choicedChoices = choicedChoices.filter(c => !c.isDisabled);
    if (this.multiple) {
      return choicedChoices.map(c => c.value);
    }
    return choicedChoices[0] ? choicedChoices[0].value : this.defaultValue;
  }

  get value(): any {
    return this.getValue(true);
  }

  get formValue(): any | void {
    return this.getValue();
  }

  set value(value: any) {
    this.vf_setValue(value);
  }

  private vf_setValue(value: any, withEmit: boolean = true) {
    const beforeValue = this.value;
    if (this.multiple) {
      this.choices.forEach(c => {
        c.choiced = value.includes(c.value);
      });
    } else {
      value = value || this.defaultValue;
      this.choices.forEach(c => {
        c.choiced = c.value === value;
      });
    }
    const currentValue = this.value;
    if (!this.vf_isShallowEqual(beforeValue, currentValue)) {
      this.$emit(FORM_VALUE_CONTROL_UPDATE_EVENT, currentValue);
    }
  }

  /** @private */
  public vf_emitFromChoice() {
    this.$emit(FORM_VALUE_CONTROL_UPDATE_EVENT, this.value);
  }

  /** @private */
  public vf_addChoice(choice: FormChoice) {
    if (this.multiple !== choice.multiple) {
      throw new VueFormError('Not matched multiple condition');
    }
    this.choices.push(choice);
  }

  /** @private */
  public vf_removeChoice(choice: FormChoice) {
    const index = this.choices.indexOf(choice);
    if (index !== -1) {
      this.choices.splice(index, 1);
    }

    if (this.choices.length === 0 && this.vf_autoDestroyWhenChoicesLeave) {
      this.$destroy();
    }
  }

  @Watch(FORM_VALUE_CONTROL_INPUT_PROP, { immediate: true })
  protected vf_onChangeInputProp(value: any | void) {
    this.vf_setValue(value, false);
  }
}

/**
 * FormChoiceは[FormControl]の選択肢となるクラスです。
 * VueのコンポーネントのMixinとしての利用のみを想定しています。
 * <br>
 * ■ v-model について
 * v-modelは選択肢の選択状態をbooleanで通信します。
 * <br>
 * ■ FormControlとの疎通方法について
 * 本インスタンスには必ず対応するFormControlが必要で、
 * FormControlがvnodeのツリーの上階層からInjectされた際にはそのコントロールを、
 * それがなければ設置されたvnode.contextに対して自身のname値でコントロールの生成を試みます。（この際multiple, required）属性は自身の値を設定します。
 * FormControlの参照や生成に失敗した場合例外をスローします。
 * multiple、name属性は注入されたFormControlが存在する場合、デフォルト値としてその値を継承します。
 * <br>
 * ■ 初期値設定用の特殊な属性
 * selected, checked属性が渡された場合、初期値として選択状態となりますが、
 * これはインスタンスを1度変更した以降はリアクティブに反応するものではなく、
 * 通常のHTML要素（checkbox, radio, option）等の同等のインターフェースでマークアップを行いやすいようにするためのIFです。
 * インスタンス生成以降の「selected, checked」は単なる「choiced」のエイリアスとなります。
 * <br>
 * ■ Mixinとしての利用方法
 * 選択状態の購読、変更は this.choiced を介して行ってください。
 * Mixin対象のコンポーネントのUI状態に応じて「input, change, focus, blur」を$emitしてください。
 * 通常、changeイベントはthis.choicedの変更直後に発行する形になるはずです。
 * Nativeのinput[type="radio"]を入力装置として利用する場合、multipleの設定を行うと正常に動作しない（valueとUIの状態が食い違う）事に注意してください。
 * UIの状態制御のためにtabindexとisDisabledを利用してください。（disabledは親の状態を引き継がないため利用しない事をお勧めします）
 */
@Component
export class FormChoice extends Mixins(AbstractFormNode) {
  static readonly vf_className = 'FormChoice';
  readonly vf_className = 'FormChoice';

  @Inject({
    from: 'formChoiceControl',
    default: null,
  })
  injectedChoiceControl!: FormChoiceControl | null;

  @Model(FORM_CHOICE_UPDATE_EVENT, Boolean)
  [FORM_CHOICE_INPUT_PROP]!: boolean;

  @Prop({ default: true })
  value!: any;

  @Prop({
    type: Boolean,
    default(this: FormChoice) {
      return this.injectedChoiceControl
        ? this.injectedChoiceControl.multiple
        : false;
    },
  })
  multiple!: boolean; // can't update

  @Prop({
    type: String,
    default(this: FormChoice) {
      return this.injectedChoiceControl
        ? this.injectedChoiceControl.name
        : 'form-choice-' + this.$_formNodeId;
    },
  })
  name!: string;

  public control: FormChoiceControl = INITIAL_DUMMY;

  get isDisabled(): boolean {
    return this.disabled || this.control.isDisabled;
  }

  get isReadonly(): boolean {
    return this.readonly || this.control.isReadonly;
  }

  private vf_choiced: boolean = false;

  get siblings(): FormChoice[] {
    return this.control.choices.filter(c => c !== this);
  }

  get choiced(): boolean {
    return this.vf_choiced;
  }

  set choiced(choiced: boolean) {
    if (this.vf_choiced === choiced) return;
    this.vf_choiced = choiced;
    this.$emit(FORM_CHOICE_UPDATE_EVENT, choiced);
    if (!this.multiple && choiced) {
      this.siblings.forEach(c => {
        c.unchoice();
      });
    }
    this.control.vf_emitFromChoice();
  }

  get checked(): boolean {
    return this.choiced;
  }

  set checked(checked: boolean) {
    this.choiced = checked;
  }

  get selected(): boolean {
    return this.choiced;
  }

  set selected(selected: boolean) {
    this.choiced = selected;
  }

  public choice() {
    this.choiced = true;
  }

  public unchoice() {
    this.choiced = false;
  }

  public toggle() {
    this.choiced = !this.choiced;
  }

  public check() {
    return this.choice();
  }

  public uncheck() {
    return this.unchoice();
  }

  public select() {
    return this.choice();
  }

  public deselect() {
    return this.unchoice();
  }

  private _vf_initialChoiced: boolean = false;

  private vf_pathThroughEventForControl(e: Event) {
    this.control && this.control.$emit(e.type, e);
  }

  private vf_setupControl(): void {
    if (this.control) return;

    let control: FormChoiceControl | null | void =
      this.injectedChoiceControl ||
      (this.injectedFormParent &&
        (this.injectedFormParent.findByName(this.name) as FormChoiceControl));

    if (control && !control.isFormChoiceControl()) {
      console.warn(this);
      throw new VueFormError('FormChoice can be inside FormChoiceControl.');
    }

    if (!control) {
      const { context } = this.$vnode;
      if (!context) {
        console.warn(this);
        throw new VueFormError(
          'A FormChoice not injecting FormControl needs a Context of the vnode.',
        );
      }
      const finded = context.form.findByName(this.name);
      if (finded) {
        if (finded.isFormChoiceControl(finded)) {
          control = finded;
        } else {
          throw new VueFormError(
            'FormChoice can not be paired with an ' + finded.vf_className,
          );
        }
      }

      if (!control) {
        control = new FormChoiceControl({
          propsData: {
            name: this.name,
            multiple: this.multiple,
            required: this.required,
          },
        });
        if (this.injectedFormParent) {
          control.parent = this.injectedFormParent;
        } else {
          control.parent = context.form;
        }
        control.vf_autoDestroyWhenChoicesLeave = true;
        context.$emit('vf_autoCreateChoiceControll', control);
      }
    }

    control.vf_addChoice(this);
    this.control = control;

    if (this[FORM_CHOICE_INPUT_PROP] || this._vf_initialChoiced) {
      this.choice();
      control.updateInitialValue();
    }

    const controlValue = control[FORM_VALUE_CONTROL_INPUT_PROP];
    if (control.multiple) {
      this.choiced = (controlValue || []).includes(this.value);
    } else {
      this.choiced = controlValue === this.value;
    }

    PATH_THROUGH_EVENTS.forEach(type => {
      this.$on(type, this.vf_pathThroughEventForControl);
    });
  }

  private vf_removeControl(): void {
    this.control && this.control.vf_removeChoice(this);
    PATH_THROUGH_EVENTS.forEach(type => {
      this.$off(type, this.vf_pathThroughEventForControl);
    });
    delete this.control;
  }

  protected beforeCreate() {
    if (
      this.$attrs.checked !== undefined ||
      this.$attrs.selected !== undefined
    ) {
      this._vf_initialChoiced = true;
      delete this.$attrs.checked;
      delete this.$attrs.selected;
    }
  }

  protected created() {
    this.vf_setupControl();
  }

  protected beforeDestroy() {
    this.vf_removeControl();
  }
}

// ==================================================
// private functions
// ==================================================
function _getAllControls(
  control: AbstractControl,
  controls: AbstractControl[] = [],
): AbstractControl[] {
  controls.push(control);
  if (control.isParentControl(control)) {
    const { controlList } = control;
    controlList.forEach(c => {
      _getAllControls(c, controls);
    });
  }
  return controls;
}

function _find(
  control: AbstractControlParent,
  path: (string | number)[] | string | number,
): AbstractControl | null {
  path = String(path);
  if (Array.isArray(path)) path = path.join('.');
  path = path.replace(/\[((?!\]).)+\]/g, '.$1.').replace(/\.$/, '');
  const keys = path.split('.');
  if (keys.length === 0) return null;

  let tickedControl: AbstractControl | null = control;

  for (const key of keys) {
    if (tickedControl.isParentControl(tickedControl)) {
      if (Array.isArray(tickedControl.controls)) {
        tickedControl = tickedControl.controls[Number(key)] || null;
      } else {
        tickedControl = tickedControl.controls.hasOwnProperty(key)
          ? tickedControl.controls[key]
          : null;
      }
    } else {
      tickedControl = null;
    }
    if (tickedControl === null) break;
  }
  return tickedControl;
}

function _getPathAtAnyParentControlToChildControl(
  parentControl: AbstractControlParent,
  childControl: AbstractControl,
  totalPath: string = '',
): string | null {
  if (!childControl || !childControl.parent) return null;
  const { parent } = childControl;
  totalPath = childControl.keyFromParentControl + '.' + totalPath;
  if (parent === parentControl) {
    totalPath = totalPath
      .replace(/\]\.\[/g, '][')
      .replace(/\.\[/g, '[')
      .replace(/\.$/, '');
    return totalPath;
  }
  return _getPathAtAnyParentControlToChildControl(
    parentControl,
    parent,
    totalPath,
  );
}
