export interface ParserState<T> extends InternalResultType<T> {
  target: string;
}

export interface InternalResultType<T> {
  cursor: number;
  result: T;
  error: null | string;
  isError: boolean;
}

export type ResultType<T> = Err | Ok<T>;

export type Err = {
  cursor: number;
  error: null | string;
  isError: true;
}

export type Ok<T> = {
  result: T;
  cursor: number;
  error: null | string;
  isError: false;
}

export const createParserState = (target: string): ParserState<any> => ({
  cursor: 0,
  error: null,
  isError: false,
  result: null,
  target,
});

export const updateParserState = <T, T2>(
  state: ParserState<T>,
  result: T2,
  cursor: number
): ParserState<T2> => ({
  ...state,
  result,
  cursor,
});

export const updateParserError = (
  state: ParserState<any>,
  error: string
): ParserState<any> => ({
  ...state,
  error,
  isError: true,
});

export const updateParserResult = <T, T2>(
  state: ParserState<T>,
  result: T2
): ParserState<T2> => ({
  ...state,
  result,
});

// PARSER EXAMPLE
// const str =
//   (cs: string) =>
//   (parserState: PS.ParserState): PS.ParserState => {
//     const { cursor, target } = parserState;
//     const length = cs.length;
//     const sliced = target.slice(cursor);
//     if (sliced.startsWith(cs)) {
//       return {
//         ...parserState,
//         cursor: cursor + length,
//         result: cs,
//       };
//     }

//     return {
//       ...parserState,
//       error: `Expected: ${cs} but received ${target.slice(
//         cursor,
//         10
//       )} at position: ${cursor}`,
//     };
//   };
