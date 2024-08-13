import { defineI18nMiddleware } from '@intlify/hono';
import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import nlZod from '../locales/nl/zod.json';
import { zValidatorI18n } from '../src';

describe('zValidatorI18n', async () => {
  const app = new Hono();
  let testHook = false;

  const i18nMiddleware = defineI18nMiddleware({
    locale: 'nl',
    messages: {
      nl: {
        zod: { ...nlZod, custom: { test: 'This is a custom error message' } },
      },
    },
  });

  app.use('*', i18nMiddleware);

  app.get(
    '/',
    zValidatorI18n(
      'json',
      z.object({
        test: z.string(),
        testCustomMessage: z.string({ message: 'zod.custom.test' }),
      }),
      (result, c) => {
        testHook = true;
      }
    ),
    async (c) => {
      return c.json('ok');
    }
  );

  it('should translate a Zod error message', async () => {
    const request = await app.request('/');
    const { error } = await request.json();

    expect(error?.issues?.[0]?.message).toBe('Vereist');
  });

  it('should use a custom Zod error message when provided', async () => {
    const request = await app.request('/');
    const { error } = await request.json();

    expect(error?.issues?.[1]?.message).toBe('This is a custom error message');
  });

  it('calls the provided hook function after a Zod translation', async () => {
    expect(testHook).toBe(true);
  });
});
