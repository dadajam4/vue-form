import { Component, Mixins } from 'vue-property-decorator';
import Choice from '~/mixins/Choice';

@Component({
  name: 'v-radio',
})
export default class Radio extends Mixins<Choice>(Choice) {
  type = 'radio';
}
