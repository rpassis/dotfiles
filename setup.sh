#!/usr/bin/env bash

# Get the dotfiles directory's absolute path
SCRIPT_DIR="$(cd "$(dirname "$0")"; pwd -P)"
DOTFILES_DIR="$(dirname "$SCRIPT_DIR")"
XCODE_THEMES_DIR="~/Library/Developer/Xcode/UserData/FontAndColorThemes"
RCRC=$HOME/dotfiles/rcrc
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

export DOTFILES_DIR
DOTFILES_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Package managers & packages

. "$DOTFILES_DIR/install/brew.sh"
. "$DOTFILES_DIR/install/npm.sh"

if [ "$(uname)" == "Darwin" ]; then
    . "$DOTFILES_DIR/install/brew-cask.sh"
fi

. "$DOTFILES_DIR/install/gem.sh"

# Install C66 toolbelt
curl -sSL https://s3.amazonaws.com/downloads.cloud66.com/cx_installation/cx_install.sh | bash

# Install fonts
git clone https://github.com/rpassis/fonts.git && cd fonts && ./install.sh
cd ../ && rm -rf fonts

# Basic Xcode setup
mkdir $XCODE_THEMES_DIR
cp "$DOTFILES_DIR/xcode/theme/One Dark.dvtcolortheme" "$XCODE_THEMES_DIR"

# Symlink dotfiles
."rcup"

# Manually symlink atom folder as rcup takes forever due to number of files that may be here
ln -s "$DOTFILES_DIR/atom" "$HOME/.atom"

echo "All done"
