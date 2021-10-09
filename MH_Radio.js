//**********************************************************************************
// Anna's Radio
// MH_Radio.js
// Version 1.1
//**********************************************************************************
/*:
**@plugindesc
*(v1.1) Create a radio that plays in the background until you call a plugin command to hear it! It's always going like a real radio!
*
*
*@target MV
*@author AnnaMageis
*@url
*@help
*
* Release Notes:
* 1.0:
* • Released Plugin
*
* 1.1:
* • Fixed song unmuting once song changes.
* • Added simplified HUD to show Station 1 and current song.
* • Added initial volume changing section.
*
-----------------------------------------------------------------------------------
                    Settings and Parameters:
-----------------------------------------------------------------------------------
* Description:
* Just load your OGG/M4A files into the playlist 
* and the Radio will play them in that order, then repeat!
*
* ===______ Make sure to add at least 1 song before loading the game. _______===
*
* Plugin Commands:
*
* Radio play x 
* • this will play (unmute) the radio (x = station number)
*
* Radio stop x
* • this will stop (mute) the radio (x = station number)
*
* Personal Radio Switch
* • The ingame switch to allow the radio to keep playing regardless of switching maps. You still need to turn off radio after turning off switch.
*
*
*@param Station Setup
*
*@param Station 1
*
*@param StationName1
*@text Station 1 Name
*@type text
*@parent Station 1
*@default Station 1
*
*@param StationPlaylist1
*@text Playlist
*@parent Station 1
*@type file[]
*@dir audio/bgm/
*
*@param Station1Volume
*@text Station 1 Volume
*@parent Station 1
*@desc Volume station 1 plays at (decimal indicates %. i.e. 0.5 = 50%). Starts to distort after 100%.
*@type number
*@decimals 1
*@default 1.0
*
*@param MuteOnMapChange
*@text Mute On Map Change
*@desc Whether or not radio needs to be muted when changing maps (unless map is marked as radio).
*@type boolean
*@default true
*
*@param PersonalRadioSwitch
*@text Personal Radio Switch
*@desc When this switch is on, the radio will always play regardless of switching maps. (it will still mute when turning off a radio with plugin commands)
*@type switch
*@default 0
*
*/

var Imported = Imported || {};
Imported.MH_Radio = true;
var Radio = Radio || {};
Radio.version = 1.1;

var params = PluginManager.parameters('MH_Radio');

Radio.personalRadioSwitch = Number(params['PersonalRadioSwitch'] || 1);

Radio.mapChangeMute = params['MuteOnMapChange'] || true;

Radio.station1Name  =  params['StationName1'] || "My Station 1";
Radio.station1Playlist = eval(params['StationPlaylist1'] || null);

Radio.station1Volume = 1;
Radio.station1Muted = true;

AudioManager._bgmBuffers = [];
Radio.Initialized = false;

Radio.initialize = function() 
{
    if (!Radio.Initialized)
    {
        Radio.station1PlaylistIndex = 0;
        Radio.radioStation1Playing = Radio.station1Playlist[Radio.station1PlaylistIndex];
        AudioManager._bgmBuffers[1] = AudioManager.createBuffer('bgm', Radio.radioStation1Playing);
        AudioManager._bgmBuffers[1].volume = 0;
        Radio.Initialized = true;
        Radio.playSong();
    }
}

Radio.OnMapLoaded = Scene_Map.prototype.onMapLoaded;              
Scene_Map.prototype.onMapLoaded = function()
{
    if ($gamePlayer.isTransferring())
    {      
        console.log("map loaded");
        if (Radio.mapChangeMute && Radio.Initialized && !$gameSwitches.value(Radio.personalRadioSwitch)){AudioManager._bgmBuffers[1].volume = 0; Radio.station1Muted = true;};}
        Radio.OnMapLoaded.call(this);
};

Radio.getSongPos = function() 
{
    if (AudioManager._bgmBuffers[1]._buffer != null && AudioManager._bgmBuffers[1].isPlaying())
    {
        var position = (AudioManager._bgmBuffers[1].seek() / AudioManager._bgmBuffers[1]._totalTime);
        return Number.isFinite(position) ? position : 0.0;
    }
}

Radio.getSongDur = function() 
{
    var duration = (AudioManager._bgmBuffers[1]._totalTime);
    return Number.isFinite(duration) ? duration : 0.0;
}

Radio.changeSong = function ()
{
    Radio.stopSong();
    Radio.updateSong();
    Radio.loadSong();
    Radio.playSong();
}

Radio.stopSong = function() 
{
    AudioManager._bgmBuffers[1].clear();
}

Radio.updateSong = function() 
{
    if(Radio.station1PlaylistIndex < (Radio.station1Playlist.length - 1)){Radio.station1PlaylistIndex += 1;} else {Radio.station1PlaylistIndex = 0;};
    Radio.radioStation1Playing = Radio.station1Playlist[Radio.station1PlaylistIndex];
}

Radio.loadSong = function() 
{
    AudioManager._bgmBuffers[1] = AudioManager.createBuffer('bgm', Radio.radioStation1Playing);
    switch (Radio.station1Muted){case true: AudioManager._bgmBuffers[1].volume = 0; break; case false: AudioManager._bgmBuffers[1].volume = Radio.station1Volume; break;}
}

Radio.playSong = function() 
{
    AudioManager._bgmBuffers[1].play(true, 0);
}


//AudioManager._bgmBuffers[1] = AudioManager.createBuffer('bgm', Radio.radioStation1Playing);

Radio.mapUpdate = Scene_Map.prototype.update;
Scene_Map.prototype.update = function () 
{
    Radio.mapUpdate.call(this);

    if(Radio.getSongPos() >= 0.99)
    {
        Radio.changeSong();
    };
};


Radio.pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) 
{
    Radio.pluginCommand.call(this, command, args);
    
    if (command === 'Radio') 
    {
        switch (args[0].toLowerCase()) 
        {
            case 'setup':
                if(args[1] === 1)
                AudioManager._bgmBuffers[1].volume = 0;
                Radio.playSong();
            break;

            case 'play':
                if (args[1] == 1){AudioManager._bgmBuffers[1].volume = 1;
                    Radio.station1Muted = false;}                
            break;

            case 'stop':
                if (args[1] == 1){AudioManager._bgmBuffers[1].volume = 0;
                    Radio.station1Muted = true;}
            break;

            case 'fadeout':
                if (args[1] == 1)
                {
                    // audioBuffer.fadeOut(intSeconds);
                    AudioManager._bgmBuffers[1].fadeOut(args[2]);
                    Radio.station1Muted = true;
                }
            break;

            case 'fadein':
                if (args[1] == 1)
                {
                    // audioBuffer.fadeOut(intSeconds);
                    AudioManager._bgmBuffers[1].fadeIn(args[2]);
                    Radio.station1Muted = false;
                }
                
        }
    };
};

// Hud Setup
//_______________________________________________________________________

Radio.CreateAllWindows = Scene_Map.prototype.createAllWindows;
Scene_Map.prototype.createAllWindows = function() 
{
    Radio.CreateAllWindows.call(this);
    this._RadioWindow = new Window_Radio(0, 0, 100, 100);
    this._RadioWindow.opacity = 0;
    this.addChild(this._RadioWindow);
};

Window_Radio.prototype.create = function()
{
    Window_Radio.prototype.create.call(this);
}

function Window_Radio()
{
    this.initialize.apply(this, arguments);
};

Window_Radio.prototype = Object.create(Window_Base.prototype);
Window_Radio.prototype.constructor = Window_Radio;

var windowX = 0;
var windowY = 50;
var windowWidth = 250;
var windowHeight = 100;

Window_Radio.prototype.initialize = function(x, y, width, height)
{
    Window_Base.prototype.initialize.call(this, windowX, windowY, windowWidth, windowHeight);
}

Window_Radio.prototype.refresh = function() 
{
    this.contents.clear();
    //var color1 = this.textColor(1);
    //var color2 = this.textColor(23);    
    this.contents.fontSize = 18;
    
    this.drawText("Station: " + Radio.station1Name, windowX, windowY - 55, windowWidth, windowHeight); 
    this.drawText("Playing: " + Radio.radioStation1Playing, windowX, windowY - 40, windowWidth, windowHeight);  

    this.resetFontSettings();        
};

Radio.MapUpdate = Scene_Map.prototype.update;
Scene_Map.prototype.update = function () 
{
    Radio.MapUpdate.call(this);
    this._RadioWindow.refresh();
};
//_______________________________________________________________________

Radio.initialize();