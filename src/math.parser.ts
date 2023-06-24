import * as S from "./strings";
import * as P from "./Parser";

// 5646 454.5454 + * ()
// 2+3+6 -> Sum is associative
// 2*3*5 = 5*3*2 -> Mult is associative
// -1-8-3 = -3-8-1 valid BUT -1+8-3 != -3+8-1
// Division same result 2/1 1/2 -> n/0
// Factor ()

// F :: [Parser * * *] => Parser * [*] *
const betweenParens = P.between(S.char("("))(S.char(")"));

const number = S.digits.map((x) => ({
  type: "number",
  value: parseInt(x),
}));

const operator = P.choice([S.char("+"), S.char("-"), S.char("*"), S.char("/")]);

// @ts-ignore
const expression = P.lazy(() => P.choice([number, operation]));

// (+ (* 10 2) (- (/ 50 3) 2))
// @ts-ignore
const operation = betweenParens(
  P.sequenceOf([
    operator,
    S.char(" "),
    expression,
    S.char(" "),
    expression,
  ]).map((x) => ({
    type: "operation",
    value: {
      operator: x![0],
      left: x![2],
      right: x![4],
    },
  }))
);

type NumberNode = {
  type: "number";
  value: number;
};

type ExpressionNode = {
  type: "operation";
  value: {
    operator: "+" | "-" | "*" | "/";
    left: ExpressionNode | NumberNode;
    right: ExpressionNode | NumberNode;
  };
};
const evaluator = (node: NumberNode | ExpressionNode) => {
  if (node.type === "number") {
    return node.value;
  }
  if (node.type === "operation") {
    switch (node.value.operator) {
      case "+":
        return evaluator(node.value.left) + evaluator(node.value.right);
      case "-":
        return evaluator(node.value.left) - evaluator(node.value.right);
      case "*":
        return evaluator(node.value.left) * evaluator(node.value.right);
      case "/":
        return evaluator(node.value.left) / evaluator(node.value.right);
    }
  }
};

const interpreter = (program: string) => {
  const parserResult = expression.run(program);
  if (parserResult.isError) {
    throw new SyntaxError("Program can not be interpreted");
  }
  return evaluator(parserResult.result);
};

interpreter("(+ (* 10 2) (- (/ 50 3) 2))");
const r = 10 * 2 + 50 / 3 - 2;

const Box = (x: string) => ({
  value: x,
});
