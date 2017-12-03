const DATA = "data.php";
var articleCourrant="";

$(document).on(	"click",
    "#paragraphes p",
    function (){
        // clic sur un futur P.

        var contenuP = $(this).html();
        var metaP =  $(this).data();
        // préparer le futur textarea
        var jT = $("<textarea>")
            .val(contenuP)
            .data(metaP);

        // insertion dans le DOM
        $(this).replaceWith(jT);
    });
$(document).on("keyup","body",function(leContexte){
    if(leContexte.which==27){

    }
})
$(document).on(	"keydown",
    "#paragraphes textarea",
    function(leContexe){
        // Validation d'une saisie
        if(leContexe.which == 13 ) {
            // On prépare le nouveau P.
            var contenuT = $(this).val();
            var metaT = $(this).data();
            var jP = $("<p>").html(contenuT).data(metaT);

            // On met à jour ses méta-données
            // car le contenu a changé
            jP.data("contenu",contenuT);

            //On envoie une requete au serveur
            $.getJSON(	DATA,
                {	"action" : "updateP",
                    "id": metaT.id,
                    "contenu" : contenuT},
                function (oRep){
                    if (oRep.feedback!="ok") {
                        alert("Rechargez votre navigateur...");
                    }
                });

            // On l'insère
            $(this).replaceWith(jP);
        }
    });







// TODO: afficher dans la console les méta-données
// lors du survol des P.
/*$(document).on(	"mouseover",
								"#paragraphes *",
								function(){
	// Survol d'un elt dans le div des p.
	// $(this) dénote l'élément manipulé
	// On affiche ses méta-données
	console.log($(this).data());
});*/

// TODO: ne pas perdre les méta-données des P. en cours d'édition
// TODO : envoyer une requete de mise à jour lors de la modification d'un P.
// TODO UX : permettre une annulation des éditions en cours
// lors de l'appui sur ESC, on annule toutes les éditions
// en replacant les contenus initiaux dans chaque P. en cours d'édition [besoin éventuel de l'itérateur .each()]

$(document).ready(function(){

    $.getJSON(DATA, {"action":"getArticles"}, function(oRep){
        if (oRep.feedback != "ok") {
            alert("Erreur, veuillez recharger votre navigateur");
        } else {
            for(i=0;i<oRep.articles.length;i++) {
                var jOption = $("<option>").val(oRep.articles[i].id).html(oRep.articles[i].nom);
                $("#articles").append(jOption);
            }
        }
    });
    //$("#articles").val('1');




    // Insérer un bouton + avant le div des paragraphes
    var jP = $("<input type='button'/>")
        .val("+")
        .click(function(){
            // Ordre du futur P. ?
            // ordre du premier des P. actuels - 1
            if(articleCourrant != "") {
                var jPremier = $("#paragraphes *:first-child");
                // $("#paragraphes *").first()
                // $("#paragraphes *:first-child");
                // ATTENTION AUX PERFORMANCES !
                var ordreNouveau = jPremier.data("ordre") - 1;
                // Attention au cas avec '+' : il faut vérifier
                // les types des éléments :
                // "1" +1  vaut "11"!!

                // Lors du clic sur un bouton,
                // On insère le P. dans le DOM
                var contenu = $(this).next().val();
                var jP = $("<div>").prepend($("<span>").addClass("poignee ui-icon ui-icon-arrowthick-2-n-s"))
                    .append($("<p>").addClass("ui-state-default").html(contenu).data({
                        "id": 0,
                        "ordre": ordreNouveau,
                        "contenu": contenu
                    }));

                $("#paragraphes").prepend(jP);
                $.getJSON("data.php",
                    {
                        "action": "addP",
                        "ordre": ordreNouveau,
                        "contenu": contenu,
                        "article":articleCourrant
                    },
                    function (oRep) {
                        jP.html(oRep.content);
                    }
                );
            }
        });

    // insertion bouton avant paragraphes
    $("#paragraphes").before(jP);
    // On pourrait cloner avec .clone()

    // insertion champ entrée texte apres bouton
    jP.after("<input type='text' />");

    $("#paragraphes").sortable();
    $("#paragraphes").disableSelection();
    $("#articles").selectmenu({
        select: function( event, data ) {
            $("#paragraphes").empty();
            articleCourrant = data.item.value;
            getP(articleCourrant);

        }
    });


});


function getP(idArticle) {
// Envoyer une requete au serveur pour récupérer les P.
    // en base de données
    $.getJSON(	DATA,
        {"action":"getP"},
        function (oRep){

            /* {"feedback":"ok","paragraphes":[{"id":"1","contenu":"premier","ordre":"1"},...]} */

            if (oRep.feedback != "ok") {
                alert("Erreur, veuillez recharger votre navigateur");
            } else {
                // on les intègre au div des paragraphes
                for(i=0;i<oRep.paragraphes.length;i++) {
                    // oRep.paragraphes[i] contient les méta-données
                    // du paragraphe i : id, contenu, ordre
                    if(oRep.paragraphes[i].article == idArticle) {
                        var jP = $("<p>").html(oRep.paragraphes[i].contenu);
                        var jSpan = $("<div>").addClass("blockList")
                            .prepend($("<span>").addClass("poignee ui-icon ui-icon-arrowthick-2-n-s"))
                            .append(jP);
                        $("#paragraphes").append(jSpan);

                        // TODO: y associer leurs méta-données
                        jP.data(oRep.paragraphes[i]);
                    }
                }
            }
        });
}