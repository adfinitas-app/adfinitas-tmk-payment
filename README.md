# Adfinitas-tmk-payment
## Présentation

Cette application permet d'intégrer un formulaire de paiement en ligne personnalisable sur une page.

Deux modes de paiement sont disponibles:
* [Unique](http://google.fr)  
* [Mensuel](http://google.fr)  

## CONFIGURATION GÉNÉRALE

###### Ajouter le formulaire à un site

1. Inclure les 6 scripts dans votre page à la fin de la balise ```<body>``` par soucis d'optimisation (voir un [exemple d'index.html](client/index.html)):
````html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.4/jquery.min.js" type="text/javascript"></script>
<script src="assets/js/libs.min.js" type="text/javascript"></script>
<script src="assets/js/submitForm.js" type="text/javascript"></script>
<script src="assets/js/validateForm.js" type="text/javascript"></script>
<script src="/socket.io/socket.io.js" type="text/javascript"></script>
<script src="assets/js/main.js" type="text/javascript"></script>
````

2. Configurer le fichier settings.cfg (cf. [Configuration Settings](#configuration-settings))

3. Configurer les templates du formulaire (cf. [Configuration Templates](#configuration-templates))

## CONFIGURATION SETTINGS

Exemple de fichier de configuration:
````JSON
{
	"WRAPPER_JQ_SELECTOR"	:		"#view",
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

```WRAPPER_JQ_SELECTOR```: Selecteur jQuery de la balise où sera inséré le formulaire <br/>
```UNIQUE_DONATION -> AMOUNT_X```: Montant à afficher pour le mode de paiement unique (2300 = 23.00€) <br/>
```MONTHLY_DONATION -> AMOUNT_X```: Montant à afficher pour le mode de paiement mensuel <br/>
```URL```: URL à mentionner dans le footer <br/>
```SITE_NAME```: Nom du site à mentionner dans le footer <br/>

## CONFIGURATION TEMPLATES

Le formulaire est découpé en plusieurs layouts :

* La base : [form.template](client/assets/layouts/form.template)
* Le header : [header.template](client/assets/layouts/header.template)  
* Les champs : [fields.template](client/assets/layouts/fields.template)  
* Le type de paiement : [paymentType.template](client/assets/layouts/paymentType.template)  
* Le footer : [footer.template](client/assets/layouts/footer.template)


Afin d'améliorer l'expérience du visiteur, il est nécessaire que les balises d'entrées (input, select) aient la classe ```field``` et aient une balise parente ayant la classe ```input-container```.
Cela permet de vérifier la validité des entrées en temps réel.
