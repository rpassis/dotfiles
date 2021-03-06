#!/usr/bin/env bash

# Get the dotfiles directory's absolute path
DOTFILES_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
XCODE_THEMES_DIR="$HOME/Library/Developer/Xcode/UserData/FontAndColorThemes"
RCRC=$HOME/dotfiles/rcrc
RUBY_VERSION=2.7.0
XCODE_VERSION="$(xcodebuild -version)"

# Check for Homebrew and install it if missing
if test ! $(which brew)
then
  echo "Installing Homebrew..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
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

# Package managers & packages
brew bundle

# Gems
. "$DOTFILES_DIR/install/gem.sh"

# Install C66 toolbelt
curl -sSL https://s3.amazonaws.com/downloads.cloud66.com/cx_installation/cx_install.sh | bash

# Basic Xcode setup
mkdir -p $XCODE_THEMES_DIR
cp $DOTFILES_DIR/xcode/theme/One\ Dark.dvtcolortheme $XCODE_THEMES_DIR

# Terminal preferences
cp $DOTFILES_DIR/terminal/com.apple.Terminal.plist $HOME/Library/Preferences/ && defaults read com.apple.Terminal

# Zsh auto suggetions
git clone https://github.com/zsh-users/zsh-autosuggestions ~/.zsh/zsh-autosuggestions

# Symlink dotfiles (check file named rcrc to see excluded symlinked files)
echo "All done! Run 'env RCRC=$HOME/dotfiles/rcrc rcup' to link your symfiles"
