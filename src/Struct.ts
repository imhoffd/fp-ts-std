/**
 * This module targets objects in the sense of product types. For objects in
 * the sense of maps see the `Record` module.
 *
 * @since 0.14.0
 */

import { pipe } from "fp-ts/function"
import * as A from "fp-ts/Array"

/**
 * Merge two records together. For merging many identical records, instead
 * consider defining a semigroup.
 *
 * @example
 * import { merge } from 'fp-ts-std/Struct'
 *
 * assert.deepStrictEqual(merge({ a: 1, b: 2 })({ b: 'two', c: true }), { a: 1, b: 'two', c: true })
 *
 * @since 0.14.0
 */
export const merge =
  <A>(x: A) =>
  <B>(y: B): A & B => ({ ...x, ...y })

/**
 * Pick a set of keys from a `Record`. The value-level equivalent of the `Pick`
 * type.
 *
 * @example
 * import { pick } from 'fp-ts-std/Struct'
 * import { pipe } from 'fp-ts/function'
 *
 * const picked = pipe(
 *   { a: 1, b: 'two', c: [true] },
 *   pick(['a', 'c'])
 * )
 *
 * assert.deepStrictEqual(picked, { a: 1, c: [true] })
 *
 * @since 0.14.0
 */
export const pick =
  <A, K extends keyof A>(ks: Array<K>) =>
  (x: A): Pick<A, K> =>
    // I don't believe there's any reasonable way to model this sort of
    // transformation in the type system without an assertion - at least here
    // it's in a single reused place.
    pipe(
      ks,
      A.reduce({} as Pick<A, K>, (ys, k) =>
        merge(ys)(k in x ? { [k]: x[k] } : {}),
      ),
    )

/**
 * Like `pick`, but allows you to specify the input record upfront.
 *
 * @example
 * import { pickFrom } from 'fp-ts-std/Struct'
 *
 * type MyType = { a: number; b: string; c: ReadonlyArray<boolean> }
 * const picked = pickFrom<MyType>()(['a', 'c'])
 *
 * assert.deepStrictEqual(picked({ a: 1, b: 'two', c: [true] }), { a: 1, c: [true] })
 *
 * @since 0.14.0
 */
export const pickFrom = <A>(): (<K extends keyof A>(
  ks: Array<K>,
) => (x: A) => Pick<A, K>) => pick

/**
 * Omit a set of keys from a `Record`. The value-level equivalent of the `Omit`
 * type.
 *
 * @example
 * import { omit } from 'fp-ts-std/Struct'
 *
 * const sansB = omit(['b'])
 *
 * assert.deepStrictEqual(sansB({ a: 1, b: 'two', c: [true] }), { a: 1, c: [true] })
 *
 * @since 0.14.0
 */
export const omit =
  <K extends string>(ks: Array<K>) =>
  <V, A extends Record<K, V>>(x: Partial<A>): Omit<A, K> => {
    const y = { ...x }

    /* eslint-disable */
    for (const k of ks) {
      delete y[k]
    }
    /* eslint-enable */

    return y as Omit<A, K>
  }

/**
 * Like `omit`, but allows you to specify the input record upfront.
 *
 * @example
 * import { omitFrom } from 'fp-ts-std/Struct'
 *
 * type MyType = { a: number; b: string; c: ReadonlyArray<boolean> }
 * const sansB = omitFrom<MyType>()(['b'])
 *
 * assert.deepStrictEqual(sansB({ a: 1, b: 'two', c: [true] }), { a: 1, c: [true] })
 *
 * @since 0.15.0
 */
export const omitFrom = <A>(): (<K extends keyof A & string>(
  ks: Array<K>,
) => (x: A) => Omit<A, K>) => omit

type OptionalKeys<O extends object> = {
  [K in keyof O]-?: Record<string, unknown> extends Pick<O, K> ? K : never
}[keyof O]

type Exact<A extends object, B extends A> = A &
  Record<Exclude<keyof B, keyof A>, never>

/**
 * Provide default values for an object with optional properties.
 *
 * @example
 * import { withDefaults } from 'fp-ts-std/Struct'
 * import { pipe } from 'fp-ts/function'
 *
 * const aOptB: { a: number; b?: string } = { a: 1 }
 *
 * assert.deepStrictEqual(pipe(aOptB, withDefaults({ b: 'foo' })), { a: 1, b: 'foo' })
 *
 * @since 0.15.0
 */
export const withDefaults: <
  T extends object,
  PT extends Exact<{ [K in OptionalKeys<T>]-?: Exclude<T[K], undefined> }, PT>,
>(
  defaults: PT,
) => (t: T) => PT & T = merge
