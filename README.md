# Mini_Projet_IA_Jeux_2

Pour ce projet, seules les fonctionnalités 1, 2  et 3 ont été réalisées

1- Implémenter le comportement du transparent précédent (suivi de leader avec séparation et evasion si devant le leader, avec un cercle devant le leader. Si le véhicule entre dans le cercle, il fuit le centre du cercle)
Curseurs pour régler les paramètres
Tester avec un leader qui suit la souris (arrive)
Tous les véhicules doivent éviter les obstacles


2- En tapant une touche ou en cliquant avec la souris, on change le comportement des suiveurs :
On avait fait un comportement où les Vehicules suivaient le leader à la queue leu leu (avec un arrive sur les précédents), implémenter aussi ce mode de suivi du leader dans le projet.
Vous essaierez de passer du comportement du transparent précédent au comportement à la queue leu leu par exemple quand on tape la touche “l”;


3- Ajouter des véhicules ayant les comportements wander + éviter les obstacles + être repoussés par les bords de l’écran (comportement boundaries, dans vehicle.js de l’exemple 8). On pourra en ajouter avec le touche “w”

//=============================================================================================================================================



Pour la functionnalitée 1:
    Dans le function "setup()" du fichier sketch.js:
            -j'ai défini un objet 'vehiculeChef = new Vehicle(200, 200, "blue", 20);' de type voiture qui sera le chef des véhicules
            -Créer des véhicules pour suivre le leader et pour le comportement wander
            -Créer un obstacle(obstacles.push(new Obstacle(width / 2, height / 2, 35));)
            -Et Création des sliders pour manipuler les variables de la classe véhicule
    Dans la function "draw()";
            -Création de la souris 'target = createVector(mouseX, mouseY);'
            -Affichage des obstacles, paramétrage des sliders, affichage du texte des commandes et des sliders
            -
            //Comportements appliqués aux véhicules
            Un 'switch (comportement)' pour gérer les comportements appliqués aux véhicules soit "case "suivreLeader":" pour le comportement 1

         *Lorsqu'on sélectionne le comportement "suivreLeader", le véhicule principal suit une cible spécifique(seek). Il utilise des fonctions pour se diriger vers cette cible, en ajustant sa vitesse pour ralentir doucement en s'approchant tout en evitant les obstacle et les autres véhicules:
                    Fonction 'applyBehaviors()'--> 
                            Cette fonction est responsable de l'application des différents comportements aux véhicules. Elle calcule et applique les forces d'évitement (avoid), et de séparation (separate) en fonction des paramètres définis pour chaque véhicule.
                    Fonction 'update()'--> 
                            Cette fonction met à jour les propriétés du véhicule telles que la position, la vitesse et l'accélération en fonction des forces appliquées. Elle limite également la vitesse maximale du véhicule.
                    Fonction 'show()'--> 
                            La fonction show() est responsable de l'affichage visuel du véhicule.
                    Fonction 'edges()'-->
                            ette fonction permet aux véhicules de réapparaître de l'autre côté de l'écran lorsque leur position dépasse les bords de celui-ci, créant ainsi un environnement de type "boucle".

        * Pendant ce temps, les autres véhicules suivent le point derrière le véhicule chef(calculer avec la méthode "pointbehind()" de la classe véhicule), évitent les obstacles, et réagissent à leur environnement,et ce en utilisant les méthodes précédentes.
                J'ai ajouté le comportement 'v.applyEvade(vehiculeChef) qui permet au autres véhicules de fuir le véhicule chef;' la logique est la suivante:
                1-Obtenir le point "ahead" du leader grace a la méthode 'pointAhead()' : Cela représente la position anticipée où le leader se dirigera.

                2-Calculer le rayon de la zone d'évitement : Il s'agit de la zone autour du point "ahead" dans laquelle le véhicule doit réagir pour éviter une collision.

                3-Détection de l'entrée dans la zone d'évitement : Le code vérifie si le véhicule est suffisamment proche du point "ahead" pour nécessiter une évitement.

                4-Calcul de la force d'évitement : Si le véhicule est dans la zone d'évitement, une force est calculée pour fuir le point "ahead" du leader. Cette force est dirigée dans la direction opposée au point "ahead", avec une magnitude ajustée pour contrôler l'évitement.

                5-Retourner la force d'évitement : Si le véhicule est dans la zone d'évitement, la force d'évitement est renvoyée pour être appliquée au véhicule.

                6-Retourner un vecteur nul si aucun évitement n'est nécessaire : Si le véhicule n'est pas dans la zone d'évitement, un vecteur nul est renvoyé, indiquant qu'aucune force d'évitement n'est requise.

                7-Appliquer la force d'évitement : Cette force est ensuite appliquée au véhicule dans la méthode applyEvade, où elle est ajustée par un coefficient défini par la valeur de this.evadeForce.


Pour la functionnalitée 2(snake):
        J'ai utilisé les fonctions définies ci-dessus mais j'ai modifié la logique:
        Les véhicules ne ciblent plus le point derrière le chef mais le véhicule précédent.
        Les véhicules se suivent les uns les autres en se ciblant formant ainsi une chaine ou un serpent



Pour la functionnalitée 3(Wander):

        Les comportements tels que éviter les obstacles et les véhicules s'appliquent toujours.
        -J'ai ajouté la méthode 
            function wanderBehavior() {
                vehiculeWander.forEach(v => {
                    v.show();
                    v.update();
                    v.wander();
                    v.applyBehaviors(vehiculeChef, obstacles, vehicules);
                    v.boundaries();
                });
            }
        
        Qui applique en plus 'v.wander();':
                La logique:  
                    Dans la logique de la fonction wander(), plusieurs étapes permettent au véhicule de dériver sans destination fixe :

                    1-Calcul du point devant le véhicule : Un point est calculé devant le véhicule, à une certaine distance définie par this.distanceCercleWander dans la direction de sa vitesse actuelle.

                    2-Visualisation en mode débogage : Si le mode débogage (Vehicle.debug) est activé, des formes géométriques sont dessinées pour visualiser le processus. Un cercle rouge représente le point calculé, un cercle autour de ce point indique le rayon de dérive, et une ligne blanche relie le véhicule à ce point.

                    3-Calcul du point sur le cercle : Un point est calculé sur un cercle dont le centre est le point précédemment défini. La position de ce point est déterminée par l'angle this.wanderTheta combiné à la direction de la vitesse du véhicule.

                    4-Visualisation des points en mode débogage : Si le mode débogage est activé, des formes géométriques sont dessinées pour visualiser le processus. Un cercle vert représente le point calculé sur le cercle, et une ligne jaune relie le véhicule à ce point.

                    5-Calcul de la vitesse désirée : La vitesse désirée est définie comme le vecteur allant du véhicule au point calculé sur le cercle.

                    6-Application de la force : La force à appliquer au véhicule est ajustée pour être égale à la vitesse désirée, comme recommandé par Craig Reynolds pour ce comportement spécifique. Cette force est ensuite appliquée au véhicule.

                    7-Déplacement du point sur le cercle : La position du point sur le cercle est modifiée de manière aléatoire pour simuler une dérive fluide du véhicule.

                    8-Cette logique permet au véhicule de dériver sans but précis en calculant des points à l'avant et sur un cercle, puis en ajustant sa trajectoire en fonction de ces calculs pour créer une animation de mouvement aléatoire.

        Et v.boundaries():
                La fonction boundaries() est responsable de contraindre le véhicule à rester à l'intérieur des limites de l'écran. Elle fonctionne de la manière suivante :

                1.Initialisation des forces désirées : Un vecteur desired est défini à null, ce qui signifie qu'aucune force désirée n'est définie par défaut.

                2-Vérification de la position du véhicule : Le code vérifie la position actuelle du véhicule par rapport aux bords de l'écran en utilisant this.distanceBorder comme limite de détection. Si le véhicule s'approche trop près d'un bord, une force désirée est définie pour le contraindre.

                3-Définition des forces selon la position : Si le véhicule se trouve trop à gauche, une force vers la droite est définie pour le maintenir à l'intérieur. De même, si le véhicule est trop à droite, une force vers la gauche est définie. Les mêmes principes s'appliquent pour les bords haut et bas de l'écran.

                4-Application des forces : Si une force désirée est définie, elle est normalisée pour correspondre à la vitesse maximale du véhicule. Ensuite, un vecteur de direction est calculé pour ajuster la trajectoire du véhicule et le contraindre à rester dans les limites de l'écran.

                5-Cette fonction assure que le véhicule reste à l'intérieur des limites de l'écran en appliquant des forces pour corriger sa trajectoire dès qu'il s'approche trop près d'un bord.



Pour finir, j'ai ajouté des commandes pour permettre l'ajout et la suppression des véhicules.



