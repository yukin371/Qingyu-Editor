# QyForm & QyFormItem Components

Qingyu-style form components with validation support and glassmorphism effects.

## Features

- ✅ Form validation support
- ✅ Error message display (`text-red-500`)
- ✅ Label positioning (left, top, right)
- ✅ Glassmorphism input items
- ✅ Integration with QyInput
- ✅ Required field indicators
- ✅ Customizable label width
- ✅ v-model support for form data

## QyForm Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `Record<string, any>` | `{}` | Form data model (v-model) |
| `rules` | `Record<string, any[]>` | `{}` | Validation rules |
| `labelWidth` | `string` | `'100px'` | Label width |
| `labelPosition` | `'left'` \| `'top'` \| `'right'` | `'top'` | Label position |

## QyFormItem Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `prop` | `string` | `''` | Form field name (for validation) |
| `label` | `string` | `''` | Label text |
| `labelWidth` | `string` | `''` | Label width (overrides form level) |
| `required` | `boolean` | `false` | Required field indicator |
| `error` | `string` | `''` | Error message (external control) |

## Validation Rules

| Rule | Type | Description |
|------|------|-------------|
| `required` | `boolean` | Field must have a value |
| `min` | `number` | Minimum length |
| `max` | `number` | Maximum length |
| `pattern` | `RegExp` | Pattern validation |
| `validator` | `Function` | Custom validator function |
| `message` | `string` | Error message to display |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `Record<string, any>` | Emitted when form data changes (v-model) |
| `validate` | `boolean` | Emitted on form validation |

## Usage

### Basic Form

```vue
<template>
  <QyForm v-model="formData" label-position="top">
    <QyFormItem label="Name">
      <QyInput v-model="formData.name" placeholder="Enter your name" />
    </QyFormItem>

    <QyFormItem label="Email">
      <QyInput v-model="formData.email" type="email" placeholder="Enter your email" />
    </QyFormItem>
  </QyForm>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const formData = ref({
  name: '',
  email: ''
})
</script>
```

### Form with Validation

```vue
<template>
  <QyForm
    v-model="formData"
    :rules="rules"
    label-width="120px"
    label-position="left"
    @validate="handleValidate"
  >
    <QyFormItem prop="name" label="Full Name" required>
      <QyInput v-model="formData.name" placeholder="Enter your full name" />
    </QyFormItem>

    <QyFormItem prop="email" label="Email Address" required>
      <QyInput v-model="formData.email" type="email" placeholder="Enter your email" />
    </QyFormItem>

    <QyFormItem prop="password" label="Password" required>
      <QyInput v-model="formData.password" type="password" placeholder="Enter a password" />
    </QyFormItem>

    <div class="flex gap-3 mt-4">
      <QyButton variant="secondary" @click="handleReset">Reset</QyButton>
      <QyButton variant="primary" @click="handleSubmit">Submit</QyButton>
    </div>
  </QyForm>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const formData = ref({
  name: '',
  email: '',
  password: ''
})

const rules = {
  name: [
    { required: true, message: 'Name is required' },
    { min: 2, message: 'Name must be at least 2 characters' },
    { max: 50, message: 'Name must be no more than 50 characters' }
  ],
  email: [
    { required: true, message: 'Email is required' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' }
  ],
  password: [
    { required: true, message: 'Password is required' },
    { min: 8, message: 'Password must be at least 8 characters' },
    {
      validator: (value: string) => {
        return /[A-Z]/.test(value) && /[0-9]/.test(value)
      },
      message: 'Password must contain at least one uppercase letter and one number'
    }
  ]
}

const handleValidate = (isValid: boolean) => {
  console.log('Form is valid:', isValid)
}

const handleSubmit = () => {
  console.log('Form data:', formData.value)
  // Submit to server
}

const handleReset = () => {
  formData.value = {
    name: '',
    email: '',
    password: ''
  }
}
</script>
```

### Label Position Variants

```vue
<template>
  <div class="space-y-8">
    <!-- Top Labels (default) -->
    <QyForm v-model="form1" label-position="top">
      <QyFormItem label="Name">
        <QyInput v-model="form1.name" />
      </QyFormItem>
    </QyForm>

    <!-- Left Labels -->
    <QyForm v-model="form2" label-position="left" label-width="120px">
      <QyFormItem label="Name">
        <QyInput v-model="form2.name" />
      </QyFormItem>
    </QyForm>

    <!-- Right Labels -->
    <QyForm v-model="form3" label-position="right" label-width="120px">
      <QyFormItem label="Name">
        <QyInput v-model="form3.name" />
      </QyFormItem>
    </QyForm>
  </div>
</template>
```

### Custom Label Width

```vue
<template>
  <QyForm v-model="formData" label-position="left">
    <QyFormItem label="Short" label-width="80px">
      <QyInput v-model="formData.field1" />
    </QyFormItem>

    <QyFormItem label="Very Long Label" label-width="200px">
      <QyInput v-model="formData.field2" />
    </QyFormItem>
  </QyForm>
</template>
```

### External Error Control

```vue
<template>
  <QyForm v-model="formData">
    <QyFormItem
      label="Username"
      :error="externalError"
    >
      <QyInput v-model="formData.username" @blur="checkUsername" />
    </QyFormItem>
  </QyForm>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const formData = ref({ username: '' })
const externalError = ref('')

const checkUsername = async () => {
  // Simulate API call
  const exists = await checkUsernameExists(formData.value.username)
  if (exists) {
    externalError.value = 'Username already exists'
  } else {
    externalError.value = ''
  }
}

const checkUsernameExists = async (username: string) => {
  // Your validation logic
  return username === 'admin'
}
</script>
```

### Integration with QyInput

```vue
<template>
  <QyForm v-model="formData" :rules="rules">
    <QyFormItem prop="name" label="Name" required>
      <QyInput
        v-model="formData.name"
        placeholder="Enter your name"
        variant="outlined"
      />
    </QyFormItem>

    <QyFormItem prop="bio" label="About">
      <QyInput
        v-model="formData.bio"
        type="textarea"
        placeholder="Tell us about yourself"
        :rows="4"
      />
    </QyFormItem>

    <QyFormItem prop="website" label="Website">
      <QyInput
        v-model="formData.website"
        type="url"
        placeholder="https://example.com"
      />
    </QyFormItem>
  </QyForm>
</template>
```

## Style Customization

The form components use Qingyu's design system:

- **Label**: `text-sm font-medium text-slate-700`
- **Required Indicator**: `text-red-500`
- **Error Message**: `text-red-500 text-sm`
- **Spacing**: 1rem gap between items
- **Label Positions**:
  - Top: Vertical layout (default)
  - Left: Horizontal with label on left
  - Right: Horizontal with label on right

## Validation Examples

### Required Field

```javascript
{
  required: true,
  message: 'This field is required'
}
```

### Length Validation

```javascript
{
  min: 6,
  max: 20,
  message: 'Must be between 6 and 20 characters'
}
```

### Pattern Validation

```javascript
{
  pattern: /^[A-Z][a-z]+$/,
  message: 'Must start with uppercase letter'
}
```

### Custom Validator

```javascript
{
  validator: (value) => {
    if (value < 18) return false
    if (value > 120) return 'Age must be realistic'
    return true
  },
  message: 'Must be at least 18 years old'
}
```

### Multiple Rules

```javascript
{
  password: [
    { required: true, message: 'Password is required' },
    { min: 8, message: 'Must be at least 8 characters' },
    {
      validator: (value) => /[A-Z]/.test(value),
      message: 'Must contain uppercase letter'
    },
    {
      validator: (value) => /[0-9]/.test(value),
      message: 'Must contain number'
    }
  ]
}
```

## Best Practices

1. **Always provide labels**: Labels improve accessibility and UX
2. **Use appropriate input types**: email, password, url, etc.
3. **Provide clear error messages**: Be specific about what's wrong
4. **Validate on blur**: Don't validate too aggressively
5. **Group related fields**: Use fieldsets or sections
6. **Mark required fields clearly**: Use the required prop
7. **Keep forms simple**: Only ask for necessary information

## Accessibility

- Labels are properly associated with inputs
- Required fields are marked with asterisk
- Error messages are announced to screen readers
- Keyboard navigation is supported
- Semantic HTML form structure

## Design Decisions

1. **Context-based validation**: Form provides context to items via inject/provide
2. **Flexible layout**: Three label positions for different use cases
3. **Per-item customization**: Items can override form-level settings
4. **External error control**: Support for async validation errors
5. **Minimal styling**: Relies on input component styling
