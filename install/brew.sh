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
  rbenv
  carthage
  tmux
  s3cmd
  mogenerator
  node
  npm
  rcm
  homebrew/completions/brew-cask-completion
  homebrew/dupes/grep
  homebrew/dupes/openssh
)

brew install "${apps[@]}"

# Remove outdated versions from the cellar.
brew cleanup

echo "Brew installation tasks finished"
