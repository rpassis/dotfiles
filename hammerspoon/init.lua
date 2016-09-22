hs.alert.closeAll()

-- require 'tools/clipboard'
local ignored = require 'ignored'

-- key define
local hyper = {'ctrl', 'alt', 'cmd'}
local hyperShift = {'ctrl', 'alt', 'cmd', 'shift'}

-- states
hs.window.animationDuration = 0

-- cli
if not hs.ipc.cliStatus() then hs.ipc.cliInstall() end

-- App shortcuts
local key2App = {
    a = 'Atom',
		d = 'Dash',
		f = 'Finder',
    g = 'Gitbox',
    m = 'Mail',
    p = 'Paw',
		s = 'Spotify',
    t = 'iTerm',
		w = 'Safari',
    x = 'Xcode',
}

for key, app in pairs(key2App) do
	hs.hotkey.bind(hyper, key, function() hs.application.launchOrFocus(app) end)
end

-- Hints
hs.hotkey.bind(hyper, 'h', function()
    hs.hints.windowHints(getAllValidWindows())
end)

-- undo
local undo = require 'undo'
hs.hotkey.bind(hyper, 'z', function() undo:undo() end)

-- caffeinate
hs.hotkey.bind(hyperShift, 'c', function()
    local c = hs.caffeinate
    if not c then return end
    if c.get('displayIdle') or c.get('systemIdle') or c.get('system') then
        if menuCaff then
            menuCaffRelease()
        else
            addMenuCaff()
            local type
            if c.get('displayIdle') then type = 'displayIdle' end
            if c.get('systemIdle') then type = 'systemIdle' end
            if c.get('system') then type = 'system' end
            hs.alert('Caffeine already on for '..type)
        end
    else
        acAndBatt = hs.battery.powerSource() == 'Battery Power'
        c.set('system', true, acAndBatt)
        hs.notify.new({title="Hammerspoon", informativeText='Caffeinated '..(acAndBatt and '' or 'on AC Power')}):send()
        addMenuCaff()
    end
end)

function addMenuCaff()
    menuCaff = hs.menubar.new()
    menuCaff:setIcon("caffeine-on.pdf")
    menuCaff:setClickCallback(menuCaffRelease)
end

function menuCaffRelease()
    local c = hs.caffeinate
    if not c then return end
    if c.get('displayIdle') then
        c.set('displayIdle', false, true)
    end
    if c.get('systemIdle') then
        c.set('systemIdle', false, true)
    end
    if c.get('system') then
        c.set('system', false, true)
    end
    if menuCaff then
        menuCaff:delete()
        menuCaff = nil
    end
    hs.notify.new({title="Hammerspoon", informativeText="Decaffeinated"}):send()
end

-- console
hs.hotkey.bind(hyperShift, ';', hs.openConsole)

-- reload
hs.hotkey.bind(hyper, 'escape', function() hs.reload() end )

-- utils
function getAllValidWindows ()
    local allWindows = hs.window.allWindows()
    local windows = {}
    local index = 1
    for i = 1, #allWindows do
        local w = allWindows[i]
        if w:screen() then
            windows[index] = w
            index = index + 1
        end
    end
    return windows
end

hs.notify.new({title="Hammerspoon", informativeText="Config reloaded"}):send()
