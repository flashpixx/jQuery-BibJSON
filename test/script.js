jQuery(function() {

    // create publication list
    jQuery("#publication").publication({

        // URL of the BibJSON and BibTeX file
        bibjson : "publication.json",
        bibtex  : "publication.bib",

        // callback of formatter of bibtex element
        callbackFormatBibtex : function( pc ) { 
                                    return jQuery("<input>").addClass("bibtex")
                                                            .attr("type", "button")
                                                            .attr( "data-clipboard-text", jQuery("#publication").publication().bibtexsource(pc) )
                                                            .val("BibTeX");
        },

        // callback of finisher, after all entries are added to the DOM
        callbackFinish : function() { var lo = new Clipboard(".bibtex"); lo.on("success", function(po) { alert("BibTeX Entry copied to Clipboard"); po.clearSelection(); }); }
    });

    // search action (search only iif more than 2 charcters are inserted)
    jQuery( "#search" ).on("change keyup paste", function() {
        jQuery("#publication").publication()
                             .filter( 
                                 ( jQuery(this).val() ) && (jQuery(this).val().length > 2)
                                 ? jQuery(this).val()
                                 : null
                             );    
    });

    // sort action
    jQuery( "#sort" ).click(function() {
        jQuery("#publication").publication().sort( function(i,j) { 
            return i.title.localeCompare( j.title ); 
        });
    });

});
