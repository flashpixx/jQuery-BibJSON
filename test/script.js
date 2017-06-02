jQuery(function() {
    var ln_sort = 1;


    // create publication list
    jQuery("#publication").publication({

        // URL of the BibJSON and BibTeX file
        bibjson : "publication.json",
        bibtex  : "publication.bib",

        // callback of formatter of bibtex element
        callbackEntry : {
            50 : function( po_this, po ) { 
                                return jQuery("<a>").addClass("bibtex")
                                                    .attr("href", "#")
                                                    .attr("data-clipboard-text", po_this.bibtexsource(po.id))
                                                    .text("BibTeX");
            }
        },

        // callback of finisher, after all entries are added to the DOM
        callbackFinish : function( po_this ) { 

            // give-all items
            var lo_all = new Clipboard("#giveall", { text : function() {
                return jQuery(".visible > a").map(function(i, po) { return jQuery(po).data("clipboard-text"); }).get().join("\n");
            }});
            lo_all.on("success", function(po) { alert("BibTeX Entries copied to Clipboard"); po.clearSelection(); });

            // set clipboard for bibtex button
            var lo = new Clipboard(".bibtex"); 
            lo.on("success", function(po) { alert("BibTeX Entry copied to Clipboard"); po.clearSelection(); });

            // do initialized sorting
            po_this.sort( function(i,j) { return i.title.localeCompare( j.title ); });
        }
    });

    // search action (search only iif more than 2 charcters are inserted)
    jQuery( "#search" ).on("change keyup paste", function() {
        var lc = jQuery(this).val();
        
        if ( ( !lc ) || ( lc.length < 3 ) )
            jQuery("#publication").publication().filter();
        else
        {
            var la = lc.split(/(\s+)/).filter( function(i) { return i.trim().length > 0; } );

            jQuery("#publication").publication().filter( function(po) {
                return ["title", "publisher", "collection-title"].some(function(j) {
                    return po[j] && la.every(function(i){ 
                        return po[j].toLowerCase().indexOf( i.toLowerCase() ) != -1;
                     });
                })
                || ["author", "editor"].some(function(j) {
                    return po[j] && la.some(function(i){
                        return po[j].some(function(n) { return n.family && n.family.toLowerCase().indexOf( i.toLowerCase() ) != -1; });
                    });
                });
            });
        }
    });

    // sort action (only title is sorted)
    jQuery( "#sort" ).click(function() {
        ln_sort = -1 * ln_sort;
        jQuery("#publication").publication().sort( function(i,j) { 
            return ln_sort * i.title.localeCompare( j.title ); 
        });
    });

});
