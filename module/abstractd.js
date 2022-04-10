import { AbstractDActor } from "./documents/actor.js";
import { AbstractDItem } from "./documents/item.js";
import AbstractDItemSheet from "./sheets/AbstractDItemSheet.js";
import AbstractDActorSheet from "./sheets/AbstractDActorSheet.js";
//import * from "./gestiondes.js";

Hooks.once("init", async function () {
    console.log("AbstractD | Initialisation du système Abstract Dungeon");
    game.abstractd = {
        AbstractDActor,
        AbstractDItem
    };

    CONFIG.Actor.documentClass = AbstractDActor;
    console.log("AbstractD | AbstractDActor inscrit");
    CONFIG.Item.documentClass = AbstractDItem;
    console.log("AbstractD | AbstractDItem inscrit");

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("abstractd", AbstractDItemSheet, { makeDefault: true });
    console.log("AbstractD | ItemSheet inscit");
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("abstractd", AbstractDActorSheet, { makeDefault: true });
    console.log("AbstractD | ActorSheet inscit");

    Handlebars.registerHelper('ismultiple', function (value, div) {
        return (value+1) % div == 0;
    });
    console.log("AbstractD | fonction ismultiple val div est inscrite");
})