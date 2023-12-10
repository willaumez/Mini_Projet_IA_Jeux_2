let target;
let comportement = "suivreLeader";

//Initialiser les variables
let vehicules = [];
let obstacles = [];
let vehiculeChef;

//vehiculeWander: le vehicule qui vagabonde
let vehiculeWander = [];

//tester wander
let wander = false;

//Les sliders
let seekForceSlider, avoidForceSlider, separateForceSlider, evadeForceSlider;
let maxSpeedSlider, maxForceSlider, distanceAheadSlider, rayonZoneDeFreinageSlider;

function setup() {
    //Initialiser le canvas
    createCanvas(windowWidth, windowHeight);

    //Creer le vehicule chef
    vehiculeChef = new Vehicle(200, 200, "blue", 20);
    for (let i = 0; i < 7; i++) {
        let v = new Vehicle(random(width), random(height), "green");
        vehicules.push(v);
    }

    for (let i = 0; i < 7; i++) {
        let v = new Vehicle(random(width), random(height), "yellow");
        vehiculeWander.push(v);
    }

    obstacles.push(new Obstacle(width / 2, height / 2, 35));

    // Création des sliders
    seekSlider = createSlider(0, 1, 0.5, 0.01);
    seekSlider.position(20, windowHeight - 200);

    avoidSlider = createSlider(0, 10, 4, 0.1);
    avoidSlider.position(20, windowHeight - 180);

    separateSlider = createSlider(0, 1, 0.2, 0.01);
    separateSlider.position(20, windowHeight - 160);

    evadeSlider = createSlider(0, 10, 7, 0.1);
    evadeSlider.position(20, windowHeight - 140);

    maxSpeedSlider = createSlider(0, 20, 10, 0.1);
    maxSpeedSlider.position(20, windowHeight - 120);

    maxForceSlider = createSlider(0, 2, 0.5, 0.01);
    maxForceSlider.position(20, windowHeight - 100);

    distanceAheadSlider = createSlider(0, 200, 80, 1);
    distanceAheadSlider.position(20, windowHeight - 80);

    rayonZoneDeFreinageSlider = createSlider(0, 200, 100, 1);
    rayonZoneDeFreinageSlider.position(20, windowHeight - 60);
}

//Fonction draw qui dessine les vehicules et les obstacles
//Dessiner les formes
function draw() {
    background(0, 0, 0, 100);

    target = createVector(mouseX, mouseY);



    //la souris avec 15px de rayon
    fill(255, 0, 0);
    noStroke();
    circle(target.x, target.y, 15);

    //Obstacles
    obstacles.forEach(o => {
        o.show();
    })

    //Les sliders
    fill(255);
    //fill("black");
    noStroke();
    text(`Seek Force: ${seekSlider.value()}`, seekSlider.x * 2 + seekSlider.width, seekSlider.y + 15);
    text(`Avoid Force: ${avoidSlider.value()}`, avoidSlider.x * 2 + avoidSlider.width, avoidSlider.y + 15);
    text(`Separate Force: ${separateSlider.value()}`, separateSlider.x * 2 + separateSlider.width, separateSlider.y + 15);
    text(`Evade Force: ${evadeSlider.value()}`, evadeSlider.x * 2 + evadeSlider.width, evadeSlider.y + 15);
    text(`Max Speed: ${maxSpeedSlider.value()}`, maxSpeedSlider.x * 2 + maxSpeedSlider.width, maxSpeedSlider.y + 15);
    text(`Max Force: ${maxForceSlider.value()}`, maxForceSlider.x * 2 + maxForceSlider.width, maxForceSlider.y + 15);
    text(`Distance Ahead: ${distanceAheadSlider.value()}`, distanceAheadSlider.x * 2 + distanceAheadSlider.width, distanceAheadSlider.y + 15);
    text(`Braking Radius: ${rayonZoneDeFreinageSlider.value()}`, rayonZoneDeFreinageSlider.x * 2 + rayonZoneDeFreinageSlider.width, rayonZoneDeFreinageSlider.y + 15);

    //texte pour les commande utilisées
    // Positionnement du texte pour les différentes commandes en bas à droite de l'écran
    text("Suivre Leader-Seek ( 1 )", windowWidth - 200, windowHeight - 180);
    text("Suivre Leader-Seek forme-Snake ( i )", windowWidth - 200, windowHeight - 160);
    text("Vagabonder-Wander ( w )", windowWidth - 200, windowHeight - 140);
    text("Ajouter véhicules à Seek ( a )", windowWidth - 200, windowHeight - 120);
    text("Supprimer véhicules de Seek ( s )", windowWidth - 200, windowHeight - 100);
    text("Ajouter vehicules a wander ( g )", windowWidth - 200, windowHeight - 80);
    text("Supprimer vehicules de wander ( f )", windowWidth - 200, windowHeight-60);
    text("Afficher le debug ( d )", windowWidth - 200, windowHeight-40);


    //Comportements appliqués aux véhicules
    switch (comportement) {
        case "suivreLeader":
            vehiculeChef.applyBehaviors(target, obstacles, vehicules);
            vehiculeChef.arrive(target);
            let force = vehiculeChef.seek1(target, true);
            force.mult(vehiculeChef.seekForce);
            vehiculeChef.applyForce(force);

            vehiculeChef.update();
            vehiculeChef.show();
            vehiculeChef.edges();

            vehicules.forEach(v => {
                v.arrive(vehiculeChef.pointBehind());

                v.applyBehaviors(vehiculeChef.pointBehind(), obstacles, vehicules);

                v.applyEvade(vehiculeChef);

                v.update();
                v.show();
                v.edges();
            })

            if (wander) {
                wanderBehavior();
            }
            break;
        case "suivreLeader_Snake":
            vehiculeChef.applyBehaviors(target, obstacles, vehicules);
            vehiculeChef.arrive(target);
            vehiculeChef.update();
            vehiculeChef.show();
            vehiculeChef.edges();

            vehicules.forEach((v, index) => {
                if (index == 0) {
                    v.arrive(vehiculeChef.pointBehind());
                } else {
                    let vehiculePrecedent = vehicules[index - 1];
                    v.arrive(vehiculePrecedent.position, 40);
                }
                v.applyBehaviors(vehiculeChef.pointBehind(), obstacles, vehicules);

                v.applyEvade(vehiculeChef);

                v.update();
                v.show();
                v.edges();
            })
            if (wander) {
                wanderBehavior();
            }
            break;

        default:
            break;

    }


}

//Function pour Modifier les sliders
function updateSliders() {
    Vehicle.seekForce = seekSlider.value();
    Vehicle.avoidForce = avoidSlider.value();
    Vehicle.separateForce = separateSlider.value();
    Vehicle.evadeForce = evadeSlider.value();
    Vehicle.maxSpeed = maxSpeedSlider.value();
    Vehicle.maxForce = maxForceSlider.value();
    Vehicle.distanceAhead = distanceAheadSlider.value();
    Vehicle.rayonZoneDeFreinage = rayonZoneDeFreinageSlider.value();
}

//comportement wander
function wanderBehavior() {
    vehiculeWander.forEach(v => {
        v.show();
        v.update();
        v.wander();
        v.applyBehaviors(vehiculeChef, obstacles, vehicules);
        v.boundaries();
    });
}

//Click sur la souris pour ajouter des obstacles
function mousePressed() {
    // TODO : ajouter un obstacle de taille aléatoire à la position de la souris
    obstacles.push(new Obstacle(mouseX, mouseY, random(10, 70)));

}

//Commandes
function keyPressed() {
    switch (key) {
        case "1":
            comportement = "suivreLeader";
            break;
        case "i":
            comportement = "suivreLeader_Snake";
            break;
        case "w":
            wander = !wander;
            break;
        case "a":
            // TODO : ajouter 4 véhicules
            for (let i = 0; i < 4; i++) {
                vehicules.push(new Vehicle(random(width), random(height), "green"));
            }
            break;
        case "s":
            // TODO : Supprimer 4 véhicules
            for (let i = 0; i < 4; i++) {
                vehicules.pop();
            }
            break;
        case "g":
            // TODO : ajouter 4 véhicules
            for (let i = 0; i < 4; i++) {
                vehiculeWander.push(new Vehicle(random(width), random(height), "green"));
            }
            break;
        case "f":
            // TODO : Supprimer 4 véhicules
            for (let i = 0; i < 4; i++) {
                vehiculeWander.pop();
            }
            break;
        case "d":
            Vehicle.debug = !Vehicle.debug;
            break;
        default:
            break;
    }


}