#!/usr/bin/env bash

# Get the dotfiles directory's absolute path
SCRIPT_DIR="$(cd "$(dirname "$0")"; pwd -P)"
DOTFILES_DIR="$(dirname "$SCRIPT_DIR")"
XCODE_THEMES_DIR="~/Library/Developer/Xcode/UserData/FontAndColorThemes"
RCRC=$HOME/dotfiles/rcrc
RUBY_VERSION=2.4.1
XCODE_VERSION="$(xcodebuild -version)"

if ! [[ "$XCODE_VERSION" =~ "Xcode 8" ]]; then
  echo "The latest version of brew needs Xcode 8 to work. Please install it and try running this script again."
  exit 2
fi

# Check for Homebrew and install it if missing
if test ! $(which brew)
then
  echo "Installing Homebrew..."
  ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
fi

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

# Basic Xcode setup
mkdir -p $XCODE_THEMES_DIR
cp "$DOTFILES_DIR/xcode/theme/One Dark.dvtcolortheme" "$XCODE_THEMES_DIR"

# Terminal preferences
cp "$DOTFILES_DIR/terminal/com.apple.Terminal.plist" "~/Library/Preferences/" && defaults read com.apple.Terminal

# Symlink dotfiles (check file named rcrc to see excluded symlinked files)
echo "All done! Run `env RCRC=$HOME/dotfiles/rcrc rcup` to link your symfiles"
