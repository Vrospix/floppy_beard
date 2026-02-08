let config = {
    renderer: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: "arcade",
        arcade: {
        gravity: { y: 300 },
        debug: false,
        },
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
};

let game = new Phaser.Game(config);


function preload() {
    this.load.image("background", "assets/background.png");
    this.load.image("road", "assets/road.png");
    this.load.image("column", "assets/column.png");
    this.load.spritesheet("bird", "assets/bird.png", {
        frameWidth: 64,
        frameHeight: 96,
    });
}

//Set up variables
let bird;
let hasLanded = false;
let hasBumped = false;
let cursors;
let isGameStarted = false;
let messageToPlayer;

function create() {
    // Create the background picture
    const background = this.add.image(0, 0, "background").setOrigin(0, 0);
    
    // Create the top & bottom columns
    const topColumns = this.physics.add.staticGroup({
        key: "column",
        repeat: 1,
        setXY: { x: 200, y: 0, stepX: 300 },
    });

    const bottomColumns = this.physics.add.staticGroup({
        key: "column",
        repeat: 1,
        setXY: { x: 350, y: 400, stepX: 300 },
    });

    // Create the roads on the bottom parts
    const roads = this.physics.add.staticGroup();
    const road = roads.create(400, 568, "road").setScale(2).refreshBody();
    
    // Assign bird as a physics sprite
    bird = this.physics.add.sprite(0, 50, 'bird').setScale(2);
    bird.setBounce(0.2);
    bird.setCollideWorldBounds(true); // Limit the bird to bounce on edge of frame
    

    // Add land trigger to set true if bird hits road
    this.physics.add.overlap(bird, road, () => (hasLanded = true), null, this);
    this.physics.add.collider(bird, road); // Collide limit on top of road

    // Add bump trigger to set true if bird hits column
    this.physics.add.overlap(
        bird,
        topColumns,
        () => (hasBumped = true),
        null,
        this
    );
    this.physics.add.overlap(
        bird,
        bottomColumns,
        () => (hasBumped = true),
        null,
        this
    ); 
    this.physics.add.collider(bird, topColumns);
    this.physics.add.collider(bird, bottomColumns);

    // Create input detection from keyboard (Up,Down,Left,Right,Spacebar & Shift)
    cursors = this.input.keyboard.createCursorKeys();

    // Add message display for instruction
    messageToPlayer = this.add.text(
        0,
        0,
        'Instructions: Press space bar to start',
        {
            fontFamily: '"Comic Sans MS", Times, serif',
            fontSize: "20px",
            color: "white",
            backgroundColor: "black",
        }
    );
    Phaser.Display.Align.In.BottomCenter(messageToPlayer, background, 0, 50); // Adjust display to bottom screen
}

function update() {

    // Continue movement if not landed/bumped
    if (!hasLanded && !hasBumped) {
        bird.body.velocity.x = 50;
    } 

    // Stop movement if any condition is met
    if (hasLanded || hasBumped || !isGameStarted) {
        bird.body.velocity.x = 0;
    }

    // Change display message if landed/bumped
    if (hasLanded || hasBumped) {
        messageToPlayer.text = `Oh no! You crashed!`;
    }

    // Set up game to only start after space input
    if (!isGameStarted) {
        bird.setVelocityY(-160);
    }
    if (cursors.space.isDown && !isGameStarted) {
        isGameStarted = true;
        messageToPlayer.text = 'Instructions: Press the "up" button to stay upright\nAnd don\'t hit the columns or ground';
    } 

    // Set up key movement if it hasn't landed & bumped
    if (cursors.up.isDown && !hasLanded && !hasBumped) {
        bird.setVelocityY(-160);
    }

    // Display win message
    if (bird.x > 750) {
        bird.setVelocityY(40);
        messageToPlayer.text = `Congrats! You won!`;
    }
    
}