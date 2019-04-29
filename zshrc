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
export ZSH="/Users/rogerioassis/.oh-my-zsh"

# Set name of the theme to load
ZSH_THEME="agnoster"

# Which plugins would you like to load?
# Standard plugins can be found in ~/.oh-my-zsh/plugins/*
# Custom plugins may be added to ~/.oh-my-zsh/custom/plugins/
# Example format: plugins=(rails git textmate ruby lighthouse)
# Add wisely, as too many plugins slow down shell startup.
plugins=(
    git
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

# The next line updates PATH for the Google Cloud SDK.
if [ -f /Users/rppassis/.gcloud/path.zsh.inc ]; then
  source '/Users/rppassis/.gcloud/path.zsh.inc'
fi

# The next line enables shell command completion for gcloud.
if [ -f /Users/rppassis/.gcloud/completion.zsh.inc ]; then
  source '/Users/rppassis/.gcloud/completion.zsh.inc'
fi

# Local config
[[ -f ~/.zshrc.local ]] && source ~/.zshrc.local

# aliases
[[ -f ~/.aliases ]] && source ~/.aliases
