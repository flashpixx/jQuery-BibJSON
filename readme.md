# jQuery BibJSON plugin

A JavaScript framework to convert [BibJSON](http://okfnlabs.org/bibjson/) to [BibTeX](http://www.bibtex.org/) to create BibTeX references on-fly.

## Testing

* you need a current [jQuery](https://jquery.com/) and [ZeroClipboard](https://clipboardjs.com/)
* create the ```publication.json``` file based on your ```publication.bib``` with [Pandoc-Citeproc](http://pandoc.org/)

  ```cli
  pandoc-citeproc --bib2json publication.bib > publication.json
  ```

* create a basic CSS file ```layout.css``` with

  ```css
  .hidden {
      display: none;
  }
  ```
* add a base JavaScript ```script.js``` for interaction and initialization

  ```javascript
    "use strict";
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
    
    });  
  ```  
* create a basic ```index.htm``` file with

  ```html
    <!doctype html>
    <html lang="de_DE">
    
    <head>
    	<meta  charset="utf-8" />
    	<meta name="viewport" content="width=device-width, initial-scale=0.95, maximum-scale=0.95" />
    
    	<script src="jquery.min.js" type="text/javascript"></script>
    	<script src="clipboard.min.js" type="text/javascript"></script>
    
        <script src="publication.js" type="text/javascript"></script>
    	<script src="script.js" type="text/javascript"></script>
    
    	<link href="layout.css" type="text/css" rel="stylesheet" media="all" />
    
    	<title>Publications</title>
    </head>
    
    <body>
    
    <p>
    	<form>
    		<label for="search">Suche:</label> <input type="text" id="search" />
    		<input type="button" id="test"/>
    	</form>
    </p>
    
    <ol id="publication"></ol>
    
    </body>
    </html>  
  ```
