export class source {
// à cause d'une recursiton infini (lst De se contient)
/* codification simple : 1ier élement = le type, deuxième, le repère, troisième l'indice
 * A = propibuts : (2)F = Force, D = Dextérité, I = Intelligence, S = sagesse (3) le dé
 * T = traits :  (2)le nom, (3)l'indice du dé
 * O = objets : idem
 */
    constructor(type, code, indice) {
        this.type = type;
        this.code = code;
        this.indice = indice;
    }

    toString(){
        return '{ "type":"'+ this.type+ '","code":"'+ this.code +'", "indice":'+this.indice+'"}';
    }

    /**
     * 
     * @param {*} pdata : un objet qui possède les propibuts directement (for etc..)
     * @returns : l'objet de la réserve demandée (pas réf l'indice)
     */
    getObjetSource(pdata){
        let prop = this.getProp();
        switch(this.type){
            case "A":
                console.log("Source : demande de l'attribut :"+ prop + "("+ this.indice+")");
                return pdata[prop].lstdes;
                break;
            case "T":
                console.log("Source : demande du trait"+ this.code + "("+ this.indice+")");
                return pdata.traits[code].lstdes;
                break;
            case "O":
                    console.log("Source : demande de l'objet"+ this.code + "("+ this.indice+")");
                    return pdata.objets[code].lstdes;
                break;
            default:
                console.log("Source : Erreur dans la demande du type :"+ this.type+" "+this.code)
        }
         return null;
     }

    getType(){
        return this.type;
    }

    getCode() {
        return this.code;
    }

    getIndice(){
        return this.indice;
    }

    /** donne le nom de la propriété correspond à la source (type x code)
     * 
     * @returns le nom de la collection contenant la propriété et au besoin de code (poure les attributs)
     */
    getProp() {
        switch(this.type){
            case "A":
                switch(this.code) {
                    case "F":
                    case "FOR":
                    case "for":
                    case "f":
                        prop = "for";
                        break;
                    case "D":
                    case "DEX":
                    case "dex":
                    case "d":
                        prop = "dex";
                        break;
                    case "I":
                    case "INT":
                    case "i":
                    case "int":
                        prop = "int";
                        break;
                    case "S":
                    case "SAG":
                    case "s":
                    case "sag":
                        prop = "sag";
                        break;
                    case "B":
                    case "BONUS":
                    case "b":
                    case "bonus":
                        prop = "bonus";
                        break;
                    case "E":
                    case "SEL":
                    case "SELECTION":
                    case "e":
                    case "sel":
                    case "selection":
                        prop = "selection";
                        break;
                    default : 
                    console.log("Source : Erreur dans la demande du code :"+ this.type+" "+this.code);
                }   
                break;
            case "T":
                prop = "traits";
                console.log("Source : demande du trait"+ this.code + "("+ this.indice+")");
                break;
            case "O":
                prop = "objets";
                console.log("Source : demande de l'objet"+ this.code + "("+ this.indice+")");
                break;
            default:
                console.log("Source : Erreur dans la demande du type :"+ this.type+" "+this.code);
        }
        return prop;
    }

    getCollection(pdata) {
        let prop = getProp();
        return pdata[prop];
    }
}