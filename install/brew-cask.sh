#!/bin/bash

echo "Brew-cask installation tasks starting"

# Install Caskroom
brew tap homebrew/cask
brew tap homebrew/cask-versions
brew tap homebrew/cask-fonts

# Install packages
apps=(
    1password
    alfred
    android-studio
    dash
    docker
    charles
    firefox
    google-chrome
    kap
    nosleep
    paw
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
    font-inconsolata-for-powerline
    font-meslo-for-powerline
    font-source-code-pro
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
