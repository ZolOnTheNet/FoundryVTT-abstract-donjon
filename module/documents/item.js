import  * as utils from "../utils.js";

export class AbstractDItem extends Item {

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
        const itemData = this.data;
        const data = itemData.data;
      //  const flags = itemData.flags.abstractd || {};
      switch (itemData.type) {
        case "trait":
        case "objet":
            let modifie = false;
            if(data.lstdesjson == "") {
                data.lstdes = utils.EtendLesDes(data.lstdes, data.nbdes);
                modifie = true;
            } else {
                data.lstdes = JSON.parse(data.lstdesjson);
            }
            if(data.lstdes.length < data.nbdes){
                data.lstdes = utils.EtendLesDes(data.lstdes, data.nbdes)
                modifie = true; // plus identique au JSON
            } else if( data.lstdes.length> data.nbdes) {
                data.lstdes.length = data.nbdes; // on cut !
                modifie = true;
            }
            if(modifie) {
                data.lstdesjson = JSON.stringify(data.lstdes);
            }
            break;
        case "deattaque": // quand j'aurais fini le reste
            break;
        default:
            break;
    }

        // Make separate methods for each Actor type (character, npc, etc.) to keep
        // things organized.
      }

      _onUpdate(changed, options, userId){
        super._onUpdate(changed, options, userId);
        console.log("------- > item changé :");
        console.log(changed);
    }
}