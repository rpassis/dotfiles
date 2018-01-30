#!/bin/bash

echo "Brew-cask installation tasks starting"

# Install Caskroom
brew tap caskroom/cask
brew tap caskroom/versions
brew tap caskroom/fonts

# Install packages
apps=(
    1password
    dash
    docker
    charles
    firefox    
    google-chrome
    kaleidoscope    
    nosleep
    paw    
    screenflow
    simpholders
    spotify
    slack
    sourcetree
    sequel-pro
    visual-studio-code
)

brew cask install "${apps[@]}"

# Fonts
fonts=(
    font-inconsolata
    font-meslo-lg
    font-anonymous-pro
)

brew cask install "${fonts[@]}"

# Quick Look Plugins (https://github.com/sindresorhus/quick-look-plugins)
quicklookPlugins=(
    qlcolorcode
    qlstephen
    qlmarkdown
    quicklook-json
    quicklook-csv
    betterzipql
    qlimagesize
    suspicious-package
    provisionql
)


brew cask install "${quicklookPlugins[@]}"

echo "Brew-cask installation tasks finished"
