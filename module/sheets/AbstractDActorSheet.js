import  * as utils from "../utils.js";
//import {unde} from "../unde.js";
// modification pour simplifier la gestion des objetss et des items

export default class AbstractDActorSheet extends ActorSheet {
    get template() {
        console.log(`AbstractD | Récupération du fichier html ${this.actor.data.type}-sheet.`);

        return `systems/abstractd/templates/sheets/${this.actor.data.type}-sheet.html`;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 590,
            height: 730,
        });
    }


    getData() {
        const baseData = super.getData();
        // OG : modification vers 9.5
        let data = {
            // on devrait mettre que ce que l'on a besoin dans la feuilles (pj, pnj, obs, defi)
            owner: this.actor.isOwner,
            editable: this.isEditable,
            actor : baseData.actor,
            data: baseData.actor.data.data,
            items: baseData.actor.items,
            texteAff : "text",  // mettre sur text pour les voir, sur hidden pour les cacher
            initToZero: false, 
            repDessin : "",
            isDMG : false,
            isCMB: true  // mettre les jsons a vide dans PJinit;
        };

        console.log(data);

        const persodata = data.actor.data.data;
        data.data.repdessin = "systems/abstractd/ui/d6-" +data.data.couleurde +"-";  // soucis d'initialisation
        // ici on initialise l'objet en fonction de ce que c'est........................
        let rollit = false;
        // c'est ici que l'on fait l'initialisation du PJ/PNJ/Autres
        switch (data.actor.data.type) {
            case "personnage":
                console.log("AbstractD | creation des dés" );
                //this.creerLesDesPJ(persodata);
                // pour affichage
                persodata.traits = data.items.filter(item => item.type === "trait");
                persodata.objets = data.items.filter(item => item.type === "objet");
                data.isCMB = persodata.selection.mode == "cmb";
                if(data.data.dmg === undefined) data.data.dmg = false;
                data.isDMG = data.data.dmg;
                persodata.selection.lstori = [];
                for(let i = 0; i < persodata.selection.lstdes.length; i++) {
                    // les items marchent pas comme les champs ! c'est la merde
                    let aAfficher = "";
                    persodata.selection.lstori[i] = {
                        "aff":"",
                        "valeur":0
                    };
                    if(persodata.selection.lstprov[i].length > 6) {
                        let it = data.items.get(persodata.selection.lstprov[i]);
                        // it.data.data.lstdes[persodata.selection.lstindice[i]] = -1;
                        // it.data.data.lstdesjson = JSON.stringify(it.data.data.lstdes);
                        aAfficher = it.name.substring(0,6)+"...";
                    } else aAfficher = persodata.selection.lstprov[i].substring(0,6);
                    if( persodata.selection.lstindice[i]>-1) {
                        persodata.selection.lstori[i].aff = aAfficher+ ":" + persodata.selection.lstindice[i];
                    } else persodata.selection.lstori[i].aff ="--";
                    persodata.selection.lstori[i].valeur = persodata.selection.lstdes[i];
                }

                if(persodata.mapdesitems.substring(0,2) != "[["){ // ne devrait plus être fait sauf init
                    let jb = utils.backupMap(this.actor.data.data, this.actor.items);
                    this.actor.data.data.mapdesitems=jb.lstdes; 
                    this.actor.data.data.uiddesitems=jb.uiddes;
                   } else {
                    let uiddes = JSON.parse(this.actor.data.data.uiddesitems);
                    let lstdes = JSON.parse(this.actor.data.data.mapdesitems);
                    for(let i = 0; i < uiddes.length; i++){
                        let it = data.items.get(uiddes[i]);
                        it.data.data.lstdes = lstdes[i];
                        it.data.data.lstdesjson = JSON.stringify(lstdes[i]);
                    }
                }
                break;
            case "pnj": // a envisager : gestion de item => armes magiques
                persodata.lstattaques = data.items.filter(item => item.type === "deattaque");
                persodata.objets = data.items.filter(item => item.type === "objet");
                if(persodata.nbjoueurs === undefined) {
                    if(persodata.nbpj === undefined) persodata.nbjoueurs =3;
                    else persodata.nbjoueurs = persodata.nbpj;
                } // l'info est mis dans nbpj si elle n'existe pas on part du principe de 3
                let temp = parseInt(persodata.difficulte,10)  + parseInt(persodata.diffnbpj,10) * parseInt(persodata.nbjoueurs,10) ;
                persodata.desTotal = temp; // faut juste que je trouve comment detecter qu'il y a modif de total (desTotals) -champ old ?
                data.TypesAdv = { "adv":"Adversaire", "boss":"Boss" };
                data.TypeValue = persodata.type; 
                break;
            case "plateaumonstre": // quand j'aurais fini le reste
                break;
            case "defi":
            case "obstacle": // même comportement mais avec dommage ou pas
            default:
                break;
        }
        console.log(data);
        return data;
    }

    activateListeners(html){
        // attention ses tous les feuilles de présenations (pj, pnj, obs, defi)
        super.activateListeners(html);

        // attribut et associé (bonus et selection)
        html.find('.selectDice').click(this._onSelectDiceAttr.bind(this));
        html.find('.selectItemDice').click(this._onSelectDiceItem.bind(this));
        html.find('.selectSelDice').click(this._onSelectDiceSelection.bind(this));
        if(this.actor.data.type == "personnage") html.find('.mode-dommage').click(this._onModeDommage.bind(this));
    //     // items 
        html.find('.item-edit').click(this._onItemEdit.bind(this));
        html.find('.item-delete').click(this._onItemDelete.bind(this));
       // generique de lancer dé 
       if(this.actor.data.type == "personnage") html.find('.Ele-reroll').click(this._onRerollEle.bind(this));
       html.find('.Ele-rerollall').click(this._RerollAllEle.bind(this));
       if(this.actor.data.type == "personnage") html.find('.Ele-fullrerollall').click(this._FullRerollAllEle.bind(this));
       
       // selection 
       if(this.actor.data.type == "personnage") { 
           html.find('.select-annuler').click(this._onSelectAnnuler.bind(this));
            html.find('.select-proposer').click(this._onSelectProposer.bind(this));
            html.find('.select-valider').click(this._onSelectValider.bind(this));
            html.find('.mode-combat').click(this._onSelectChangeMode.bind(this));
       }
       if(this.actor.data.type == "pnj") html.find('.pnj-showall').click(this._onPnjShowAll.bind(this));
    }

    // code pour la version 9
    getItemFromEvent = (ev) => {
        const parent = $(ev.currentTarget).parents(".item");
        const item = this.actor.items.get(parent.data("itemId"));
       return item;
    }

    _onItemEdit(event){
        const item = this.getItemFromEvent(event);
        item.sheet.render(true);
        this.render(true);
    }

    _onItemDelete(event){
        const item = this.getItemFromEvent(event);
        console.log(item);
        let d = Dialog.confirm({
            title: "Suppression d'élément",
            content: "<p>Confirmer la suppression de '" + item.name + "'.</p>",
            //yes: () => this.actor.deleteOwnedItem(item._id), transofmer car les OwnedItem n'existe plus => transformer
            // simplement par l'objet que l'on supprime (objet à id unique)
            yes: () =>{
                //supprimer l'item dans la map et son champs backup
                item.delete();
                //this.actor.data.data.mapdesitems=utils.backupMap(this.actor.data.data, this.actor.items);
                // mapdesitems doit être refait
            },
            no: () => { },
            defaultYes: false
        });
    }

    /**
     * click sur un dé de selection 
     *
     * @param {*} event : l"venement déclanchat : voit avoir deux type de réf
     * @memberof AbstractDActorSheet
     */
    _onSelectDiceSelection(event){
        console.log("Choix de selection ! _onSelectDiceSelection ------------------");
        console.log(event);
        const baseData = super.getData();
        const persodata = baseData.actor.data.data;
        //let diceRef = event.currentTarget.dataset.ref;
        let indice = event.currentTarget.dataset.key
        if(persodata.selection.lstindice[indice]>0) { // le dé a été informé
            console.log("vous avez choisi :" + utils.resumerVenantDe(persodata.selection.lstdes[indice], persodata.selection.lstprov[indice], persodata.selection.lstindice[indice]));
        }
   
     }

    /**
     * activation d'un dé d'un item
     *
     * @param {*} event
     * @memberof AbstractDActorSheet
     */
    _onSelectDiceItem(event){
        switch (data.actor.data.type) {
            case "personnage":
                break;
            case "pnj": // a envisager : gestion de item => armes magiques
                break;
            case "plateaumonstre": // quand j'aurais fini le reste
                break;
            case "defi":
            case "obstacle": // même comportement mais avec dommage ou pas
            default:
                break;
        }
        console.log("Choix d'un item ! _onSelectDiceItem ------------------");
        console.log(event);
        
        const baseDataN = this.actor.data;
        const persodata = baseDataN.data;
        const item = this.getItemFromEvent(event);
        let itemRef = event.currentTarget.dataset.ref;
        let indice = event.currentTarget.dataset.key;
        console.log("vous avez choisi : "+itemRef+":"+indice);
        let itmb = baseDataN.items.get(itemRef).data;
        if(itmb !== undefined) {
            if(itmb.data.lstdes[indice] >0 ) { // sauvegardable
                let seli = utils.selIndice(persodata, itmb.type, indice); // cherche une place
                persodata.selection.lstprov[seli] = itemRef;
                persodata.selection.lstindice[seli] = indice;
                persodata.selection.lstdes[seli]= itmb.data.lstdes[indice];
                item.data.data.lstdes[indice] = -1;
                item.data.data.lstdesjson = JSON.stringify(item.data.data.lstdes);
                // recopie vers actor -> items/map
                itmb.data.lstdesjson = item.data.data.lstdesjson;
                itmb.data.lstdes = item.data.data.lstdes;
                // la source de itmb // non identique et toujours pas svg
                itmb._source.data.lstdes = item.data.data.lstdes;
                itmb._source.data.lstdesjson = item.data.data.lstdesjson;
                // set ajouter
                persodata.selection.lstdesjson = JSON.stringify(persodata.selection.lstdes);
                persodata.selection.lstprovjson = JSON.stringify(persodata.selection.lstprov);
                persodata.selection.lstindicejson = JSON.stringify(persodata.selection.lstindice);
                //item.data.data.lstdes = baseData.items[noIndex].data.lstdes
                //item.data.data.lstdesjson = baseData.items[noIndex].data.lstdesjson;
                let jb = utils.backupMap(this.actor.data.data, this.actor.items);
                this.actor.data.data.mapdesitems=jb.lstdes; 
                this.actor.data.data.uiddesitems=jb.uiddes;
                this.render(true);
            }
            
        }
     }

    _onSelectDiceAttr(event){
        // faudra gere le mode dommage (if(isDMG))!!)
        switch (data.actor.data.type) {
            case "personnage":
                break;
            case "pnj": // a envisager : gestion de item => armes magiques
                break;
            case "plateaumonstre": // quand j'aurais fini le reste
                break;
            case "defi":
            case "obstacle": // même comportement mais avec dommage ou pas
            default:
                break;
        }
        const baseData = super.getData();
        const persodata = baseData.actor.data.data;
        let atr = event.currentTarget.dataset.ref;
        let indice = event.currentTarget.dataset.key
        if(this.actor.data.data.dmg) {
            if(persodata[atr].lstdes[indice]> 0) {
                persodata[atr].lstdes[indice]--;
                persodata[atr].lstdesjson = JSON.stringify(persodata[atr].lstdes);
            }
        } else {
            console.log("Oucht on play ! _onSelectDiceAttr ------------------");
            console.log(event);
            if(persodata[atr].lstdes[indice] > 0) { // si le dés n'est pas vide, le remettre là d'où il vient
                let seli = utils.selIndice(persodata, atr, indice);
                if(persodata.selection.lstdes[seli] > 0) {
                    // remettre la valeur d'où elle vient
                    if(persodata.selection.lstprov[seli].length < 7) { // attribut car moins de 7 caractères
                        let oriattr = persodata.selection.lstprov[seli].toLowerCase();
                        let oriind = persodata.selection.lstindice[seli];
                        persodata[oriattr].lstdes[oriind]= persodata.selection.lstdes[seli]; // remise du codex
                        persodata[oriattr].lstdesjson = JSON.stringify(persodata[oriattr].lstdes);
                    } else { // items
                        let oriitem = baseData.actor.data.items.get(persodata.selection.lstprov[seli]);
                        let oriind = persodata.selection.lstindice[seli];
                        oriitem.data.data.lstdes[oriind]= persodata.selection.lstdes[seli];
                        oriitem.data.data.lstdesjson= JSON.stringify(oriitem.data.data.lstdes);
                        baseData.actor.data.items.set(persodata.selection.lstprov[seli], oriitem);
                    }
                }
                persodata.selection.lstprov[seli] = atr.toUpperCase()
                persodata.selection.lstindice[seli] = indice;//persodata[atr].lstdes.lstd[indice].source;
                persodata.selection.lstdes[seli] = persodata[atr].lstdes[indice];
                persodata.selection.lstdesjson = JSON.stringify(persodata.selection.lstdes);
                persodata.selection.lstprovjson = JSON.stringify(persodata.selection.lstprov);
                persodata.selection.lstindicejson = JSON.stringify(persodata.selection.lstindice);
                utils.simpleChatMessage("A Choisi :"+ atr + ", " + indice); 
                persodata[atr].lstdes[indice] =-1;
                persodata[atr].lstdesjson = JSON.stringify(persodata[atr].lstdes);
                //this.actor.data.data.mapdesitems=utils.backupMap(this.actor.data.data, this.actor.items);
            }
        }
        this.render(true);
    }

    _onModeDommage(event) {
        this.actor.data.data.dmg = ! this.actor.data.data.dmg;
        this.render(true);
    }

    _onRerollEle(event){
        // ne fait rien encore
        console.log("on relance les vides ! _onRerollEle------------------");
        console.log(event);
        let refChamp = event.currentTarget.dataset.key; // premet de déterminer d'où vient le clic
        if(refChamp.length > 7){            
            const item = this.getItemFromEvent(event);
            const itemdata = item.data.data;
            if(itemdata.lstdes === undefined) itemdata.lstdes = JSON.parse(itemdata.lstdesjson);
            itemdata.lstdes = utils.relancerLesDes(itemdata.lstdes,itemdata.nbdes, false);
            //baseData.actor.data.items.set(item._id, item);
            let jb = utils.backupMap(this.actor.data.data, this.actor.items);
            this.actor.data.data.mapdesitems=jb.lstdes; 
            this.actor.data.data.uiddesitems=jb.uiddes;
        } else {
            const persodata = this.actor.data.data;
            if(persodata[refChamp].lstdes === undefined) persodata[refChamp].lstdes = JSON.parse(persodata[refChamp].lstdesjson);
            persodata[refChamp].lstdes = utils.relancerLesDes(persodata[refChamp].lstdes,persodata[refChamp].nbdes, false);
        }
        this.render(true);
     }

     _RerollAllEle(event){
         // ne fait rien encore 
        console.log("relance de tous les dés ! _RerollAllEle ------------------");
        console.log(event);
        switch (this.actor.data.type) {
            case "personnage":
                let refChamp = event.currentTarget.dataset.key; // premet de déterminer d'où vient le clic
                if(refChamp.length > 7){ // items
                    const item = this.getItemFromEvent(event);
                    const itemdata = item.data.data;
                    if(itemdata.lstdes === undefined) itemdata.lstdes = JSON.parse(itemdata.lstdesjson);
                    itemdata.lstdes = utils.relancerLesDes(itemdata.lstdes,itemdata.nbdes, true);
                    itemdata.lstdesjson = JSON.stringify(itemdata.lstdes);
                    let jb = utils.backupMap(this.actor.data.data, this.actor.items);
                    this.actor.data.data.mapdesitems=jb.lstdes; 
                    this.actor.data.data.uiddesitems=jb.uiddes;
                     let i = 0; // pour le stop
                } else { // attributs
                    const baseData = super.getData();
                    const persodata = baseData.actor.data.data;
                    if(persodata[refChamp].lstdes === undefined) persodata[refChamp].lstdes = JSON.parse(persodata[refChamp].lstdesjson);
                    persodata[refChamp].lstdes = utils.relancerLesDes(persodata[refChamp].lstdes,persodata[refChamp].nbdes, true);
                    persodata[refChamp].lstdesjson = JSON.stringify(persodata[refChamp].lstdes);
               }
                
                break;
            case "pnj": // a envisager : gestion de item => armes magiques

                this.actor.data.data.lstdes = utils.relancerLesDes(this.actor.data.data.lstdes,this.actor.data.data.desTotal, true); // initialisation de la liste
                this.actor.data.data.lstdesjson = JSON.stringify(this.actor.data.data.lstdes);
                break;
            case "plateaumonstre": // quand j'aurais fini le reste
                break;
            case "defi":
            case "obstacle": // même comportement mais avec dommage ou pas
            default:
                break;
        }
        this.render(true);
     }

    _FullRerollAllEle(event){
        let d = Dialog.confirm({
                title: "relancer Tous les dés du Personnage",
                content: "<h2>Nouvelle Aventure  ou un repos bien mérité ?</h2><p>Validez après accord du MJ !</p>",
                //yes: () => this.actor.deleteOwnedItem(item._id), transofmer car les OwnedItem n'existe plus => transformer
                // simplement par l'objet que l'on supprime (objet à id unique)
                yes: () =>{
                }, 
                no: () => {
                    return;
                },
                defaultYes: false
            });
        // cas des attributs
        const persodata = this.actor.data.data;
        const actor = actor.data;

        switch (data.actor.data.type) {
            case "personnage":
                console.log("AbstractD | reroll All ");
                let attrib = ["for","dex","int","sag","bonus"];
                attrib.forEach((atr, index) => {
                    persodata[atr].lstdes = utils.relancerLesDes(persodata[atr].lstdes, persodata[atr].nbdes, true);
                    persodata[atr].lstdesjson = JSON.stringify(persodata[atr].lstdes);
                    console.log("Creation dés de "+atr);
                });
                // cas du bonus
                if(persodata.bonus.lstdes[0] != 6 ) { 
                    persodata.bonus.lstdes[0] = 6;
                    persodata.bonus.lstdesjson = JSON.stringify(data.bonus.lstdes);
                }
                // cas de la selection
                for(let i = 0; i < persodata.selection.lstdes.length; i++) {
                    persodata.selection.lstdes[i] = 0;
                    persodata.selection.lstprov[i] = "SEL";
                    persodata.selection.lstindice[i] = -1;
                }
                persodata.selection.lstdesjson = JSON.stringify(persodata.selection.lstdes);
                persodata.selection.lstprovjson = JSON.stringify(persodata.selection.lstprov);
                persodata.selection.lstindicejson = JSON.stringify(persodata.selection.lstindice);
                // cas des items : AFAIRE                
                break;
            case "pnj": // a envisager : gestion de item => armes magiques
                if(persodata.lstdes === undefined) persodata.lstdes = [];
                persodata.lstdes = utils.relancerLesDes(persodata.lstdes, persodata.nbdes, true);
                persodata.lstdesjson = JSON.stringify(persodata.lstdes);                
                break;
            case "plateaumonstre": // quand j'aurais fini le reste
                break;
            case "defi":
            case "obstacle": // même comportement mais avec dommage ou pas
            default:
                break;
        }
        
        

    }
// -- Selection --------------
    /**
     * Annulation de tous les choix fait dans selection 
     *
     * @param {*} event
     * @memberof AbstractDActorSheet
     */
    _onSelectAnnuler(event){
        console.log("Selection Annulation ! _onSelectAnnuler ------------------");
        console.log(event);
        const baseData = super.getData();
        const persodata = baseData.actor.data.data;
        //let item = event.currentTarget.dataset.ref;
        //let indice = event.currentTarget.dataset.key;

        for(let i = 0; i < persodata.selection.lstdes.length; i++) {
            if(persodata.selection.lstindice[i] > -1){ // modifier à rendre
                if(persodata.selection.lstprov[i].length < 7) { // atribut
                    let atr = persodata.selection.lstprov[i].toLowerCase();
                    let ind = persodata.selection.lstindice[i];
                    persodata[atr].lstdes[ind] = persodata.selection.lstdes[i];
                    persodata[atr].lstdesjson = JSON.stringify(persodata[atr].lstdes);
                } else {
                    let it = baseData.actor.data.items.get(persodata.selection.lstprov[i]);
                    it.data.data.lstdes[persodata.selection.lstindice[i]] = persodata.selection.lstdes[i];
                    it.data.data.lstdesjson = JSON.stringify(it.data.data.lstdes);
                    baseData.actor.data.items.set(persodata.selection.lstprov[i], it); // un get un set
                }
                persodata.selection.lstdes[i] = 0;
                persodata.selection.lstprov[i] = "SEL";
                persodata.selection.lstindice[i] = -1;
            }
        }
        persodata.selection.lstdesjson = JSON.stringify(persodata.selection.lstdes);
        persodata.selection.lstprovjson = JSON.stringify(persodata.selection.lstprov);
        persodata.selection.lstindicejson = JSON.stringify(persodata.selection.lstindice);
        //console.log("vous avez choisi : "+item+":"+indice);
        let jb = utils.backupMap(this.actor.data.data, this.actor.items);
        this.actor.data.data.mapdesitems=jb.lstdes; 
        this.actor.data.data.uiddesitems=jb.uiddes;
     this.render(true);
    }

    _onSelectProposer(event){
        console.log("Confirmer le choix ! _onSelectProposer ------------------");
        console.log(event);
        const baseData = super.getData();
        const persodata = baseData.actor.data.data;
        let aAfficher = "vous avez choisi pour <h2>" + baseData.data.name + "</h1>";
        let somme = 0;
        for(let i = 0; i < persodata.selection.lstdes.length; i++) {
            if(persodata.selection.lstindice[i]>-1) {
                aAfficher = aAfficher + "<b>";
                if(persodata.selection.lstprov[i].length>7) {
                    let item = baseData.actor.data.items.get(persodata.selection.lstprov[i]);
                    aAfficher = aAfficher + item.data.name;
                } else { // atribut
                    aAfficher = aAfficher + persodata.selection.lstprov[i];
                }
                aAfficher = aAfficher + "</b>("+ persodata.selection.lstindice[i]+") :"+persodata.selection.lstdes[i]+"<br>";
                somme = somme + persodata.selection.lstdes[i]
            }
        }
        aAfficher = aAfficher + "<h2>dont la valeur donne :" + somme + "</h2>.<br>"
        aAfficher = aAfficher + "Oh ! MJ ! acceptez vous ?";
        utils.simpleChatMessage(aAfficher);
    }

    _onSelectValider(event){
        console.log("Choix Valider ! _onSelectValider------------------");
        console.log(event);
        //const baseData = super.getData(); // ne pas prendre c'est de l'affichage
        const baseData = this;
        const persodata = this.actor.data.data;
        let d = Dialog.confirm({
            title: "Confirmation de l'élément",
            content: "<p>Validez votre selection après accord de votre MJ préféré?</p>",
            //yes: () => this.actor.deleteOwnedItem(item._id), transofmer car les OwnedItem n'existe plus => transformer
            // simplement par l'objet que l'on supprime (objet à id unique)
            yes: () =>{
                //const flags = baseData.actor.getFlag("world","videItems");
                let aAfficher = "Le choix définitif est :<br>";
                for(let i = 0; i < persodata.selection.lstdes.length; i++) {
                    
                    if(persodata.selection.lstindice[i] > -1){ // modifier à rendre

                        if(persodata.selection.lstprov[i].length < 7) { // atribut
                            let atr = persodata.selection.lstprov[i].toLowerCase();
                            let ind = persodata.selection.lstindice[i];
                            persodata[atr].lstdes[ind] = 0;
                            persodata[atr].lstdesjson = JSON.stringify(persodata[atr].lstdes);
                            aAfficher = aAfficher+ persodata.selection.lstprov[i] + " : " + persodata.selection.lstdes[i] + ' => <img src="'+ persodata.repdessin+persodata.selection.lstdes[i] +'.png" height="25" width="25"></image>' +".<br>";
                        } else {
                            let it = baseData.actor.data.items.get(persodata.selection.lstprov[i]);
                            //let obj = { "uid":persodata.selection.lstprov[i], "indice": persodata.selection.lstindice[i], "valeur":persodata.selection.lstdes[i] };
                            //flags.push(obj); // a tester sans 
                            //baseData.actor.setFlag("world","videItems", { "uid":persodata.selection.lstprov[i], "indice": persodata.selection.lstindice[i], "valeur":persodata.selection.lstdes[i] } )
                            it.data.data.lstdes[persodata.selection.lstindice[i]] = 0;
                            it.data.data.lstdesjson = JSON.stringify(it.data.data.lstdes);
                            // rempalcer peut être par :  
                            //let indit = baseData.actor.data.items.findIndex((ele) => ele._id == persodata.selection.lstprov[i]);
                            it.data.data.lstdes[persodata.selection.lstindice[i]]=0;
                            it.data.data.lstdesjson =JSON.stringify(it.data.data.lstdes);
                            aAfficher = aAfficher+ it.data.name + " : " + persodata.selection.lstdes[i] + ' => <img src="'+ persodata.repdessin+persodata.selection.lstdes[i] +'.png" height="25" width="25"></image>' +".<br>";
                            //baseData.actor.data.items.set(persodata.selection.lstprov[i], it);
                        }
                        persodata.selection.lstdes[i] = 0;
                        persodata.selection.lstprov[i] = "SEL";
                        persodata.selection.lstindice[i] = -1;
                    }
                }
                persodata.selection.lstdesjson = JSON.stringify(persodata.selection.lstdes);
                persodata.selection.lstprovjson = JSON.stringify(persodata.selection.lstprov);
                persodata.selection.lstindicejson = JSON.stringify(persodata.selection.lstindice);
                //let obj = this.actor.getFlag("world","videItems");
                //this.actor.setFlag("world","videItems", flags); // réassigner car pas modifié par methodes
                //console.log("vous avez choisi : "+item+":"+indice);
                persodata.traits = baseData.actor.data.items.filter(item => item.type === "trait");
                persodata.objets = baseData.actor.data.items.filter(item => item.type === "objet");
                let jb = utils.backupMap(this.actor.data.data, this.actor.items);
                this.actor.data.data.mapdesitems=jb.lstdes; 
                this.actor.data.data.uiddesitems=jb.uiddes;
                aAfficher = aAfficher + "vient d'être validé.";
                utils.simpleChatMessage(aAfficher);
                this.render(true);
            },
            no: () => { },
            defaultYes: false
        });
    }

    _onSelectChangeMode(event){
        console.log("Choix Valider ! _onSelectValider------------------");
        console.log(event);
        const baseData = super.getData();
        const persodata = baseData.actor.data.data;
        let mode = event.currentTarget.dataset.ref;
        // c'est plus souix : si cmb => on passe en objet, et vice versa
        if(mode == "obj") {
            persodata.selection.mode = "cmb";
            // relimiter à 3
        } else {
            persodata.selection.mode = "obj";
            // faire maj (fixe of etc...)
        }
 //       this.actor.data.data.mapdesitems=utils.backupMap(this.actor.data.data, this.actor.items);
        this.render(true)
        console.log("vous avez choisi : "+mode+"=>"+persodata.selection.mode);
    }

    _onPnjShowAll(event){
        const persodata = this.actor.data.data;
        let aAfficher = "Votre adversaire, <b>"+this.actor.data.name +"</b>, est de cette puissance :<br>";
        let somme = 0;
        for(let i = 0; i < persodata.lstdes.length; i++) {
            aAfficher = aAfficher  + '<img src="'+ persodata.repdessin+persodata.lstdes[i] +'.png" height="25" width="25"></image>' +" ";
            somme += persodata.lstdes[i];
        }
        for(let i = 0; i < persodata.objets.length; i++){   
            for(let j = 0; j < persodata.objets[i].lstdes.length; i++) {
                aAfficher = aAfficher  + '<img src="'+ persodata.repdessin+persodata.objets[i].lstdes[j] +'.png" height="25" width="25"></image>' +" ";
                somme += persodata.objets[i].lstdes[j];
            }
        }
        aAfficher = aAfficher + " = "+somme+"<br>A vos propositions !";
        utils.simpleChatMessage(aAfficher)
    }

    // fout le bordel
    // _updateObject(event, formData){
    // _onSubmit(event, updateData, preventClose, preventRender) {
  
}