import {relancerLesDes} from '../utils.js' ;

export default class AbstractDItemSheet extends ItemSheet{
    get template(){
        console.log(`AbstractD | Récupération du fichier html ${this.item.data.type}-sheet.`);

        return `systems/abstractd/templates/sheets/${this.item.data.type}-sheet.html`;
    }

    getData(){
        const baseData = super.getData();
        let sheetData = {
            owner: this.item.isOwner,
            editable: this.isEditable,
            item : baseData.item,
            data: baseData.item.data.data
        };
        console.log(sheetData);
        // pas à la bonne place, mais bon ...

        switch (baseData.item.data.type) {
            case "trait":
            case "objet":
                if(sheetData.item.data.img=="icons/svg/item-bag.svg" && sheetData.item.data.type=="trait") { sheetData.item.data.img ="icons/svg/angel.svg"; }
                if(sheetData.item.data.img=="icons/svg/angel.svg" && sheetData.item.data.type=="objet") { sheetData.item.data.img ="icons/svg/item-bag.svg"; }
                let obtenirde = false ;
                if (sheetData.data.lstdesjson === undefined) {
                    sheetData.data.lstdesjson="[1]";// la liste de dé n'existe pas
                    obtenirde = true; 
                } else if( sheetData.data.lstdes === undefined) {
                    if(sheetData.data.lstdesjson == "") sheetData.data.lstdesjson ="[1]";
                    obtenirde = true; 
                } else if(sheetData.data.lstdes.length == 0) {
                    if(sheetData.data.lstdesjson == "") sheetData.data.lstdesjson ="[1]";
                    obtenirde = true;
                }
                if(obtenirde) {
                    sheetData.data.lstdes = JSON.parse(sheetData.data.lstdesjson);   
                    console.log(sheetData.data.lstdes );
                    // faire une sauvegarde de JSON dans lstdesjson?
                }
                // The total resulting from the roll
                break;
            case "deattaque": // quand j'aurais fini le reste
                break;
            default:
                break;
        }

            
        sheetData.data.repdessin = "systems/abstractd/ui/d6-blanc-"
        return sheetData;
    }

    activateListeners(html){
        // attention ses tous les feuilles de présenations (pj, pnj, obs, defi)
        super.activateListeners(html);
       // generique de lancer dé 
       html.find('.Ele-reroll').click(this._onRerollEle.bind(this));
       html.find('.Ele-rerollall').click(this._RerollAllEle.bind(this));
    }

    _onRerollEle(event){
        // ne fait rien encore
        console.log("on relance les vides ! _onRerollEle------------------");
        console.log(event);
        const baseData = super.getData();
        const itemdata = baseData.item.data.data;
        let item = event.currentTarget.dataset.ref;
        let indice = event.currentTarget.dataset.key;
        console.log("vous avez choisi : "+item+":"+indice);
        if(itemdata.lstdes === undefined) itemdata.lstdes = JSON.parse(itemdata.lstdesjson);
        itemdata.lstdes = relancerLesDes(itemdata.lstdes,itemdata.nbdes, false);
        this.render(true);
     }

     _RerollAllEle(event){
         // ne fait rien encore 
        console.log("relance de tous les dés ! _RerollAllEle ------------------");
        console.log(event);
        const baseData = super.getData();
        const itemdata = baseData.item.data.data;
        let item = event.currentTarget.dataset.ref;
        let indice = event.currentTarget.dataset.key;
        console.log("vous avez choisi : "+item+":"+indice);
        if(itemdata.lstdes === undefined) itemdata.lstdes = JSON.parse(itemdata.lstdesjson);
        itemdata.lstdes = relancerLesDes(itemdata.lstdes,itemdata.nbdes, true);
        this.render(true);
     }

}