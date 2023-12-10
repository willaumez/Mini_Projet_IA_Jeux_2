
//Definir la classe Vehicle
class Vehicle {
    //Pour le debug
    static debug = false;
    //Constructeur
    constructor(x, y, color = "white", taille = 15) {
        //Position du véhicule
        this.position = createVector(x, y);
        //Vitesse du véhicule
        this.velocity = createVector(0, 0);
        //Acceleration du véhicule
        this.acceleration = createVector(0, 0);
        //Vitesse maximale
        this.maxSpeed = 10;
        //Force maximale
        this.maxForce = 0.5;
        //Couleur
        this.color = color;
        //Duree de vie
        this.lifespan = 5;


        this.r_pourDessin = taille;
        // rayon du véhicule pour l'évitement
        this.r = this.r_pourDessin * 3;

        // Pour évitement d'obstacle
        this.largeurZoneEvitementDevantVaisseau = this.r;
        this.rayonZoneDeFreinage = 100;
        //this.zoneEvitement = 200;
        this.distanceAhead = 80;

        // chemin derrière vaisseaux
        this.path = [];
        this.pathMaxLength = 10;

        //Les Forces de base
        this.seekForce = 0.5;
        this.avoidForce = 4;
        this.separateForce = 0.2;
        this.evadeForce = 7;

        //distance du bordering
        this.distanceBorder = 100;
    }

    //===================================================================================================
    //Point ahead et point behind 
    pointAhead() {
        let ahead = this.velocity.copy();
        ahead.normalize();
        ahead.mult(this.distanceAhead);
        let pointAuBoutDeAhead = p5.Vector.add(this.position, ahead);
        //Pour le debug, afficher le cercle autour du point ahead
        if (Vehicle.debug) {
            stroke(255);
            noFill();
            circle(pointAuBoutDeAhead.x, pointAuBoutDeAhead.y, this.largeurZoneEvitementDevantVaisseau * 3);
        }
        return pointAuBoutDeAhead;
    }
    pointBehind() {
        let behind = this.velocity.copy();
        behind.normalize();
        behind.mult(-this.distanceAhead);
        let pointDerriere = p5.Vector.add(this.position, behind);
        if (Vehicle.debug) {
            stroke(255);
            fill("pink"); // Utilisation de la couleur rose
            circle(pointDerriere.x, pointDerriere.y, 10);
        }
        return pointDerriere;
    }

    //===================================================================================================
    //Methode applyBehaviors qui applique les comportements seek, avoid et separate
    applyBehaviors(target, obstacles, vehicles) {
        // Application du comportement seek
        //let seekForce = this.seek(target, true); // Le true indique l'arrêt à l'arrivée
        let avoidForce = this.avoid(obstacles);
        let separateForce = this.separate(vehicles);

        // Multiplication de la force par un coefficient
        //seekForce.mult(this.seekForce); // Utilisation du coefficient pour le comportement seek
        avoidForce.mult(this.avoidForce);
        separateForce.mult(this.separateForce);

        // Application de la force
        //this.applyForce(seekForce); // Applique le comportement seek
        this.applyForce(avoidForce);
        this.applyForce(separateForce);
    }

    //Methode applyForce qui applique une force
    applyForce(force) {
        this.acceleration.add(force);
    }

    //Methode avoid qui permet d'éviter les obstacles
    avoid(obstacles) {
        // calcul d'un vecteur ahead devant le véhicule
        // il regarde par exemple 50 frames devant lui
        let ahead = this.velocity.copy();
        ahead.mult(this.distanceAhead);
        // on l'ajoute à la position du véhicule
        let pointAuBoutDeAhead = p5.Vector.add(this.position, ahead);

        // Calcule de ahead2, deux fois plus petit que le premier
        let ahead2 = ahead.copy();
        ahead2.mult(0.5);
        let pointAuBoutDeAhead2 = p5.Vector.add(this.position, ahead2);
        if (Vehicle.debug) {
            this.drawVector(this.position, ahead2, color("lightblue"));
            fill("orange");
            noStroke();
            circle(pointAuBoutDeAhead2.x, pointAuBoutDeAhead2.y, this.r / 3);
        }
        // Detection de l'obstacle le plus proche
        let obstacleLePlusProche = this.getObstacleLePlusProche(obstacles);

        // Si pas d'obstacle, on renvoie un vecteur nul
        if (obstacleLePlusProche == undefined) {
            return createVector(0, 0);
        }

        // On calcule la distance entre le centre du cercle de l'obstacle 
        // et le bout du vecteur ahead
        let distance = obstacleLePlusProche.position.dist(pointAuBoutDeAhead);
        // et pour ahead2
        let distance2 = obstacleLePlusProche.position.dist(pointAuBoutDeAhead2);
        // et pour la position du vaiseau
        let distance3 = obstacleLePlusProche.position.dist(this.position);

        let plusPetiteDistance = min(distance, distance2);
        plusPetiteDistance = min(plusPetiteDistance, distance3);

        let pointLePlusProcheDeObstacle = undefined;
        let alerteRougeVaisseauDansObstacle = false;

        if (distance == plusPetiteDistance) {
            pointLePlusProcheDeObstacle = pointAuBoutDeAhead;
        } else if (distance2 == plusPetiteDistance) {
            pointLePlusProcheDeObstacle = pointAuBoutDeAhead2;
        } else if (distance3 == plusPetiteDistance) {
            pointLePlusProcheDeObstacle = this.position;
            // si le vaisseau est dans l'obstacle, alors alerte rouge !
            if (distance3 < obstacleLePlusProche.r) {
                alerteRougeVaisseauDansObstacle = true;
                obstacleLePlusProche.color = color("red");
            } else {
                obstacleLePlusProche.color = "green";
            }
        }

        // si la distance est < rayon de l'obstacle
        // il y a collision possible et on dessine l'obstacle en rouge

        if (plusPetiteDistance < obstacleLePlusProche.r + this.largeurZoneEvitementDevantVaisseau) {
            // collision possible

            // calcul de la force d'évitement. C'est un vecteur qui va
            // du centre de l'obstacle vers le point au bout du vecteur ahead
            let force = p5.Vector.sub(pointLePlusProcheDeObstacle, obstacleLePlusProche.position);

            // on le dessine en jaune pour vérifier qu'il est ok (dans le bon sens etc)
            if (Vehicle.debug)
                this.drawVector(obstacleLePlusProche.position, force, "yellow");

            // Dessous c'est l'ETAPE 2 : le pilotage (comment on se dirige vers la cible)
            // on limite ce vecteur à la longueur maxSpeed
            // force est la vitesse désirée
            force.setMag(this.maxSpeed);
            // on calcule la force à appliquer pour atteindre la cible avec la formule
            // que vous commencez à connaitre : force = vitesse désirée - vitesse courante
            force.sub(this.velocity);
            // on limite cette force à la longueur maxForce
            force.limit(this.maxForce);

            if (alerteRougeVaisseauDansObstacle) {
                return force.setMag(this.maxForce * 2);
            } else {
                return force;
            }

        } else {
            // pas de collision possible
            return createVector(0, 0);
        }
    }
    //Methode getObstacleLePlusProche qui retourne l'obstacle le plus proche
    getObstacleLePlusProche(obstacles) {
        let plusPetiteDistance = 100000000;
        let obstacleLePlusProche = undefined;

        obstacles.forEach(o => {
            // Je calcule la distance entre le vaisseau et l'obstacle
            const distance = this.position.dist(o.position);

            if (distance < plusPetiteDistance) {
                plusPetiteDistance = distance;
                obstacleLePlusProche = o;
            }
        });

        return obstacleLePlusProche;
    }

    //Methode Separate qui permet d'éviter les collisions entre véhicules
    separate(vehicles) {
        let desiredSeparation = this.r * 2;
        let steer = createVector(0, 0, 0);
        let count = 0;
        // On examine les autres véhicules pour voir s'ils sont trop près
        for (let i = 0; i < vehicles.length; i++) {
            let other = vehicles[i];
            let d = p5.Vector.dist(this.position, other.position);
            // Si la distance est supérieure à 0 et inférieure à une valeur arbitraire (0 quand on est soi-même)
            if (d > 0 && d < desiredSeparation) {
                // Calculate vector pointing away from neighbor
                let diff = p5.Vector.sub(this.position, other.position);
                diff.normalize();
                diff.div(d); // poids en fonction de la distance. Plus le voisin est proche, plus le poids est grand
                steer.add(diff);
                count++; // On compte le nombre de voisins
            }
        }
        // On moyenne le vecteur steer en fonction du nombre de voisins
        if (count > 0) {
            steer.div(count);
        }

        // si la force de répulsion est supérieure à 0
        if (steer.mag() > 0) {
            // On implemente : Steering = Desired - Velocity
            steer.normalize();
            steer.mult(this.maxSpeed);
            steer.sub(this.velocity);
            steer.limit(this.maxForce);
        }
        return steer;
    }

    //Methode seek qui permet de se diriger vers la cible
    seek(target, arrival = false, distanceVisee = 0) {
        let force = p5.Vector.sub(target, this.position);
        let desiredSpeed = this.maxSpeed;

        if (arrival) {
            // Calcul de la distance entre la cible et le véhicule
            let distance = p5.Vector.dist(this.position, target);

            // Si la distance est inférieure au rayon de freinage, ajuster la vitesse
            if (distance < this.rayonZoneDeFreinage) {
                desiredSpeed = map(distance, distanceVisee, this.rayonZoneDeFreinage + distanceVisee, 0, this.maxSpeed);

                // Si le véhicule est arrivé à destination, annuler uniquement la vitesse linéaire
                if (distance < 5) {
                    this.velocity.mult(0);
                    return createVector(0, 0);
                }
            }
        }
        force.setMag(desiredSpeed);
        force.sub(this.velocity);
        force.limit(this.maxForce);
        return force;
    }

    //Methode arrive qui permet de ralentir le véhicule quand il est proche de la cible
    arrive(target, distanceVisee = 0) {
        let force = this.seek(target, true, distanceVisee);
        //modifie la force pour ralentir le véhicule quand il est proche de la cible
        force.mult(this.seekForce);
        //applique la force
        this.applyForce(force);
        //return this.seek(target, true, distanceVisee);
    }
    //Methode evade qui permet au vehicule de fuir la zone de 100px de rayon autour du point head(pointAhead) du leader
    evade(target) {
        // 1 - Obtenir le point ahead du leader
        let ahead = target.pointAhead();

        // 2 - Calculer le rayon de la zone d'évitement autour du point ahead

        // 3 - Détecter si le véhicule est entré dans la zone d'évitement
        let distanceToAhead = p5.Vector.dist(this.position, ahead);
        if (distanceToAhead < this.largeurZoneEvitementDevantVaisseau * 2) {
            // 4 - Si le véhicule est dans la zone d'évitement, calculer la force d'évitement

            // Calcul de la force d'évitement pour fuir le point ahead du leader
            let force = p5.Vector.sub(this.position, ahead);
            force.setMag(this.maxSpeed);
            force.sub(this.velocity);
            force.limit(this.maxForce);

            // 5 - Retourner la force d'évitement
            return force;
        }
        // 6 - Si le véhicule n'est pas dans la zone d'évitement, retourner un vecteur nul
        return createVector(0, 0);

        // 7 - Appliquer la force d'évitement au véhicule dans la méthode applyBehaviors
    }
    applyEvade(target) {
        let evadeForce = this.evade(target);
        evadeForce.mult(this.evadeForce);
        this.applyForce(evadeForce);
    }



    // inverse de seek !
    flee(target) {
        return this.seek(target).mult(-1);
    }

    //Methode update qui met à jour la position, la vitesse et l'accélération du véhicule
    update() {
        //On met à jour la vitesse
        this.velocity.add(this.acceleration);
        //On limite la vitesse
        this.velocity.limit(this.maxSpeed);
        //On met à jour la position
        this.position.add(this.velocity);
        //On remet l'accélération à zéro
        this.acceleration.mult(0);
        //On met à jour le chemin
        this.path.push(this.position.copy());
        //On limite la taille du chemin
        if (this.path.length > this.pathMaxLength) {
            this.path.shift();
        }
    }


    //Methode show qui affiche le véhicule, le chemin et les vecteurs
    show() {
        //Dessin du chemin
        this.showPath();
        //Dessin du véhicule
        this.showVehicle();
    }
    showPath() {
        push();
        stroke(255);
        noFill();
        strokeWeight(1);
        fill(this.color);
        // dessin du chemin
        this.path.forEach((p, index) => {
            if (!(index % 5)) {
                circle(p.x, p.y, 1);
            }
        });
        pop();
    }
    showVehicle() {
        stroke(255);
        strokeWeight(2);
        fill(this.color);
        push();
        translate(this.position.x, this.position.y);
        rotate(this.velocity.heading());
        triangle(-this.r_pourDessin, -this.r_pourDessin / 2, -this.r_pourDessin, this.r_pourDessin / 2, this.r_pourDessin, 0);
        pop();
        this.drawVector(this.position, this.velocity, color(255, 0, 0));

        // Cercle pour évitement entre vehicules et obstacles
        if (Vehicle.debug) {
            stroke(this.color);
            noFill();
            circle(this.position.x, this.position.y, this.r);

            // Dessiner le point "ahead" en forme de cercle avec un rayon de 30px
            fill("lightgreen");
            noStroke();
            //circle(this.pointAhead.x, this.pointAhead.y, 30);

        }
    }
    drawVector(position, v, color) {
        push();
        stroke(color);
        strokeWeight(2);
        line(position.x, position.y, position.x + v.x, position.y + v.y);
        let arrowSize = 5;
        translate(position.x + v.x, position.y + v.y);
        rotate(v.heading());
        translate(-arrowSize / 2, 0);
        triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
        pop();
    }
    //Function edges qui permet de faire réapparaitre le véhicule de l'autre côté de l'écran
    edges() {
        if (this.position.x > width + this.r) {
            this.position.x = -this.r;
        } else if (this.position.x < -this.r) {
            this.position.x = width + this.r;
        }
        if (this.position.y > height + this.r) {
            this.position.y = -this.r;
        } else if (this.position.y < -this.r) {
            this.position.y = height + this.r;
        }
    }


    //Comporetement wander
    wander() {
        // point devant le véhicule
        let wanderPoint = this.velocity.copy();
        wanderPoint.setMag(this.distanceCercleWander);
        wanderPoint.add(this.position);

        if (Vehicle.debug) {
            // on le dessine sous la forme d'une petit cercle rouge
            fill(255, 0, 0);
            noStroke();
            circle(wanderPoint.x, wanderPoint.y, 8);

            // Cercle autour du point
            noFill();
            stroke(255);
            circle(wanderPoint.x, wanderPoint.y, this.wanderRadius * 2);

            // on dessine une lige qui relie le vaisseau à ce point
            // c'est la ligne blanche en face du vaisseau
            line(this.position.x, this.position.y, wanderPoint.x, wanderPoint.y);
        }
        // On va s'occuper de calculer le point vert SUR LE CERCLE
        // il fait un angle wanderTheta avec le centre du cercle
        // l'angle final par rapport à l'axe des X c'est l'angle du vaisseau
        // + cet angle
        let theta = this.wanderTheta + this.velocity.heading();

        let x = this.wanderRadius * cos(theta);
        let y = this.wanderRadius * sin(theta);

        // maintenant wanderPoint c'est un point sur le cercle
        wanderPoint.add(x, y);

        if (Vehicle.debug) {
            // on le dessine sous la forme d'un cercle vert
            fill("green");
            noStroke();
            circle(wanderPoint.x, wanderPoint.y, 20);

            // on dessine le vecteur desiredSpeed qui va du vaisseau au point vert
            stroke("yellow");
            line(this.position.x, this.position.y, wanderPoint.x, wanderPoint.y);
        }
        // On a donc la vitesse désirée que l'on cherche qui est le vecteur
        // allant du vaisseau au cercle vert. On le calcule :
        // ci-dessous, steer c'est la desiredSpeed directement !
        let desiredSpeed = wanderPoint.sub(this.position);

        // Ce que dit Craig Reynolds, c'est que uniquement pour ce
        // comportement, la force à appliquer au véhicule est
        // desiredSpeed et pas desiredSpeed - vitesse actuelle !
        let force = desiredSpeed;

        force.setMag(this.forceMax);
        this.applyForce(force);

        // On déplace le point vert sur le cerlcle (en radians)
        this.wanderTheta += random(-this.displaceRange, this.displaceRange);
    }

    //Comporetement boundaries
    // Exerce une force renvoyant vers le centre du canvas si le véhicule s'approche
    // des bords du canvas
    boundaries() {

        let desired = null;

        if (this.position.x < this.distanceBorder) {
            desired = createVector(this.maxSpeed, this.velocity.y);
        } else if (this.position.x > width - this.distanceBorder) {
            desired = createVector(-this.maxSpeed, this.velocity.y);
        }

        if (this.position.y < this.distanceBorder) {
            desired = createVector(this.velocity.x, this.maxSpeed);
        } else if (this.position.y > height - this.distanceBorder) {
            desired = createVector(this.velocity.x, -this.maxSpeed);
        }

        if (desired !== null) {
            desired.normalize();
            desired.mult(this.maxSpeed);
            const steer = p5.Vector.sub(desired, this.velocity);
            steer.limit(this.maxForce);
            this.applyForce(steer);
        }
    }

    //Comporetement follow Leader
    seek1(target, arrival = false, distanceVisee = 50) {
        let force = p5.Vector.sub(target, this.position);
        let distance = force.mag();
        let desiredSpeed = this.maxSpeed;

        if (arrival) {
            // Dessiner le cercle de rayon 50 autour du véhicule
            if (Vehicle.debug) {
                stroke("white");
                noFill();
                circle(this.position.x, this.position.y, this.rayonZoneDeFreinage);
            }

            // Ajuster la vitesse en fonction de la distance
            if (distance < distanceVisee) {
                desiredSpeed = map(distance, 0, distanceVisee, 0.1, this.maxSpeed);
            }
        }

        force.setMag(desiredSpeed);
        force.sub(this.vel);
        force.limit(this.maxForce);
        return force;
    }







}