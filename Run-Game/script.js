/* global Phaser */

window.game = new Phaser.Game({
  renderer: Phaser.CANVAS,
  width: 1080,
  height: 720,
  antialias: false,
  state: {

    init: function () {
      this.game.camera.roundPx = true; // default
      this.game.renderer.renderSession.roundPixels = true;
    },

    preload: function () {
      this.load.baseURL = 'https://cdn.jsdelivr.net/gh/samme/phaser-examples-assets@v2.0.0/assets/';
      this.load.crossOrigin = 'anonymous';
      this.load.image('background', 'pics/lazur_skkaay3.png');
      this.load.image('rabbit', 'sprites/wabbit.png');
      this.load.spritesheet('obstacle', 'sprites/gameboy_seize_color_40x60.png', 40, 60);
      this.load.spritesheet('player', 'sprites/metalslug_mummy37x45.png', 37, 45, 18);
    },

    create: function () {
      this.world.setBounds(0, 0, 720, 360);

      // background
      this.bg = this.game.add.tileSprite(0, 0, this.game.width, 360, 'background');
      this.bg.fixedToCamera = true;
      this.bg.tileScale.set(this.bg.height / this.bg.texture.frame.height);

      // rabbit
      this.rabbit = this.add.sprite(
        this.world.centerX,
        this.world.centerY,
        'rabbit'
      );
      this.physics.arcade.enable(this.rabbit);
      this.rabbit.body.acceleration.x = 10;
      this.rabbit.body.velocity.x = 100;

      // player
      this.player = this.add.sprite(this.rabbit.x, this.rabbit.y, 'player');
      this.player.animations.add('run');
      this.physics.arcade.enable(this.player);
      this.player.body.collideWorldBounds = true;
      this.player.body.gravity.y = 1000;
      this.player.body.maxVelocity.set(100, 400);

      // obstacles
      this.obstacles = this.game.add.physicsGroup();

      // input
      this.cursors = this.input.keyboard.createCursorKeys();
      this.jumpButton = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

      // timer
      this.timer = this.time.create();
      this.timer.name = 'Time';
      this.timer.start();

      // score
      this.score = 0;

      // begin
      this.createObstacles();
      this.nextObstacle();
    },

    update: function () {
      var body = this.player.body;
      if (this.player.alive) {
        this.physics.arcade.collide(this.player, this.obstacles);
        body.maxVelocity.x = this.rabbit.body.velocity.x;

        if (!body.touching.right) {
          body.velocity.x = body.maxVelocity.x;
        }

        if (body.blocked.down || body.touching.down) {
          this.player.animations.play('run', ~~(body.velocity.x / 2), true);
          if (this.jumpButton.isDown || this.input.activePointer.isDown) {
            body.velocity.y = -body.maxVelocity.y;
          }
        } else {
          this.player.animations.stop();
        }

        if (body.left < this.world.bounds.left) {
          this.player.kill();
          this.startOver();
        }
      }

      this.obstacles.forEachAlive(this.updateObstacle, this);
      this.bg.tilePosition.x = this.camera.view.x / -2;
      this.updateBounds(); // preRender instead?
    },

    render: function () {
      var debug = this.game.debug;

      debug.timerEvents(null, 20, 400, 100, 20);
      debug.timerElapsed(this.timer, 380, 400);
      // debug.geom(this.physics.arcade.bounds, 'rgba(0,0,255,0.25)')
      // debug.geom(this.world.bounds, 'rgba(255,0,0,0.25)')
      debug.object(this.world.bounds, 20, 600, {
        keys: ['x', 'y', 'width', 'height', 'centerX', 'centerY'],
        label: 'world.bounds'
      });
      debug.object(this.camera.bounds, 200, 600, {
        keys: ['x', 'y', 'width', 'height', 'centerX', 'centerY'],
        label: 'camera.bounds'
      });
    },

    // Helpers
    addEvent: function (delay, callback, name) {
      var event = this.time.events.add(delay, callback, this);

      event.name = name;

      return event;
    },

    createObstacles: function () {
      // 1 x 5 keys == 5 obstacles
      this.obstacles.createMultiple(1, 'obstacle', [0, 1, 2, 3, 4]);
      this.obstacles.setAll('body.allowGravity', false);
      this.obstacles.setAll('body.immovable', true);
      this.obstacles.setAll('body.moves', false);
    },

    nextObstacle: function () {
      this.resetNextObstacle();
      this.addEvent((this.rnd.between(2000, 6000) * 100) / this.rabbit.body.velocity.x, this.nextObstacle, 'next obstacle');
    },

    resetNextObstacle: function () {
      var obs;

      obs = this.obstacles.getFirstDead();

      if (obs) {
        obs.reset();
        obs.left = this.world.bounds.right;
        obs.bottom = this.world.bounds.bottom;
      } else {
        console.warn('None available', this.obstacles.children);
      }
    },

    restart: function () {
      this.state.restart();
    },

    startOver: function () {
      this.timer.pause();
      this.camera.fade(0, 1000);
      this.addEvent(1000, this.restart, 'restart');
    },

    updateObstacle: function (obs) {
      if (obs.right < this.world.bounds.left) {
        obs.kill();
        if (this.player.alive) {
          this.score += 1;
        }
      }
    },

    updateBounds: function () {
      var bounds = this.world.bounds;

      this.world.setBounds(this.rabbit.x - bounds.halfWidth, bounds.y, bounds.width, bounds.height);
    }
  }
});
