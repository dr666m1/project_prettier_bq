"use strict";
const parser = require("@dr666m1/bq2cst");
const {
  doc: {
    builders: {
      concat,
      hardline,
      group,
      indent,
      softline,
      join,
      line,
      literalline,
      lineSuffix,
      lineSuffixBoundary,
      markAsRoot,
      dedentToRoot,
    },
  },
} = require("prettier");

const languages = [
  {
    extensions: [".sql"],
    name: "sql",
    parsers: ["sql-parse"],
  },
];

const parsers = {
  "sql-parse": {
    parse: (text) => parser.parse(text),
    astFormat: "sql-ast",
  },
};

const printSQL = (path, options, print) => {
  const node = path.getValue();

  if (Array.isArray(node)) {
    return concat(path.map(print));
  }

  switch (guess_node_type(node)) {
    case "parent":
      return path.call(print, "children");
    case "selectStatement":
      return printSelectStatement(path, options, print);
    case "func":
      return printFunc(path, options, print);
    case "binaryOperator":
      return printBinaryOperator(path, options, print);
    case "asStructOrValue":
      return printAsStructOrValue(path, options, print);
    case "unaryOperator":
      return printUnaryOperator(path, options, print);
    case "keywordWithExpr":
      return printKeywordWithExpr(path, options, print);
    case "keywordWithGroupedExprs":
      return printKeywordWithGroupedExprs(path, options, print);
    case "intervalLiteral":
      return printIntervalLiteral(path, options, print);
    case "limitClause":
      return printLimitClause(path, options, print);
    case "groupedExpr":
      return printGroupedExpr(path, options, print);
    case "groupedExprs":
      return printGroupedExprs(path, options, print);
    case "groupedStmt":
      return printGroupedStatement(path, options, print);
    case "withQuery":
      return printWithQuery(path, options, print);
    case "withQueries":
      return printWithQueries(path, options, print);
    case "arrayAccess":
      return printArrayAccess(path, options, print);
    case "structOrArrayType":
      return printStructOrArrayType(path, options, print);
    case "typeDeclaration":
      return printTypeDeclaration(path, options, print);
    case "identAndType":
      return printIdentAndType(path, options, print);
    case "tableName":
      return printTableName(path, options, print);
    case "forSystemTimeAsOfClause":
      return printForSystemTimeAsOfClause(path, options, print);
    case "as":
      return printAs(path, options, print);
    case "betweenOperator":
      return printBetweenOperator(path, options, print);
    case "setOperator":
      return printSetOperator(path, options, print);
    case "caseExpr":
      return printCaseExpr(path, options, print);
    case "overClause":
      return printOverClause(path, options, print);
    case "windowSpecification":
      return printWindowSpecification(path, options, print);
    case "windowFrameClause":
      return printWindowFrameClause(path, options, print);
    case "frameStartOrEnd":
      return printFrameStartOrEnd(path, options, print);
    case "xxxByExprs":
      return printXXXByExprs(path, options, print);
    case "unnestWithOffset":
      return printUnnestWithOffset(path, options, print);
    case "withOffset":
      return printWithOffset(path, options, print);
    case "caseArm":
      return printCaseArm(path, options, print);
    default:
      return printSelf(path, options, print);
  }
};

const printSelectStatement = (path, options, print) => {
  const node = path.getValue();
  const config = {
    printComma: false,
    printAlias: false,
    printOrder: false,
  };
  // with
  let with_ = "";
  if ("with" in node) {
    with_ = concat([path.call((p) => p.call(print, "Node"), "with"), line]);
  }
  // as
  let as = "";
  if ("as" in node) {
    as = concat([" ", path.call((p) => p.call(print, "Node"), "as")]);
  }
  // distinct
  let distinct = "";
  if ("distinct" in node) {
    distinct = concat([
      " ",
      path.call((p) => p.call(print, "Node"), "distinct"),
    ]);
  }
  // select
  const select = group(
    markAsRoot(
      indent(
        concat([
          dedentToRoot(
            concat([printSelf(path, options, print, config), as, distinct])
          ),
          line,
          path.call((p) => join(line, p.map(print, "NodeVec")), "exprs"),
        ])
      )
    )
  );
  // from
  let from = "";
  if ("from" in node) {
    from = concat([
      line,
      group(path.call((p) => p.call(print, "Node"), "from")),
    ]);
  }
  // where
  let where = "";
  if ("where" in node) {
    where = concat([line, path.call((p) => p.call(print, "Node"), "where")]);
  }
  // group by
  let groupby = "";
  if ("groupby" in node) {
    groupby = concat([
      line,
      group(path.call((p) => p.call(print, "Node"), "groupby")),
    ]);
  }
  // having
  let having = "";
  if ("having" in node) {
    having = concat([
      line,
      group(path.call((p) => p.call(print, "Node"), "having")),
    ]);
  }
  // order by
  let orderby = "";
  if ("orderby" in node) {
    orderby = concat([
      line,
      group(path.call((p) => p.call(print, "Node"), "orderby")),
    ]);
  }
  // limit
  let limit = "";
  if ("limit" in node) {
    limit = concat([
      line,
      group(path.call((p) => p.call(print, "Node"), "limit")),
    ]);
  }
  // semicolon
  let semicolon = "";
  if ("semicolon" in node) {
    semicolon = path.call((p) => p.call(print, "Node"), "semicolon");
  }
  // end of statement
  let endOfStatement = "";
  if ("semicolon" in node) {
    endOfStatement = hardline;
  }
  return concat([
    group(
      concat([
        with_,
        select,
        from,
        where,
        groupby,
        having,
        orderby,
        limit,
        softline,
        semicolon,
      ])
    ),
    endOfStatement,
  ]);
};

const printAsStructOrValue = (path, options, print) => {
  const node = path.getValue();
  return concat([
    printSelf(path, options, print),
    " ",
    path.call((p) => p.call(print, "Node"), "struct_value"),
  ]);
};

const printWithQuery = (path, options, print) => {
  const node = path.getValue();
  const config = {
    printComma: false,
    printAlias: false,
    printOrder: false,
  };
  let comma = "";
  if ("comma" in node) {
    comma = path.call((p) => p.call(print, "Node"), "comma");
  }
  return concat([
    printSelf(path, options, print, config),
    " ",
    path.call((p) => p.call(print, "Node"), "as"),
    " ",
    path.call((p) => p.call(print, "Node"), "stmt"),
    comma,
  ]);
};

const printWithQueries = (path, options, print) => {
  const node = path.getValue();
  return concat([
    printSelf(path, options, print),
    indent(
      concat([
        line,
        path.call((p) => join(line, p.map(print, "NodeVec")), "queries"),
      ])
    ),
  ]);
};

const printUnnestWithOffset = (path, options, print) => {
  const node = path.getValue();
  return concat([
    printFunc(path, options, print),
    " ",
    path.call((p) => p.call(print, "Node"), "with"),
  ]);
};

const printWithOffset = (path, options, print) => {
  return concat([
    printSelf(path, options, print),
    " ",
    path.call((p) => p.call(print, "Node"), "unnest_offset"),
  ]);
};

const printGroupedStatement = (path, options, print) => {
  const node = path.getValue();
  let semicolon = "";
  let endOfStatement = "";
  if ("semicolon" in node) {
    semicolon = path.call((p) => p.call(print, "Node"), "semicolon");
    endOfStatement = hardline;
  }
  return concat([
    group(
      concat([
        printSelf(path, options, print),
        indent(
          concat([softline, path.call((p) => p.call(print, "Node"), "stmt")])
        ),
        softline,
        path.call((p) => p.call(print, "Node"), "rparen"),
        semicolon,
      ])
    ),
    endOfStatement,
  ]);
};

const printKeywordWithExpr = (path, options, print) => {
  // const node = path.getValue();
  return group(
    markAsRoot(
      indent(
        concat([
          dedentToRoot(printSelf(path, options, print)),
          line,
          path.call((p) => p.call(print, "Node"), "expr"),
        ])
      )
    )
  );
};

const printKeywordWithGroupedExprs = (path, options, print) => {
  const node = path.getValue();
  return concat([
    printSelf(path, options, print),
    " ",
    path.call((p) => p.call(print, "Node"), "group"),
  ]);
};

const printAs = (path, options, print) => {
  const node = path.getValue();
  let as = "";
  if ("self" in node) {
    as = concat([printSelf(path, options, print), " "]);
  }
  return concat([as, path.call((p) => p.call(print, "Node"), "alias")]);
};

const printFunc = (path, options, print) => {
  const node = path.getValue();
  const config = {
    printComma: false,
    printAlias: false,
    printOrder: false,
  };
  let args = "";
  if ("args" in node) {
    args = path.call((p) => join(" ", p.map(print, "NodeVec")), "args");
  }
  let over = "";
  if ("over" in node) {
    over = concat([" ", path.call((p) => p.call(print, "Node"), "over")]);
  }
  let comma = "";
  if ("comma" in node) {
    comma = path.call((p) => p.call(print, "Node"), "comma");
  }
  let order = "";
  if ("order" in node) {
    order = concat([" ", path.call((p) => p.call(print, "Node"), "order")]);
  }
  let as = "";
  if ("as" in node) {
    as = concat([" ", path.call((p) => p.call(print, "Node"), "as")]);
  }
  return concat([
    path.call((p) => p.call(print, "Node"), "func"),
    printSelf(path, options, print, config),
    args,
    path.call((p) => p.call(print, "Node"), "rparen"),
    over,
    order,
    as,
    comma,
  ]);
};

const printLimitClause = (path, options, print) => {
  const node = path.getValue();
  return group(
    concat([
      printKeywordWithExpr(path, options, print),
      line,
      path.call((p) => p.call(print, "Node"), "offset"),
    ])
  );
};

const printBinaryOperator = (path, options, print) => {
  const node = path.getValue();
  const config = {
    printComma: false,
    printAlias: false,
    printOrder: false,
  };
  const noSpaceOperators = ["."];
  let sep = " ";
  if (noSpaceOperators.indexOf(node.self.Node.token.literal) !== -1) {
    sep = "";
  }
  let not = "";
  if ("not" in node) {
    not = concat([path.call((p) => p.call(print, "Node"), "not"), " "]);
  }
  let comma = "";
  if ("comma" in node) {
    comma = path.call((p) => p.call(print, "Node"), "comma");
  }
  let order = "";
  if ("order" in node) {
    order = concat([" ", path.call((p) => p.call(print, "Node"), "order")]);
  }
  let as = "";
  if ("as" in node) {
    as = concat([" ", path.call((p) => p.call(print, "Node"), "as")]);
  }
  return concat([
    path.call((p) => p.call(print, "Node"), "left"),
    sep,
    not,
    printSelf(path, options, print, config),
    sep,
    path.call((p) => p.call(print, "Node"), "right"),
    order,
    as,
    comma,
  ]);
};

const printTableName = (path, options, print) => {
  const node = path.getValue();
  return concat([
    printSelf(path, options, print),
    " ",
    path.call((p) => p.call(print, "Node"), "for_system_time_as_of"),
  ]);
};

const printForSystemTimeAsOfClause = (path, options, print) => {
  const node = path.getValue();
  return join(" ", [
    printSelf(path, options, print),
    path.call((p) => join(" ", p.map(print, "NodeVec")), "system_time_as_of"),
    path.call((p) => p.call(print, "Node"), "expr"),
  ]);
};

const printCaseExpr = (path, options, print) => {
  const node = path.getValue();
  const config = {
    printComma: false,
    printAlias: false,
    printOrder: false,
  };
  let expr = "";
  if ("expr" in node) {
    expr = concat([" ", path.call((p) => p.call(print, "Node"), "expr")]);
  }
  let comma = "";
  if ("comma" in node) {
    comma = path.call((p) => p.call(print, "Node"), "comma");
  }
  let order = "";
  if ("order" in node) {
    order = concat([" ", path.call((p) => p.call(print, "Node"), "order")]);
  }
  let as = "";
  if ("as" in node) {
    as = concat([" ", path.call((p) => p.call(print, "Node"), "as")]);
  }
  return group(
    concat([
      printSelf(path, options, print, config),
      expr,
      indent(
        concat([
          line,
          path.call((p) => join(line, p.map(print, "NodeVec")), "arms"),
          " ",
          path.call((p) => p.call(print, "Node"), "end"),
          order,
          as,
          comma,
        ])
      ),
    ])
  );
};

const printXXXByExprs = (path, options, print) => {
  const node = path.getValue();
  return concat([
    printSelf(path, options, print),
    " ",
    path.call((p) => p.call(print, "Node"), "by"),
    " ",
    path.call((p) => join(line, p.map(print, "NodeVec")), "exprs"),
  ]);
};

const printOverClause = (path, options, print) => {
  const node = path.getValue();
  let win = path.call((p) => p.call(print, "Node"), "window");
  return group(concat([printSelf(path, options, print), " ", win]));
};

const printWindowSpecification = (path, options, print) => {
  const node = path.getValue();
  let contents = [];
  if ("name" in node) {
    contents.push(path.call((p) => p.call(print, "Node"), "name"));
  }
  if ("partitionby" in node) {
    contents.push(
      group(path.call((p) => p.call(print, "Node"), "partitionby"))
    );
  }
  if ("orderby" in node) {
    contents.push(group(path.call((p) => p.call(print, "Node"), "orderby")));
  }
  if ("frame" in node) {
    contents.push(path.call((p) => p.call(print, "Node"), "frame"));
  }
  let rparen = "";
  if ("rparen" in node) {
    rparen = path.call((p) => p.call(print, "Node"), "rparen");
  }
  return group(
    concat([
      printSelf(path, options, print),
      indent(concat([softline, join(line, contents)])),
      softline,
      rparen,
    ])
  );
};

const printWindowFrameClause = (path, options, print) => {
  const node = path.getValue();
  let contents = [];
  contents.push(printSelf(path, options, print));
  if ("between" in node) {
    contents.push(path.call((p) => p.call(print, "Node"), "between"));
  }
  if ("start" in node) {
    contents.push(path.call((p) => p.call(print, "Node"), "start"));
  }
  if ("and" in node) {
    contents.push(path.call((p) => p.call(print, "Node"), "and"));
  }
  if ("end" in node) {
    contents.push(path.call((p) => p.call(print, "Node"), "end"));
  }
  return group(join(" ", contents));
};

const printFrameStartOrEnd = (path, options, print) => {
  const node = path.getValue();
  let preceding = "";
  if ("preceding" in node) {
    preceding = concat([
      " ",
      path.call((p) => p.call(print, "Node"), "preceding"),
    ]);
    delete node.preceding;
  }
  let following = "";
  if ("following" in node) {
    following = concat([
      " ",
      path.call((p) => p.call(print, "Node"), "following"),
    ]);
    delete node.following;
  }
  return concat([
    path.call(print), // TODO refuctoring
    preceding,
    following,
  ]);
};

const printCaseArm = (path, options, print) => {
  const node = path.getValue();
  const config = {
    printComma: false,
    printAlias: false,
    printOrder: false,
  };
  let whenExprThen;
  if ("expr" in node) {
    // when
    whenExprThen = concat([
      join(" ", [
        printSelf(path, options, print, config),
        path.call((p) => p.call(print, "Node"), "expr"),
        path.call((p) => p.call(print, "Node"), "then"),
      ]),
      " ",
    ]);
  } else {
    // else
    whenExprThen = concat([printSelf(path, options, print, config), " "]);
  }
  return concat([
    whenExprThen,
    path.call((p) => p.call(print, "Node"), "result"),
  ]);
};

const printUnaryOperator = (path, options, print) => {
  const node = path.getValue();
  const config = {
    printComma: false,
    printAlias: false,
    printOrder: false,
  };
  const noSpaceOperators = ["-", "br", "r", "rb", "b", "array", "struct"];
  let self = printSelf(path, options, print, config);
  if (
    noSpaceOperators.indexOf(node.self.Node.token.literal.toLowerCase()) === -1
  ) {
    self = concat([self, " "]);
  }
  let typeDeclaration = "";
  if ("type_declaration" in node) {
    typeDeclaration = path.call(
      (p) => p.call(print, "Node"),
      "type_declaration"
    );
  }
  let comma = "";
  if ("comma" in node) {
    comma = path.call((p) => p.call(print, "Node"), "comma");
  }
  let order = "";
  if ("order" in node) {
    order = concat([" ", path.call((p) => p.call(print, "Node"), "order")]);
  }
  let as = "";
  if ("as" in node) {
    as = concat([" ", path.call((p) => p.call(print, "Node"), "as")]);
  }
  return concat([
    self,
    typeDeclaration,
    path.call((p) => p.call(print, "Node"), "right"),
    order,
    as,
    comma,
  ]);
};

const printIntervalLiteral = (path, options, print) => {
  const node = path.getValue();
  const config = {
    printComma: false,
    printAlias: false,
    printOrder: false,
  };
  const date_part = path.call((p) => p.call(print, "Node"), "date_part");
  let comma = "";
  if ("comma" in node) {
    comma = path.call((p) => p.call(print, "Node"), "comma");
  }
  let order = "";
  if ("order" in node) {
    order = concat([" ", path.call((p) => p.call(print, "Node"), "order")]);
  }
  let as = "";
  if ("as" in node) {
    as = concat([" ", path.call((p) => p.call(print, "Node"), "as")]);
  }
  return concat([
    printSelf(path, options, print, config),
    " ",
    path.call((p) => p.call(print, "Node"), "right"),
    " ",
    date_part,
    order,
    as,
    comma,
  ]);
};

const printGroupedExpr = (path, options, print) => {
  const node = path.getValue();
  const config = {
    printComma: false,
    printAlias: false,
    printOrder: false,
  };
  let comma = "";
  if ("comma" in node) {
    comma = path.call((p) => p.call(print, "Node"), "comma");
  }
  let order = "";
  if ("order" in node) {
    order = concat([" ", path.call((p) => p.call(print, "Node"), "order")]);
  }
  let as = "";
  if ("as" in node) {
    as = concat([" ", path.call((p) => p.call(print, "Node"), "as")]);
  }
  return concat([
    printSelf(path, options, print, config),
    path.call((p) => p.call(print, "Node"), "expr"),
    path.call((p) => p.call(print, "Node"), "rparen"),
    order,
    as,
    comma,
  ]);
};

const printGroupedExprs = (path, options, print) => {
  const node = path.getValue();
  const config = {
    printComma: false,
    printAlias: false,
    printOrder: false,
  };
  let comma = "";
  if ("comma" in node) {
    comma = path.call((p) => p.call(print, "Node"), "comma");
  }
  let order = "";
  if ("order" in node) {
    order = concat([" ", path.call((p) => p.call(print, "Node"), "order")]);
  }
  let as = "";
  if ("as" in node) {
    as = concat([" ", path.call((p) => p.call(print, "Node"), "as")]);
  }
  return concat([
    printSelf(path, options, print, config),
    path.call((p) => join(" ", p.map(print, "NodeVec")), "exprs"),
    path.call((p) => p.call(print, "Node"), "rparen"),
    order,
    as,
    comma,
  ]);
};

const printArrayAccess = (path, options, print) => {
  const node = path.getValue();
  const config = {
    printComma: false,
    printAlias: false,
    printOrder: false,
  };
  let comma = "";
  if ("comma" in node) {
    comma = path.call((p) => p.call(print, "Node"), "comma");
  }
  let order = "";
  if ("order" in node) {
    order = concat([" ", path.call((p) => p.call(print, "Node"), "order")]);
  }
  let as = "";
  if ("as" in node) {
    as = concat([" ", path.call((p) => p.call(print, "Node"), "as")]);
  }
  return concat([
    path.call((p) => p.call(print, "Node"), "left"),
    printSelf(path, options, print, config),
    path.call((p) => p.call(print, "Node"), "right"),
    path.call((p) => p.call(print, "Node"), "rparen"),
    order,
    as,
    comma,
  ]);
};

const printTypeDeclaration = (path, options, print) => {
  const node = path.getValue();
  let type = "";
  if ("type" in node) {
    type = path.call((p) => p.call(print, "Node"), "type");
  }
  let declarations = "";
  if ("declarations" in node) {
    declarations = path.call(
      (p) => join(" ", p.map(print, "NodeVec")),
      "declarations"
    );
  }
  return concat([
    printSelf(path, options, print),
    type,
    declarations,
    path.call((p) => p.call(print, "Node"), "rparen"),
  ]);
};

const printIdentAndType = (path, options, print) => {
  const node = path.getValue();
  const config = {
    printComma: false,
    printAlias: false,
    printOrder: false,
  };
  let ident = "";
  if ("self" in node) {
    ident = concat([printSelf(path, options, print, config), " "]);
  }
  let comma = "";
  if ("comma" in node) {
    comma = path.call((p) => p.call(print, "Node"), "comma");
  }
  return concat([
    ident,
    path.call((p) => p.call(print, "Node"), "type"),
    comma,
  ]);
};

const printStructOrArrayType = (path, options, print) => {
  const node = path.getValue();
  return concat([
    printSelf(path, options, print),
    path.call((p) => p.call(print, "Node"), "type_declaration"),
  ]);
};

const printBetweenOperator = (path, options, print) => {
  const node = path.getValue();
  const config = {
    printComma: false,
    printAlias: false,
    printOrder: false,
  };
  const min = path.call((p) => p.map(print, "NodeVec")[0], "right");
  const max = path.call((p) => p.map(print, "NodeVec")[1], "right");
  let comma = "";
  if ("comma" in node) {
    comma = path.call((p) => p.call(print, "Node"), "comma");
  }
  let order = "";
  if ("order" in node) {
    order = concat([" ", path.call((p) => p.call(print, "Node"), "order")]);
  }
  let as = "";
  if ("as" in node) {
    as = concat([" ", path.call((p) => p.call(print, "Node"), "as")]);
  }
  return concat([
    join(" ", [
      path.call((p) => p.call(print, "Node"), "left"),
      printSelf(path, options, print, config),
      min,
      path.call((p) => p.call(print, "Node"), "and"),
      max,
    ]),
    order,
    as,
    comma,
  ]);
};

const printSetOperator = (path, options, print) => {
  const node = path.getValue();
  let semicolon = "";
  let endOfStatement = "";
  if ("semicolon" in node) {
    semicolon = path.call((p) => p.call(print, "Node"), "semicolon");
    endOfStatement = hardline;
  }
  return concat([
    group(
      concat([
        path.call((p) => p.call(print, "Node"), "left"),
        line,
        printSelf(path, options, print),
        " ",
        path.call((p) => p.call(print, "Node"), "distinct"),
        line,
        path.call((p) => p.call(print, "Node"), "right"),
        semicolon,
      ])
    ),
    endOfStatement,
  ]);
};

const printSelf = (
  path,
  options,
  print,
  config = { printComma: true, printAlias: true, printOrder: true }
) => {
  const { printComma, printAlias, printOrder } = config;
  const node = path.getValue();
  // leading_comments
  let leading_comments = "";
  if ("leading_comments" in node) {
    leading_comments = concat([
      // leading lineSuffixBoundary might be needed
      concat(
        node.leading_comments.NodeVec.map(
          (x) => concat([x.token.literal, hardline]) // literallineWithoutBreakParent may be better
        )
      ),
    ]);
  }
  // except
  let except = "";
  if ("except" in node) {
    except = concat([" ", path.call((p) => p.call(print, "Node"), "except")]);
  }
  // replace
  let replace = "";
  if ("replace" in node) {
    replace = concat([" ", path.call((p) => p.call(print, "Node"), "replace")]);
  }
  // order
  let order = "";
  if (printOrder) {
    if ("order" in node) {
      order = concat([" ", path.call((p) => p.call(print, "Node"), "order")]);
    }
  }
  // comma
  let comma = "";
  if (printComma) {
    if ("comma" in node) {
      comma = path.call((p) => p.call(print, "Node"), "comma");
    }
  }
  // following_comments
  let following_comments = "";
  if ("following_comments" in node) {
    following_comments = lineSuffix(
      concat(
        node.following_comments.NodeVec.map((x) =>
          concat([" ", x.token.literal])
        )
      )
    );
  }
  // alias
  let alias = "";
  if (printAlias) {
    if ("as" in node) {
      alias = concat([" ", path.call((p) => p.call(print, "Node"), "as")]);
    }
  }
  return concat([
    leading_comments,
    node.self.Node.token.literal,
    except,
    replace,
    order,
    alias,
    comma,
    following_comments,
  ]);
};

const guess_node_type = (node) => {
  if ("children" in node) {
    return "parent";
  } else {
    if ("with" in node && "func" in node) return "unnestWithOffset";
    if ("func" in node) return "func";
    if ("group" in node) return "keywordWithGroupedExprs";
    if ("struct_value" in node) return "asStructOrValue";
    if (("type" in node || "declarations" in node) && "rparen" in node) {
      return "typeDeclaration";
    } // <int64>
    if ("type" in node) return "identAndType"; // x int64
    if ("alias" in node) return "as";
    if ("start" in node) return "windowFrameClause";
    if ("preceding" in node || "following" in node) return "frameStartOrEnd";
    if (
      "Node" in node.self &&
      node.self.Node.token.literal.toLowerCase() === "select"
    ) {
      return "selectStatement";
    }
    if ("right" in node && "left" in node && "and" in node) {
      return "betweenOperator";
    }
    if (
      "right" in node &&
      "left" in node &&
      node.self.Node.token.literal === "["
    ) {
      return "arrayAccess";
    }
    if ("right" in node && "left" in node && "distinct" in node)
      return "setOperator"; // union all
    if ("right" in node && "left" in node) return "binaryOperator";
    if ("right" in node && "date_part" in node) return "intervalLiteral";
    if ("right" in node) return "unaryOperator";
    if ("rparen" in node && "expr" in node) return "groupedExpr";
    if ("rparen" in node && "exprs" in node) return "groupedExprs";
    if ("rparen" in node && "stmt" in node) return "groupedStmt"; // (select *)
    if ("as" in node && "stmt" in node) return "withQuery"; // name as (select *)
    if ("queries" in node) return "withQueries"; // name as (select *)
    if ("rparen" in node) return "windowSpecification";
    if ("arms" in node) return "caseExpr";
    if ("type_declaration" in node) return "structOrArrayType"; // struct<int64>
    if ("result" in node) return "caseArm";
    if ("unnest_offset" in node) return "withOffset"; // with offset
    if ("offset" in node) return "limitClause";
    if ("window" in node) return "overClause";
    if ("for_system_time_as_of" in node) return "tableName";
    if ("system_time_as_of" in node) return "forSystemTimeAsOfClause";
    if ("expr" in node) return "keywordWithExpr";
    if ("by" in node && "exprs" in node) return "xxxByExprs";
  }
  return ""; // default
};

const printers = {
  "sql-ast": {
    print: printSQL,
  },
};

module.exports = {
  languages,
  parsers,
  printers,
};
