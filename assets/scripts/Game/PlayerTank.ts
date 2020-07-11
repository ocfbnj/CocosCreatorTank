import BaseTank from "./BaseTank";
import { Dir } from "../Globals";
import MapLayer from "./MapLayer";
import UpdateInformations from "./UpdateInformations";
import Game from "./Game";
import AudioMng from "../AudioMng";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerTank extends BaseTank {
    @property(cc.Node)
    private ring: cc.Node = null;

    private _isInvincible: boolean;
    private _movingAnimation: string;

    public control(dir: Dir) {
        if (!this.canMove) return;

        if (!this.autoMoving)
            cc.find("/Game/AudioMng").getComponent(AudioMng).playAudio("player_move", true);

        this._setDir(dir);
        this._playMovingAnimation();
        this.autoMoving = true;
    }

    public controlStop() {
        if (!this.canMove) return;

        this.autoMoving = false;
        cc.find("/Game/AudioMng").getComponent(AudioMng).stopAudio("player_move");
        this._stopMovingAnimation();
    }

    public shoot() {
        if (!this.canMove)
            return;

        this.mapLayer.createBullet(this.dir, this.node.position, (this.level + 1) * 2, this);
    }

    public disBlood() {
        if (this._isInvincible)
            return;

        this.blood--;

        if (this.blood >= 0) {
            cc.find("/Game/AudioMng").getComponent(AudioMng).playAudio("tank_bomb", false);
            this.canMove = false;
            this._stopMovingAnimation();
        }

        if (this.blood != 0) {
            this.reset();
        } else {
            // 播放死亡动画
            this.getComponent(cc.Animation).play("blast");
            this.gameOver();
        }

        // 更新剩余生命值
        if (this.blood > 0)
            cc.find("/Canvas/GameLayer/Informations").getComponent(UpdateInformations).updatePlayerBlood(this.blood - 1);
    }

    /**
     * 播放一个从左到右的game over动画，然后播放游戏失败流程动画
     */
    public gameOver() {
        this.node.active = false;
        cc.find("/Game/AudioMng").getComponent(AudioMng).stopAudio("player_move");
        let visableSize = cc.view.getVisibleSize();

        let gameOverNode = cc.find("/Canvas/External/gameover_left");
        gameOverNode.active = true;
        gameOverNode.setPosition(-visableSize.width / 2 - gameOverNode.width / 2, -94);

        // 播放右移动画
        cc.tween(gameOverNode)
            .to(1.5, { x: -35, y: -94 })
            .delay(1)
            .call(() => {
                // 播放上升动画
                cc.find("/Game").getComponent(Game).gameOver();
            })
            .start();
    }

    /**
     * 回到起始位置，并播放出生动画
     * */
    public reset() {
        this._isInvincible = true;
        this._setDir(Dir.UP);
        this.node.setPosition(80, 8);
        this.getComponent(cc.Animation).play("star");
        cc.find("/Canvas/GameLayer/Informations").getComponent(UpdateInformations).updatePlayerBlood(this.blood - 1);
    }

    public init() {
        this.blood = 3;
        this.isEnemy = false;
        this.mapLayer = cc.find("/Canvas/GameLayer/MapLayer").getComponent(MapLayer);

        // TODO
        this.bulletCount = 2;

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this._onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this._onKeyUp, this);

        this.reset();
    }

    // protected onEnable() {
    //     cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this._onKeyDown, this);
    //     cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this._onKeyUp, this);

    //     this.reset();
    // }

    // protected onDisable() {
    //     cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this._onKeyDown, this);
    //     cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this._onKeyUp, this);

    //     this.canMove = false;
    // }

    // 播放完star动画后调用
    protected afterStar() {
        this.canMove = true;
        this._isInvincible = true;
        this._playMovingAnimation();

        this.ring.active = true;
        let animation = this.ring.getComponent(cc.Animation);
        animation.play("ring");

        // 5秒后取消无敌状态
        this.scheduleOnce(() => {
            this._isInvincible = false;

            animation.stop();
            this.ring.active = false;
        }, 5);
    }

    protected update(dt: number) {
        if (!this.canMove)
            return;

        if (this.autoMoving) {
            let realStep = (this.level + 1) * 40 * dt;
            this._autoMoving(realStep);
        }
    }

    private _onKeyDown(event: { keyCode: cc.macro.KEY; }) {
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

    private _onKeyUp(event: cc.Event.EventKeyboard) {
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

    private _playMovingAnimation() {
        // TODO
        this._movingAnimation = "moving";
        this.getComponent(cc.Animation).play(this._movingAnimation);
    }

    private _stopMovingAnimation() {
        this.getComponent(cc.Animation).stop(this._movingAnimation);
    }

    private _setDir(dir: Dir) {
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
        this.node.angle = -90 * this.dir;

        // 产生贴图
        this._playMovingAnimation();
    }

    private _autoMoving(realStep) {
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