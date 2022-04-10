import  * as utils from "../utils.js";
/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
 export class AbstractDActor extends Actor {

    /** @override */
    prepareData() {
      // Prepare data for the actor. Calling the super version of this executes
      // the following, in order: data reset (to clear active effects),
      // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
      // prepareDerivedData().
      super.prepareData();
    }
  
    /** @override */
    prepareBaseData() {
    const actorData = this.data;
    const data = actorData.data;
    // Data modifications in this step occur before processing embedded
      // documents or derived data.
      // on essaie ici car toujours pas sauver dans la bd
      this._prepareBDCharacterData(actorData);
      this._prepareBDNpcData(actorData);
      console.log("AbstractD | ActorData | Donnees après traitement prepareBaseData");
      console.log(actorData);
  }
  
    /**
     * @override
     * Augment the basic actor data with additional dynamic data. Typically,
     * you'll want to handle most of your calculated/derived data in this step.
     * Data calculated in this step should generally not exist in template.json
     * (such as ability modifiers rather than ability scores) and should be
     * available both inside and outside of character sheets (such as if an actor
     * is queried and has a roll executed directly from it).
     */
    prepareDerivedData() {
      const actorData = this.data;
      const data = actorData.data;
      const flags = actorData.flags.abstractd || {};

      this._prepareCharacterData(actorData);
      this._prepareNpcData(actorData);

      // Make separate methods for each Actor type (character, npc, etc.) to keep
      // things organized.
    }
  
    /**
     * Prepare Character type specific data
     */
     _prepareBDCharacterData(actorData) {
        if (actorData.type !== 'personnage') return;
        
        const data = actorData.data;

        if(data.mapdesitems === undefined || data.mapdessitems == "") {
            //mettre tous les json à "" car on part de zero
            data.mapdesitems="";
            data.uiddesitems="";
            let jb = utils.backupMap(data, actorData.items);
            data.mapdesitems=jb.lstdes; 
            data.uiddesitems=jb.uiddes;

        } else { // premier essai pour reporter les valeurs des items
            let uiddes = JSON.parse(data.uiddesitems);
            let lstdes = JSON.parse(data.mapdesitems);
            if(data.mapdesitems.substring(0,2) == "[[") { // ceinture et bretelle
                for(let i = 0; i < uiddes.length; i++){
                    let it = actorData.items.get(uiddes[i]);
                    if(lstdes[i] === null) lstdes[i]= [1]; // cas de l'import
                    it.data.data.lstdes = lstdes[i];
                    it.data.data.lstdesjson = JSON.stringify(lstdes[i]);
                }
            }

        }

        // pas mettre de flag ici

        let attrib = ["for","dex","int","sag","bonus"];
        attrib.forEach((atr, index) => {
            if(data[atr].lstdesjson === undefined) data[atr].lstdesjson ="";
            if(data[atr].lstdesjson==""){
                data[atr].lstdes = utils.EtendLesDes(data[atr].lstdes, data[atr].nbdes);
                data[atr].lstdesjson = JSON.stringify(data[atr].lstdes);
                console.log("Creation dés de "+atr);
            } else {
                data[atr].lstdes = JSON.parse(data[atr].lstdesjson);
            }
        });
        // premier bonus à 6
        if(data.bonus.lstdes[0] != 6 ) { 
            data.bonus.lstdes[0] = 6;
            data.bonus.lstdesjson = JSON.stringify(data.bonus.lstdes);
        }
        if(data.selection.lstdesjson == ""){
            if(data.selection.lstdes === undefined) {
                data.selection.lstdes = [];
                data.selection.lstprov = [];
                data.selection.lstindice = [];
            }
            for(let i = data.selection.lstdes.length; i < data.selection.nbdes; i++) {
                data.selection.lstdes[i] = 0; // pas de dés selectionnée
                data.selection.lstprov[i] = "SEL";
                data.selection.lstindice[i]= -1;
            }
            data.selection.lstdesjson = JSON.stringify(data.selection.lstdes);
            data.selection.lstprovjson = JSON.stringify(data.selection.lstprov);
            data.selection.lstindicejson = JSON.stringify(data.selection.lstindice);
        } else { // faut pensez à les charger
            data.selection.lstdes = JSON.parse(data.selection.lstdesjson);
            data.selection.lstprov = JSON.parse(data.selection.lstprovjson);
            data.selection.lstindice = JSON.parse(data.selection.lstindicejson);
        }       

        data.initialise="true"; // historique

    }

     _prepareBDNpcData(actorData) {
        if (actorData.type === 'personnage') return;
    
        // Make modifications to data here. For example:
        const data = actorData.data;

        if(data.nbpj === undefined &&  data.nbjoueurs === undefined) data.nbjoueurs =1; // promis quand je serai calcule le nombre de joueur !
            else if(data.nbjoueurs === undefined) data.nbjoueurs = data.nbpj;
        if( data.diffnbpj == "") data.diffnbpj = 0;
        data.desTotal = parseInt(data.diffnbpj,10) * parseInt(data.nbjoueurs,10) + parseInt(data.difficulte,10); // on prend le mini des deux (10 dés par défaut)
        
        if(data.lstdesjson === undefined) data.lstdesjson = "";
        if(data.lstdesjson == "") {
            data.lstdes = utils.EtendLesDes([],data.desTotal); // initialisation de la liste
            data.lstdesjson = JSON.stringify(data.lstdes);
        } else {
            data.lstdes = utils.EtendLesDes(data.lstdes, data.desTotal);
        }
        //if(data.lstdesd === undefined || data.lstdesd.length != data.lstdes.length) {this.update( { "lstdesd": data.lstdes }); 
     }
  
     _prepareCharacterData(actorData) {
      if (actorData.type !== 'personnage') return;
  
      // Make modifications to data here. For example:
      const data = actorData.data;
  
              // premier utilisation des flags pour stocker ce qui ne veut pas être modifié
        //let mesFlag = this.getFlag("world", "videItems");
        //if(mesFlag === undefined) this.setFlag("world","videItems", [] );
      
        // mise en correspondance entre attributs (sens large) et nbdes, la liste et son image texte
        let attrib = ["for","dex","int","sag","bonus"];
        attrib.forEach((atr, index) => {
            console.log("recuperation dés de "+atr);
            let modifie = true;
            if(data[atr].lstdesjson != "") { // les json ne devraient pas être vide ici -secu-
                data[atr].lstdes = JSON.parse(data[atr].lstdesjson);
                modifie = false; // ici identique au JSON
            }
            if(data[atr].lstdes.length < data[atr].nbdes){
                data[atr].lstdes = utils.EtendLesDes(data[atr].lstdes, data[atr].nbdes)
                modifie = true; // plus identique au JSON
            } else if( data[atr].lstdes.length> data[atr].nbdes) {
                data[atr].lstdes.length = data[atr].nbdes; // on cut !
                modifie = true;
            }
            if(modifie) {
                data[atr].lstdesjson = JSON.stringify(data[atr].lstdes); 
            }
            console.log("Fin de recuperation dés de "+atr);
        });
        // traitement spécifique à selection ici 
            // chargement des données si elle existent.
        let modifie = true; // par défaut on modifie => pas de chargement
        if(data.selection.lstdesjson !="") {
            try {
                data.selection.lstdes = JSON.parse(data.selection.lstdesjson);
                data.selection.lstprov = JSON.parse(data.selection.lstprovjson);
                data.selection.lstindice = JSON.parse(data.selection.lstindicejson);
                modifie = false; // chargement effectuée
            } catch(e) {
                data.selection.lstdes = [];
                data.selection.lstdesjson ="";
                data.selection.lstprov = []; // peut être faire une gestion des retours
                data.selection.lstprovjson = "";
                data.selection.lstindice = [];
                data.selection.lstindicejson ="";
            }
            
        }
        if(data.selection.mode == "cmb") {
            data.selection.nbdes = 3; // fixer ici à trois
        } else { //ici mode ou on peut ajouter des dés si l'ensemble des trois est strictement pas égale à "SEL"
            let unSel = false; let pasledernier = false; 
            for(let i = 0; i < data.selection.lstdes.length; i++){
                unSel = (data.selection.lstprov[i] == "SEL"); // cherche au moins 1 espace libre
                if(unSel) { 
                    pasledernier = (i != data.selection.lstdes.length -1); // ce n'est pas le dernier 
                    break; 
                } // on sort si il existe une place de libre avant la fin 
            } 
            if( ! unSel) { // plus d'espace libre
                data.selection.nbde++; // on en ajouter un
            } else if(data.selection.nbdes > 3){ // plus de trois et il y a un autre espace vide
                if(pasledernier && data.selection.lstprov[data.selection.nbdes-1]=="SEL") { //et le dernier est un espace libre 
                    data.selection.nbde--; // on en enlève un
                }
            }
         }
        if(data.selection.lstdes.length < data.selection.nbdes){
            for(let i = data.selection.lstdes.length; i < data.selection.nbdes; i++) {
                data.selection.lstdes[i] = 0; // pas de dés selectionnée
                data.selection.lstprov[i] = "SEL";
                data.selection.lstindice[i]= -1;
            }
        } else if( data.selection.lstdes.length> data.selection.nbdes) {
            // faut restituer les dés enlevés
            for(let i = data.selection.nbdes; i < data.selection.lstdes.length; i++) {
                if(data.selection.lstprov[i] != "SEL") {
                    if(data.selection.lstprov[i].length < 7 ) { // bonus compris ;-) c'est un attribut
                        data[data.selection.lstprov[i]].lstdes[data.selection.lstindice[i]] = data.selection.lstdes[i];
                        data[data.selection.lstprov[i]].lstdesjson = JSON.stringify(data[data.selection.lstprov[i]].lstdes);
                    } else {
                    // traitement plus complexe : trouver l'indice dans items de data.selection.lstprov[i]
                    // modifier l'indice du puis valider son JSON.
                    //data.items[data.selection.lstprov[i]].lstdes[data.selection.lstindice[i]]
                    }
                }
            }
            data.selection.lstdes.length = data.selection.nbdes; // on cut !
            data.selection.lstprov.length = data.selection.nbdes;
            data.selection.lstindice = data.selection.nbdes;
        }
        data.selection.lstdesjson = JSON.stringify(data.selection.lstdes);
        data.selection.lstprovjson = JSON.stringify(data.selection.lstprov);
        data.selection.lstindicejson = JSON.stringify(data.selection.lstindice);
        console.log("AbstractD | Actor | Donnees après traitement");
        console.log(data);
    }
  
    /**
     * Prepare NPC type specific data.
     */
    _prepareNpcData(actorData) {
        if (actorData.type === 'personnage') return;
    
        const data = actorData.data;
        
        let modifie = true;
        if(data.lstdesjson != "") { // les json ne devraient pas être vide ici -secu-
            data.lstdes = JSON.parse(data.lstdesjson);
            modifie = false; // ici identique au JSON
        }
        if(data.lstdes.length < data.desTotal){
            data.lstdes = utils.EtendLesDes(data.lstdes, data.desTotal)
            modifie = true; // plus identique au JSON
        } else if( data.lstdes.length> data.desTotal) {
            data.lstdes.length = data.desTotal; // on cut !
            modifie = true;
        }
        if(modifie) {
            data.lstdesjson = JSON.stringify(data.lstdes); 
        }
    //    if(data.lstdesd === undefined || data.lstdesd.length != data.lstdes.length) this.update( { "lstdesd": data.lstdes }); 
    // Make modifications to data here. For example:
    //   const data = actorData.data;
    //   data.xp = (data.cr * data.cr) * 100;
    }
  
    async _preUpdate(changed, options, user){
        await super._preUpdate(changed, options, user);
        
        if (this.data.type !== 'personnage') return; // pas encore de préUpdate pour le PNJ

        try {
            let lstjsonlst = changed.this.data.data.lstdesjson; // c'est une liste des modifs des items dans l'ordre
            if(lstjsonlst !== undefined)  {
                // for(let i = 0; i < lstjsonlst.length; i++){
                //     this.items._source[i].data.lstdesjson = lstjsonlst[i];
                // }
                let jb = utils.backupMap(this.data.data, this.items);
                this.data.data.mapdesitems=jb.lstdes; 
                this.data.data.uiddesitems=jb.uiddes;
                this.data._source.data.mapdesitems = this.data.data.mapdesitems;
                let x = 10; // pour voir
            }
            console.log(this.items)
        } catch(e) {
            // ne fait rien ! c'est pas le bon changed
        }
        console.log(changed);
    }
    
    // _onUpdate(changed, options, userId){
        
    //     console.log("------- > Acteur changé :");
    //     let lstjsonlst = changed.this.data.data.lstdesjson; // c'est une liste des modifs des items dans l'ordre
    //     if(lstjsonlst !== undefined)  {
    //         // for(let i = 0; i < lstjsonlst.length; i++){
    //         //     this.items._source[i].data.lstdesjson = lstjsonlst[i];
    //         // }
    //     }
    //     super._onUpdate(changed, options, userId);
    //     console.log(this)
    //     console.log(changed);
    // }

    // _preUpdateEmbeddedDocuments(embeddedName, result, options, userId){
    //     console.log(this.items)
    //     console.log(embeddedName + "," + result + "," + options + "," + userId);
        
    // }
    _onCreate(data, options, userId){
        console.log("CREATION : verif pour les blancs");
        // mettre tous les champs dans la bon état une fois
        console.log("data");
        console.log(data);
        console.log("options:");
        console.log(options);
        console.log("userid"+userId);
    }
   
  }