import BaseTank from "./BaseTank"
import { Dir } from "./Globals"
import MapLayer from "./MapLayer";
import AudioMng from "../AudioMng";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EnemyTank extends BaseTank {
    private readonly _maxDistance: number = 100;
    private _curDistance: number = 0;

    update(dt: number) {
        if (!this.autoMoving) return;

        let realStep = (this.level + 35) * dt;
        this._autoMoving(realStep);
    }

    init(pos: cc.Vec3) {
        this.mapLayer = cc.find("/Canvas/GameLayer/MapLayer").getComponent(MapLayer);

        this._curDistance = 0;
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
            if (this._curDistance >= this._maxDistance) {
                this._curDistance = 0;
                this.changeDir();
            }
        }, 0.1);

        // 控制发射子弹
        this.schedule(() => {
            if (!this.autoMoving)
                return;
            if (Math.random() > 0.5)
                this.shoot();
        }, 0.5);
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
            this._curDistance = this._maxDistance;
        }

        this.dir = dir;
        this.node.angle = -90 * this.dir;
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
        this.mapLayer.createBullet(this.dir, this.node.position, this.level, this);
    }

    playAnimation() {
        let animation = "moving_0_" + this.level;

        if (this.level == 4) {
            animation = "moving_0_" + this.level + "_" + (3 - this.blood);
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
            cc.find("/Game/AudioMng").getComponent(AudioMng).playAudio("tank_bomb", false);

            this.stopAnimation();

            this.getComponent(cc.Animation).play("blast");
        } else {
            cc.find("/Game/AudioMng").getComponent(AudioMng).playAudio("bin", false);

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

        this._curDistance += realStep;

        // 如果产生碰撞，则回到之前的位置
        if (this._isCollisionWithMap() || this._isCollisionWithBlock() || this._isCollisionWithTank()) {
            this.node.position = oldPosition;

            // 变换方向
            this._curDistance = this._maxDistance;
        }

    }
}

