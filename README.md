Flint
===

Starten des Backends
-------

1. zuerst alle Dependencies installieren:

        npm install

1. Konfiguration in `app/config/config.js` erstellen (Vorlage: `config/config.js.template`).  

1. Server starten mit:

        npm start


Deployment
-----

### Build from source

Das kann zB auf der `atvulicl9` geschehen.   

Auschecken:

    git clone https://z003USER@atvulicl1.ww300.siemens.net/git/flint/backend.git flint-backend
    cd flint-backend

Libs installieren:

    npm install

**// Start Exkurs**

*Zwischenschritt, bis deploy-node als npm-Package auf Nexus installiert werden kann:* um sicherstellen, dass das Deployment-Tool deploy-node installiert ist, müssen die folgenden Schritte ausgeführt werden, danach ist das Executable `deploy-node` für npm als Kommando verfügbar:

    git clone .../oe/deploy-node
    cd deploy-node
    npm link

Deployment-Package erstellen:

    npm run package

*Anmerkung:* falls die Fehlermeldung 

    : No such file or directory 

kommt, ist das Skript `deploy-node` vermutlich mit CRLF-Line-Endings ausgecheckt worden. Beheben mit:

    dos2unix bin/deploy-node.js

Danach sollte das obige Kommando (`npm run package`) funktionieren.

**// Ende Exkurs**

Das Skript `npm run package` macht Folgendes:

1. Im Projekt-Root-Verzeichnis ein neues Verzeichnis `dist/` erstellen bzw. dieses leeren
2. Die Applikation in diesem `dist/`-Verzeichnis builden (inkl. Installieren der Dependencies mit `npm install --production`)
3. Ein `versions.json`-File erstellen 
3.  Die gebuildete Applikation in `dist/` packen in ein `*.tgz`-File

Variation:

    npm run package:snapshot

macht genau das gleiche, aber fügt noch einen Timestamp zur Versionsnummer hinzu. Diese Variante sollte für ad-hoc-Snapshots verwendet werden, damit die Version durch den Timestamp besser referenziert ist.

### Installieren

1. alte Instanz der App sichern (config-Files werden gleich benötigt)
1. Das Deployment-Package `*.tgz` entpacken in Zielverzeichnis am Server.
2. config-Files der alten Instanz in die neue App kopieren bzw. anpassen. Welche das sind, ist dem File `overrides.txt` zu entnehmen.
