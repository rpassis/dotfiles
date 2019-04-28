#

export ZSH_THEME="agnoster"

# load custom executable functions
for function in ~/.zsh/functions/*; do
  source $function
done

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

# zsh autocompletion
source ~/.zsh/zsh-autosuggestions/zsh-autosuggestions.zsh
