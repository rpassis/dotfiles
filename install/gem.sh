#!/bin/bash

echo "Gem installation tasks starting"

# Ask for the administrator password upfront
sudo -v

# Install rbenv ruby
rbenv install ${RUBY_VERSION}
rbenv global ${RUBY_VERSION}

# Install essential gems
gems=(
  cocoapods
  fastlane
  tmuxinator
)

gem install "${gems[@]}"

echo "Gem installation tasks finished"
