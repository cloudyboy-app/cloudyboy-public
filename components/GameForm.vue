<script setup lang="ts">
import { object, string, mixed, array } from 'yup';
import { Form, Field, FieldArray } from 'vee-validate';

import { Game } from '~~/models/game';

const emit = defineEmits<{ (event: 'submit', data: Partial<Game>): void }>();
const props = defineProps<{ initialValues: Partial<Game>; loading: boolean }>();
const { initialValues, loading } = toRefs(props);

const EIGHT_MEGABYTES = 8388608;

const validateMaxFileSize = (file: File | null) =>
  file?.size <= EIGHT_MEGABYTES;

const validateImageMimeType = (file: File | null) =>
  file?.type.startsWith('image/');

const validationSchema = object().shape(
  {
    title: string().required('This field is required'),
    description: string()
      .notRequired()
      .max(5000, 'Description cannot be longer than 5000 characters'),
    file: mixed()
      .required('This field is required')
      .test(
        'fileExtension',
        "This file doesn't have a .gb or .gbc extension",
        (file: File) =>
          file?.name.endsWith('.gb') || file?.name.endsWith('.gbc')
      ),
    cover: mixed()
      .required()
      .test('mimeType', 'This file is not an image', validateImageMimeType)
      .test('maxSize', "This file's size exceeds 8 MB", validateMaxFileSize),
    screenshots: mixed()
      .notRequired()
      .when('screenshots', {
        is: (files: FileList) => files?.length > 0,
        then: (schema) =>
          schema
            .test(
              'maxFileListLength',
              'You cannot choose more than 10 files',
              (files: FileList) => files?.length <= 10
            )
            .test(
              'mimeType',
              'Some of the files are not images',
              (files: FileList) => [...files].every(validateImageMimeType)
            )
            .test(
              'maxSize',
              "Some of the files' sizes exceed 8 MB",
              (files: FileList) => [...files].every(validateMaxFileSize)
            )
      }),
    tagToAdd: string()
      .notRequired()
      .when('tagToAdd', {
        is: (value: string) => value?.length > 0,
        then: (schema) =>
          schema
            .test(
              'lengthRange',
              'Tags have to contain between 3 and 50 characters',
              (tag: string) => tag?.length >= 3 && tag?.length <= 50
            )
            .test(
              'unique',
              'This tag has already been added',
              function (tag: string) {
                // This SO answer came in handy, and still could in the future:
                // https://stackoverflow.com/a/65146593

                return !(
                  this.options as unknown as { parent: { tags: string[] } }
                ).parent.tags.includes(tag);
              }
            )
            .matches(
              /^[a-z0-9-]+$/,
              'Tags can only contain lowercase alphanumeric characters and hyphens'
            )
      }),
    tags: array()
      .notRequired()
      .when('tags', {
        is: (value: string) => value?.length > 0,
        then: (schema) => schema.max(10, 'You cannot specify more than 10 tags')
      })
  },
  [
    ['screenshots', 'screenshots'],
    ['tagToAdd', 'tagToAdd'],
    ['tags', 'tags']
  ]
);

const emitSubmitEvent = (data: Partial<Game>) => {
  delete data.tagToAdd;
  emit('submit', data);
};
</script>

<template>
  <Form
    v-slot="{ meta, errors }"
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
      <label for="rom-file" class="label">
        <span class="label-text -z-1">
          ROM file
          <sup class="text-red-500">*</sup>
        </span>
      </label>
      <Field v-slot="{ handleChange, handleBlur }" name="file">
        <input
          id="rom-file"
          type="file"
          accept=".gb,.gbc"
          :disabled="loading"
          @change="handleChange"
          @blur="handleBlur"
        />
      </Field>
      <label v-if="errors.file" class="label">
        <span class="label-text text-error">{{ errors.file }}</span>
      </label>
    </div>
    <div class="form-control">
      <label for="cover" class="label">
        <span class="label-text">
          Cover image
          <sup class="text-red-500">*</sup>
        </span>
      </label>
      <Field v-slot="{ handleChange, handleBlur }" name="cover">
        <input
          id="cover"
          type="file"
          accept="image/*"
          :disabled="loading"
          @change="handleChange"
          @blur="handleBlur"
        />
      </Field>
      <label v-if="errors.cover" class="label">
        <span class="label-text text-error">{{ errors.cover }}</span>
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
    <div class="form-control my-6">
      <label for="screenshots" class="label">
        <span class="label-text">Screenshots (max. 10)</span>
      </label>
      <Field v-slot="{ handleChange, handleBlur }" name="screenshots">
        <input
          id="screenshots"
          type="file"
          accept="image/*"
          multiple
          :disabled="loading"
          @change="handleChange"
          @blur="handleBlur"
        />
      </Field>
      <label v-if="errors.screenshots" class="label">
        <span class="label-text text-error">
          {{ errors.screenshots }}
        </span>
      </label>
    </div>
    <div class="form-control">
      <FieldArray v-slot="{ fields, push, remove }" name="tags">
        <label for="tags" class="label">
          <span class="label-text">Tags (max. 10)</span>
        </label>
        <Field
          v-slot="{ field, resetField, value, meta: tagToAddMeta }"
          name="tagToAdd"
        >
          <div class="input-group w-full">
            <input
              id="tags"
              type="text"
              class="input input-bordered w-full"
              :class="{ 'input-error': errors.tagToAdd }"
              :disabled="loading"
              v-bind="field"
            />
            <button
              type="button"
              class="btn"
              :disabled="loading || !(value as string).length || !tagToAddMeta.valid"
              @click="push(field.value), resetField({ value: '' })"
            >
              Add tag
            </button>
          </div>
          <label v-if="errors.tagToAdd" class="label">
            <span class="label-text text-error">{{ errors.tagToAdd }}</span>
          </label>
        </Field>
        <div v-if="fields.length > 0" class="mt-6">
          <span
            v-for="(tag, index) of fields"
            :key="tag.key"
            class="badge text-base mb-4 mr-4 p-4"
          >
            {{ tag.value }}
            <button
              class="btn btn-xs btn-circle btn-outline border-slate-300 ml-2"
              :disabled="loading"
              @click="remove(index)"
            >
              <i class="fa-solid fa-xmark text-slate-300"></i>
            </button>
          </span>
        </div>
      </FieldArray>
    </div>
    <div class="my-6"><sup class="text-red-500">*</sup> - required field</div>
    <button
      class="btn btn-primary"
      type="submit"
      :disabled="loading || !meta.valid"
    >
      <i v-if="loading" class="fa-solid fa-spinner fa-spin mr-2"></i>
      Submit
    </button>
  </Form>
</template>
