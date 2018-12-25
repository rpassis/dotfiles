#!/bin/bash

echo "Brew-cask installation tasks starting"

# Install Caskroom
brew tap caskroom/cask
brew tap caskroom/versions
brew tap caskroom/fonts

# Install packages
apps=(
    1password
    android-studio
    dash
    docker
    charles
    firefox
    google-chrome
    kaleidoscope
    kap
    nosleep
    paw
    screenflow
    simpholders
    spotify
    sketch
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
    font-fira-code
)

brew cask install "${fonts[@]}"

# Quick Look Plugins (https://github.com/sindresorhus/quick-look-plugins)
quicklookPlugins=(
    qlcolorcode
    qlstephen
    qlmarkdown
    quicklook-json
    quicklook-csv
    provisionql
)


brew cask install "${quicklookPlugins[@]}"

echo "Brew-cask installation tasks finished"
