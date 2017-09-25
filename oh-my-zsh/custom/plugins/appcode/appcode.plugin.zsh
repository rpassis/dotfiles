function apc {
  local xcode_proj
  xcode_proj=(*.{xcworkspace,xcodeproj}(N))

  if [[ ${#xcode_proj} -eq 0 ]]; then
    echo "No xcworkspace/xcodeproj file found in the current directory."
    return 1
  else
    echo "Found ${xcode_proj[1]}"
    /usr/local/bin/appcode "${xcode_proj[1]}"
  fi
}
