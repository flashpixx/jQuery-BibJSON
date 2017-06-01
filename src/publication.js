/*
 * @cond LICENSE
 * ######################################################################################
 * # LGPL License                                                                       #
 * #                                                                                    #
 * # This file is part of the jQuery BibJSON Publication Plugin                         #
 * # Copyright (c) 2017, Philipp Kraus (philipp.kraus@flashpixx.de)                     #
 * # This program is free software: you can redistribute it and/or modify               #
 * # it under the terms of the GNU Lesser General Public License as                     #
 * # published by the Free Software Foundation, either version 3 of the                 #
 * # License, or (at your option) any later version.                                    #
 * #                                                                                    #
 * # This program is distributed in the hope that it will be useful,                    #
 * # but WITHOUT ANY WARRANTY; without even the implied warranty of                     #
 * # MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the                      #
 * # GNU Lesser General Public License for more details.                                #
 * #                                                                                    #
 * # You should have received a copy of the GNU Lesser General Public License           #
 * # along with this program. If not, see http://www.gnu.org/licenses/                  #
 * ######################################################################################
 * @endcond
 */


"use strict";
(function() {

    var pluginname = "publication";

    // ---- jQuery initialization -------------------------------------------------------------------------------------------

    /**
     * plugin initialize
     *
     * @param options any options
     */
    jQuery.fn[pluginname] = function (options) {
        var plugin = this.data("plugin_" + pluginname);

        if (!plugin) {
            plugin = new Publication(this, jQuery.extend(true, {}, jQuery.fn[pluginname].defaultSettings, options || {}));
            this.data("plugin_" + pluginname, plugin);
        }

        return plugin;
    };


    /**
     * default settings
     */
    jQuery.fn[pluginname].defaultSettings = {
        
        // ajax url of the BibJSON data
        bibjson : null,

        // http url of the BibTeX data (optional)
        bibtex : null,



        // css class name to show items
        csshidden : "hidden",
        
        // css class name of each publication entry
        cssentry  : "publication",
        
        // data-field name to store the BibTeX ID
        datafield : "bibtexid",



        // callback to generate a publication entry
        callbackEntryGenerator : function( po ) { return jQuery( "<li>" ); },

        // callback to generate a callback to define css ids
        callbackIDGenerator : function( po_this ) { 
            var lc_id = po_this.dom.attr("id"); 
            if ( !lc_id ) 
                throw new Error( "parent object needs an id attribute" ); 
            return function(i) { return lc_id + "-" + i.replace(/[^a-z0-9\-_]|^[^a-z]+/gi, "_"); }; 
        },

        // finish callback to determine successful execution
        callbackFinish : null,


        // any other callbacks, which are called in-order within each entry
        // numeric keys allows to order the function calling
        callbackEntry : {
            
            // title
            0 : function( po_this, po ) { 
                    var lo = jQuery('<span class="title">'); 
                    lo.append( po.URL ? jQuery("<a>").attr("href", po.URL ).append( po.title ) : po.title ); 
                    return lo; 
            },

            // authors
            10 : function( po_this, po ) {
                    if (!po.author)
                        return null;

                    var lo = jQuery('<span class="author">'); 
                    lo.append( 
                        po.author.map( function(i) { 
                            return i.given && i.family 
                                ? i.given + ( i["dropping-particle"] ? " " + i["dropping-particle"] : "" ) + " " + i.family
                                : ( i["literal"] ? i["literal"] : null ); 
                        })
                        .filter(function(i) { return i != null; }).join(", ") 
                    ); 
                    return lo; 
            },

            // publishing
            20 : function( po_this, po ) {
                    var lo = jQuery('<span class="publishing">');
                    var la = [];

                    if ( po["container-title"] )
                        la.push( po["container-title"] );

                    if ( po["collection-number"] )
                        la.push( "number " + po["collection-number"] );

                    if ( ( po["issue"] ) && ( po["issued"] ) ) 
                        la.push( po["issue"] + "." + (jQuery.isNumeric(po["issue"]) ? "" : " ") + po["issued"]["date-parts"].map(function(i) { return i.join(" ") }) );

                    if ( po["volume"] )
                        la.push( "volume " + po["volume"] );

                    if ( po["page"] )
                        la.push( "page " + po["page"] );

                    if ( po["publisher"] )
                        la.push( po["publisher"] );
            
                    if (la.length == 0)
                        return null;

                    lo.append( la.join(", ") );
                    return lo;
            },

            // editors
            30 : function( po_this, po ) {
                    if ( !po.editor )
                        return null;

                    var lo = jQuery('<span class="editor">');    
                    lo.append( 
                        po.editor.map( function(i) { 
                            return i.given && i.family 
                                ? i.given + ( i["dropping-particle"] ? " " + i["dropping-particle"] : "" ) + " " + i.family 
                                : null; 
                        })
                        .filter(function(i) { return i != null; }).join(", ") 
                    );

                    return lo;     
            }

        }

    };


    // ---- plugin definition (public methods) ------------------------------------------------------------------------------

    /**
     * plugin factory
     *
     * @param po_element DOM element
     * @param po_options initialize options
     * @return self reference / instance
     */
    function Publication(po_element, po_options) {
        this.dom = po_element;
        this.settings = po_options;
        this.bibjson = [];
        this.bibtex = "";
        
        return this.load();
    }

    Publication.prototype = {

        /**
         * load data
         * 
         * @return self reference
         */
        load : function() {
            var self = this;

            if ( self.settings.bibjson )
                jQuery.ajax({ url: self.settings.bibjson, datatype : "json" })
                      .done( function( pa_data ) { 
                          self.bibjson = {};
                          pa_data.forEach( function(i) { self.bibjson[i.id] = i;  }) 

                          if ( !self.settings.bibtex )
                              processdata( self )
                          else   
                              jQuery.get( self.settings.bibtex, "text" )
                                    .done( function(pc_data) {
                                        // we add between closing entry backet and @ an explicit linebreak for matching the regular expression
                                        self.bibtex = pc_data.replace(/\s+/g, " ").replace(/\} @/g, "}\n@");
                                        processdata( self );
                                    })
                                    .fail( function() {
                                        throw new Error( "BibTeX source [" + self.settings.bibtex + "] cannot be read" );
                                    });
                      })
                      .fail( function() {
                          throw new Error( "BibJSON source [" + self.settings.bibjson + "] cannot be read" );
                      })
            
            return this;
        },

        /**
         * adds a filter to the items
         * 
         * @param po_filter filter function (true element is shown, otherwise element is hidden)
         * @return self reference
         */
        filter : function( po_filter ) {
            var self = this;
            var lo_generator = self.settings.callbackIDGenerator( this );
            var lo_filter = po_filter && ( typeof( po_filter ) === "function" ) ? po_filter : function() { return true; } 

            Object.values(this.bibjson).forEach(function(i) {
                var lc_id = lo_generator( i.id );
                if ( !lc_id )
                    return;

                if ( lo_filter( i ) )
                    jQuery( "#" + lc_id ).removeClass( self.settings.csshidden );
                else
                    jQuery( "#" + lc_id ).addClass( self.settings.csshidden );    
            });

            return this;
        },

        /**
         * sorts the list
         * 
         * @param po_sort sorting function
         * @return self reference
         */
        sort : function( po_sort ) {
            var self = this;
            var lo_sort = po_sort && ( typeof(po_sort) === "function" )
                          ? po_sort
                          : function() { return 0; }

            this.dom.children().sort(function(i, j) { return lo_sort( self.bibjson[ jQuery(i).data( self.settings.datafield ) ], self.bibjson[ jQuery(j).data( self.settings.datafield ) ] ); }).appendTo( this.dom );
            return this;
        },

        /**
         * returns for a Bibtex key the full entry
         * 
         * @param pc_id Bibtex identifier
         * @return string with Bibtex
         */
        bibtexsource : function( pc_id ) {
            var lo_search = new RegExp( "@.+\\{" + pc_id.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + "(.|\\s)+?(@|$)" ).exec( this.bibtex );
            if ( ( !lo_search ) || ( lo_search.length == 0 ) )
                return null;

            var lc_result = lo_search[0].slice(0, -1).trim()
            return lc_result[ lc_result.length - 1 ] != '}'
                   ? lc_result + "}"
                   : lc_result;
        }

    };


    // ---- private function ------------------------------------------------------------------------------------------------

    /**
     * process BibJSON array
     * 
     * @param po_this plugin reference
     * @param pc_filter filter string
     */
    var processdata = function ( po_this, pc_filter )
    {
        if ( typeof(po_this.settings.callbackIDGenerator) !== "function" )
            throw new Error( "ID generator not set" );

        if ( typeof(po_this.settings.callbackEntryGenerator) !== "function" )
            throw new Error( "entry generator callback not set" );


        // instance of id generator
        var lo_idgenerator = po_this.settings.callbackIDGenerator( po_this );

        // check function to analyse BibTeX source
        var lo_bibtexcheck = po_this.settings.bibtex
                             ? function(i) { 
                                   if ( !new RegExp( "@.+\\{" + i.id.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") ).test( po_this.bibtex ) )
                                        throw new Error( "BibJSON ID [" + i.id + "] not found in BibTeX source, data sources seems not be synchronized" );
                                   return i; 
                               }
                             : function(i) { return i; };


        // clear dom element and iterate over all bibjson data
        po_this.dom.empty();
        Object.values( po_this.bibjson )

        // check all existing entries within BibTex (only if exists)
        .map( lo_bibtexcheck )

        // create list with meta-data
        .forEach(function( i ) { po_this.dom.append( format_entry( po_this, lo_idgenerator, i ) ); });

        // execute finisher iif exist
        if ( typeof( po_this.settings.callbackFinish ) === "function" )
            po_this.settings.callbackFinish( po_this );    
    }


    /**
     * format function for a BibJSON object
     * 
     * @param po_this plugin reference
     * @param po_idgenerator id generator 
     * @param po_item BibJSON object
     * @return DOM entry
     */
    var format_entry = function ( po_this, po_idgenerator, po_item ) {
        var lo_dom = po_this.settings.callbackEntryGenerator( po_item );

        lo_dom.attr("data-" + po_this.settings.datafield, po_item.id );
        lo_dom.attr( "id", po_idgenerator( po_item.id ) );
        
        if (po_item["type"])
            lo_dom.addClass( po_item["type"].replace(/[^a-z0-9\-_]|^[^a-z]+/gi, "_") );
        
        if ( po_this.settings.cssentry )
             lo_dom.addClass( po_this.settings.cssentry );
        

        Object.values(po_this.settings.callbackEntry).forEach(function(i) {
            var lo = i( po_this, po_item );
            if ( !lo )
                return;

            lo_dom.append(" ").append( lo );             
        });

        return lo_dom;
    }

}(jQuery));
