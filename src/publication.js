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
            plugin = new Publication(this, jQuery.extend({}, jQuery.fn[pluginname].defaultSettings, options || {}));
            this.data("plugin_" + pluginname, plugin);
        }

        return plugin;
    };


    /**
     * default settings
     */
    jQuery.fn[pluginname].defaultSettings = {
        
        // AJAX url of the BibJSON data
        bibjson : null,
        bibtex : null,

        // format callbacks
        callbackFormatEntry : function( po ) { return jQuery( "<li>" ); },
        callbackFormatTitle : function ( po ) { var lo = jQuery('<span class="title">'); lo.append( po.URL ? jQuery("<a>").attr("href", po.URL ).append( po.title ) : po.title ); return lo; },
        callbackFormatAuthor : function( pa ) { var lo = jQuery('<span class="author">'); lo.append( "(" + pa.map( function(po_item) { return po_item.given + " " + po_item.family; } ).join(", ") + ")" ); return lo; },
        callbackFormatBibtex : null,

        // filter callback
        callbackFilter : function( po, pa_search ) { return pa_search.every(function(i){ return po.title.toLowerCase().indexOf( i.toLowerCase() ) != -1; }); },

        // sorting callback
        callbackSort : function( po1, po2 ) { return po1.title.localeCompare( po2.title ); },

        // finish callback (is called after all data are shown)
        callbackFinish : null
    };


    // ---- plugin definition (public methods) ------------------------------------------------------------------------------

    /**
     * plugin factory
     *
     * @param po_element DOM element
     * @param po_options initialize options
     */
    function Publication (po_element, po_options) {
        this.dom = po_element;
        this.settings = po_options;
        this.bibjson = [];
        this.bibtex = "";
        
        return initialize(this);
    }

    Publication.prototype = {

        /**
         * load data
         */
        load : function() {
            var self = this;

            if ( self.settings.bibjson )
                jQuery.ajax({ url: self.settings.bibjson }).done(function( pa_data ) { 
                    self.bibjson = pa_data; ; 

                    if ( !self.settings.bibtex )
                        processdata( self )
                    else   
                        jQuery.get( self.settings.bibtex, function(pc_data) { 
                            self.bibtex = pc_data;
                            processdata( self );
                        }, "text" );
                });
            
            return this;
        },

        /**
         * adds a filter to the items
         * 
         * @param pc_filter filter string (will be split on any space) / empty or null value resets the filter
         */
        filter : function( pc_filter ) {
            processdata( this, pc_filter );
            return this;
        },

        /**
         * returns for a Bibtex key the full entry
         * 
         * @param pc_id Bibtex identifier
         * @return string with Bibtex
         */
        bibtexsource : function( pc_id ) {
            var l_search = new RegExp( "@.+\\{" + pc_id.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + "(.|\\s)+?(@|$)" ).exec( this.bibtex );
            if ( ( !l_search ) || ( l_search.length == 0 ) )
                return null;

            var l_result = l_search[0].slice(0, -1).trim();
            return l_result[ l_result.length - 1 ] != '}'
                   ? l_result + "}"
                   : l_result;
        }

    };


    // ---- private function ------------------------------------------------------------------------------------------------

    /**
     * constructor
     *
     * @param po_this execution context
     * @return self reference
     */
    var initialize = function (po_this) {
        return po_this.load();
    }

    /**
     * process BibJSON array
     * 
     * @param po_this plugin reference
     * @param pc_filter filter string
     */
    var processdata = function ( po_this, pc_filter )
    {
        po_this.dom.empty();

        po_this.bibjson
        
        // filter data
        .filter( 
            pc_filter && ( typeof( po_this.settings.callbackFilter ) === "function" ) 
            ? function(po) { return po_this.settings.callbackFilter( po, pc_filter.split(/(\s+)/).filter( function(i) { return i.trim().length > 0; } ) ) } 
            : function() { return true; } 
        )

        // sort data
        .sort(
            typeof( po_this.settings.callbackSort ) === "function"
            ? po_this.settings.callbackSort
            : function() { return 0; }
        )

        // create list with meta-data
        .forEach(function( po_item ) {
           //console.log( po_item );
           po_this.dom.append( format_entry( po_this, po_item ) ); 
        });

        if ( typeof( po_this.settings.callbackFinish ) === "function" )
            po_this.settings.callbackFinish();    
    }


    /**
     * format function for a BibJSON object
     * 
     * @param po_this plugin reference 
     * @param po_item BibJSON object
     * @return DOM entry
     */
    var format_entry = function ( po_this, po_item ) {
        if ( typeof(po_this.settings.callbackFormatEntry) !== "function" )
            return;

        var lo_item = po_this.settings.callbackFormatEntry( po_item );

        if ( typeof(po_this.settings.callbackFormatTitle) === "function" )
            lo_item.append( po_this.settings.callbackFormatTitle( po_item ) );

        if ( ( typeof(po_this.settings.callbackFormatAuthor) === "function" ) && ( po_item.author ) )
            lo_item.append(" ").append( po_this.settings.callbackFormatAuthor( po_item.author ) );

        if ( typeof(po_this.settings.callbackFormatBibtex) === "function" )
            lo_item.append(" ").append( po_this.settings.callbackFormatBibtex( po_item.id ) );

        return lo_item;
    }

}(jQuery));