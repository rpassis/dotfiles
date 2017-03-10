"use strict";
exports.configuration = {
    wordPattern: /\w+[\.\w+]*/,
    indentationRules: {
        increaseIndentPattern: new RegExp("(after|else|catch|rescue|fn|^.*(do|<\\-|\\->|\\{|\\[))\\s*$"),
        decreaseIndentPattern: new RegExp("^\\s*((\\}|\\])\\s*$|(after|else|catch|rescue|end)\\b)")
    },
};
//# sourceMappingURL=elixirConfiguration.js.map