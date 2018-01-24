#!/bin/bash

# Installs Homebrew and some of the common dependencies needed/desired for software development
echo "Brew installation tasks starting"

# Ask for the administrator password upfront
sudo -v

brew tap homebrew/versions
brew tap homebrew/dupes
brew tap thoughtbot/formulae

# Make sure we’re using the latest Homebrew
brew update

# Upgrade any already-installed formulae
brew upgrade --all

apps=(
  awscli
  nvm
  hub
  direnv
  git
  git-flow-avh
  fasd
  rbenv
  carthage
  tmux
  s3cmd
  mogenerator
  rcm
  homebrew/completions/brew-cask-completion
  homebrew/dupes/grep
  homebrew/dupes/openssh
  reattach-to-user-namespace --wrap-pbcopy-and-pbpaste
  swiftlint
  swiftgen
)

brew install "${apps[@]}"

# Remove outdated versions from the cellar.
brew cleanup

# Setup nvm
export NVM_DIR="$HOME/.nvm"
. "$(brew --prefix nvm)/nvm.sh"
nvm install stable

echo "Brew installation tasks finished"
