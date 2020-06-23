import BaseTank from "./BaseTank";
import { Dir } from "./Globals";
import MapLayer from "./MapLayer";
import UpdateInformations from "./UpdateInformations";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerTank extends BaseTank {
    isInvincible: boolean;

    constructor() {
        super();
        this.isEnemy = false;
        this.isInvincible = false;

        // TODO
        this.bulletCount = 2;
    }

    onLoad() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);

    }

    start() {
        this.getComponent(cc.Animation).play("star");
        this.blood = 2;
        cc.find("/Game/Informations").getComponent(UpdateInformations).updatePlayerBlood(this.blood);
    }

    afterStart() {
        this.canMove = true;
        this.setDir(Dir.UP);
        this.node.getChildByName("ring").getComponent("Ring").play();
    }

    update(dt: number) {
        if (this.autoMoving) {
            let realStep = (this.step + 40) * dt;
            this._autoMoving(realStep);
        }
    }

    onKeyDown(event: { keyCode: cc.macro.KEY; }) {
        if (!this.canMove)
            return;

        switch (event.keyCode) {
            case cc.macro.KEY.a:
                this.control(Dir.LEFT)
                break;
            case cc.macro.KEY.w:
                this.control(Dir.UP);
                break;
            case cc.macro.KEY.d:
                this.control(Dir.RIGHT);
                break;
            case cc.macro.KEY.s:
                this.control(Dir.DOWN);
                break;
            case cc.macro.KEY.j:
                this.shoot();
            default:
                break;
        }
    }

    control(dir: Dir) {
        if (!this.autoMoving)
            this.node.parent.getComponent(MapLayer).game.playAudio("player_move", true);
        this.setDir(dir);
        this.playAnimation();
        this.autoMoving = true;
    }

    controlStop() {
        this.autoMoving = false;
        this.node.parent.getComponent(MapLayer).game.stopAudio("player_move");
        this.stopAnimation();
    }

    onKeyUp(event: { keyCode: cc.macro.KEY; }) {
        if (!this.canMove)
            return;

        switch (event.keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.w:
            case cc.macro.KEY.d:
            case cc.macro.KEY.s:
                this.controlStop();
                break;
            default:
                break;
        }
    }

    playAnimation() {
        if (this.autoMoving) return;

        let animation = "moving_" + this.dir + "_" + this.level;
        this.getComponent(cc.Animation).play(animation);
    }

    stopAnimation() {
        this.getComponent(cc.Animation).stop();
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
        }

        this.dir = dir;

        // 产生贴图
        this.playAnimation();
    }

    shoot() {
        this.node.parent.getComponent(MapLayer).createBullet(this.dir, this.node.position, this.step * 2, this);
    }

    disBlood() {
        cc.log("player disBlood");

        if (this.blood > 0)
            this.blood--;

        // 更新信息区域
        cc.find("/Game/Informations").getComponent(UpdateInformations).updatePlayerBlood(this.blood);
    }

    _autoMoving(realStep) {
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

        // 如果产生碰撞，则回到之前的位置
        if (this._isCollisionWithMap() || this._isCollisionWithBlock() || this._isCollisionWithTank()) {
            this.node.position = oldPosition;
        }
    }
}