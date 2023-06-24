import * as P from "./Parser";
import * as PS from "./ParserState";

export const literal = (cs: string) =>
  new P.Parser((state) => {
    const { cursor, target } = state;
    const length = cs.length;
    const sliced = target.slice(cursor);
    if (sliced.startsWith(cs)) {
      return PS.updateParserState(state, cs, cursor + length);
    }

    return PS.updateParserError(
      state,
      `Expected: ${cs} but received ${target.slice(
        cursor,
        10
      )} at position: ${cursor}`
    );
  });

export const char = (x: string): P.Parser<string> =>
  new P.Parser((state) => {
    if (state.isError) return state;
    const { cursor, target } = state;
    const sliced = target.slice(cursor, cursor + 1);
    if (x === sliced) {
      return PS.updateParserState(state, x, cursor + 1);
    }
    return PS.updateParserError(
      state,
      `ParserError (position ${cursor}) Expecting character ${x} but got ${sliced}`
    );
  });

const regexLetters = /^[a-zA-Z]+/;
const regexDigits = /^[0-9]+/;

export const regex = (re: RegExp): P.Parser<string> =>
  new P.Parser((state) => {
    const { cursor, target } = state;
    const sliced = state.target.slice(cursor);
    const match = sliced.match(re);
    if (!match) {
      return PS.updateParserError(
        state,
        `ParserError: (position ${cursor}) regex could not match any char`
      );
    }
    return PS.updateParserState(state, match[0], cursor + match[0].length);
  });

export const letters = regex(regexLetters);
export const digits = regex(regexDigits);

export const alphanumeric = P.many1(P.choice([letters, digits]));
