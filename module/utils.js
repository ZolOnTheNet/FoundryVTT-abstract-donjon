//import {Collection} from "/common/utils/collection.mjs";


// fonction utilitaire
// par ce que je ne sais pas mieux faire pour l'instant

export function getArrayJson(strJson, opt=","){
    let s = sansCrochet(strJson);
    let v = s.split(opt);
    return v;
}

export function sansCrochet(strJson) {
    let ret = strJson
    if(strJson[0]=="[") {
        ret = strJson.substring(1);// fin de la chaine pas
    }
    if(ret[ret.length-1]=="]"){
        ret = ret.substring(0, ret.length-3);
    }
    return ret;
}

/** retourne un objet, en ajoutant les [] de début et de fin
 * 
 * @param {*} strJson : une chaine de caractère persque comme un JSON, mais sans les crochet
 * @returns Array() : l'objet liste
 */
 export function getArrayFromField(strJson){
    let j = sansCrochet(strJson);
    return JSON.parse("["+strJson+"]");
  }

export function simpleChatMessage(monTexte="coucou"){
    let chatData = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        content : monTexte
    };
    ChatMessage.create(chatData);

}

export function getNomFromCode(code) {
    let ret = "";
    switch(code.toUpperCase()){ 
        case "F":
            ret = "for";
            break;
        case "D":
            ret = "des";
            break;
        case "S":
            ret = "sag";
            break;
        case "I":
            ret = "int";
            break;
        case "B":
            ret = "bonus";
            break;
        case "L":
            ret = "selection";
            break;
        case "FOR":
        case "DEX":
        case "INT":
        case "SAG":
        case "BONUS":
            ret = code.toLowerCase();
            break;
         default: // items
            ret = "item";
            break;
    }
    if(ret == "item") {
        ret = code; // sans tout en majuscule
    }
}

export function EtendLesDes(lstd, nbde) { // a prefer pour sont efficacité
    /**
     * ajoute les dés supplémentaire à la liste au nombre de nbe
     */
    let r = new Roll(nbde +"d6"); // au pire => nbde a ajouter
    if(lstd === undefined) lstd = []; // cas d'initialisation
    // Execute the roll
    r.evaluate({async :false });
    // The resulting equation after it was rolled : r.result, r.total => même valeur à priori
    // il faudra créer correctement les objets un dés (index, result)
    for(let i = lstd.length; i < nbde; i++) {
        lstd[i] =r.terms[0].results[i].result;
    }
    return lstd; 
}

export function relancerLesDes(lstd, nbde, tous = false) { // a prefer pour sont efficacité
    /**
     * ajoute les dés supplémentaire à la liste au nombre de nbe
     */
    let r = new Roll(nbde +"d6"); // au pire => nbde a ajouter
    if(lstd === undefined) lstd = []; // cas d'initialisation
    // Execute the roll
    r.evaluate({async :false });
    // The resulting equation after it was rolled : r.result, r.total => même valeur à priori
    // il faudra créer correctement les objets un dés (index, result)
    for(let i = 0; i < nbde; i++) {
        if(lstd[i] === undefined) lstd[i] = 0; //
        if(tous || lstd[i] == 0) {
            lstd[i] =r.terms[0].results[i].result;
        }
    }
    return lstd; 
}

export function selIndice(persodata, atr, indice) {
    // 2 modes : cmb et non cmb : cmb => limité à 3/4
    let ret = -1; // mauvaise réponse
    if(persodata.selection.mode == "cmb") { //combat 
        switch(atr.toUpperCase()){ 
            case "FOR":
            case "F":
            case "DEX":
            case "D":
            case "INT":
            case "I":
            case "SAG":
            case "S":
                ret = 0; // sel obligatoirement 0
                break;
            case "B": // premier 
            case "BONUS":
            default: // items
                let i = 0
                for(i = 0; i < persodata.selection.lstindice.length; i++){
                    if(persodata.selection.lstindice[i] <0 ) { // premier espace trouvé
                        break;
                    }
                }
                if(i > 2) i = 2; // limite  à 3 pour le cmb
                 ret = i; // le dernier de la liste voir le maxi+1 
        }
    } else { //extensible = defi et obstacle
        let i = 0
        for(i = 0; i < persodata.selection.lstindice.length; i++){
            if(persodata.selection.lstindice[i] <0 ) { // premier espace trouvé
                break;
            }
        }
         ret = i; // le dernier de la liste voir le maxi+1 
    }
    return ret;
}

/**
 * retourne l'indice de l'item ayant le id dans le tableau
 *
 * @export
 * @param {*} items : sur la structure actor.data.items
 * @param {*} idItem
 */
export function indiceItem(items, idItem) {
    let ret = 0;
    //items.indexof()
    return ret;
}

export function resumerVenantDe(valeur, prov, indice) {
    let ret = "-";
    try{
        ret = prov + "("+ indice+"): "+valeur;
    }catch(e) {
        ret = "--";
    }
   return ret;
}

export function backupMap(persodata,mapOrdonnee) {
    let a = new Array();
    let b = new Array()
//    let m = new Map();
    const ite = mapOrdonnee.keys();
    for(let j = 0; j < mapOrdonnee.size; j++ ) {
         let id = ite.next().value;
        //let it = mapOrdonnee.get(id);
        b.push(id);
        let ind = persodata.traits.findIndex((ele) => ele.data._id == id);
        if(ind > -1) {
            a.push(persodata.traits[ind].data.data.lstdes);
        }else {
            let ind = persodata.objets.findIndex((ele) => ele.data._id == id);
            if(ind > -1) {
                a.push(persodata.objets[ind].data.data.lstdes);
            }
        }
    }
    // for(let i = 0; i < persodata.traits.length; i++ ){
    //     m.set(persodata.traits[i].data._id, persodata.traits[i].data.data.lstdes);
    // }
    // for(let i = 0; i < persodata.objets.length; i++ ){
    //     m.set(persodata.objets[i].data._id, persodata.objets[i].data.data.lstdes);
    // }
    // let cm = new Collection(m);
    // return JSON.stringify(cm);
    return { lstdes : JSON.stringify(a), uiddes: JSON.stringify(b) } ;
}


