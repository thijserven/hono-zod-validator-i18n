# Zod Internationalization

This library is used to translate Zod's default error messages.

## Installation

```bash
npm install hono-zod-validator-i18n @intlify/hono
```

This library depends on `@intlify/hono`.

## How to Use

```ts
import { Hono } from 'hono';
import {
  defineI18nMiddleware,
  detectLocaleFromAcceptLanguageHeader,
  useTranslation,
} from '@intlify/hono';
import { zValidatorI18n } from 'hono-zod-validator-i18n';
import zodEn from 'hono-zod-validator-i18n/locales/en/zod.json';
import zodJa from 'hono-zod-validator-i18n/locales/ja/zod.json';

// define middleware with vue-i18n like options
const i18nMiddleware = defineI18nMiddleware({
  // detect locale with `accept-language` header
  locale: detectLocaleFromAcceptLanguageHeader,
  // resource messages
  messages: {
    en: {
      hello: 'Hello {name}!',
      zod: zodEn,
    },
    ja: {
      hello: 'こんにちは、{name}！',
      zod: zodJa,
    },
  },
  // something options
  // ...
});

const app = new Hono();

// install middleware with `app.use`
app.use('*', i18nMiddleware);

const schema = z.object({
  name: z.string(),
  age: z.number(),
});

app.post('/author', zValidatorI18n('json', schema), (c) => {
  const data = c.req.valid('json');
  return c.json({
    success: true,
    message: `${data.name} is ${data.age}`,
  });
});

export default app;
```

## `zValidatorI18n`

The `zValidatorI18n` function works exactly the same as the original `zValidator` function from `@hono/zod-validator` so it can still except a custom hook function.

```ts
zValidatorI18n('json', schema, (result, c) => {
  // "result" and "c" are fully typed!
  console.log('This will run after the error translation.');
});
```
