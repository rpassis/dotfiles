#!/bin/bash

echo "Brew-cask installation tasks starting"

# Install Caskroom
brew tap caskroom/cask
brew tap caskroom/versions
brew tap caskroom/fonts

# Install packages
apps=(
    1password
    flux
    dash
    docker
    atom-beta
    charles
    firefox
    firefoxnightly
    gitbox
    google-chrome
    google-chrome-canary
    kaleidoscope
    keepingyouawake
    macdown
    paw
    screenflow
    simpholders
    sketch
    sonos
    spotify
    slack
    gitbox
    elmedia-player
    utorrent
    valentina-studio
    visual-studio-code
)

brew cask install "${apps[@]}"

# Fonts
fonts=(
    font-inconsolata
    font-inconsolata-for-powerline
    font-meslo-lg
    font-meslo-lg-for-powerline
    font-anonymous-pro
    font-anonymous-pro-for-powerline
)

brew cask install "${fonts[@]}"

# Quick Look Plugins (https://github.com/sindresorhus/quick-look-plugins)
brew cask install qlcolorcode qlstephen qlmarkdown quicklook-json quicklook-csv betterzipql qlimagesize suspicious-package provisioning

echo "Brew-cask installation tasks finished"
