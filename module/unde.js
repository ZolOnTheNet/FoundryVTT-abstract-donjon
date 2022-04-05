export class unde {
    // gestion d'un dé 
    /*    "source" : {}
        "no":0,
        "selection":0,
        "valeur":4,
        "couleur":"blanc"
    */
        
        constructor(source={}, position=0, selection=false, valeur=0, couleur="blanc", venantde={}, positionde = -1){
            this.source = source;
            this.position = position;
            this.selection = selection;
            this.valeur = valeur; // valeur pouvant aller jusqu'a 8 pour 1d6
            if(couleur !== "blanc" && valeur !== "noir") {
                valeur = "blanc";
            }
            // this.token =  "systems/abstractd/ui/d6-" + couleur + "-" + valeur + ".png";
            this.couleur = couleur; // actuellement, blanc ou noir
            this.venantde = venantde; // a modifié pour selection a fin de pointer sur la source d'origne
            this.positionde = positionde;
        }
    
        lancerDe(){ // methode peu efficace sur plusieurs dés
            let r = new Roll("1d6");
            // Execute the roll
            r.evaluate({async :false });
            // The resulting equation after it was rolled : r.result, r.total => même valeur à priori
            // il faudra créer correctement les objets un dés (index, result)
            value = r.result;
        }
    
        modifierDe(pValeur=7){ // methode plusieurs
            this.valeur = pValeur;;
            //this.token =  "systems/abstractd/ui/d6-" + couleur + "-" + valeur + ".png";
            this.selection = pValeur === 8;
        }
    
        value() {
            return this.valeur;
        }
    
        isSelectionner(){
            return this.selection;
        }
    
        isBlanc() {
            return this.valeur == 7 || this.valeur == 0;
        }
    
        isVide() {
            return this.valeur== 0;
        }

        // fixer l'objet source au besoin (EstAttr, code, quelle position)
        setSource(pSource) {
            this.source = pSource;
        }

        getSource(){
            return this.source;
        }

        // uniquement utile pour selection  -----------------
        getVenantDe() {
            return this.venantde;
        }

        getIndice()  {
            return this.positionde;
        }

        setVenantDe(source) {
            this.venantde = source;
        }

        setIndice(pIndice=-1) {
            this.Indice = pIndice;
        }

    }