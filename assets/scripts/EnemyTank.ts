import BaseTank from "./BaseTank"
import { Dir } from "./Globals"
import MapLayer from "./MapLayer";
import Game from "./Game";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EnemyTank extends BaseTank {
    curDistance: number;
    maxDistance: number;

    constructor() {
        super();
        
        this.curDistance = 0;
        this.maxDistance = 100;
    }

    update(dt: number) {
        if (!this.autoMoving) return;

        let realStep = (this.step + 35) * dt;
        this._autoMoving(realStep);
    }

    init(pos: cc.Vec3) {
        this.mapLayer = cc.find("/Canvas/MapLayer").getComponent(MapLayer);

        this.curDistance = 0;
        this.level = Math.ceil(Math.random() * 4);

        if (this.level == 4) {
            this.blood = 3;
        } else {
            this.blood = 1;
        }

        this.node.position = pos;

        this.getComponent(cc.Animation).play("star");

        // 控制方向
        this.schedule(() => {
            if (this.curDistance >= this.maxDistance) {
                this.curDistance = 0;
                this.changeDir();
            }
        }, 0.1);

        // 控制发射子弹
        this.schedule(() => {
            if (!this.autoMoving)
                return;
            if (Math.random() > 0.5)
                this.shoot();
        }, 0.5)
    }

    afterStar() {
        this.autoMoving = true;
        this.setDir(Dir.DOWN);
        this.playAnimation();
    }

    setDir(dir: Dir) {
        if (this.dir == dir)
            return;


        let oldPosition = this.node.position;
        // 调整位置为8的整数倍
        this._adjustPosition();

        // 如果产生碰撞，则回到之前的位置
        if (this._isCollisionWithMap() || this._isCollisionWithBlock() || this._isCollisionWithTank()) {
            this.node.position = oldPosition;

            // 变换方向
            this.curDistance = this.maxDistance;
        }

        this.dir = dir;
    }

    changeDir() {
        let choice = Math.random();

        if (choice < 0.4) {
            this.setDir(Dir.DOWN);
        } else if (choice < 0.6) {
            this.setDir(Dir.LEFT);
        } else if (choice < 0.8) {
            this.setDir(Dir.UP);
        } else {
            this.setDir(Dir.RIGHT);
        }

        this.playAnimation();
    }

    shoot() {
        this.mapLayer.createBullet(this.dir, this.node.position, this.step * 2, this);
    }

    playAnimation() {
        let animation = "moving_" + this.dir + "_" + this.level;

        if (this.level == 4) {
            animation = "moving_" + this.dir + "_" + this.level + "_" + (3 - this.blood);
        }

        this.getComponent(cc.Animation).play(animation);
    }

    stopAnimation() {
        this.getComponent(cc.Animation).stop();
    }

    disBlood() {
        if (this.blood <= 0)
            return;

        if (--this.blood == 0) {
            this.unscheduleAllCallbacks();
            this.mapLayer.game.getComponent(Game).playAudio("tank_bomb", false);

            this.stopAnimation();

            this.getComponent(cc.Animation).play("blast");
        } else {
            this.mapLayer.game.getComponent(Game).playAudio("bin", false);

            // 刷新动画
            this.playAnimation();
        }

    }

    onDestroyed() {
        this.autoMoving = false;
        this.mapLayer.destoryEnemy(this.node);
    }

    _autoMoving(realStep: number) {
        // 记录移动前的位置
        let oldPosition = this.node.position;

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

        this.curDistance += realStep;

        // 如果产生碰撞，则回到之前的位置
        if (this._isCollisionWithMap() || this._isCollisionWithBlock() || this._isCollisionWithTank()) {
            this.node.position = oldPosition;

            // 变换方向
            this.curDistance = this.maxDistance;
        }

    }
}

