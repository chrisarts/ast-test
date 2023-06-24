/*
 **Grammar Parser**
 *  Parser(input -> string) -> TOKEN
 *  Keyword "class" -> {type: 'keyword'} -> TREE
 */
/*
 **Parser Generator**
 *  State transformer function
 *  ParserState -> { cursor: 0, target: string, result: any, error: null, isError: boolean }
 *  Parser(input -> ParserState) -> ParserState
 *  ParserState must be inmutable
 */
import * as PS from "./ParserState";

type StateTransformerFn<T> = (state: PS.ParserState<any>) => PS.ParserState<T>;

export class Parser<T> {
  transform: StateTransformerFn<T>;
  constructor(transform: StateTransformerFn<T>) {
    this.transform = transform;
  }

  map<T2>(fn: (x: T) => T2): Parser<T2> {
    const currentParser = this.transform;
    return new Parser((state): PS.ParserState<T2> => {
      const newState = currentParser(state);
      if (newState.isError) return newState as unknown as PS.ParserState<T2>;
      return PS.updateParserResult(newState, fn(newState.result));
    });
  }

  chain<T2>(fn: (x: T) => Parser<T2>): Parser<T2> {
    const currentParser = this.transform;
    return new Parser((state): PS.ParserState<T2> => {
      const newState = currentParser(state);
      if (newState.isError) return newState as unknown as PS.ParserState<T2>;
      return fn(newState.result).transform(newState);
    });
  }

  run(cs: string): PS.ResultType<T> {
    const state = PS.createParserState(cs);

    const resultState = this.transform(state);
    if (resultState.isError) {
      return {
        ...resultState,
        isError: true,
        cursor: resultState.cursor,
        error: resultState.error,
      };
    }
    return {
      ...resultState,
      isError: false,
      cursor: resultState.cursor,
      result: resultState.result,
    };
  }
}

// ESTE PARSER PUEDE LEERSE COMO AND this AND that
export const sequenceOf = (parsers: Parser<any>[]) => {
  return new Parser((state) => {
    if (state.isError) return state;
    const length = parsers.length;
    const results = new Array(length);
    let nextState = state;

    for (let i = 0; i < length; i++) {
      const out = parsers[i].transform(nextState);
      if (out.isError) {
        return out;
      } else {
        nextState = out;
        results[i] = out.result;
      }
    }

    return PS.updateParserResult(nextState, results);
  });
};

// ESTE PARSER PUEDE LEERSE COMO OR this OR that
export const choice = (parsers: Parser<any>[]) => {
  return new Parser((state) => {
    if (state.isError) return state;

    let error = null;
    for (const current of parsers) {
      const out = current.transform(state);

      if (!out.isError) return out;
      if (error === null || (error && out.cursor > error.cursor)) {
        error = out;
      }
    }

    return error as PS.ParserState<any>;
  });
};

export const many = <A>(parser: Parser<A>) => {
  return new Parser((state) => {
    const results = [];
    let nextState = state;
    while (true) {
      const out = parser.transform(nextState);

      if (out.isError) {
        break;
      } else {
        nextState = out;
        results.push(nextState.result);
        if (nextState.cursor >= state.target.length) {
          break;
        }
      }
    }
    return PS.updateParserResult(nextState, results);
  });
};

export const many1 = <A>(parser: Parser<A>) => {
  return new Parser((state) => {
    const response = many(parser).transform(state);
    if (response.result.length > 1) {
      return response;
    }
    return PS.updateParserError(state, "Many: does not have any result");
  });
};

export const between =
  <L, T, R>(leftParser: Parser<L>) =>
  (rightParser: Parser<R>) =>
  (midParser: Parser<T>): Parser<T> => {
    return sequenceOf([leftParser, midParser, rightParser]).map(([l, m]) => m);
  };

export const separatedBy =
  <S, T>(sepParser: Parser<S>) =>
  (valueParser: Parser<T>) => {
    return new Parser((state) => {
      if (state.isError) return state;

      let nextState: PS.ParserState<S | T> = state;
      let error = null;
      const results: T[] = [];

      while (true) {
        const valueState = valueParser.transform(nextState);
        const sepState = sepParser.transform(valueState);
        if (valueState.isError) {
          error = valueState;
          break;
        } else {
          results.push(valueState.result);
        }

        if (sepState.isError) {
          nextState = valueState;
          break;
        }
        nextState = sepState;
      }

      if (error) {
        if (results.length === 0) {
          return PS.updateParserResult(state, results);
        }
        return error;
      }

      return PS.updateParserResult(nextState, results);
    });
  };

export const lazy = <T>(parserThunk: () => Parser<T>): Parser<T> =>
  new Parser((state) => {
    return parserThunk().transform(state);
  });
