//import {source} from "./source.js"
import {unde} from "./unde.js";
import {source} from "./source.js";

export class lstdes {
// gestion d'une liste de dés : vaudra prevoir le changement ([]=> {})
    /**
     * crée une liste de dés en suivant le nombre de dé, 
     *  de couleur blanche par défaut, sans limite de dé, 
     *  sans limites (-1), mais tous les dés sont à 0 !
     * 
     * @param {*} nbdes : nombre de dés dans la liste (référence)
     * @param {*} couleur : couleurs des dés 
     * @param {*} limite  : nombre de dés dans la listes maximum (-1 = sans limites)
     * @param {*} fixe : si fixe, la limite ne peux être dépassé
     * @param {*} source : source générale du lancés ou de la réserve (généralement l'attribut à l'indice == 0)
     */
    constructor(nbdes = 1, couleur="blanc", limite = -1, fixe=false, source ={} ){
        this.limite = limite; //sans limite si 
        this.fixe = fixe;
        this.lstd = [];
        this.couleur = couleur;
        if(source == "" ) {
            source = new source("A","E",0);
        }
        this.source = source;
        this.repdessin = "systems/abstractd/ui/d6-" + couleur + "-"; // ou se trouve les dés à afficher (couleur comprise)
        for(let i =0; i < nbdes; i++){
            let de = new unde(source, i, false, 0, couleur);
            this.lstd.push(de);
        }
    }

    ajouterUnDe(unde){
        this.lstd.push(unde);
    }

    ajouterDe(valeur) {
        let lede = new unde({}, this.lstd.length, valeur===8, valeur, this.couleur);
        this.ajouterUnDe(lede);
    }

    rajouter(source, position, selection=false, valeur=0, couleur="blanc"){
        let de = new unde(source, position, selection, valeur, couleur);
        if( this.fixe && position < this.limite ) {
            this.lstd[position]=de;
        } else if (this.fixe === false){
            this.lstd[position]=de;
        }
    }

    lancer1de(position=0) {
        if (position < this.lstd.length ) {
            this.lstd[position].lancerDe()
        }
    }
    
    setLimit(plimite){
        let lim = parseInt(this.limite); // par ce que l'on doit créer autant de unde qu'il y a d'extension du nombre
        this.limite = plimite;
        plimite = parseInt(plimite); // il se peut qu'il soit chaine de caractère
        if (lim > plimite) {
            this.lstd.length = plimite; // troncage
        } else if(lim < plimite) { // agrandissement
            for(let i =lim ; i < plimite; i++){
                let de = new unde(source, i, false, 0, this.couleur);
                this.lstd.push(de);
            }
            this.lancerLesDes(false); // que ceux qui sont à zéro
        }
    }

    getLimit(){
        return this.limite;
    }
/**
 *  lancerLesDes : relance les dés de la liste de dé s'il sont vide (déjà utilisé) ou tous les dés si tous est à vrai.
 *                  cette fonction est plus éfficace car elle lance un ensemble de dés en même temps.
 * @param {*} tous : la liste des dés doivent être relancé
 */
    lancerLesDes(tous=false) { // a prefer pour sont efficacité
        if(this.lstd.length>0) {
            let r = new Roll(this.lstd.length +"d6");
            // Execute the roll
            r.evaluate({async :false });
            // The resulting equation after it was rolled : r.result, r.total => même valeur à priori
            // il faudra créer correctement les objets un dés (index, result)
            let i = 0; // valeur a prendre
            this.lstd.forEach((de, index) => {
                if(tous || de.isVide()) {
                    de.modifierDe(r.terms[0].results[i].result);
                    i++;
                } 
                // le reste des valeurs est oubliée, hihihi !
            });
    //           console.log(r.lstdes);
        }
    }

/**
 * mettreAVal : fixe la valeur à pVal d'un des dés ou tous les dés si indice < 0
 *
 * @param {number} [pVal=7]
 * @param {number} [indice=0]
 */
    mettreAVal(pVal=7, indice = 0){    
        if(indice < 0) {
            this.lstd.forEach((de,  index) => { 
                de.modifierDe(pVal);
            });
        } else {
            if(indice < this.lstd.length) {
                this.lstd[indice].modifierDe(pVal);
            }
        }
    }

    fromData(pdata){
        // retourne un objet list conforme (liste, undé, sources)
        let so = JSON.parse(pdata);
        // on a un data objet, mais pas un objet de type lstdes
        //copie des structures allocations
        console.log("AbstractD | conversion vers un objet : ")
        console.log(so);
        //...
    }
}