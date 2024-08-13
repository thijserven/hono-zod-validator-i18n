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

## Translation Files

`hono-zod-validator-i18n` contains translation files for several locales.

- [Arabic(ar)](https://github.com/thijserven/hono-zod-validator-i18n/blob/main/locales/ar/zod.json)
- [Bulgarian(bg)](https://github.com/thijserven/hono-zod-validator-i18n/blob/main/locales/bg/zod.json)
- [Czech(cs)](https://github.com/thijserven/hono-zod-validator-i18n/blob/main/locales/cs/zod.json)
- [German(de)](https://github.com/thijserven/hono-zod-validator-i18n/blob/main/locales/de/zod.json)
- [English(en)](https://github.com/thijserven/hono-zod-validator-i18n/blob/main/locales/en/zod.json)
- [Spanish(es)](https://github.com/thijserven/hono-zod-validator-i18n/blob/main/locales/es/zod.json)
- [Persian(fa)](https://github.com/thijserven/hono-zod-validator-i18n/blob/main/locales/fa/zod.json)
- [Finnish(fi)](https://github.com/thijserven/hono-zod-validator-i18n/blob/main/locales/fi/zod.json)
- [French(fr)](https://github.com/thijserven/hono-zod-validator-i18n/blob/main/locales/fr/zod.json)
- [Hebrew(he)](https://github.com/thijserven/hono-zod-validator-i18n/blob/main/locales/he/zod.json)
- [Croatian(hr-Hr)](https://github.com/thijserven/hono-zod-validator-i18n/blob/main/locales/hr-He/zod.json)
- [Indonesian(id)](https://github.com/thijserven/hono-zod-validator-i18n/blob/main/locales/id/zod.json)
- [Icelandic(is)](https://github.com/thijserven/hono-zod-validator-i18n/blob/main/locales/is/zod.json)
- [Italian(it)](https://github.com/thijserven/hono-zod-validator-i18n/blob/main/locales/it/zod.json)
- [Japanese(ja)](https://github.com/thijserven/hono-zod-validator-i18n/blob/main/locales/ja/zod.json)
- [Korean(ko)](https://github.com/thijserven/hono-zod-validator-i18n/blob/main/locales/ko/zod.json)
- [Lithuanian(lt)](https://github.com/thijserven/hono-zod-validator-i18n/blob/main/locales/lt/zod.json)
- [Norwegian(nb)](https://github.com/thijserven/hono-zod-validator-i18n/blob/main/locales/nb/zod.json)
- [Dutch(nl)](https://github.com/thijserven/hono-zod-validator-i18n/blob/main/locales/nl/zod.json)
- [Polish(pl)](https://github.com/thijserven/hono-zod-validator-i18n/blob/main/locales/pl/zod.json)
- [Portuguese(pt)](https://github.com/thijserven/hono-zod-validator-i18n/blob/main/locales/pt/zod.json)
- [Romanian(ro)](https://github.com/thijserven/hono-zod-validator-i18n/blob/main/locales/ro/zod.json)
- [Russian(ru)](https://github.com/thijserven/hono-zod-validator-i18n/blob/main/locales/ru/zod.json)
- [Swedish(sv)](https://github.com/thijserven/hono-zod-validator-i18n/blob/main/locales/sv/zod.json)
- [Turkish(tr)](https://github.com/thijserven/hono-zod-validator-i18n/blob/main/locales/tr/zod.json)
- [Ukrainian(uk-UA)](https://github.com/thijserven/hono-zod-validator-i18n/blob/main/locales/uk-UA/zod.json)
- [Uzbek(uz)](https://github.com/thijserven/hono-zod-validator-i18n/blob/main/locales/uz/zod.json)
- Chinese
  - [Simplified Chinese(zh-CN)](https://github.com/thijserven/hono-zod-validator-i18n/blob/main/locales/zh-CN/zod.json)
  - [Traditional Chinese(zh-TW)](https://github.com/thijserven/hono-zod-validator-i18n/blob/main/locales/zh-TW/zod.json)

It is also possible to create and edit translation files. You can use [this English translation file](https://github.com/thijserven/hono-zod-validator-i18n/blob/main/locales/en/zod.json) as a basis for rewriting it in your language.

**If you have created a translation file for a language not yet in the repository, please send us a pull request.**

## Contributing

Please read [CONTRIBUTING.md](https://github.com/thijserven/hono-zod-validator-i18n/tree/main/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License

- see the [LICENSE](https://github.com/thijserven/hono-zod-validator-i18n/tree/main/LICENCE) file for details

## Contributors ✨

![Contributors icons](https://contrib.nn.ci/api?repo=thijserven/hono-zod-validator-i18n)

## Special Thanks

- [aiji42](https://www.npmjs.com/~aiji42) for creating [Zod i18n Map](https://www.npmjs.com/package/zod-i18n-map/v/1.7.0) which inspired this package.
