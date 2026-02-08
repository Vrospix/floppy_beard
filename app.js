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
let topColumns;
let bottomColumns;

let hasLanded = false;
let hasBumped = false;
let isGameStarted = false;

let cursors;
let messageToPlayer;
let score = 0;
let scoreText;

function create() {
    // Create the background picture
    const background = this.add.image(0, 0, "background").setOrigin(0, 0);
    
    // Create the top & bottom columns
    this.topColumns = this.physics.add.group({
        allowGravity: false,
        immovable: true
    });

    this.bottomColumns = this.physics.add.group({
        allowGravity: false,
        immovable: true
    });
    
    // Generate columns
    for (let i = 0; i < 3; i++) {
        const top = this.topColumns.create(400 + i * 400, 0, 'column');
        top.setOrigin(0.5, 0.6);
        top.passed = false;

        const bottom = this.bottomColumns.create(400 + i * 400, 400, 'column');
        bottom.setOrigin(0.5, 0.2);
    }

    // Create the roads on the bottom parts
    const roads = this.physics.add.staticGroup();
    const road = roads.create(400, 568, "road").setScale(2).refreshBody();
    
    // Assign bird as a physics sprite
    bird = this.physics.add.sprite(0, 100, 'bird').setScale(2);
    bird.setBounce(0.2);
    bird.setCollideWorldBounds(true); // Limit the bird to bounce on edge of frame
    
    // Add land trigger to set true if bird hits road
    this.physics.add.overlap(bird, road, () => (hasLanded = true), null, this);
    this.physics.add.collider(bird, road); // Collide limit on top of road

    // Add bump trigger to set true if bird hits column
    this.physics.add.collider(bird, this.topColumns, () => (hasBumped = true));
    this.physics.add.collider(bird, this.bottomColumns, () => (hasBumped = true));

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

    // Create score text
    scoreText = this.add.text(
        0, 
        0, 
        'Score: 0', 
        {
            fontFamily: '"Comic Sans MS", Times, serif',
            fontSize: '20px',
            color: "white",
            backgroundColor: "black",
        }
    );
    Phaser.Display.Align.In.BottomCenter(scoreText, background, -400, 50); // Adjust display to bottom screen

}

function update() {

    // Continue movement if not landed/bumped
    if (!hasLanded && !hasBumped) {
        const middleX = this.sys.game.config.width / 2;
        if (bird.x <= middleX) {
            bird.setVelocityX(40);
        } else {
            bird.setVelocityX(0);
        }
    } 

    // Stop movement if any condition is met
    if (hasLanded || hasBumped || !isGameStarted) {
        bird.body.velocity.x = 0;
        this.topColumns.setVelocityX(0);
        this.bottomColumns.setVelocityX(0);
    }

    // Change display message if landed/bumped
    if (hasLanded || hasBumped) {
        messageToPlayer.text = `Oh no! You crashed!\nPress the "space" button to restart the game`;
        if (cursors.space.isDown) {
            resetGame(this);
        }
    }

    // Set up game to only start after space input
    if (!isGameStarted) {
        bird.setVelocityY(0);
    }
    if (cursors.space.isDown && !isGameStarted) {
        isGameStarted = true;
        messageToPlayer.text = 'Instructions: Press the "space" button to stay upright\nAnd don\'t hit the columns or ground';
    } 

    // Set up key movement if it hasn't landed & bumped
    if (cursors.space.isDown && !hasLanded && !hasBumped && isGameStarted) {
        bird.setVelocityY(-160);
    }

    
    if (isGameStarted && !hasBumped && !hasLanded) {
        // Set up column moves
        this.topColumns.setVelocityX(-100);
        this.bottomColumns.setVelocityX(-100);

        // Set up recycle method
        const screenWidth = this.sys.game.config.width;

        this.topColumns.children.iterate(col => {
            if (col.x < -col.width) {
                col.x = screenWidth + 370;
                col.passed = false;
                col.body.updateFromGameObject();
            }

            // Scoring tracker
            if (col.x < bird.x  && !col.passed) {
                col.passed = true;
                score += 1;
                scoreText.setText("Score: " + score);
            }
        });

        this.bottomColumns.children.iterate(col => {
            if (col.x < -col.width) {
                col.x = screenWidth + 370;
                col.body.updateFromGameObject();
            }
        });
    }
}

function resetGame(scene) {
    // Reset flags
    hasLanded = false;
    hasBumped = false;
    isGameStarted = false;
    score = 0;
    scoreText.setText("Score: 0");

    // Reset bird
    bird.setPosition(0, 100); // starting coordinates

    // Reset columns
    scene.topColumns.children.iterate((col, i) => {
        col.x = 400 + i * 400;
        col.body.updateFromGameObject();
        col.passed = false;
    });

    scene.bottomColumns.children.iterate((col, i) => {
        col.x = 400 + i * 400;
        col.body.updateFromGameObject();
    });

    // Reset message
    messageToPlayer.setText('Instructions: Press space bar to start');
}
