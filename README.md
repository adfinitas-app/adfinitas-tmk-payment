# Adfinitas-tmk-payment
## Présentation

Cette application sert à intégrer un formulaire de paiement en ligne personnalisable sur une page.

Deux modes de paiement sont disponibles:
* [Unique](http://google.fr)  
* [Mensuel](http://google.fr)  

## CONFIGURATION GÉNÉRALE

###### Ajouter le formulaire à un site

1. Inclure les 6 scripts dans votre page (à la fin de la balise ```<body>``` par soucis d'optimisation):
````html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.4/jquery.min.js" type="text/javascript"></script>
<script src="assets/js/libs.min.js" type="text/javascript"></script>
<script src="assets/js/submitForm.js" type="text/javascript"></script>
<script src="assets/js/validateForm.js" type="text/javascript"></script>
<script src="/socket.io/socket.io.js" type="text/javascript"></script>
<script src="assets/js/main.js" type="text/javascript"></script>
````
2. Configurer le fichier settings.cfg (cf [Configuration Settings](#configuration-settings))

## CONFIGURATION SETTINGS {#configuration-settings}

Exemple de fichier de configuration:
````JSON
{
	"WRAPPER_JQ_SELECTOR"	:	"#view",
	"UNIQUE_DONATION"		: {
		"AMOUNT_1"	: "2300",
		"AMOUNT_2"	: "1500",
		"AMOUNT_3"	: "5800"
	},
	"MONTHLY_DONATION"		: {
		"AMOUNT_1"	: "300",
		"AMOUNT_2"	: "1000",
		"AMOUNT_3"	: "2800"
	},
	"URL"					: "{{ ADFINITAS.FR }}",
	"SITE_NAME"				: "{{ ADFINITAS }}"
}
````

WRAPPER_JQ_SELECTOR: Selecteur jQuery de la balise où sera inséré le formulaire<br>
UNIQUE_DONATION -> AMOUNT_X: Montant à afficher pour le mode de paiement unique (2300 = 23€)
MONTHLY_DONATION -> AMOUNT_X: Montant à afficher pour le mode de paiement mensuel
URL -> URL à mentionner dans le footer
SITE_NAME -> Nom du site à mentionner dans le footer
