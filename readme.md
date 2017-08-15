# jQuery BibJSON plugin

A JavaScript framework to convert [BibJSON](http://okfnlabs.org/bibjson/) to [BibTeX](http://www.bibtex.org/) to create BibTeX references on-fly.

## Usage 

### BibTeX - BibJSON Source

A BibTeX file must be converted into BibJSON first, for the BibTeX file we recommand UTF-8 encoding. The program [Pandoc-Citeproc](https://github.com/jgm/pandoc-citeproc) can be used to for converting with:

```
pandoc-citeproc --bib2json publication.bib > publication.json
```

### Plugin Installation

On default the citation is build into a numbered list in your HTML document, the basic usage is in an JavaScript file:

```javascript
jQuery("#publication").publication({
    bibjson : "publication.json",
    bibtex  : "publication.bib",
});
```

The plugin is bind to the DOM element ```#publication``` (an ```<ol>``` list element). The possible parameters are


| Parameter              | Required | Description | 
|------------------------|:--------:|-------------|
| bibjson                | Yes      | URL to the BibJSON source |
| bibtex                 | No       | URL to the BibTeX source, which can be used for exporting the BibTeX entry |
| csshidden              | No       | CSS class name to mark hidden / filtered entries, default ```.hidden``` |
| cssvisible             | No       | CSS class name to mark visible / not-filtered entries, default ```.visible``` |
| csspublication         | No       | CSS class name to mark all publication entries, default ```.publication``` |
| datafield              | No       | Data-field name (of the data attribute) to store BibTeX-ID within the DOM entry element, default ```bibtexid``` |
| callbackEntryGenerator | Yes      | Callback function with one parameter (the publication entry) to generate the publication DOM element, default ```jQuery("<li>")``` | 
| callbackIDGenerator    | Yes      | Callback function with one parameter (the plugin reference) which creates a callback function with one parameter to generate the DOM element ID of a publication entry, default ```<ID of the publication DOM element>-<CSS formated BibTeX ID>``` | 
| callbackFinish         | No       | Callback function with one parameter, that contains the plugin instance, e.g. for building clipboard export, default is not set |
| callbackEntry          | No       | A JSON object with callback function |
| crossdomain            | No       | Enables Ajax cross-domain access, default ```false```|


## Testing

Just run the directory with your favorit webserver e.g [MAMP](https://www.mamp.info) or [XAMPP](https://www.apachefriends.org) and open the ```index.html``` file within the ```test```-directory
