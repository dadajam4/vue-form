import * as alphaHelper from './alphaHelper';

export interface FileInfo {
  name: string;
  size: number;
  type: string;
}

export interface ImageInfo {
  width: number;
  height: number;
  ratio: number;
}

export interface ImageFileInfo extends FileInfo, ImageInfo {}

export function getFileInfo(file: File): FileInfo {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
  };
}

export async function getImageFileInfo(file: File): Promise<ImageFileInfo> {
  const dimension = await getImageDimension(file);
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    ...dimension,
  };
}

/**
 * value === null
 * || value === undefined
 * || value === ''
 * || Array.isArray(value) && value.length === 0
 */
export function isEmptyInputValue(value: any): boolean {
  return value == null || value.length === 0;
}

export function getInputValueLength(value: any): number {
  if (typeof value === 'number') value = String(value);
  if (!!value) {
    return value.length || 0;
  }
  return value ? value.length || 0 : 0;
}

export const EMAIL_REGEXP = /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;

export function isEmailValue(value: any): boolean {
  return EMAIL_REGEXP.test(value);
}

export function isNumeric(value: any): boolean {
  return /^[0-9]+$/.test(String(value));
}

export function isInteger(value: any): boolean {
  return /^-?[0-9]+$/.test(String(value));
}

/**
 * value == requiredValue
 */
export function isEqual(value: any, requiredValue: any): boolean {
  return value == requiredValue;
}

/**
 * value != requiredValue
 */
export function isNotEqual(value: any, requiredValue: any): boolean {
  return value != requiredValue;
}

/**
 * value === requiredValue
 */
export function isStrictEqual(value: any, requiredValue: any): boolean {
  return value === requiredValue;
}

/**
 * value !== requiredValue
 */
export function isNotStrictEqual(value: any, requiredValue: any): boolean {
  return value !== requiredValue;
}

/**
 * value >= min
 */
export function isNotLessThan(value: any, min: any): boolean {
  const parsedValue = parseFloat(value);
  const minValue = parseFloat(min);
  if (isNaN(parsedValue)) return false;
  if (isNaN(parsedValue)) return true;
  return parsedValue >= minValue;
}

/**
 * value > min
 */
export function isGreaterThan(value: any, min: any): boolean {
  const parsedValue = parseFloat(value);
  const minValue = parseFloat(min);
  if (isNaN(parsedValue)) return false;
  if (isNaN(parsedValue)) return true;
  return parsedValue > minValue;
}

/**
 * value <= max
 */
export function isNotGreaterThan(value: any, max: any): boolean {
  const parsedValue = parseFloat(value);
  const minValue = parseFloat(max);
  if (isNaN(parsedValue)) return true;
  if (isNaN(parsedValue)) return false;
  return parsedValue <= minValue;
}

/**
 * value < max
 */
export function isLessThan(value: any, max: any): boolean {
  const parsedValue = parseFloat(value);
  const minValue = parseFloat(max);
  if (isNaN(parsedValue)) return true;
  if (isNaN(parsedValue)) return false;
  return parsedValue < minValue;
}

/**
 * min <= value <= max
 */
export function isBetween(value: any, min: any, max: any): boolean {
  return isNotLessThan(value, min) && isNotGreaterThan(value, max);
}

export function isAlpha(value: any, locale?: string): boolean {
  const reMap = alphaHelper.alpha;
  const helper = (locale && reMap[locale]) || undefined;
  return helper
    ? helper.test(value)
    : Object.keys(reMap).some(loc => reMap[loc].test(value));
}

export function isAlphaDash(value: any, locale?: string): boolean {
  const reMap = alphaHelper.alphaDash;
  const helper = (locale && reMap[locale]) || undefined;
  return helper
    ? helper.test(value)
    : Object.keys(reMap).some(loc => reMap[loc].test(value));
}

export function isAlphaNumeric(value: any, locale?: string): boolean {
  const reMap = alphaHelper.alphaNumeric;
  const helper = (locale && reMap[locale]) || undefined;
  return helper
    ? helper.test(value)
    : Object.keys(reMap).some(loc => reMap[loc].test(value));
}

export function isAlphaSpaces(value: any, locale?: string): boolean {
  const reMap = alphaHelper.alphaSpaces;
  const helper = (locale && reMap[locale]) || undefined;
  return helper
    ? helper.test(value)
    : Object.keys(reMap).some(loc => reMap[loc].test(value));
}

export function getImageDimension(
  pathOrfile: string | File,
): Promise<ImageInfo> {
  const URL = window.URL || ((window as any).webkitURL as URL);
  const isFile = typeof pathOrfile !== 'string';

  return new Promise((resolve, reject) => {
    const src = isFile ? URL.createObjectURL(pathOrfile) : <string>pathOrfile;
    const image = new Image();
    image.onerror = e => {
      isFile && URL.revokeObjectURL(src);
      reject(e);
    };
    image.onload = () => {
      isFile && URL.revokeObjectURL(src);
      const { width, height } = image;
      resolve({
        width,
        height,
        ratio: width / height,
      });
    };
    image.src = src;
  });
}

export interface ImageFileDimensionConditions {
  width?: CompareCondition[];
  height?: CompareCondition[];
  ratio?: CompareCondition[];
}

export type ImageFileDimensionInputConditions = {
  [P in keyof ImageFileDimensionConditions]?: string | string[]
};

export interface ImageFileDimensionRowError {
  actual: number;
  conditions: CompareCondition[];
}

export type ImageFileDimensionError = {
  [P in keyof ImageFileDimensionConditions]?: ImageFileDimensionRowError
};

const IMAGE_DIMENSION_VALIDATE_KEYS: (keyof ImageFileDimensionConditions)[] = [
  'width',
  'height',
  'ratio',
];
export async function getImageFileDimensionErrors(
  file: File,
  conditions: ImageFileDimensionConditions,
): Promise<ImageFileDimensionError | null> {
  const info = await getImageFileInfo(file);
  let errors: ImageFileDimensionError | null = null;
  IMAGE_DIMENSION_VALIDATE_KEYS.forEach(key => {
    const rowConditions = conditions[key];
    const value = info[key];
    if (
      rowConditions &&
      !compareValueByCompareConditions(info[key], rowConditions)
    ) {
      errors = errors || {};
      errors[key] = {
        actual: value,
        conditions: rowConditions,
      };
    }
  });
  return errors;
}

export type CompareExt = '<=' | '>=' | '<>' | '!=' | '<' | '>' | '=';
export interface CompareCondition {
  ammount: number;
  ext: CompareExt;
  isNotEqual: boolean;
  hasEqual: boolean;
  hasGreater: boolean;
  hasNotGreater: boolean;
}

export function conditionStringToCompareConditions(
  conditions: number | string | (number | string)[],
): CompareCondition[] {
  conditions = Array.isArray(conditions) ? conditions : [conditions];
  return conditions.map(condition => {
    condition = String(condition);
    const extMatch = condition.match(/^(<=|>=|<>|!=|<|>|=)+/);
    const valueMatch = condition.match(/[\d\.]+/);
    const ext: CompareExt = extMatch ? (extMatch[0] as CompareExt) : '=';
    const ammount = valueMatch ? parseFloat(valueMatch[0]) : 0;
    const isNotEqual = ['<>', '!='].includes(ext);
    const hasEqual = !isNotEqual && ext.indexOf('=') !== -1;
    const hasGreater = !isNotEqual && ext.indexOf('>') !== -1;
    const hasNotGreater = !isNotEqual && ext.indexOf('<') !== -1;
    return { ammount, ext, isNotEqual, hasEqual, hasGreater, hasNotGreater };
  });
}

export function compareValueByCompareCondition(
  value: any,
  condition: CompareCondition,
): boolean {
  const { ammount } = condition;
  if (condition.isNotEqual) {
    return value !== ammount;
  }

  if (condition.hasEqual && value === ammount) return true;
  if (condition.hasGreater) {
    return value > ammount;
  }
  if (condition.hasNotGreater) {
    return value < ammount;
  }
  return false;
}

export function compareValueByCompareConditions(
  value: any,
  conditions: CompareCondition | CompareCondition[],
): boolean {
  conditions = Array.isArray(conditions) ? conditions : [conditions];
  for (const condition of conditions) {
    if (!compareValueByCompareCondition(value, condition)) return false;
  }
  return true;
}
