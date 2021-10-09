//**********************************************************************************
// Anna's Radio
// MH_Radio.js
// Version 1.0
//**********************************************************************************
/*:
**@plugindesc
*(v1.0) Create a radio that plays in the background until you call a plugin command to hear it! It's always going like a real radio!
*
*@target MV
*@author AnnaMageis
*@url
*@help
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
*Plugin Commands:
*
* Radio play x 
* • this will play (unmute) the radio (x = station number)
*
* Radio stop x
* • this will stop (mute) the radio (x = station number)
*
*
*
*@param Station Setup
*
*@param StationName1
*@text Station 1 Name
*@type text
*@parent Station Setup
*@default Station 1
*
*@param StationPlaylist1
*@text Playlist
*@parent Station Setup
*@type file[]
*@dir audio/bgm/
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
*/

var MH = MH || {};
var Imported = Imported || {};
Imported.MH_Radio = true;
MH.Radio = MH.Radio || {};
MH.Radio.version = 2.1;

var params = PluginManager.parameters('MH_Radio');

MH.Radio.personalRadioSwitch = Number(params['PersonalRadioSwitch'] || 1);

MH.Radio.mapChangeMute = params['MuteOnMapChange'] || true;

MH.Radio.station1Name  =  params['StationName1'] || "My Station 1";
MH.Radio.station1Playlist = eval(params['StationPlaylist1'] || null);

AudioManager._bgmBuffers = [];
MH.Radio.Initialized = false;

MH.Radio.initialize = function() 
{
    if (!MH.Radio.Initialized)
    {
        MH.Radio.station1PlaylistIndex = 0;
        MH.Radio.radioStation1Playing = MH.Radio.station1Playlist[MH.Radio.station1PlaylistIndex];
        AudioManager._bgmBuffers[1] = AudioManager.createBuffer('bgm', MH.Radio.radioStation1Playing);
        AudioManager._bgmBuffers[1].volume = 0;
        MH.Radio.Initialized = true;
        MH.Radio.playSong();
    }
}

MH.Radio.OnMapLoaded = Scene_Map.prototype.onMapLoaded;              
Scene_Map.prototype.onMapLoaded = function()
{
    if ($gamePlayer.isTransferring())
    {      
        console.log("map loaded");
        if (MH.Radio.mapChangeMute && MH.Radio.Initialized && !$gameSwitches.value(MH.Radio.personalRadioSwitch)){AudioManager._bgmBuffers[1].volume = 0};}
        MH.Radio.OnMapLoaded.call(this);
};

MH.Radio.getSongPos = function() 
{
    if (AudioManager._bgmBuffers[1]._buffer != null && AudioManager._bgmBuffers[1].isPlaying())
    {
        var position = (AudioManager._bgmBuffers[1].seek() / AudioManager._bgmBuffers[1]._totalTime);
        return Number.isFinite(position) ? position : 0.0;
    }
}

MH.Radio.getSongDur = function() 
{
    var duration = (AudioManager._bgmBuffers[1]._totalTime);
    return Number.isFinite(duration) ? duration : 0.0;
}

MH.Radio.changeSong = function ()
{
    MH.Radio.stopSong();
    MH.Radio.updateSong();
    MH.Radio.loadSong();
    MH.Radio.playSong();
}

MH.Radio.stopSong = function() 
{
    AudioManager._bgmBuffers[1].clear();
}

MH.Radio.updateSong = function() 
{
    if(MH.Radio.station1PlaylistIndex < (MH.Radio.station1Playlist.length - 1)){MH.Radio.station1PlaylistIndex += 1;} else {MH.Radio.station1PlaylistIndex = 0;};
    MH.Radio.radioStation1Playing = MH.Radio.station1Playlist[MH.Radio.station1PlaylistIndex];
}

MH.Radio.loadSong = function() 
{
    AudioManager._bgmBuffers[1] = AudioManager.createBuffer('bgm', MH.Radio.radioStation1Playing);
}

MH.Radio.playSong = function() 
{
    AudioManager._bgmBuffers[1].play(true, 0);
}


//AudioManager._bgmBuffers[1] = AudioManager.createBuffer('bgm', MH.Radio.radioStation1Playing);

MH.Radio.mapUpdate = Scene_Map.prototype.update;
Scene_Map.prototype.update = function () 
{
    MH.Radio.mapUpdate.call(this);

    if(MH.Radio.getSongPos() >= 0.99)
    {
        MH.Radio.changeSong();
    };
};


MH.Radio.pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) 
{
    MH.Radio.pluginCommand.call(this, command, args);
    
    if (command === 'Radio') 
    {
        switch (args[0].toLowerCase()) 
        {
            case 'setup':
                if(args[1] === 1)
                AudioManager._bgmBuffers[1].volume = 0;
                MH.Radio.playSong();
            break;

            case 'play':
                if (args[1] == 1){AudioManager._bgmBuffers[1].volume = 1;}                
            break;

            case 'stop':
                if (args[1] == 1){AudioManager._bgmBuffers[1].volume = 0;}
            break;

            case 'fadeout':
                if (args[1] == 1)
                {
                    // audioBuffer.fadeOut(intSeconds);
                    AudioManager._bgmBuffers[1].fadeOut(args[2]);
                }
            break;

            case 'fadein':
                if (args[1] == 1)
                {
                    // audioBuffer.fadeOut(intSeconds);
                    AudioManager._bgmBuffers[1].fadeIn(args[2]);
                }
                
        }
    };
};

MH.Radio.initialize();
