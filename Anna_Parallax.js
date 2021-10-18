var Imported = Imported || {};
Imported.Anna_Parallax = true;

var Anna= Anna || {};
Anna.Parallax = Anna.Parallax || {};
Anna.Parallax.version = 1.0

//**********************************************************************************
// Anna's Parallax Loop Manipulator
//**********************************************************************************
/*:
*
*@plugindesc
* Basically just randomizes the map's parallax loop speeds.
* Can be used in various ways.
*
*@author AnnaMageis
*
*@help
*
* Map Notetags:
*<loopxmin: x> <-- A random value will be between these two values when the map is loaded
*<loopxmax: x> <--|
*<loopymin: x> <-- Same with these
*<loopymax: x> <--|
*
*
*Plugin command: 
*
* Only useful if you want higher/lower speeds than the usual max of 10.
* Parallax change name loopX(true/false) loopY(true/false) sx(x) sy(x))
* ex. Parallax change Castle true true 5 6
* The parallax of the current map will change to Castle and loop it's X by 5 and Y by 6.
*
*@param Random 
*@text Use Random
*@desc Activates random loop speed on map change.
*Setup via map notetags.
*@type boolean
*@default false
*
*@param ChanceOfChange 
*@text Chance For Parallax Change
*@parent Random 
*@desc Chance (in %) that the parallax will change loop speeds on map transfer.
*@type number
*@default 50
*
*/
var param = PluginManager.parameters('Anna_Parallax');

Anna.Parallax.LoopX;
Anna.Parallax.MinLoopX;
Anna.Parallax.MaxLoopX;

Anna.Parallax.LoopY;
Anna.Parallax.MinLoopY;
Anna.Parallax.MaxLoopY;

Anna.Parallax.LoopXBoolean = true;
Anna.Parallax.LoopYBoolean = true;

Anna.Parallax.Random = param["Random"] || false;
Anna.Parallax.ChanceOfChange = Number(param["ChanceOfChange"] || 50);
Anna.Parallax.ChanceOfChange = Anna.Parallax.ChanceOfChange / 100;

var Anna_Parallax_Game_Interpreter_prototype_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) 
{
    Anna_Parallax_Game_Interpreter_prototype_pluginCommand.call(this, command, args);
    
    if (command === 'Parallax'.toLowerCase()) {
        switch (args[0].toLowerCase()) {
            //Parallax change name loopX(boolean) loopY(boolean) sx(speed) sy(speed))
            case 'change':{
                $gameMap.changeParallax(args[1].toLowerCase(), args[2], args[3], args[4], args[5]);
            }
            break;     
        }
    };
};


    var Anna_Parallax_SceneMap_onMapLoaded = Scene_Map.prototype.onMapLoaded;              
Scene_Map.prototype.onMapLoaded = function()
{
    if (Anna.Parallax.Random){
        Anna_Parallax_SceneMap_onMapLoaded.call(this);
        var chance = Math.random();
        
        if (chance < Anna.Parallax.ChanceOfChange){
            Anna.Parallax.LoopX = parseInt(Math.floor(Math.random()*$dataMap.meta.loopxmax) + $dataMap.meta.loopxmin);
            Anna.Parallax.LoopX *= Math.round(Math.random()) ? 1 : -1;
            Anna.Parallax.LoopY = parseInt(Math.floor(Math.random()*$dataMap.meta.loopymax) + $dataMap.meta.loopymin);
            Anna.Parallax.LoopY *= Math.round(Math.random()) ? 1 : -1;
            $gameMap.changeParallax($gameMap.parallaxName(), true, true, Anna.Parallax.LoopX, Anna.Parallax.LoopY);
        }; 

    };
};