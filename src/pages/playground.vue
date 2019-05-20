<template>
  <div>
    <table class="table">
      <thead>
        <tr>
          <th>type</th>
          <td>count</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th>nodes</th>
          <td>{{ $form.nodes.length }}</td>
        </tr>
        <tr>
          <th>controls</th>
          <td>{{ $form.controls.length }}</td>
        </tr>
        <tr>
          <th>forms</th>
          <td>{{ $form.forms.length }}</td>
        </tr>
        <tr>
          <th>formGroups</th>
          <td>{{ $form.formGroups.length }}</td>
        </tr>
        <tr>
          <th>formArrays</th>
          <td>{{ $form.formArrays.length }}</td>
        </tr>
        <tr>
          <th>valueControls</th>
          <td>{{ $form.valueControls.length }}</td>
        </tr>
        <tr>
          <th>formControls</th>
          <td>{{ $form.formControls.length }}</td>
        </tr>
        <tr>
          <th>formChoiceControls</th>
          <td>{{ $form.formChoiceControls.length }}</td>
        </tr>
      </tbody>
    </table>

    <nuxt-child/>
  </div>
</template>

<script>
export default {
  // created() {
  //   console.warn(this.$form.nodes.length);
  // },
};
</script>
