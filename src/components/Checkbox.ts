import { Component } from 'vue-property-decorator';
import { Mixins } from 'vue-mixin-decorator';
import Choice from '~/mixins/Choice';

@Component({
  name: 'v-checkbox',
})
export default class Checkbox extends Mixins<Choice>(Choice) {
  type = 'checkbox';
}
