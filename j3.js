const DATA = "data.php";
var articleCourrant="";
var paragraphes = [];

$(document).on(	"click",
    "#paragraphes p",
    function (){
        // clic sur un futur P.

        var contenuP = $(this).html();
        var metaP =  $(this).data();
        //stockage pour echape
        paragraphes[$(this).data().id] = $(this);
        // préparer le futur textarea
        var jT = $("<textarea>").attr('id', )
            .val(contenuP)
            .data(metaP);

        // insertion dans le DOM
        $(this).replaceWith(jT);
    });
$(document).on("keyup","body",function(leContexte){
    if(leContexte.which==27){
        var textarea = document.getElementsByTagName("textarea");
        for( var i = 0 ; i < textarea.length; i++){
            var currentP = paragraphes[i];
            var contenuT = $(currentP).html();
            var metaT =  $(currentP).data();
            var jP = $("<p>").html(contenuT).data(metaT);
            //$("#"+$(textarea[i])[0].id).replaceWith($(paragraphes[i]));
            console.log($(textarea[i]).prop('id'));
        }
    }
})
$(document).on(	"keydown",
    "#paragraphes textarea",
    function(leContexe){

        switch (leContexe.which){
            // Validation d'une saisie
            case 13 : {
                // On prépare le nouveau P.
                var contenuT = $(this).val();
                var metaT = $(this).data();
                var jP = $("<p>").html(contenuT).data(metaT);

                // On met à jour ses méta-données
                // car le contenu a changé
                jP.data("contenu", contenuT);

                //On envoie une requete au serveur
                $.getJSON(DATA,
                    {
                        "action": "updateP",
                        "id": metaT.id,
                        "contenu": contenuT
                    },
                    function (oRep) {
                        if (oRep.feedback != "ok") {
                            alert("Rechargez votre navigateur...");
                        }
                    });

                // On l'insère
                $(this).replaceWith(jP);
                console.log("code touche");
                console.log(leContexe.which);
                break;
            }

            default : {
                console.log("code touche");
                console.log(leContexe.which);
            }
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
            for(i = 0; i < oRep.articles.length; i++) {
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
            if(articleCourrant !== "") {
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
                if( contenu.replace(/\s+/g, '') === "") {
                    contenu = "Nouveau paragraphe";
                }
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
    $("#paragraphes").after(jP);
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
        {	"action" : "getP",
            "idArticle": idArticle},
        function (oRep){
            if (oRep.feedback!="ok") {
                alert("Rechargez votre navigateur...");
            }
            else {
                for(i=0;i<oRep.paragraphes.length;i++) {
                    var jP = $("<p>").html(oRep.paragraphes[i].contenu);
                    var jSpan = $("<div>").addClass("blockList")
                        .prepend($("<span>").addClass("poignee ui-icon ui-icon-arrowthick-2-n-s"))
                        .append(jP);
                    $("#paragraphes").append(jSpan);

                    // TODO: y associer leurs méta-données
                    jP.data(oRep.paragraphes[i]);
                } 
            }
        });
}

function ajouterArticle() {
    console.log("Ajouter un article");

    let articleName = $('#newArticleName').val();
    if (!articleName) return;

    $.getJSON("data.php",
        {
            "action": "addArticle",
            "nomArticle": articleName
        },
        function (oRep) {
            // Crée et ajoute l'option dans le select
            let jOption = $("<option>").val(oRep.id).html(articleName);
            $("#articles").append(jOption);

            // Selectionne l'option
            console.log(oRep.id);
            $("select[name=articles]").val(oRep.id).trigger( "change" );
            // $(`#articles option[value=${oRep.id}]`).attr('selected','selected').change();
        }
    );
}