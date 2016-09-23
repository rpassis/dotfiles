#!/bin/bash

# Installs Homebrew and some of the common dependencies needed/desired for software development

# Ask for the administrator password upfront
sudo -v

# Install rbenv ruby
rbenv install ${RUBY_VERSION}
rbenv global ${RUBY_VERSION}

# Install essential gems
gems=(
  cocoapods,
  fastlane,
  tmuxinator
)

gem install "${gems[@]}"
