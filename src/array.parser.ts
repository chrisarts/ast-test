import * as PS from "./ParserState";
import * as P from "./Parser";
import * as S from "./strings";
// "[3,2,1,1]"

const betweenSquareBrackets = P.between(S.char("["))(S.char("]"));

const separatedByComma = P.separatedBy(S.char(","));

const value = P.lazy(() => P.choice([S.digits, S.letters, S.alphanumeric, parser]))
const parser = betweenSquareBrackets(separatedByComma(value));

parser.run("[r,[2,d,[2,a,4]],f]"); //?
