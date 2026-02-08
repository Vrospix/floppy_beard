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

function create() {
    const background = this.add.image(0, 0, "background").setOrigin(0, 0);
}

function update() {}