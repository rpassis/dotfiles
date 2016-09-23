#!/usr/bin/env bash

which -s brew
if [[ $? != 0 ]] ; then
  # Install brew first
  /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
else
  # Make sure we’re using the latest Homebrew.
  brew update
fi

# Upgrade any already-installed formulae.
brew upgrade --all

# Install GNU core utilities (those that come with macOS are outdated).
# Don’t forget to add `$(brew --prefix coreutils)/libexec/gnubin` to `$PATH`.
brew install rbenv
brew install carthage
brew install tmux
brew install s3cmd

# Install rbenv ruby
rbenv install 2.3.1
rbenv global 2.3.1

# Install essential gems
gem install cocoapods
gem install fastlane
gem install tmuxinator

# Install dotfiles
brew tap thoughtbot/formulae
brew install rcm
env RCRC=$HOME/dotfiles/rcrc rcup

# Remove outdated versions from the cellar.
brew cleanup
