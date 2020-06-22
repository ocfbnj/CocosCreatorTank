import { Globals, Dir } from "./Globals";
import BaseTank from "./BaseTank";
import MapLayer from "./MapLayer";
import EnemyTank from "./EnemyTank";
import BlockWall from "./BlockWall";
import BlockCamp from "./BlockCamp";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Bullet extends cc.Component {
    @property([cc.SpriteFrame])
    frames: cc.SpriteFrame[] = [];

    tank: BaseTank;
    isEnemy: boolean;
    dir: number;
    step: number;
    stopMoving: boolean;

    update(dt: number) {
        if (this.stopMoving)
            return;

        let realStep = (this.step * 50) * dt;

        switch (this.dir) {
            case Dir.LEFT:
                this.node.x -= realStep;
                break;
            case Dir.UP:
                this.node.y += realStep;
                break;
            case Dir.RIGHT:
                this.node.x += realStep;
                break;
            case Dir.DOWN:
                this.node.y -= realStep;
                break;
            default:
                break;
        }

        if (this._isCollisionWithMap() || this._isCollisionWithBlock() ||
            this._isCollisionWithTank()) {
            this.stopMoving = true;
            this.playAnimation();
        } else if (this._isCollisionWithBullet()) {
            this.onBulletDestory();
        }
    }

    init(dir: Dir, pos: cc.Vec3, step: number, tank: BaseTank) {
        this.tank = tank;
        this.tank.bulletCount--;
        this.isEnemy = tank.isEnemy;
        this.dir = dir;
        this.step = step;
        this.stopMoving = false;

        // 初始化位置
        this.node.position = pos;
        switch (this.dir) {
            case Dir.LEFT:
                this.node.x -= Globals.BULLET_SIZE;
                break;
            case Dir.UP:
                this.node.y += Globals.BULLET_SIZE;
                break;
            case Dir.RIGHT:
                this.node.x += Globals.BULLET_SIZE;
                break;
            case Dir.DOWN:
                this.node.y -= Globals.BULLET_SIZE;
                break;
            default:
                break;
        }

        this.getComponent(cc.Sprite).spriteFrame = this.frames[this.dir];
    }

    onBulletDestory() {
        this.stopMoving = true;
        // TODO 删掉if
        if (this.tank)
            this.tank.bulletCount++;
        this.node.parent.getComponent(MapLayer).destoryBullet(this.node, this.isEnemy);
    }

    playAnimation() {
        this.getComponent(cc.Animation).play("bomb");
    }

    _isCollisionWithMap() {
        let node = this.node;
        let offset = Globals.BULLET_SIZE / 2;

        if (node.x - offset < 0 || node.x + offset > Globals.MAP_WIDTH ||
            node.y + offset > Globals.MAP_HEIGHT || node.y - offset < 0) {
            if (!this.isEnemy)
                this.node.parent.getComponent(MapLayer).game.playAudio("bin", false);
            return true;
        }

        return false;
    }

    _isCollisionWithBlock() {
        let count = 0;
        let blocks = this.node.parent.getComponent(MapLayer).blocks;
        let box = this.node.getBoundingBox();

        // 加宽子弹
        switch (this.dir) {
            case Dir.LEFT:
            case Dir.RIGHT:
                box = new cc.Rect(box.xMin, box.yMin - Globals.BULLET_SIZE,
                    Globals.BULLET_SIZE, 3 * Globals.BULLET_SIZE);
                break;
            case Dir.UP:
            case Dir.DOWN:
                box = new cc.Rect(box.xMin - Globals.BULLET_SIZE, box.yMin,
                    3 * Globals.BULLET_SIZE, Globals.BULLET_SIZE);
                break;
            default:
                break;
        }

        for (let i = 0; i < blocks.length; i++) {
            let block = blocks[i];

            if (box.intersects(block.getBoundingBox())) {
                // count++;

                if (block.name == "block_wall") {
                    // TODO
                    if (block.getComponent(BlockWall).tryDestory(box)) {
                        count++;
                        i--;
                    }
                } else if (block.name == "block_stone") {
                    if (!this.isEnemy)
                        this.node.parent.getComponent(MapLayer).game.playAudio("bin", false);
                    count++;
                } else if (block.name == "block_camp") {
                    block.getComponent(BlockCamp).tryDestory();
                    count++;
                }
            }
        }

        return count;
    }

    _isCollisionWithTank() {
        let box = this.node.getBoundingBox();
        if (this.isEnemy) {
            let player = this.node.parent.getComponent(MapLayer).player;
            if (box.intersects(player.node.getBoundingBox())) {
                player.disBlood();

                return true;
            }
        } else {
            let enemies = this.node.parent.getComponent(MapLayer).enemies;
            for (let i = 0; i != enemies.length; i++) {
                if (box.intersects(enemies[i].getBoundingBox())) {
                    enemies[i].getComponent(EnemyTank).disBlood();

                    return true;
                }
            }
        }

        return false;
    }

    _isCollisionWithBullet() {
        let box = this.node.getBoundingBox();
        let bullets: cc.Node[];

        // 只检测玩家
        if (!this.isEnemy) {
            bullets = this.node.parent.getComponent(MapLayer).enemiesBullets;

            for (let i = 0; i != bullets.length; i++) {
                if (box.intersects(bullets[i].getBoundingBox())) {
                    bullets[i].getComponent(Bullet).stopMoving = true;
                    bullets[i].getComponent(Bullet).onBulletDestory();
                    return true;
                }
            }

        }


        return false;
    }
}