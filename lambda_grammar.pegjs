// no associativity of bracketing : expressions have to be fully parenthesised

LTerm
  = v:LVar {return {ctor : "LVar", var :v};}
  / n:LInt {return {ctor : "LInt", val :n};}
  / l:LLambda {return {ctor : "LLambda", var :l.var, exp : l.exp};}
  / a:LApp {return {ctor : "LApp", lhs :a.lhs, rhs : a.rhs};}
  / c:LBinOp {return c;}
  / "(" _ t:LTerm _ ")" {return t;}
 
LVar
  = id:LIdentifier {return id;}
  
LInt
  = _ [0-9]+ { return parseInt(text(), 10); }

LLambda
  = _ "λ" v:LVar _ "." _ e:LTerm {return {var:v, exp:e};}
  
LApp
  = _ "(" _ l:LTerm _ r:LTerm  _ ")" {return {lhs :l, rhs : r};}
  
LIdentifier 
  = _ id:[a-z]+ {return id.join('');}
  
LBinOp
  = _ "(" _ l:LTerm _ "+" _ r:LTerm ")" {return {ctor : "PLUS", lhs :l, rhs : r};}
  / _ "(" _ l:LTerm _ "*" _ r:LTerm ")" {return {ctor : "TIMES", lhs :l, rhs : r};}

_ "whitespace"
  = [ \t\n\r]*
