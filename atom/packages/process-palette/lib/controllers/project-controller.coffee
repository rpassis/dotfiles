ProcessConfig = require '../process-config'
SaveController = require './save-controller'
ConfigController = require './config-controller'
ProcessController = require './process-controller'
RegExpPattern = require '../pattern/regexp-pattern'
{Directory, File, BufferedProcess, CompositeDisposable} = require 'atom'
os = require 'os';

module.exports =
class ProjectController

  constructor: (@main, @projectPath) ->
    @configControllers = [];
    @saveControllers = [];
    @patterns = {};
    @configurationFile = new Directory(@projectPath).getFile('process-palette.json');
    @loadFile();

  getMain: ->
    return @main;

  getConfigControllers: ->
    return @configControllers;

  dispose: ->
    @clearControllers();

  clearControllers: ->
    @clearConfigControllers();
    @clearSaveControllers();

  clearConfigControllers: ->
    for configController in @configControllers
      @main.mainView.removeConfigController(configController);
      configController.dispose();

    @configControllers = [];

  clearSaveControllers: ->
    for saveController in @saveControllers
      saveController.dispose();

    @saveControllers = [];

  loadFile: ->
    @clearControllers();

    if (!@configurationFile.isFile() or !@configurationFile.existsSync())
      return;

    @configurationFile.read(true).then (resolve) =>
      @parseFile(resolve);

  parseFile: (content) ->
    try
      processConfigs = JSON.parse(content);
    catch err
      console.log("error");
      console.log(err.lineNumber);
      return;

    if !processConfigs?
      return;

    patterns = processConfigs.patterns;
    commands = processConfigs.commands;
    saveCommands = processConfigs.saveCommands;

    @addDefaultPattern();

    if patterns?
      for key, value of patterns
        @addPattern(key, value);

    if commands?
      for command in commands
        command = new ProcessConfig(command);
        if command.isValid()
          configController = new ConfigController(@, command);
          @configControllers.push(configController);
          @main.mainView.addConfigController(configController);

    if saveCommands?
      for saveCommand in saveCommands
        saveController = new SaveController(@main, saveCommand);
        @saveControllers.push(saveController);

  getPatterns: (names) ->
    result = [];

    if !names?
      return result;

    for name in names
      pattern = @patterns[name];

      if pattern
        result.push(pattern);

    return result;

  addDefaultPattern: ->
    config = {};
    config.expression = "(path)";

    @addPattern("default", config);

  addPattern: (name, config) ->
    pattern = @createRegExpPattern(name, config);

    if pattern != null
      @patterns[name] = pattern;

  createRegExpPattern: (name, config) ->
    if !config.expression?
      console.error("Pattern #{name} doesn't have an expression.")
      return null;

    if !config.flags?
      config.flags = "i";

    if config.expression.indexOf("(path)") == -1
      console.error("Pattern #{name} doesn't have (path) in its expression.");
      return null;

    pathIndex = config.expression.indexOf("(path)");
    lineIndex = config.expression.indexOf("(line)");

    config.pathIndex = 1;

    if lineIndex > -1
      if pathIndex < lineIndex
        config.lineIndex = 2;
      else
        config.lineIndex = 1;
        config.pathIndex = 2;

    if !config.path?
      config.path = @getPathExpression(lineIndex > -1);

    config.expression = config.expression.replace("(path)", "("+config.path+")");
    config.expression = config.expression.replace("(line)", "(\\d+)");

    try
      return new RegExpPattern(config);
    catch err
      console.error("Pattern #{name} could not be created.");
      console.error(err);

    return null;

  getPathExpression: (hasLine) ->
    if hasLine
      if os.platform == "win32"
        return "(?:[a-z]:\\\\|\\\\)?[\\w\\.\\-]+[\\\\[\\w\\.\\-]+]*";
      else
        return "(?:~\\/|\\/?)[\\w\\.\\-]+[\\/[\\w\\.\\-]+]*";

    if os.platform == "win32"
      return "(?:[a-z]:\\\\|\\\\)?(?:[\\w\\.\\-]+\\\\)+[\\w\\.\\-]+";

    return "(?:~\\/|\\/?)(?:[\\w\\.\\-]+\\/)+[\\w\\.\\-]+";

  editConfiguration: ->
    if (@configurationFile.isFile() and @configurationFile.existsSync())
      atom.workspace.open(@configurationFile.getPath());

  fileSaved: (path) =>
    for saveController in @saveControllers
      saveController.fileSaved(path);

  getConfigController: (namespace, action) =>
    for configController in @configControllers
      if (configController.config.namespace == namespace) and (configController.config.action == action)
        return configController;

    return null;
