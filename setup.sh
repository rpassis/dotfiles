#!/usr/bin/env bash

# Get the dotfiles directory's absolute path
SCRIPT_DIR="$(cd "$(dirname "$0")"; pwd -P)"
DOTFILES_DIR="$(dirname "$SCRIPT_DIR")"

RUBY_VERSION=2.3.1

# Check if zsh is present
if [ -f /bin/zsh -o -f /usr/bin/zsh ]; then
    # Install Oh My Zsh if it isn't already present
    if [[ ! -d $dir/oh-my-zsh/ ]]; then
      sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
    fi
    # Set the default shell to zsh if it isn't currently set to zsh
    if [[ ! $(echo $SHELL) == $(which zsh) ]]; then
      chsh -s $(which zsh)
    fi
else
  echo "We'll install zsh, then re-run this script!"
  brew install zsh
  exit
fi

# Package managers & packages

. "$DOTFILES_DIR/install/brew.sh"
. "$DOTFILES_DIR/install/npm.sh"

if [ "$(uname)" == "Darwin" ]; then
    . "$DOTFILES_DIR/install/brew-cask.sh"
fi

. "$DOTFILES_DIR/install/gem.sh"

echo "All done"
