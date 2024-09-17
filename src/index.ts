import { zValidator } from '@hono/zod-validator';
import { useTranslation } from '@intlify/hono';
import type {
  Context,
  Env,
  Input,
  MiddlewareHandler,
  TypedResponse,
  ValidationTargets,
} from 'hono';
import type { ZodIssue } from 'zod';
import { ZodError, ZodIssueCode, ZodParsedType, z } from 'zod';

// Zod issue translation functions
const jsonStringifyReplacer = (_: string, value: any): any => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
};

function joinValues<T extends any[]>(array: T, separator = ' | '): string {
  return array
    .map((val) => (typeof val === 'string' ? `'${val}'` : val))
    .join(separator);
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  for (const key in value) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) {
      return false;
    }
  }

  return true;
};

const getKeyAndValues = (
  param: unknown,
  defaultKey: string
): {
  values: Record<string, unknown>;
  key: string;
} => {
  if (typeof param === 'string') {
    return { key: param, values: {} };
  }

  if (isRecord(param)) {
    const key =
      'key' in param && typeof param.key === 'string' ? param.key : defaultKey;
    const values =
      'values' in param && isRecord(param.values) ? param.values : {};
    return { key, values };
  }

  return { key: defaultKey, values: {} };
};

function translateIssues(c: Context, issues: ZodIssue[]) {
  const { t, ns } = {
    t: useTranslation(c),
    ns: 'zod',
  };

  const translatedIssues: ZodIssue[] = [];

  issues.forEach((issue) => {
    let message: string = issue.message;

    if (message.includes(`${ns}.custom`)) {
      return translatedIssues.push({
        ...issue,
        message: t(message),
      });
    }

    switch (issue.code) {
      case ZodIssueCode.invalid_type:
        if (issue.received === ZodParsedType.undefined) {
          message = t(`${ns}.errors.invalid_type_received_undefined`);
        } else if (issue.received === ZodParsedType.null) {
          message = t(`${ns}.errors.invalid_type_received_null`);
        } else {
          message = t(`${ns}.errors.invalid_type`, {
            expected: t(`${ns}.types.${issue.expected}`),
            received: t(`${ns}.types.${issue.received}`),
          });
        }
        break;
      case ZodIssueCode.invalid_literal:
        message = t(`${ns}.errors.invalid_literal`, {
          expected: JSON.stringify(issue.expected, jsonStringifyReplacer),
        });
        break;
      case ZodIssueCode.unrecognized_keys:
        message = t(`${ns}.errors.unrecognized_keys`, {
          keys: joinValues(issue.keys, ', '),
          count: issue.keys.length,
        });
        break;
      case ZodIssueCode.invalid_union:
        message = t(`${ns}.errors.invalid_union`);
        break;
      case ZodIssueCode.invalid_union_discriminator:
        message = t(`${ns}.errors.invalid_union_discriminator`, {
          options: joinValues(issue.options),
        });
        break;
      case ZodIssueCode.invalid_enum_value:
        message = t(`${ns}.errors.invalid_enum_value`, {
          options: joinValues(issue.options),
          received: issue.received,
        });
        break;
      case ZodIssueCode.invalid_arguments:
        message = t(`${ns}.errors.invalid_arguments`);
        break;
      case ZodIssueCode.invalid_return_type:
        message = t(`${ns}.errors.invalid_return_type`);
        break;
      case ZodIssueCode.invalid_date:
        message = t(`${ns}.errors.invalid_date`);
        break;
      case ZodIssueCode.invalid_string:
        if (typeof issue.validation === 'object') {
          if ('startsWith' in issue.validation) {
            message = t(`${ns}.errors.invalid_string.startsWith`, {
              startsWith: issue.validation.startsWith,
            });
          } else if ('endsWith' in issue.validation) {
            message = t(`${ns}.errors.invalid_string.endsWith`, {
              endsWith: issue.validation.endsWith,
            });
          }
        } else {
          message = t(`${ns}.errors.invalid_string.${issue.validation}`, {
            validation: t(`${ns}.validations.${issue.validation}`),
          });
        }
        break;
      case ZodIssueCode.too_small:
        const minimum =
          issue.type === 'date'
            ? new Date(issue.minimum as number)
            : issue.minimum;
        message = t(
          `${ns}.errors.too_small.${issue.type}.${
            issue.exact
              ? 'exact'
              : issue.inclusive
              ? 'inclusive'
              : 'not_inclusive'
          }`,
          {
            minimum,
            count: typeof minimum === 'number' ? minimum : undefined,
          }
        );
        break;
      case ZodIssueCode.too_big:
        const maximum =
          issue.type === 'date'
            ? new Date(issue.maximum as number)
            : issue.maximum;
        message = t(
          `${ns}.errors.too_big.${issue.type}.${
            issue.exact
              ? 'exact'
              : issue.inclusive
              ? 'inclusive'
              : 'not_inclusive'
          }`,
          {
            maximum,
            count: typeof maximum === 'number' ? maximum : undefined,
          }
        );
        break;
      case ZodIssueCode.custom:
        const { key, values } = getKeyAndValues(
          issue.params?.i18n,
          'errors.custom'
        );

        message = t(key, {
          ...values,
        });
        break;
      case ZodIssueCode.invalid_intersection_types:
        message = t(`${ns}.errors.invalid_intersection_types`);
        break;
      case ZodIssueCode.not_multiple_of:
        message = t(`${ns}.errors.not_multiple_of`, {
          multipleOf: issue.multipleOf,
        });
        break;
      case ZodIssueCode.not_finite:
        message = t(`${ns}.errors.not_finite`);
        break;
      default:
    }

    translatedIssues.push({
      ...issue,
      message,
    });
  });

  return translatedIssues;
}

// Validator function
export type Hook<T, E extends Env, P extends string, O = {}> = (
  result:
    | {
        success: true;
        data: T;
      }
    | {
        success: false;
        error: ZodError;
        data: T;
      },
  c: Context<E, P>
) =>
  | Response
  | void
  | TypedResponse<O>
  | Promise<Response | void | TypedResponse<O>>;

type HasUndefined<T> = undefined extends T ? true : false;

const zValidatorI18n = <
  T extends z.ZodType<any, z.ZodTypeDef, any>,
  Target extends keyof ValidationTargets,
  E extends Env,
  P extends string,
  In = z.input<T>,
  Out = z.output<T>,
  I extends Input = {
    in: HasUndefined<In> extends true
      ? {
          [K in Target]?:
            | (K extends 'json'
                ? In
                : HasUndefined<keyof ValidationTargets[K]> extends true
                ? { [K2 in keyof In]?: ValidationTargets[K][K2] | undefined }
                : { [K2_1 in keyof In]: ValidationTargets[K][K2_1] })
            | undefined;
        }
      : {
          [K_1 in Target]: K_1 extends 'json'
            ? In
            : HasUndefined<keyof ValidationTargets[K_1]> extends true
            ? {
                [K2_2 in keyof In]?: ValidationTargets[K_1][K2_2] | undefined;
              }
            : { [K2_3 in keyof In]: ValidationTargets[K_1][K2_3] };
        };
    out: { [K_2 in Target]: Out };
  },
  V extends I = I
>(
  target: Target,
  schema: T,
  hook?: Hook<z.TypeOf<T>, E, P, {}> | undefined
): MiddlewareHandler<E, P, V> => {
  return zValidator<T, Target, E, P, In, Out, I, V>(
    target,
    schema,
    (result, c) => {
      if (!result.success) {
        result.error.issues = translateIssues(c, result.error.issues);
      }
      if (hook) {
        return hook(result, c);
      }
    }
  );
};

export { zValidatorI18n };
