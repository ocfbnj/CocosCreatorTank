import { Globals, Dir } from "./Globals";
import BaseTank from "./BaseTank";
import MapLayer from "./MapLayer";
import EnemyTank from "./EnemyTank";
import BlockWall from "./BlockWall";
import BlockCamp from "./BlockCamp";
import PlayerTank from "./PlayerTank";
import AudioMng from "../AudioMng";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Bullet extends cc.Component {
    @property([cc.SpriteFrame])
    private frames: cc.SpriteFrame[] = [];

    public tank: BaseTank;
    public isEnemy: boolean;
    private dir: number;
    private step: number;
    private stopMoving: boolean;
    private mapLayer: MapLayer;

    public init(dir: Dir, pos: cc.Vec3, step: number, tank: BaseTank) {
        this.mapLayer = cc.find("/Canvas/GameLayer/MapLayer").getComponent(MapLayer);
        this.tank = tank;
        this.tank.bulletCount--;
        this.isEnemy = tank instanceof EnemyTank;
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

    public onBulletDestory() {
        this.stopMoving = true;
        // TODO 删掉if
        if (this.tank)
            this.tank.bulletCount++;
        this.mapLayer.destoryBullet(this.node, this.isEnemy);
    }

    protected update(dt: number) {
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
            this._playAnimation();
        } else if (this._isCollisionWithBullet()) {
            this.onBulletDestory();
        }
    }

    private _playAnimation() {
        this.getComponent(cc.Animation).play("bomb");
    }

    private _isCollisionWithMap() {
        let node = this.node;
        let offset = Globals.BULLET_SIZE / 2;

        if (node.x - offset < 0 || node.x + offset > Globals.MAP_WIDTH ||
            node.y + offset > Globals.MAP_HEIGHT || node.y - offset < 0) {
            if (!this.isEnemy)
                cc.find("/Game/AudioMng").getComponent(AudioMng).playAudio("bin", false);
            return true;
        }

        return false;
    }

    private _isCollisionWithBlock() {
        let count = 0;
        let blocks: cc.Node[] = this.mapLayer.blocks.children;
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
                        cc.find("/Game/AudioMng").getComponent(AudioMng).playAudio("bin", false);
                    count++;
                } else if (block.name == "camp") {
                    block.getComponent(BlockCamp).tryDestory();
                    count++;
                }
            }
        }

        return count;
    }

    private _isCollisionWithTank() {
        let box = this.node.getBoundingBox();
        if (this.isEnemy) {
            let players = this.mapLayer.players.children;
            for (const player of players) {
                if (box.intersects(player.getBoundingBox())) {
                    player.getComponent(PlayerTank).disBlood();

                    return true;
                }
            }
        } else {
            let enemies = this.mapLayer.enemies.children;
            for (const enemy of enemies) {
                if (box.intersects(enemy.getBoundingBox())) {
                    enemy.getComponent(EnemyTank).disBlood();

                    return true;
                }
            }
        }

        return false;
    }

    private _isCollisionWithBullet() {
        let box = this.node.getBoundingBox();
        let bullets: cc.Node[];

        // 只检测玩家
        if (!this.isEnemy) {
            bullets = this.mapLayer.enemiesBullets.children;

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