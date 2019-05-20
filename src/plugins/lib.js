import Vue from 'vue';
import { VueFormPlugin } from '~/lib';
import * as components from '~/components';

Vue.use(VueFormPlugin);

Object.keys(components).forEach(key => {
  const Component = components[key];
  const name = Component.options ? Component.options.name : Component.name;
  Vue.component(name, Component);
});

// if (module && module.hot) {
//   module.hot.accept(function(err) {
//     if (err) {
//       console.error(err);
//     }
//   });

//   module.hot.dispose(function() {
//     console.warn('なにがおきた、、、？');
//     // Vue.$form.reset();
//   });
// }

// export default function(context) {
//   if (typeof process !== 'undefined' && process.memoryUsage) {
//     console.log(process.memoryUsage());
//   }
//   Vue.$form.reset();
// }
