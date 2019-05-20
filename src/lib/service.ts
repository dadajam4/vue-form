import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import {
  AbstractFormNode,
  AbstractControl,
  FormArray,
  FormChoice,
  FormControl,
  FormChoiceControl,
  FormGroup,
  Form,
} from './classes';
import { Validators } from './validators';

@Component({
  name: 'v-form-service',
})
export default class FormService extends Vue {
  public readonly Ctors = {
    FormArray,
    FormChoice,
    FormControl,
    FormChoiceControl,
    FormGroup,
    Form,
  };
  public readonly rules = Validators;

  private vf_incrementForId: number = 0;
  public readonly nodes: AbstractFormNode[] = [];
  public readonly contextFormedVms: Vue[] = [];
  public createComponentId(): number {
    return ++this.vf_incrementForId;
  }

  get controls(): AbstractControl[] {
    return this.nodes.filter(n => n.isControl()) as AbstractControl[];
  }

  get forms(): Form[] {
    return this.controls.filter(n => n.isForm()) as Form[];
  }

  get formGroups(): FormGroup[] {
    return this.controls.filter(n => n.isFormGroup()) as FormGroup[];
  }

  get formArrays(): FormArray[] {
    return this.controls.filter(n => n.isFormArray()) as FormArray[];
  }

  get valueControls(): (FormControl | FormChoiceControl)[] {
    return this.controls.filter(n => n.isValueControl()) as (
      | FormControl
      | FormChoiceControl)[];
  }

  get formControls(): FormControl[] {
    return this.controls.filter(n => n.isFormControl()) as FormControl[];
  }

  get formChoiceControls(): FormChoiceControl[] {
    return this.controls.filter(n =>
      n.isFormChoiceControl(),
    ) as FormChoiceControl[];
  }

  public addFormNode(node: AbstractFormNode): number {
    let index = this.nodes.indexOf(node);
    if (index === -1) index = this.nodes.push(node);
    return index;
  }

  public removeFormNode(node: AbstractFormNode): void {
    const index = this.nodes.indexOf(node);
    if (index !== -1) this.nodes.splice(index, 1);
    if (this.nodes.length === 0) this.vf_incrementForId = 0;
  }

  public addContextFormedVm(vm: Vue): number {
    let index = this.contextFormedVms.indexOf(vm);
    if (index === -1) index = this.contextFormedVms.push(vm);
    return index;
  }

  public removeContextFormedVm(vm: Vue): void {
    const index = this.contextFormedVms.indexOf(vm);
    if (index !== -1) this.contextFormedVms.splice(index, 1);
  }

  public resetFormService(): void {
    this.nodes.slice().forEach(node => {
      node.$destroy();
    });
    this.contextFormedVms.slice().forEach(vm => {
      vm.$destroy();
    });
    this.vf_incrementForId = 0;
  }

  protected beforeDestroy() {
    this.resetFormService();
  }
}
