const vscode = require("vscode");

function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "extension.splitClassAttribute",
    function () {
      splitClassAttribute();
    }
  );

  context.subscriptions.push(disposable);

  vscode.workspace.onDidSaveTextDocument((document) => {
    const config = vscode.workspace.getConfiguration("split-class-attribute");
    const splitOnSave = config.get("splitClassAttributeOnSave");
    if (splitOnSave) {
      splitClassAttribute();
    }
  });

  function splitClassAttribute() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const document = editor.document;
      const options = editor.options;
      const tabSize = options.tabSize;
      const insertSpaces = options.insertSpaces;
      const additionalIndent = insertSpaces ? " ".repeat(tabSize) : "\t";
      editor.edit((editBuilder) => {
        for (let i = 0; i < document.lineCount; i++) {
          let line = document.lineAt(i);
          let text = line.text;
          let classIndex = text.indexOf('class="');
          if (classIndex !== -1) {
            let classEndIndex = text.indexOf('"', classIndex + 7);
            if (classEndIndex !== -1) {
              let classes = text.substring(classIndex + 7, classEndIndex);
              let classList = classes.split(" ");
              if (classList.length > 1) {
                let indent = text.substring(0, text.search(/\S/));
                let newClasses = classList.join(
                  `\n${indent}${additionalIndent}`
                );
                editBuilder.replace(
                  new vscode.Range(
                    line.range.start.translate(0, classIndex + 7),
                    line.range.start.translate(0, classEndIndex)
                  ),
                  `\n${indent}${additionalIndent}${newClasses}`
                );
              }
            }
          }
        }
      });
    }
  }
}
exports.activate = activate;

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
