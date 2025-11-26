export type Ok<T> = { type: "ok"; value: T };
export type Err<E> = { type: "err"; value: E };
export type Result<T, E> = Ok<T> | Err<E>;

export function ok<const T>(value: T): Ok<T> {
  return { type: "ok", value };
}

export function err<const E>(value: E): Err<E> {
  return { type: "err", value };
}

export function isOk<T, E>(r: Result<T, E>): r is Ok<T> {
  return r.type === "ok";
}

// Collection utilities
export function all<T, E>(results: Result<T, E>[]): Result<T[], E> {
  const values: T[] = [];
  for (const r of results) {
    if (!isOk(r)) {
      return r;
    }
    values.push(r.value);
  }
  return ok(values);
}

export async function allAsync<T, E>(promises: Promise<Result<T, E>>[]): Promise<Result<T[], E>> {
  const results = await Promise.all(promises);
  return all(results);
}

type Flow<T, E> = {
  map<U>(fn: (value: T) => U): Flow<U, E>;
  andThen<U>(fn: (value: T) => Result<U, E>): Flow<U, E>;
  asyncAndThen<U>(fn: (value: T) => Promise<Result<U, E>>): Flow<U, E>;
  value(): Promise<Result<T, E>>;
};

export function flow<T, E>(initial: T): Flow<T, E> {
  const current: Promise<Result<T, E>> = Promise.resolve(ok(initial) as Result<T, E>);

  function makeFlow<U, F>(p: Promise<Result<U, F>>): Flow<U, F> {
    return {
      map<V>(fn: (value: U) => V): Flow<V, F> {
        const next = p.then((r) => (isOk(r) ? ok(fn(r.value)) : (r as Err<F>)));
        return makeFlow(next);
      },
      andThen<V>(fn: (value: U) => Result<V, F>): Flow<V, F> {
        const next = p.then((r) => (isOk(r) ? fn(r.value) : (r as Err<F>)));
        return makeFlow(next);
      },
      asyncAndThen<V>(fn: (value: U) => Promise<Result<V, F>>): Flow<V, F> {
        const next = p.then((r) => (isOk(r) ? fn(r.value) : (r as Err<F>)));
        return makeFlow(next);
      },
      value(): Promise<Result<U, F>> {
        return p;
      },
    };
  }

  return makeFlow(current);
}
