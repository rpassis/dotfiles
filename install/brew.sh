#!/bin/bash

# Installs Homebrew and some of the common dependencies needed/desired for software development
echo "Brew installation tasks starting"

# Ask for the administrator password upfront
sudo -v

# brew tap homebrew/versions
# brew tap homebrew/dupes
brew tap thoughtbot/formulae

# Make sure we’re using the latest Homebrew
brew update

apps=(
  awscli
  carthage
  diff-so-fancy
  direnv
  fasd
  git
  git-flow-avh
  hub
  mas
  nvm
  rbenv
  rcm
  s3cmd
  swiftgen
  swiftlint
  tmux
  zsh-autosuggestions
  zsh-completions
)

brew install "${apps[@]}"

# Remove outdated versions from the cellar.
brew cleanup

# Setup nvm
export NVM_DIR="$HOME/.nvm"
. "$(brew --prefix nvm)/nvm.sh"
nvm install stable

echo "Brew installation tasks finished"
