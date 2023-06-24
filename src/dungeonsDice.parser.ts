import * as S from "./strings";
import * as P from "./Parser";

// string:sdfsdf
// number:09348503485

const firstPart = S.letters.map((x) => ({
  type: x,
}));
const stringToken = P.sequenceOf([firstPart, S.char(":")])
  .map((x) => x[0])
  .chain((x) => {
    if (x.type === "string") {
      return S.letters;
    }
    return S.digits;
  });

stringToken.run("number:23324234"); //?
