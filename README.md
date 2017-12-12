# Adfinitas-tmk-payment
## Présentation

Cette application sert à intégrer un formulaire de paiement en ligne personnalisable sur une page.

Deux modes de paiement sont disponibles:
* [Unique](http://google.fr)  
* [Mensuel](http://google.fr)  

## CONFIGURATION GÉNÉRALE

###### Ajouter le formulaire à un site

1. Inclure les 6 scripts dans votre page (à la fin de la balise <body> par soucis d'optimisation):
```
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.4/jquery.min.js" type="text/javascript"></script>
<script src="assets/js/libs.min.js" type="text/javascript"></script>
<script src="assets/js/submitForm.js" type="text/javascript"></script>
<script src="assets/js/validateForm.js" type="text/javascript"></script>
<script src="/socket.io/socket.io.js" type="text/javascript"></script>
<script src="assets/js/main.js" type="text/javascript"></script>
```
