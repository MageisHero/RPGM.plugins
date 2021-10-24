var Imported = Imported || {};
Imported.Anna_ElectricitySystem = true;

var Anna = Anna || {};
Anna.Electricity = Anna.Electricity || {};
Anna.Electricity.version = 1.0;
/*:
    @author AnnaMageis
    @target MV
    @plugindesc Give your world the ol' Edison touch!
    Tag something as a generator, or battery, and make things work!
    @help 
_____________________________________________________________________________________
    Release Notes:
_____________________________________________________________________________________
    1.0:
    • Released Plugin
    */

Anna.Electricity.params = PluginManager.parameters('Anna_Electricity');

//get newest plugin version
var fetchUpdate = fetch('http://localhost/Anna_Electricity_Version.txt')
    .then((response) => response.text())
    .then((responseText) => {
    Anna.Electricity.newestVersion = responseText[0].currentVersion;
    console.log("Anna Electricity Newest Version: " + Anna.Electricity.newestVersion);
});

//check if newest version installed and log in console.
Anna.Electricity.checkUpdates = function(){
    var hasUpdate;
    if (Anna.Electricity.version < Anna.Electricity.newestVersion){
        console.log("Anna's Electricity has a newer version available!");
        hasUpdate = true;
    } else if (Anna.Electricity.version == Anna.Electricity.newestVersion){
        console.log("Anna's Electricity is Up To Date!");
        hasUpdate = false;
    } else if (Anna.Electricity.version > Anna.Electricity.newestVersion){
        console.log("How did you get a newer version of Anna's Electricity than released?");
        hasUpdate = false;
    }  
    return hasUpdate;      
};
Anna.Electricity.checkUpdates();