# Versionsverwaltung


## Begriffe

"Item" ... das ist das Item, das versioniert wird, sei es eine Applikation, ein Config-File oder was auch immer 


## Anforderungen

Webservice, das Versionen zentral verwaltet und liefert. Es kann durch einen Build-Prozess angestoßen werden oder manuell.

In weiterer Folge wäre auch ein GUI-Frontend nett, aber zuerst ist das Service wichtig.


## Entities

### Entity "Item"

Attribute:

* code ... [unique] Kurzbezeichnung, die in Serviceanfragen benutzt wird
* name ... menschenlesbarer Name
* description ... Prosa-Beschreibung des Items
* creation_date

### Entity "Version"

Attribute:

* item_code
* major
* minor
* patch
* build
* description
* revision [varchar 30]
* creation_date


## Routen

### Routen auf Ebene "Versionen"

* version/current ... liefert zuletzt vergebene Versionsnummer zurück
* version/current/details ... liefert zuletzt vergebene Versionsnummer samt anderen Attributen zurück
* version/nextMajor ... liefert die nächste freie Major-Version zurück, alle restlichen Versionsnummer-Komponenten sind 0
* version/nextMinor ... liefert die nächste freie Minor-Version zurück, alle restlichen Versionsnummer-Komponenten sind 0
* version/nextPatch ... liefert die nächste freie Patch-Version zurück, alle restlichen Versionsnummer-Komponenten sind 0
* version/nextBuild ... liefert die nächste freie Build-Version zurück, alle restlichen Versionsnummer-Komponenten sind 0
* version/next + Parameter "level" (major=0, minor=1, patch=2, build=3 oder auch die Strings "major", "minor", "patch" oder "build")
* version/list ... liefert eine Liste an vergebenen Versionsnummern für das angegebene Item

Parameter:

* item ... [mandatory] Item, für das die Version gezogen werden soll
* format ... [optional] Format, in dem die Version geliefert wird (zB "json", "txt", "xml") (oder mit Extension konfigurierbar)

Output im Format "txt" (Text):

	1.5.10.0

Output im Format "json":

	{
	  "{": {},
	  "versionString": "1.5.10.0",
	  "versionMajor": "1",
	  "versionMinor": "5",
	  "versionPatch": "10",
	  "versionBuild": "0",
	  "creationDate": "2016-08-07T12:34:03",
	  "}": {}
	}


### Routen auf Ebene "Items"

* items/list ... liefert Liste an angelegten Items zurück
* items/add ... neues Item anlegen (initiale Versionsnummer muss mitgeliefert werden) [Zukunftsmusik]
