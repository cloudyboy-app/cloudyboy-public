<script setup lang="ts">
import { object, string } from 'yup';
import { Form, Field } from 'vee-validate';

import { Collection } from '~~/models/collection';

const emit = defineEmits<{
  (event: 'submit', data: Partial<Collection>): void;
}>();
const props = defineProps<{
  initialValues: Partial<Collection>;
  loading: boolean;
}>();
const { initialValues, loading } = toRefs(props);

const validationSchema = object().shape({
  title: string()
    .required('Title is required')
    .max(200, 'Title cannot be longer than 200 characters'),
  description: string()
    .notRequired()
    .max(5000, 'Description cannot be longer than 5000 characters')
});

const emitSubmitEvent = (data: Partial<Collection>) => emit('submit', data);
</script>

<template>
  <Form
    v-slot="{ meta, errors, resetForm }"
    :validation-schema="validationSchema"
    :initial-values="initialValues"
    @submit="emitSubmitEvent"
  >
    <div class="form-control">
      <label for="title" class="label">
        <span class="label-text">
          Title
          <sup class="text-red-500">*</sup>
        </span>
      </label>
      <Field
        id="title"
        name="title"
        class="input input-bordered w-full"
        :class="{ 'input-error': errors.title }"
        :disabled="loading"
      />
      <label v-if="errors.title" class="label">
        <span class="label-text text-error">{{ errors.title }}</span>
      </label>
    </div>
    <div class="form-control my-6">
      <label for="description" class="label">
        <span class="label-text">Description (max. 5000 characters)</span>
      </label>
      <Field
        id="description"
        class="textarea textarea-bordered h-24"
        name="description"
        as="textarea"
        :disabled="loading"
      />
      <label v-if="errors.description" class="label">
        <span class="label-text text-error">{{ errors.description }}</span>
      </label>
    </div>
    <div class="my-6"><sup class="text-red-500">*</sup> - required field</div>

    <button
      class="btn btn-primary"
      type="submit"
      :class="{ loading }"
      :disabled="loading || !meta.dirty || !meta.valid"
    >
      Submit
    </button>
    <button
      class="btn btn-outline btn-warning ml-4"
      type="button"
      :disabled="loading || !meta.dirty"
      @click="resetForm()"
    >
      Reset form
    </button>
  </Form>
</template>
