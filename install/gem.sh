#!/bin/bash

echo "Gem installation tasks starting"

# Ask for the administrator password upfront
sudo -v

# Install rbenv ruby
rbenv install ${RUBY_VERSION}
rbenv global ${RUBY_VERSION}
rbenv local ${RUBY_VERSION}

# Install essential gems
gems=(
  cocoapods
  fastlane
  xcode-install
)

gem install "${gems[@]}"

echo "Gem installation tasks finished"
