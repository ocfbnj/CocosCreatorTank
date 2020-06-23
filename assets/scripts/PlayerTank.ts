import BaseTank from "./BaseTank";
import { Dir, Globals } from "./Globals";
import MapLayer from "./MapLayer";
import UpdateInformations from "./UpdateInformations";
import Game from "./Game";

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
        this.init();
    }

    init() {
        this.node.active = true;
        this.getComponent(cc.Animation).play("star");
        this.blood = 1;
        cc.find("/Game/Informations").getComponent(UpdateInformations).updatePlayerBlood(this.blood - 1);
    }

    // 播放完star动画后调用
    afterStart() {
        this.setDir(Dir.UP);
        this.node.setPosition(80, 8);
        this.canMove = true;
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
        if (!this.canMove)
            return;

        this.node.parent.getComponent(MapLayer).createBullet(this.dir, this.node.position, this.step * 2, this);
    }

    disBlood() {
        if (this.isInvincible)
            return;

        cc.log("player disBlood");

        this.blood--;

        if (this.blood >= 0) {
            // 播放死亡动画
            this.canMove = false;
            this.node.parent.getComponent(MapLayer).game.playAudio("tank_bomb", false);
            this.stopAnimation();
            this.getComponent(cc.Animation).play("blast");
        }

        if (this.blood != 0) {
            // 回到初始位置，不播放星星动画
            this.afterStart();

        } else {
            // 让坦克消失
            this.node.active = false;
            // 播放小的game over动画
            this.gameOver();
        }

        if (this.blood > 0)
            // 更新剩余生命值
            cc.find("/Game/Informations").getComponent(UpdateInformations).updatePlayerBlood(this.blood - 1);
    }

    gameOver() {
        this.node.parent.getComponent(MapLayer).game.stopAudio("player_move");
        let visableSize = cc.view.getVisibleSize();
        let gameOverNode = cc.find("/Game/gameover");
        gameOverNode.active = true;
        gameOverNode.setPosition(-visableSize.width / 2 - gameOverNode.width / 2, -94);

        // 播放右移动画
        cc.tween(gameOverNode)
            .to(1.5, { position: cc.v2(-35, -94) })
            .call(() => {
                // 播放上升动画
                cc.find("/Game").getComponent(Game).gameOverUp();
            })
            .start();
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