# extra files in ~/.zsh/configs/pre , ~/.zsh/configs , and ~/.zsh/configs/post
# these are loaded first, second, and third, respectively.
_load_settings() {
  _dir="$1"
  if [ -d "$_dir" ]; then
    if [ -d "$_dir/pre" ]; then
      for config in "$_dir"/pre/**/*(N-.); do
        . $config
      done
    fi

    for config in "$_dir"/**/*(N-.); do
      case "$config" in
        "$_dir"/pre/*)
          :
          ;;
        "$_dir"/post/*)
          :
          ;;
        *)
          if [ -f $config ]; then
            . $config
          fi
          ;;
      esac
    done

    if [ -d "$_dir/post" ]; then
      for config in "$_dir"/post/**/*(N-.); do
        . $config
      done
    fi
  fi
}
_load_settings "$HOME/.zsh/configs"

# load direnv
eval "$(direnv hook zsh)"

# load fasd
eval "$(fasd --init auto)"

# Path to your oh-my-zsh installation.
export ZSH="$HOME/.oh-my-zsh"

# Set name of the theme to load
ZSH_THEME="agnoster"

# Which plugins would you like to load?
# Standard plugins can be found in ~/.oh-my-zsh/plugins/*
# Custom plugins may be added to ~/.oh-my-zsh/custom/plugins/
# Example format: plugins=(rails git textmate ruby lighthouse)
# Add wisely, as too many plugins slow down shell startup.
plugins=(
    git
    git-auto-fetch
    xcode
    osx
    rbenv
    docker
    docker-compose
    dotenv
    git-extras
    git-flow
)

source $ZSH/oh-my-zsh.sh

# Remove the alias so it doesnt conflict with function
# defined inside $HOME/.zsh/functions/g [RDPA 09/15/2019]
unalias g

# load custom executable functions
for function in ~/.zsh/functions/*; do
  source $function
done

# You may need to manually set your language environment
export LANG=en_US.UTF-8

# Set vscode as the preferred editor
export EDITOR='code'

# zsh autocompletion
source ~/.zsh/zsh-autosuggestions/zsh-autosuggestions.zsh

# Local config
[[ -f ~/.zshrc.local ]] && source ~/.zshrc.local

# aliases
[[ -f ~/.aliases ]] && source ~/.aliases

# nvm
export NVM_DIR="$HOME/.nvm"
  [ -s "/usr/local/opt/nvm/nvm.sh" ] && . "/usr/local/opt/nvm/nvm.sh"  # This loads nvm

# Go
export GOPATH="$HOME/Dev/Labs/go"
export GOBIN="/usr/local/go/bin"

# Brew auto update
export HOMEBREW_AUTO_UPDATE_SECS=60*60*24

# vimeo-dev-cli-autocomplete-start
if [ -f '/Users/rogerio.assis/Dev/Vimeo/Web/Main/scripts/devex/DevCli/dev-cli-completer-zsh' ]; then
    source /Users/rogerio.assis/Dev/Vimeo/Web/Main/scripts/devex/DevCli/dev-cli-completer-zsh
fi
# vimeo-dev-cli-autocomplete-end

# vimeo-dev-alias-start
alias dev=/Users/rogerio.assis/Dev/Vimeo/Web/Main/dev
# vimeo-dev-alias-end

# The next line updates PATH for the Google Cloud SDK.
if [ -f "$HOME/.google-cloud-sdk/path.zsh.inc" ]; then . "$HOME/.google-cloud-sdk/path.zsh.inc"; fi

# The next line enables shell command completion for gcloud.
if [ -f "$HOME/.google-cloud-sdk/completion.zsh.inc" ]; then . "$HOME/.google-cloud-sdk/completion.zsh.inc"; fi

# dex completion
# eval "$(dex completion --zsh-completion)"
