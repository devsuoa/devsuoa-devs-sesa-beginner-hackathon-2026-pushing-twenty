// ---------- Core keyword set ----------

export type CanonicalKeyword =
  | "def"
  | "return"
  | "if"
  | "elif"
  | "else"
  | "for"
  | "while"
  | "in"
  | "break"
  | "continue"
  | "True"
  | "False"
  | "None"
  | "and"
  | "or"
  | "not";

export type KeywordMap = Record<CanonicalKeyword, string>;

// ---------- Language families ----------

export type LanguageFamilyId =
  | "sharp"
  | "flowing"
  | "mechanical"
  | "ritual"
  | "abstract";

export type SyllablePattern =
  | "V"
  | "CV"
  | "VC"
  | "CVC"
  | "CVV"
  | "CVCV"
  | "CVCC";

export interface PhonologyConfig {
  consonants: string[];
  vowels: string[];
  syllablePatterns: SyllablePattern[];
  minSyllables: number;
  maxSyllables: number;
}

export interface MorphologyConfig {
  actionSuffixes: string[];
  conditionSuffixes: string[];
  literalSuffixes: string[];
  alternatePrefixes: string[];
  iteratorSuffixes: string[];
  negationPrefixes: string[];
}

export interface ResolvedMorphology {
  actionSuffix: string;
  conditionSuffix: string;
  literalSuffix: string;
  alternatePrefix: string;
  iteratorSuffix: string;
  negationPrefix: string;
}

export interface SyntaxBiasConfig {
  assignmentStyles: AssignmentStyleType[];
  functionStyles: FunctionStyleType[];
  blockStyles: BlockStyleType[];
  conditionalStyles: ConditionalStyleType[];
  elseStyles: ElseStyleType[];
  forStyles: ForStyleType[];
}

export interface FamilyVisualStyle {
  defaultCaseStyle: CaseStyle;
  uppercaseChance?: number;
  prefersSymbols?: boolean;
}

export interface LanguageFamily {
  id: LanguageFamilyId;
  displayName: string;
  description?: string;
  phonology: PhonologyConfig;
  morphology: MorphologyConfig;
  syntaxBias: SyntaxBiasConfig;
  visualStyle: FamilyVisualStyle;
}

// ---------- Syntax system ----------

export type AssignmentStyleType =
  | "equals"
  | "arrow"
  | "set_prefix"
  | "put_in";

export type FunctionStyleType =
  | "keyword_name_params_block"
  | "keyword_name_square_params_block"
  | "name_sigil_params_keyword"
  | "make_name_with_params_block";

export type BlockStyleType =
  | "indent"
  | "brace"
  | "then_end"
  | "arrow_indent";

export type ConditionalStyleType =
  | "keyword_expr_block"
  | "keyword_paren_expr_block"
  | "when_expr_then"
  | "sigil_expr_block";

export type ElseStyleType =
  | "keyword_block"
  | "keyword_spaced_block"
  | "otherwise_then"
  | "sigil_block";

export type ForStyleType =
  | "for_var_in_iter"
  | "for_paren_var_in_iter"
  | "for_iter_as_var";

export type CaseStyle = "lower" | "upper" | "title";

export type IdentifierTransform = "none" | "upper" | "lower";

export type NumeralStyle = "decimal" | "glyph";

export interface GeneratedSyntaxConfig {
  assignmentStyle: AssignmentStyleType;
  functionStyle: FunctionStyleType;
  blockStyle: BlockStyleType;
  conditionalStyle: ConditionalStyleType;
  elseStyle: ElseStyleType;
  forStyle: ForStyleType;
}

export interface GeneratedSymbolConfig {
  assignmentToken?: string;
  blockOpenToken?: string;
  blockCloseToken?: string;
  argOpenToken: string;
  argCloseToken: string;
  separatorToken?: string;
}

export interface GeneratedCosmeticConfig {
  caseStyle: CaseStyle;
  identifierTransform: IdentifierTransform;
  numeralStyle: NumeralStyle;
}

// ---------- Roots / generation internals ----------

export type SemanticRootKey =
  | "create"
  | "send"
  | "branch"
  | "alternate"
  | "loop"
  | "membership"
  | "terminate"
  | "truth"
  | "falsehood"
  | "nullity"
  | "join"
  | "choice"
  | "negation";

export type SemanticRoots = Record<SemanticRootKey, string>;

// ---------- Generated planet language ----------

export interface GeneratedPlanetLanguage {
  planetId: number | string;
  seed: number;
  familyId: LanguageFamilyId;

  phonology: PhonologyConfig;
  morphology: ResolvedMorphology;
  roots: SemanticRoots;

  keywords: KeywordMap;
  syntax: GeneratedSyntaxConfig;
  symbols: GeneratedSymbolConfig;
  cosmetic: GeneratedCosmeticConfig;
}

// ---------- AST types for your canonical subset ----------

export interface ProgramNode {
  type: "Program";
  body: StatementNode[];
}

export type StatementNode =
  | FunctionDefNode
  | AssignNode
  | IfNode
  | WhileNode
  | ForNode
  | ReturnNode
  | BreakNode
  | ContinueNode
  | ExprStatementNode;

export interface FunctionDefNode {
  type: "FunctionDef";
  name: string;
  params: string[];
  body: StatementNode[];
}

export interface AssignNode {
  type: "Assign";
  target: string;
  value: ExprNode;
}

export interface IfNode {
  type: "If";
  test: ExprNode;
  body: StatementNode[];
  elifs: ElifBranchNode[];
  elseBody: StatementNode[] | null;
}

export interface ElifBranchNode {
  test: ExprNode;
  body: StatementNode[];
}

export interface WhileNode {
  type: "While";
  test: ExprNode;
  body: StatementNode[];
}

export interface ForNode {
  type: "For";
  variable: string;
  iterable: ExprNode;
  body: StatementNode[];
}

export interface ReturnNode {
  type: "Return";
  value: ExprNode;
}

export interface BreakNode {
  type: "Break";
}

export interface ContinueNode {
  type: "Continue";
}

export interface ExprStatementNode {
  type: "ExprStatement";
  expression: ExprNode;
}

// ---------- Expressions ----------

export type ExprNode =
  | IdentifierNode
  | NumberLiteralNode
  | BooleanLiteralNode
  | NoneLiteralNode
  | BinaryExprNode
  | UnaryExprNode
  | CallExprNode;

export interface IdentifierNode {
  type: "Identifier";
  name: string;
}

export interface NumberLiteralNode {
  type: "NumberLiteral";
  value: number;
}

export interface BooleanLiteralNode {
  type: "BooleanLiteral";
  value: boolean;
}

export interface NoneLiteralNode {
  type: "NoneLiteral";
}

export type BinaryOperator =
  | "+"
  | "-"
  | "*"
  | "/"
  | "%"
  | "=="
  | "!="
  | "<"
  | "<="
  | ">"
  | ">="
  | "and"
  | "or";

export interface BinaryExprNode {
  type: "BinaryExpr";
  operator: BinaryOperator;
  left: ExprNode;
  right: ExprNode;
}

export type UnaryOperator = "-" | "not";

export interface UnaryExprNode {
  type: "UnaryExpr";
  operator: UnaryOperator;
  operand: ExprNode;
}

export interface CallExprNode {
  type: "CallExpr";
  callee: string;
  args: ExprNode[];
}

// ---------- Validation ----------

export interface LanguageValidationIssue {
  code:
    | "DUPLICATE_KEYWORD"
    | "SIMILAR_KEYWORDS"
    | "AMBIGUOUS_SYNTAX"
    | "INVALID_SYMBOLS"
    | "IDENTIFIER_COLLISION";
  message: string;
  keywords?: string[];
}

export interface LanguageValidationResult {
  isValid: boolean;
  issues: LanguageValidationIssue[];
}