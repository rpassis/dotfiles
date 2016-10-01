#!/bin/bash

echo "Brew-cask installation tasks starting"

# Install Caskroom
brew tap caskroom/cask
brew install brew-cask
brew tap caskroom/versions

# Install packages
apps=(
    1password
    flux
    dash
    docker
    iterm2
    atom-beta
    charles
    firefox
    firefoxnightly
    google-chrome
    google-chrome-canary
    glimmerblocker
    hammerspoon
    kaleidoscope
    macdown
    paw
    screenflow
    simpholders
    sketch
    sonos
    spotify
    slack
    tower
    gitbox
    transmit
    elmedia-player
    utorrent
    valentina-studio
    visual-studio-code
)

brew cask install "${apps[@]}"

# Quick Look Plugins (https://github.com/sindresorhus/quick-look-plugins)
brew cask install qlcolorcode qlstephen qlmarkdown quicklook-json quicklook-csv betterzipql qlimagesize suspicious-package provisioning

echo "Brew-cask installation tasks finished"
