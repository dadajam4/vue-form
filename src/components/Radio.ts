import { Component } from 'vue-property-decorator';
import { Mixins } from 'vue-mixin-decorator';
import Choice from '~/mixins/Choice';

@Component({
  name: 'v-radio',
})
export default class Radio extends Mixins<Choice>(Choice) {
  type = 'radio';
}
