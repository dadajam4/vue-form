import { Component, Mixins } from 'vue-property-decorator';
import Choice from '~/mixins/Choice';

@Component({
  name: 'v-checkbox',
})
export default class Checkbox extends Mixins<Choice>(Choice) {
  type = 'checkbox';
}
