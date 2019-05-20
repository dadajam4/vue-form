import { AbstractControl } from '../classes';
import * as util from './util';
import {
  FileInfo,
  ImageFileDimensionError,
  getImageFileDimensionErrors,
  ImageFileDimensionInputConditions,
} from './util';
import { VueFormError } from '../util';
export * from './util';
const { isEmptyInputValue, getInputValueLength } = util;

export type ValidatorFactory = (...args: any[]) => ValidatorFn;

export interface ValidatorFn {
  (control: AbstractControl):
    | (ValidationErrors | null)
    | Promise<ValidationErrors | null>;
}

export type ValidatorFactoriesOnly = Pick<
  ValidatorFactories,
  Exclude<keyof ValidatorFactories, 'regist'>
>;
export type ValidatorFactoryName = keyof ValidatorFactoriesOnly;

export interface ValidatorFactoryMap {
  [key: string]: ValidatorFactory;
}

export interface ValidationErrors {
  [key: string]: any;
}

export type ValidationResult = ValidationErrors | null;

function nullValidator(control: AbstractControl): ValidationResult {
  return null;
}

/**
 * 入力が空であるか
 */
function empty(control: AbstractControl): ValidationResult {
  return isEmptyInputValue(control.value) ? null : { empty: true };
}

/**
 * 入力がされているか
 */
function required(control: AbstractControl): ValidationResult {
  return isEmptyInputValue(control.value) ? { required: true } : null;
}

/**
 * 入力値がemailアドレスか
 */
function email(control: AbstractControl): ValidationResult {
  const { value } = control;
  return isEmptyInputValue(value) || util.isEmailValue(value)
    ? null
    : { email: true };
}

/**
 * 数値のみであるか
 * allowed: ... 0, 1, 2 ...
 */
function numeric(control: AbstractControl): ValidationResult {
  const { value } = control;
  return isEmptyInputValue(value) || util.isNumeric(value)
    ? null
    : { integer: true };
}

/**
 * 整数であるか
 * allowed: ... -1, 0, 1 ...
 */
function integer(control: AbstractControl): ValidationResult {
  const { value } = control;
  return isEmptyInputValue(value) || util.isInteger(value)
    ? null
    : { integer: true };
}

export class ValidatorFactories {
  empty() {
    return empty;
  }

  required() {
    return required;
  }

  email() {
    return email;
  }

  numeric() {
    return numeric;
  }

  integer() {
    return integer;
  }

  equal(compared: any) {
    return function equal(control: AbstractControl): ValidationResult {
      const { value } = control;
      return isEmptyInputValue(value) || util.isEqual(value, compared)
        ? null
        : { equal: { compared, actual: value } };
    };
  }

  notEqual(compared: any) {
    return function notEqual(control: AbstractControl): ValidationResult {
      const { value } = control;
      return isEmptyInputValue(value) || util.isNotEqual(value, compared)
        ? null
        : { notEqual: { compared, actual: value } };
    };
  }

  is(compared: any) {
    return function is(control: AbstractControl): ValidationResult {
      const { value } = control;
      return isEmptyInputValue(value) || util.isStrictEqual(value, compared)
        ? null
        : { is: { compared, actual: value } };
    };
  }

  isNot(compared: any) {
    return function isNot(control: AbstractControl): ValidationResult {
      const { value } = control;
      return isEmptyInputValue(value) || util.isNotStrictEqual(value, compared)
        ? null
        : { is: { compared, actual: value } };
    };
  }

  min(compared: number) {
    return function min(control: AbstractControl): ValidationResult {
      const { value } = control;
      return isEmptyInputValue(value) || util.isNotLessThan(value, compared)
        ? null
        : { min: { min: compared, actual: value } };
    };
  }

  greater(compared: number) {
    return function greater(control: AbstractControl): ValidationResult {
      const { value } = control;
      return isEmptyInputValue(value) || util.isGreaterThan(value, compared)
        ? null
        : { greater: { min: compared, actual: value } };
    };
  }

  max(compared: number) {
    return function max(control: AbstractControl): ValidationErrors | null {
      const { value } = control;
      return isEmptyInputValue(value) || util.isNotGreaterThan(value, compared)
        ? null
        : { max: { max: compared, actual: value } };
    };
  }

  less(compared: number) {
    return function less(control: AbstractControl): ValidationErrors | null {
      const { value } = control;
      return isEmptyInputValue(value) || util.isLessThan(value, compared)
        ? null
        : { less: { max: compared, actual: value } };
    };
  }

  between(minValue: number, maxValue: number) {
    return function between(control: AbstractControl): ValidationErrors | null {
      const { value } = control;
      return isEmptyInputValue(value) ||
        util.isBetween(value, minValue, maxValue)
        ? null
        : { between: { min: minValue, max: maxValue, actual: value } };
    };
  }

  alpha(locale?: string) {
    return function alpha(control: AbstractControl): ValidationErrors | null {
      const { value } = control;
      return isEmptyInputValue(value) || util.isAlpha(value, locale)
        ? null
        : { alpha: true };
    };
  }

  alphaDash(locale?: string) {
    return function alphaDash(
      control: AbstractControl,
    ): ValidationErrors | null {
      const { value } = control;
      return isEmptyInputValue(value) || util.isAlphaDash(value, locale)
        ? null
        : { alphaDash: true };
    };
  }

  alphaNumeric(locale?: string) {
    return function alphaNumeric(
      control: AbstractControl,
    ): ValidationErrors | null {
      const { value } = control;
      return isEmptyInputValue(value) || util.isAlphaNumeric(value, locale)
        ? null
        : { alphaNumeric: true };
    };
  }

  alphaSpaces(locale?: string) {
    return function alphaSpaces(
      control: AbstractControl,
    ): ValidationErrors | null {
      const { value } = control;
      return isEmptyInputValue(value) || util.isAlphaSpaces(value, locale)
        ? null
        : { alphaSpaces: true };
    };
  }

  length(requiredLength: number) {
    return function length(control: AbstractControl): ValidationErrors | null {
      const { value } = control;
      if (isEmptyInputValue(value)) return null;
      const length = getInputValueLength(value);
      return length === requiredLength
        ? null
        : { length: { requiredLength, actualLength: length } };
    };
  }

  minLength(requiredLength: number) {
    return function minLength(
      control: AbstractControl,
    ): ValidationErrors | null {
      const { value } = control;
      if (isEmptyInputValue(value)) return null;
      const length = getInputValueLength(value);
      return length >= requiredLength
        ? null
        : { minLength: { requiredLength, actualLength: length } };
    };
  }

  maxLength(requiredLength: number) {
    return function maxLength(
      control: AbstractControl,
    ): ValidationErrors | null {
      const { value } = control;
      if (isEmptyInputValue(value)) return null;
      const length = getInputValueLength(value);
      return length <= requiredLength
        ? null
        : { maxLength: { requiredLength, actualLength: length } };
    };
  }

  betweenLength(minLength: number, maxLength: number) {
    return function betweenLength(
      control: AbstractControl,
    ): ValidationErrors | null {
      const { value } = control;
      if (isEmptyInputValue(value)) return null;
      const length = getInputValueLength(value);
      return length >= minLength && length <= maxLength
        ? null
        : { maxLength: { minLength, maxLength, actualLength: length } };
    };
  }

  pattern(requiredPattern: string | RegExp) {
    if (!requiredPattern) return nullValidator;
    let regex: RegExp;
    let regexStr: string;
    if (typeof requiredPattern === 'string') {
      regexStr = '';

      if (requiredPattern.charAt(0) !== '^') regexStr += '^';

      regexStr += requiredPattern;

      if (requiredPattern.charAt(requiredPattern.length - 1) !== '$')
        regexStr += '$';

      regex = new RegExp(regexStr);
    } else {
      regexStr = requiredPattern.toString();
      regex = requiredPattern;
    }
    return function pattern(control: AbstractControl): ValidationErrors | null {
      const { value } = control;
      if (isEmptyInputValue(value)) {
        return null; // don't validate empty values to allow optional controls
      }
      return regex.test(value)
        ? null
        : { pattern: { requiredPattern: regexStr, actualValue: value } };
    };
  }

  confirm(comparePathOrControl: AbstractControl | string) {
    return function confirm(control: AbstractControl): ValidationErrors | null {
      const { value } = control;
      if (isEmptyInputValue(value)) return null;
      let compareControl: AbstractControl | null = null;
      if (typeof comparePathOrControl === 'string') {
        let { parent } = control;
        // console.warn(parent);
        // if (!parent) {
        //   console.warn(control.$vnode.context);
        // }
        // if (!parent && control.$vnode.context) {
        //   console.warn(control.$vnode.context.form);
        // }
        // if (!parent && control.$vnode.context)
        // console.warn(parent);
        console.log('■', parent);
        if (!parent) return null;
        compareControl = parent.find(comparePathOrControl);
        if (!compareControl) return null;
      } else {
        compareControl = comparePathOrControl;
      }
      console.warn(compareControl);
      control.vf_addWatchFor(compareControl);
      const compared = compareControl.value;
      return isEmptyInputValue(compared) || compared === value
        ? null
        : { confirm: { compared, actualValue: value } };
    };
  }

  include(...includes: any[]) {
    return function include(control: AbstractControl): ValidationErrors | null {
      const { value } = control;
      if (isEmptyInputValue(value)) return null;
      const isMultiple = Array.isArray(value);
      const errorItems: any = includes.filter((i: any) => {
        return isMultiple ? !value.includes(i) : value !== i;
      });
      return errorItems.length === 0
        ? null
        : { include: { includes, actualValue: value } };
    };
  }

  exclude(...excludes: any[]) {
    return function include(control: AbstractControl): ValidationErrors | null {
      const { value } = control;
      if (isEmptyInputValue(value)) return null;
      const isMultiple = Array.isArray(value);
      const errorItems: any = excludes.filter((i: any) => {
        return isMultiple ? value.includes(i) : value === i;
      });
      return errorItems.length === 0
        ? null
        : { include: { excludes, actualValue: value } };
    };
  }

  mimes(...mimes: string[]) {
    const regex = new RegExp(`${mimes.join('|').replace('*', '.+')}$`, 'i');
    return function include(control: AbstractControl): ValidationErrors | null {
      const { fileInformations } = control;
      if (isEmptyInputValue(fileInformations)) return null;
      const errors: {
        file: FileInfo;
        index: number;
      }[] = [];
      fileInformations.forEach((file, index) => {
        if (!regex.test(file.type)) {
          errors.push({ file, index });
        }
      });
      return errors.length === 0
        ? null
        : { mimes: { requiredMimes: mimes, files: errors } };
    };
  }

  size(size: number | string) {
    size = String(size);
    const numeric = parseFloat(size);
    const unitMatch = size.match(/(m|k|g|t)?b$/i);
    const unit =
      (unitMatch && unitMatch[1] ? unitMatch[1] : 'm').toLowerCase() + 'b';
    const maxSize = numeric + unit;
    return function include(control: AbstractControl): ValidationErrors | null {
      const { fileInformations } = control;
      if (isEmptyInputValue(fileInformations)) return null;

      let computedByte: number = numeric;
      if (unit === 'kb') {
        computedByte *= 1024;
      } else if (unit === 'mb') {
        computedByte *= 1024 * 1024;
      } else if (unit === 'gb') {
        computedByte *= 1024 * 1024 * 1024;
      } else if (unit === 'tb') {
        computedByte *= 1024 * 1024 * 1024 * 1024;
      }
      const errors: {
        file: FileInfo;
        index: number;
      }[] = [];
      fileInformations.forEach((file, index) => {
        if (file.size > computedByte) {
          errors.push({
            file,
            index,
          });
        }
      });
      return errors.length === 0 ? null : { size: { maxSize, files: errors } };
    };
  }

  dimensions(conditions: ImageFileDimensionInputConditions) {
    const createdConditions = {
      width:
        conditions.width !== undefined
          ? util.conditionStringToCompareConditions(conditions.width)
          : undefined,
      height:
        conditions.height !== undefined
          ? util.conditionStringToCompareConditions(conditions.height)
          : undefined,
      ratio:
        conditions.ratio !== undefined
          ? util.conditionStringToCompareConditions(conditions.ratio)
          : undefined,
    };
    return async function dimensions(
      control: AbstractControl,
    ): Promise<ValidationErrors | null> {
      const { files } = control;
      if (isEmptyInputValue(files)) return null;

      const errors: {
        file: ImageFileDimensionError;
        index: number;
      }[] = [];

      await Promise.all(
        files.map(async (f, index) => {
          const rowErrors = await getImageFileDimensionErrors(
            f,
            createdConditions,
          );
          if (rowErrors) {
            errors.push({ file: rowErrors, index });
          }
        }),
      );

      return errors.length === 0
        ? null
        : { dimensions: { conditions: createdConditions, files: errors } };
    };
  }

  regist(name: string, factory: ValidatorFactory): void;
  regist(registerMap: ValidatorFactoryMap): void;
  regist(
    nameOrRegisterMap: string | ValidatorFactoryMap,
    factory?: ValidatorFactory,
  ) {
    let registerMap: ValidatorFactoryMap;
    if (typeof nameOrRegisterMap === 'string') {
      if (!factory)
        throw new VueFormError(`missing factory for ${nameOrRegisterMap}`);
      registerMap = { [nameOrRegisterMap]: factory };
    } else {
      registerMap = nameOrRegisterMap;
    }
    for (const key in registerMap) {
      (this as any)[key] = registerMap[key];
    }
  }
}

export const Validators = new ValidatorFactories();
