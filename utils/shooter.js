// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import dynamic from "next/dynamic";

let frame = dynamic(() => requestAnimationFrame(function () {}), {
  ssr: false,
});

export function setup() {
  cancelAnimationFrame(frame), requestAnimationFrame(play);
}

export const run = () =>
  dynamic(() => setup(), {
    ssr: false,
  });

function play() {
  document.getElementById("menu").style.display = "none";
  var height = 200 * 4;
  var width = 200 * 4;
  var c = document.getElementById("c");
  c.height = height;
  c.width = width;
  var ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  var score = 0;

  var playerdead = false;

  function get(m, x, y) {
    if (x < 0 || x >= 200 || y < 0 || y >= 200)
      return new particle(x, y, 0, 0, 0);
    else return m[y][x];
  }

  function set(m, x, y, val) {
    if (x < 0 || x >= 200 || y < 0 || y >= 200) return;
    m[y][x] = val;
  }

  class particle {
    constructor(x, y, xv, yv, col) {
      this.x = x;
      this.y = y;
      this.xv = xv;
      this.yv = yv;
      this.col = col;
    }
    spread(map) {
      var x = this.x,
        y = this.y;
      var tcol = this.col;

      var dw = get(smokedata, x, y - 1).col;
      // dw = dw < 0.2 ? 0 : dw;
      var da = get(smokedata, x - 1, y).col;
      // da = da < 0.2 ? 0 : da;
      var ds = get(smokedata, x, y + 1).col;
      // ds = ds < 0.2 ? 0 : ds;
      var dd = get(smokedata, x + 1, y).col;
      // dd = dd < 0.2 ? 0 : dd;
      var sum = dw + da + ds + dd;

      if (tcol < 1) sum *= Math.random() + 0.45;

      var m = get(map, x, y);
      m.col = Math.max((m.col + sum) / (4 + Math.random() * 2.5), 0);
      // m = get(map, x, y - 1); m.col = Math.max(0, m.col - dw * A * B - 0.002);
      // m = get(map, x - 1, y); m.col = Math.max(0, m.col - da * A * B - 0.002);
      // m = get(map, x, y + 1); m.col = Math.max(0, m.col - ds * A * B - 0.002);
      // m = get(map, x + 1, y); m.col = Math.max(0, m.col - dd * A * B - 0.002);
    }
    clone() {
      return new particle(this.x, this.y, this.xv, this.yv, this.col);
    }
  }

  var smokedata = [];
  for (var r = 0; r < 200; r++) {
    smokedata[r] = [];
    for (var c = 0; c < 200; c++) smokedata[r][c] = new particle(c, r, 0, 0, 0);
  }

  var aliens = [];
  var bullets = [];
  var barriers = [];
  var sprites = document.getElementById("s");

  function cross(x, y, x2, y2) {
    return x * y2 - x2 * y;
  }

  class invader {
    constructor(x, y, type, cd) {
      this.x = x;
      this.y = y;
      this.type = type;
      this.frame = 0;
      this.count = cd;
      this.crashed = false;
      this.dir = Math.random() < 0.5 ? -1 : 1;
      this.name = Math.random();
      this.rot = 0;
    }

    move(others) {
      if (this.dead) {
        this.x += this.xv;
        this.y += this.yv;
        this.xv *= 0.99;
        this.yv *= 0.99;
        this.rv *= 0.995;
        this.yv += 0.1;
        this.rot += this.rv;
        if (this.x > 200 * 4 - 52) {
          this.x = 200 * 4 - 52;
          this.xv = -Math.abs(this.xv);
        }
        if (this.x < 0) {
          this.x = 0;
          this.xv = Math.abs(this.xv);
        }
        if (this.y < 0) {
          this.y = 0;
          this.yv = Math.abs(this.yv);
        }
        for (var i = 0; i < others.length; i++)
          if (others[i].name != this.name)
            if (Math.hypot(others[i].y - this.y, others[i].x - this.x) < 48) {
              this.die(others[i]);
              break;
            }

        for (var i = 0; i < barriers.length; i++)
          if (
            Math.abs(barriers[i].y - 26 - this.y) < 52 &&
            Math.abs(barriers[i].x - 26 - this.x) < 78
          )
            this.die(barriers[i]);

        // for(var r = -1; r <= 1; r++)
        //  for(var c = -1; c <= 1; c++)
        set(
          smokedata,
          Math.floor(6.5 + this.x / 4),
          Math.floor(6.5 + this.y / 4),
          new particle(
            Math.floor(6.5 + this.x / 4),
            Math.floor(6.5 + this.y / 4),
            this.xv,
            this.yv,
            8
          )
        );
        // console.log(Math.floor(this.x / 4), Math.floor(this.y / 4));
      } else {
        if (this.xv || this.yv) {
          this.x += this.xv;
          this.y += this.yv;
          // this.rot += this.rv;
          this.xv *= 0.9;
          this.yv *= 0.9;
          this.rv = 0;
        }
        if (--this.count <= 0) {
          this.count = SPEED;
          var i;
          for (var i = 0; i < others.length; i++)
            if (others[i].name != this.name) {
              if (
                others[i].dead &&
                Math.hypot(others[i].y - this.y, others[i].x - this.x) < 48
              ) {
                this.die(others[i]);
                return;
              }
              if (
                ((this.dir == 1 && others[i].x > this.x) ||
                  (this.dir == -1 && others[i].x < this.x)) &&
                Math.hypot(others[i].y - this.y, others[i].x - this.x) < 60
              ) {
                this.dir = Math.sign(this.x - others[i].x);
                this.x += this.dir * 4;
                this.y += 4;
                i = others.length + 1;
              }
            }
          if (this.x > 200 * 4 - 15 * 4) this.dir = -1;
          if (this.x < 8) this.dir = 1;
          if (this.y < 26) this.y += 4;
          if (i == others.length) this.x += this.dir * 8;
          this.frame = 1 - this.frame;
        }
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x + 26, this.y + 26);
      if (this.rot != 0) ctx.rotate(this.rot);
      ctx.drawImage(
        sprites,
        0,
        this.type * 26 + this.frame * 13,
        13,
        13,
        -26,
        -26,
        13 * 4,
        13 * 4
      );
      ctx.restore();
    }

    die(b) {
      var bullet = !b.name && !b.bar;
      var barrier = b.bar;
      var M = 1 / 2;
      var MV = 8;
      var ve;
      if ((ve = Math.hypot(this.yv, this.xv)) > MV) {
        this.xv *= MV / ve;
        this.yv *= MV / ve;
      }

      if ((ve = Math.hypot(b.yv, b.xv)) > MV) {
        b.xv *= MV / ve;
        b.yv *= MV / ve;
      }

      var v = [
        (this.xv ?? 0) - (b.xv ?? 0),
        (this.yv ?? 0) - (b.yv ?? (bullet ? b.dir * 16 : 0)),
      ];
      var n = [
        b.x + (b.name ? 26 : barrier ? 0 : 2) - this.x - 26,
        b.y + (b.name ? 26 : barrier ? 0 : 8) - this.y - 26,
      ];
      var norm = [n[0] / Math.hypot(n[1], n[0]), n[1] / Math.hypot(n[1], n[0])];
      if (barrier) norm = [0, 1];
      v[0] *= norm[0];
      v[1] *= norm[1];
      var vl = Math.hypot(v[0], v[1]);
      this.drv = (bullet ? 0.2 : M) * cross(v[0], v[1], n[0], n[1]) * 0.0003;
      this.rv = (this.rv ?? 0) + this.drv;
      this.xv = (this.xv ?? 0) - M * vl * norm[0];
      this.yv = (this.yv ?? 0) - M * vl * norm[1];
      b.drv = M * cross(v[0], v[1], n[0], n[1]) * 0.0003;
      b.rv = (b.rv ?? 0) + b.drv;
      b.xv = (b.xv ?? 0) + M * vl * norm[0];
      b.yv = (b.yv ?? 0) + M * vl * norm[1];
      if (!this.dead && (bullet || Math.hypot(this.yv, this.xv) > 2)) {
        this.dead = true;
        for (var i = 0; i < 16; i++) {
          var dx = Math.floor(Math.random() * 9) - 4;
          var dy = Math.floor(Math.random() * 9) - 4;
          set(
            smokedata,
            Math.floor(6.5 + this.x / 4) + dx,
            Math.floor(6.5 + this.y / 4) + dy,
            new particle(
              Math.floor(6.5 + this.x / 4) + dx,
              Math.floor(6.5 + this.y / 4) + dy,
              0,
              0,
              8
            )
          );
        }
        score += 100;
      }
      if (!b.dead && !bullet && Math.hypot(b.yv, b.xv) > 2) {
        b.dead = true;
        for (var i = 0; i < 16; i++) {
          var dx = Math.floor(Math.random() * 9) - 4;
          var dy = Math.floor(Math.random() * 9) - 4;
          set(
            smokedata,
            Math.floor(6.5 + b.x / 4 - (barrier ? 6.5 : 0)) + dx,
            Math.floor(6.5 + b.y / 4) + dy,
            new particle(
              Math.floor(6.5 + b.x / 4 - (barrier ? 6.5 : 0)) + dx,
              Math.floor(6.5 + b.y / 4) + dy,
              0,
              0,
              8
            )
          );
        }
        score += 100;
      }
    }
  }

  class bullet {
    constructor(x, y, dir) {
      this.x = x;
      this.y = y;
      this.dir = dir;
    }

    move() {
      this.y += this.dir * 8 * 4;
    }

    draw(ctx) {
      ctx.fillStyle = "white";
      ctx.fillRect(this.x - 2, this.y - 2 * 4, 4, 4 * 8);
    }
  }

  class barrier {
    constructor(x, y) {
      this.sx = this.x = x;
      this.sy = this.y = y;
      this.sr = this.rot = 0;
      this.xv = 0;
      this.yv = 0;
      this.rv = 0;
      this.health = 10;
      this.bar = true;
    }
    move() {
      if (this.dead) {
        this.yv += 0.1;
        this.xv *= 0.99;
        this.yv *= 0.99;
        this.rv *= 0.995;
        set(
          smokedata,
          Math.floor(this.x / 4),
          Math.floor(6.5 + this.y / 4),
          new particle(
            Math.floor(this.x / 4),
            Math.floor(6.5 + this.y / 4),
            this.xv,
            this.yv,
            5
          )
        );
      } else {
        this.xv *= 0.8;
        this.yv *= 0.8;
        this.rv *= 0.8;
      }
      this.x += this.xv;
      this.y += this.yv;
      this.rot += this.rv;
    }
    draw(ctx) {
      ctx.save();
      ctx.translate(this.x + 0, this.y + 0);
      if (this.rot != 0) ctx.rotate(this.rot);
      ctx.drawImage(sprites, 0, 7 * 13, 13, 13, -52, -26, 13 * 4, 13 * 4);
      ctx.drawImage(sprites, 0, 8 * 13, 13, 13, 0, -26, 13 * 4, 13 * 4);
      ctx.restore();
    }
  }

  barriers.push(new barrier(32 * 6, 110 * 6));
  barriers.push(new barrier(96 * 6, 110 * 6));

  // for(var y = 0; y < 200; y += 16)
  //  for(var x = 0; x < 200; x += 16)
  //    aliens.push(new invader(x * 4, y * 4, Math.floor(Math.random() * 3), 0));
  // aliens.push(new invader(10, 10, 0, 15));
  // aliens.push(new invader(50, 10, 0, 16));

  var SPEED = 8;
  var DELAY = 4000;
  var timer = DELAY;
  var lt = 0;
  var px = 200 * 2;
  var pv = 0;
  var keys = [];
  window.onkeydown = function (e) {
    if (e.code == "ArrowLeft" || e.code == "KeyA") keys[0] = true;
    if (e.code == "ArrowRight" || e.code == "KeyD") keys[1] = true;
    if (
      e.code == "Space" ||
      e.code == "ControlLeft" ||
      e.code == "ControlRight"
    )
      keys[2] = true;
  };

  window.onkeyup = function (e) {
    if (e.code == "ArrowLeft" || e.code == "KeyA") keys[0] = false;
    if (e.code == "ArrowRight" || e.code == "KeyD") keys[1] = false;
    if (
      e.code == "Space" ||
      e.code == "ControlLeft" ||
      e.code == "ControlRight"
    )
      keys[2] = false;
  };

  function update(t) {
    if (t == -1) lt = t;
    timer += t - lt;
    lt = t;
    frame = requestAnimationFrame(update);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    var data2 = [];
    for (var r = 0; r < 200; r++) {
      data2[r] = [];
      for (var c = 0; c < 200; c++) data2[r][c] = get(smokedata, c, r).clone();
    }
    for (var r = 0; r < 200; r++)
      for (var c = 0; c < 200; c++) smokedata[r][c].spread(data2);
    smokedata = data2;
    for (var r = 0; r < 200; r++)
      for (var c = 0; c < 200; c++)
        if (smokedata[r][c].col > 1) {
          var s = smokedata[r][c].col;
          var co = [224, 148, 54];
          ctx.globalAlpha = 1;
          ctx.fillStyle =
            "rgb(" + co[0] * s + ", " + co[1] * s + ", " + co[2] * s + ")";
          ctx.fillRect(c * 4, r * 4, 4, 4);
        } else if (smokedata[r][c].col > 0.1) {
          var s = smokedata[r][c].col;
          ctx.globalAlpha = s;
          ctx.fillStyle = "#333";
          ctx.fillRect(c * 4, r * 4, 4, 4);
        }
    ctx.globalAlpha = 1;

    for (var i = 0; i < aliens.length; i++) {
      aliens[i].move(aliens);
      aliens[i].draw(ctx);
      if (
        !playerdead &&
        Math.hypot(200 * 4 - aliens[i].y - 26, px - aliens[i].x - 26) < 26
      ) {
        playerdead = true;
        document.getElementById("menu").style.display = "block";
        document.getElementById("start").innerHTML = "PLAY AGAIN?";
        window.scrollTo({ top: 0, behavior: "smooth" });
        for (var j = 0; j < 12; j++) {
          var dx = Math.floor(Math.random() * 11) - 5;
          var dy = Math.floor(Math.random() * 21) - 10;
          set(
            smokedata,
            Math.floor(px / 4) + dx,
            123 + dy,
            new particle(Math.floor(px / 4) + dx, 123 + dy, 0, 0, 24)
          );
        }
      }

      if (aliens[i].y > 200 * 4 + 26) {
        for (
          var y =
            200 -
            Math.floor(
              Math.hypot(aliens[i].yv, aliens[i].xv) * (1 + Math.random())
            );
          y < 200;
          y++
        ) {
          var dx = Math.floor(Math.random() * 5) - 2;
          set(
            smokedata,
            Math.floor(6.5 + aliens[i].x / 4) + dx,
            y,
            new particle(Math.floor(6.5 + aliens[i].x / 4) + dx, y, 0, 0, 8)
          );
        }
        if (!playerdead && Math.abs(px - aliens[i].x - 26) < 36) {
          playerdead = true;
          document.getElementById("menu").style.display = "block";
          document.getElementById("start").innerHTML = "PLAY AGAIN?";
          for (var j = 0; j < 12; j++) {
            var dx = Math.floor(Math.random() * 11) - 5;
            var dy = Math.floor(Math.random() * 21) - 10;
            set(
              smokedata,
              Math.floor(px / 4) + dx,
              123 + dy,
              new particle(Math.floor(px / 4) + dx, 123 + dy, 0, 0, 24)
            );
          }
        }
        aliens.splice(i--, 1);
      } else
        for (var n = 0; n < bullets.length; n++)
          if (
            Math.hypot(
              aliens[i].y + 26 - bullets[n].y - 2,
              aliens[i].x + 26 - bullets[n].x - 2 * 4
            ) < 36
          ) {
            aliens[i].die(bullets[n]);
            bullets.splice(n, 1);
            break;
          }
    }

    for (var i = 0; i < bullets.length; i++) {
      bullets[i].move();
      bullets[i].draw(ctx);
      if (bullets[i].y > 200 * 4) bullets.splice(i--, 1);
      if (bullets[i].y < 0) bullets.splice(i--, 1);
    }

    for (var i = 0; i < barriers.length; i++) {
      barriers[i].move();
      barriers[i].draw(ctx);
    }
    document.getElementById("score").innerHTML = score;
    if (!playerdead) {
      if (keys[0]) pv -= 1;
      if (keys[1]) pv += 1;
      if (keys[2]) {
        bullets.push(new bullet(px, 200 * 4 - 6 * 4, -1));
        keys[2] = false;
      }
      px += pv;
      if (px < 26) {
        px = 26;
        pv = Math.abs(pv);
      }
      if (px > 200 * 4 - 26) {
        px = 200 * 4 - 26;
        pv = -Math.abs(pv);
      }
      pv *= 0.9;
      ctx.drawImage(
        sprites,
        0,
        6 * 13,
        13,
        13,
        px - 26,
        200 * 4 - 13 * 4,
        13 * 4,
        13 * 4
      );
    }
    if (aliens.length < 200 && timer > DELAY) {
      DELAY = Math.max(DELAY * 0.95, 2000);
      // SPEED = Math.max(SPEED * 0.98, 4);
      var type = Math.floor(Math.random() * 3);
      for (var x = 0; x < 8; x++)
        aliens.push(
          new invader(
            x * 16 * 4 + 32,
            -48,
            type,
            Math.floor(Math.random() * SPEED)
          )
        );
      timer = 0;
    }
  }
  update(-1);
}
