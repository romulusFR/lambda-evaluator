// projet en NodeJS

// npm install pegjs
let peg = require("pegjs");
let fs = require('fs');

const parser_source = './lambda_grammar.pegjs';

// usage nodejs lambda_evaluator "(((λx.λx.x) 2) 3)"

// exemples
// ((((λx.λy.((x y) x) (λx.λy.x)) (λx.λy.x)) 1) 0)
// (((λx.λx.x) 2) 3)


// pretty printing
let show = ex => {
  switch (ex["ctor"]) {
    case "LVar":
      return ex["var"];
      break;

    case "LInt":
      return ("" + ex.val);
      break;

    case "LApp":
      let arg = show(ex.rhs);
      let fct = show(ex.lhs);
      return "(" + fct + " @ " + arg + ")";
      break;

    case "LLambda":
      return "(λ" + (ex["var"]) + "."  + show(ex["exp"]) + ")";
      break;
      
    case "PLUS":
      let a1 = show(ex.rhs);
      let a2 = show(ex.lhs);
      return "(" + a1 + " + " + a2 + ")";
      break;

    case "TIMES":
      let t1 = show(ex.rhs);
      let t2 = show(ex.lhs);
      return "(" + t1 + " * " + t2 + ")";
      break;

    default:
      console.error("Unknown ctor 4 show " + ex.ctor);
  }

}

// environment ~ linked list of <variable, expression> pairs. NIL is undefined
// lookup in an environment (first match takes precedence)
let lookup = env => v => {
  if (typeof env.arg === "undefined"){
    console.log("lookup error for "+ v +" in " + print(env));
    return undefined;
  }
    
  if (env.arg === v)
    return env.ex;
  else
    return lookup(env.paren)(v);
}

// update environment (first match takes precedence)
let update = env => v => e => {
  return {arg:v, ex:e, paren:env};
}

// pretty printing of environment
let print = env => {
  if (typeof env.arg === "undefined")
    return ".";
  else
    return (`[${env.arg}:=${(env.ex)}]` + print(env.paren));
} 

// rightmost first (applicative order) evaluaor of the lambda calculus, see:
// https://github.com/kach/haskell-lambda-calculus/blob/master/lambda.lhs
// http://dev.stephendiehl.com/fun/005_evaluation.html
let evaluate = env => ex =>{
  console.log(`evaluate ${print(env)} ${show(ex)}`);
  switch (ex["ctor"]) {
    case "LVar":
      return lookup(env)(ex["var"]);

    case "LInt":
      return ex.val;
      break;

    case "LApp":
      let arg = evaluate(env)(ex.rhs);
      let fct = evaluate(env)(ex.lhs);
      let new_env = update(fct.paren)(fct.arg)(arg);
      return evaluate(new_env)(fct.ex);

    case "LLambda":
      return update(env)(ex["var"])(ex["exp"]);

    case "PLUS":
      let argp1 = evaluate(env)(ex.rhs);
      let argp2 = evaluate(env)(ex.lhs);
      return (argp1 + argp2);

    case "TIMES":
      let argt1 = evaluate(env)(ex.rhs);
      let argt2 = evaluate(env)(ex.lhs);
      return (argt1 * argt2);

    default:
      console.error("Unknown ctor " + ex.ctor);
  }
}

// main : reads parser's source, generate parser, parse given expression and evaluate
fs.readFile(parser_source, 'utf8', function(err, contents){
  if (!!err){
    console.error("Unable to read " + parser_source)
    return -1;
  }
  let parser = peg.generate(contents);
  let p, v;
  if (process.argv[2])
    p = parser.parse(process.argv[2]);
  else
    p = parser.parse("(((λx.λy.(x * y)) 2) 3)");
    
  console.log(p);
  v = evaluate({})(p);
  console.log(show(p) + " ~> " + v);
  
  return 0;
});




